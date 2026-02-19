/**
 * AI Providers — Supported LLM providers with their API configurations.
 *
 * All calls go directly from the browser to the provider's API.
 * No backend proxy is needed for providers that support CORS.
 * Ollama runs locally and requires no API key.
 */

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  models: AIModel[];
  keyPlaceholder: string;
  keyUrl: string;
  isLocal?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

const OLLAMA_DEFAULT_MODELS: AIModel[] = [
  { id: 'qwen2.5-coder:14b', name: 'Qwen 2.5 Coder 14B', description: 'Ottimo per codice — ~8 GB RAM' },
  { id: 'phi4:14b', name: 'Phi-4 14B', description: 'Microsoft — buon rapporto qualità/dim' },
  { id: 'codestral:latest', name: 'Codestral', description: 'Mistral — specialista codice' },
  { id: 'llama3.3:70b', name: 'Llama 3.3 70B', description: 'Meta — qualità massima (~40 GB RAM)' },
  { id: 'mistral:7b', name: 'Mistral 7B', description: 'Leggero — ~4 GB RAM' },
  { id: 'gemma2:9b', name: 'Gemma 2 9B', description: 'Google — compatto e capace' },
];

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'ollama',
    name: 'Ollama (Locale)',
    description: 'LLM locale — zero costi, dati mai inviati',
    baseUrl: 'http://localhost:11434/v1',
    keyPlaceholder: '(non necessaria)',
    keyUrl: 'https://ollama.ai',
    isLocal: true,
    models: OLLAMA_DEFAULT_MODELS,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4.1 e altri modelli OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Il più recente e capace' },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Veloce e multimodale' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Economico e veloce' },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Accesso a tutti i modelli con una sola chiave',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyPlaceholder: 'sk-or-...',
    keyUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Anthropic — equilibrio qualità/costo' },
      { id: 'openai/gpt-4.1', name: 'GPT-4.1', description: 'OpenAI via OpenRouter' },
      { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', description: 'Google — ottimo su testi lunghi' },
      { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', description: 'Meta — open source' },
    ],
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini 2.5 Pro e Flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/apikey',
    models: [
      { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro', description: 'Il più capace di Google' },
      { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', description: 'Velocissimo ed economico' },
    ],
  },
];

export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === id);
}

// ─── LocalStorage persistence ───

const STORAGE_KEY = 'segno-ai-config';

export interface AIConfig {
  providerId: string;
  modelId: string;
  apiKey: string;
}

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Ollama helpers ───

const OLLAMA_BASE = 'http://localhost:11434';

export interface OllamaStatus {
  online: boolean;
  models: AIModel[];
}

export async function probeOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { online: false, models: [] };

    const json = await res.json();
    const models: AIModel[] = (json.models ?? []).map((m: any) => ({
      id: m.name as string,
      name: formatOllamaModelName(m.name as string),
      description: formatOllamaModelSize(m.size as number),
    }));

    return { online: true, models };
  } catch {
    return { online: false, models: [] };
  }
}

function formatOllamaModelName(id: string): string {
  const base = id.split(':')[0];
  const tag = id.split(':')[1] ?? '';
  const pretty = base.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return tag && tag !== 'latest' ? `${pretty} (${tag})` : pretty;
}

function formatOllamaModelSize(bytes: number): string {
  if (!bytes) return 'Locale';
  const gb = bytes / 1e9;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1e6).toFixed(0)} MB`;
}

export function isLocalProvider(providerId: string): boolean {
  return AI_PROVIDERS.find(p => p.id === providerId)?.isLocal === true;
}
