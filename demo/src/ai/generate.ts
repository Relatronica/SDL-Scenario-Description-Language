/**
 * AI Generate — Calls LLM APIs to generate SDL code from wizard inputs.
 *
 * Supports OpenAI-compatible APIs (OpenAI, OpenRouter) and Google Gemini.
 * Includes a retry loop that feeds parse errors back to the LLM for self-correction.
 */

import { parse } from '@sdl/core/parser';
import { SDL_SYSTEM_PROMPT, buildUserPrompt, type WizardData } from './system-prompt';
import { getProvider, isLocalProvider, type AIConfig } from './providers';

export interface GenerateResult {
  sdl: string;
  attempts: number;
  parseOk: boolean;
  errors: string[];
}

const MAX_RETRIES = 2;

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
  local?: boolean,
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!local) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Rebica SDL Citizen Lab';
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      ...(local ? { num_predict: 4096 } : { max_tokens: 4096 }),
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (local) {
      throw new Error(`Ollama non raggiungibile (${res.status}). Verifica che Ollama sia in esecuzione e il modello "${model}" sia scaricato.`);
    }
    throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function cleanSDLOutput(raw: string): string {
  let text = raw.trim();

  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:sdl|SDL)?\s*\n([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```[^\n]*\n/, '').replace(/```\s*$/, '').trim();
  }

  return text;
}

async function callLLM(
  config: AIConfig,
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
): Promise<string> {
  const provider = getProvider(config.providerId);
  if (!provider) throw new Error(`Provider sconosciuto: ${config.providerId}`);

  if (config.providerId === 'google') {
    const system = messages.find(m => m.role === 'system')?.content ?? '';
    const user = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
    return callGemini(config.apiKey, config.modelId, system, user, signal);
  }

  const local = isLocalProvider(config.providerId);
  return callOpenAICompatible(provider.baseUrl, config.apiKey, config.modelId, messages, signal, local);
}

export async function generateSDL(
  config: AIConfig,
  wizardData: WizardData,
  onProgress?: (status: string) => void,
  signal?: AbortSignal,
): Promise<GenerateResult> {
  const userPrompt = buildUserPrompt(wizardData);

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: SDL_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  let lastSdl = '';
  const allErrors: string[] = [];

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    onProgress?.(attempt === 1
      ? 'Generazione scenario in corso...'
      : `Tentativo ${attempt}: correzione errori...`
    );

    const raw = await callLLM(config, messages, signal);
    lastSdl = cleanSDLOutput(raw);

    if (!lastSdl || !lastSdl.includes('scenario')) {
      allErrors.push(`Tentativo ${attempt}: l'LLM non ha generato codice SDL valido`);
      messages.push(
        { role: 'assistant', content: raw },
        { role: 'user', content: 'Il tuo output non contiene un blocco scenario SDL valido. Riprova generando SOLO codice SDL, senza markdown né spiegazioni.' },
      );
      continue;
    }

    const { diagnostics } = parse(lastSdl);
    const errors = diagnostics.filter(d => d.severity === 'error');

    if (errors.length === 0) {
      return { sdl: lastSdl, attempts: attempt, parseOk: true, errors: [] };
    }

    const errorList = errors.map(e =>
      `- Riga ${e.span?.start?.line ?? '?'}: ${e.message}`
    ).join('\n');
    allErrors.push(`Tentativo ${attempt}: ${errors.length} errori di parsing`);

    if (attempt <= MAX_RETRIES) {
      messages.push(
        { role: 'assistant', content: lastSdl },
        {
          role: 'user',
          content: `Il codice SDL generato contiene errori di parsing:\n\n${errorList}\n\nCorreggi questi errori e genera nuovamente il codice SDL completo.`,
        },
      );
    }
  }

  return {
    sdl: lastSdl,
    attempts: MAX_RETRIES + 1,
    parseOk: false,
    errors: allErrors,
  };
}
