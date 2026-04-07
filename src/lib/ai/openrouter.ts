import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let _openrouter: OpenAI | null = null;

export function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }
    _openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'WeAreImpact',
      },
    });
  }
  return _openrouter;
}

// Available models via OpenRouter
export const MODELS = {
  // Fast & cheap
  HAIKU: 'anthropic/claude-haiku-4.5',
  GPT_4_MINI: 'openai/gpt-4o-mini',

  // Balanced
  SONNET: 'anthropic/claude-sonnet-4.5',
  GPT_4O: 'openai/gpt-4o',

  // Powerful
  OPUS: 'anthropic/claude-opus-4.5',

  // Open source alternatives
  LLAMA_70B: 'meta-llama/llama-3.1-70b-instruct',
  MISTRAL_LARGE: 'mistralai/mistral-large',
} as const;

// Default model for different use cases
export const DEFAULT_MODELS = {
  scanner: MODELS.SONNET,      // Good balance for analysis
  chat: MODELS.HAIKU,          // Fast & cheap for public conversational
  admin: MODELS.SONNET,        // Smarter model for admin/Iris actions
  voice: MODELS.HAIKU,         // Fast for voice
  embedding: 'openai/text-embedding-3-small',
} as const;
