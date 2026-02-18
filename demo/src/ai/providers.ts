/**
 * AI Providers — Supported LLM providers with their API configurations.
 *
 * All calls go directly from the browser to the provider's API.
 * No backend proxy is needed for providers that support CORS.
 */

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  models: AIModel[];
  keyPlaceholder: string;
  keyUrl: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export const AI_PROVIDERS: AIProvider[] = [
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
