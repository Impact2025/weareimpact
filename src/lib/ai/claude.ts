import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

// Alle tekstgeneratie loopt via de Claude API (ANTHROPIC_API_KEY).
// `getClaude().chat.completions.create()` accepteert en geeft hetzelfde formaat
// als de OpenAI-SDK (messages, tools, tool_calls, stream, response_format), zodat
// de routes niet hoeven te weten dat er onder water Anthropic Messages wordt gebruikt.

export const MODELS = {
  HAIKU: 'claude-haiku-5-5',
  SONNET: 'claude-sonnet-5-5',
  OPUS: 'claude-opus-5-5',
} as const;

export const DEFAULT_MODELS = {
  scanner: MODELS.SONNET, // analyse
  chat: MODELS.HAIKU, // snel en goedkoop voor publieke gesprekken
  admin: MODELS.SONNET, // slimmer model voor admin/Iris
  voice: MODELS.HAIKU,
  embedding: 'openai/text-embedding-3-small', // Anthropic heeft geen embeddings
} as const;

let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

// Embeddings: Anthropic biedt die niet aan, dus alleen hiervoor blijft een
// OpenAI-compatibele provider nodig (nu nog via OPENROUTER_API_KEY).
export function getEmbeddingClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured (alleen nodig voor embeddings)');
  return new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey });
}

// ---------------------------------------------------------------------------
// OpenAI-compatibele laag bovenop de Anthropic Messages API
// ---------------------------------------------------------------------------

export interface ClaudeCompletionParams {
  model: string;
  messages: ChatCompletionMessageParam[];
  tools?: ChatCompletionTool[];
  tool_choice?: unknown;
  temperature?: number; // genegeerd: nieuwe Claude-modellen weigeren afwijkende waarden
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: string };
}

export interface ClaudeToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ClaudeCompletion {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: ClaudeToolCall[];
    };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface ClaudeChunk {
  choices: Array<{ delta: { content?: string } }>;
}

function textOf(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => (p && typeof p === 'object' && 'text' in p ? String((p as { text: unknown }).text) : ''))
      .join('');
  }
  return '';
}

function convertMessages(
  messages: ChatCompletionMessageParam[],
  jsonMode: boolean,
): { system: string | undefined; messages: Anthropic.MessageParam[] } {
  const systemParts: string[] = [];
  const out: Anthropic.MessageParam[] = [];

  const push = (role: 'user' | 'assistant', blocks: Anthropic.ContentBlockParam[]) => {
    const last = out[out.length - 1];
    if (last && last.role === role && Array.isArray(last.content)) {
      last.content.push(...blocks);
    } else {
      out.push({ role, content: blocks });
    }
  };

  for (const m of messages) {
    if (m.role === 'system' || m.role === 'developer') {
      systemParts.push(textOf(m.content));
    } else if (m.role === 'user') {
      const text = textOf(m.content);
      if (text) push('user', [{ type: 'text', text }]);
    } else if (m.role === 'assistant') {
      const blocks: Anthropic.ContentBlockParam[] = [];
      const text = textOf(m.content);
      if (text) blocks.push({ type: 'text', text });
      for (const tc of m.tool_calls ?? []) {
        if (tc.type !== 'function') continue;
        let input: unknown = {};
        try {
          input = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          input = {};
        }
        blocks.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input });
      }
      if (blocks.length) push('assistant', blocks);
    } else if (m.role === 'tool') {
      push('user', [
        { type: 'tool_result', tool_use_id: m.tool_call_id, content: textOf(m.content) },
      ]);
    }
  }

  if (jsonMode) {
    systemParts.push('Antwoord uitsluitend met één geldig JSON-object, zonder uitleg of markdown eromheen.');
  }

  // De API eist dat het gesprek met een user-bericht begint.
  if (out.length === 0 || out[0].role !== 'user') {
    out.unshift({ role: 'user', content: [{ type: 'text', text: '.' }] });
  }

  return { system: systemParts.join('\n\n') || undefined, messages: out };
}

function buildRequest(p: ClaudeCompletionParams): Anthropic.MessageCreateParamsNonStreaming {
  const { system, messages } = convertMessages(p.messages, p.response_format?.type === 'json_object');

  const req: Anthropic.MessageCreateParamsNonStreaming = {
    model: p.model,
    max_tokens: p.max_tokens ?? 4096,
    messages,
  };
  if (system) req.system = system;

  if (p.tools?.length && p.tool_choice !== 'none') {
    req.tools = p.tools
      .filter((t) => t.type === 'function')
      .map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: (t.function.parameters ?? { type: 'object', properties: {} }) as Anthropic.Tool.InputSchema,
      }));
  }

  // Haiku 5.5 denkt standaard; voor chat/voice willen we dat niet (latency).
  // Sonnet 5.5 kan niet uit, daar sturen we de diepte met effort.
  if (p.model === MODELS.HAIKU) {
    req.thinking = { type: 'disabled' };
  } else if (p.model === MODELS.SONNET) {
    req.output_config = { effort: 'low' };
  }

  return req;
}

function toCompletion(msg: Anthropic.Message): ClaudeCompletion {
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const toolCalls: ClaudeToolCall[] = msg.content
    .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    .map((b) => ({
      id: b.id,
      type: 'function',
      function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) },
    }));

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: text || null,
          ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: msg.stop_reason === 'max_tokens' ? 'length' : toolCalls.length ? 'tool_calls' : 'stop',
      },
    ],
    usage: {
      prompt_tokens: msg.usage.input_tokens,
      completion_tokens: msg.usage.output_tokens,
      total_tokens: msg.usage.input_tokens + msg.usage.output_tokens,
    },
  };
}

async function* streamChunks(req: Anthropic.MessageCreateParamsNonStreaming): AsyncGenerator<ClaudeChunk> {
  const stream = getAnthropic().messages.stream(req);
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { choices: [{ delta: { content: event.delta.text } }] };
    }
  }
}

async function create(p: ClaudeCompletionParams & { stream: true }): Promise<AsyncGenerator<ClaudeChunk>>;
async function create(p: ClaudeCompletionParams & { stream?: false }): Promise<ClaudeCompletion>;
async function create(p: ClaudeCompletionParams): Promise<ClaudeCompletion | AsyncGenerator<ClaudeChunk>> {
  const req = buildRequest(p);
  if (p.stream) return streamChunks(req);
  const msg = await getAnthropic().messages.stream(req).finalMessage();
  return toCompletion(msg);
}

export function getClaude() {
  return { chat: { completions: { create } } };
}

// Voor de routes die voorheen rechtstreeks naar OpenRouter fetchten: geeft
// dezelfde vorm terug als `fetch(...)` met een OpenAI-achtige JSON-body, zodat
// `response.ok` en `data.choices[0].message.content` blijven werken.
export async function claudeChatResponse(p: {
  model: string;
  messages: ChatCompletionMessageParam[];
  max_tokens?: number;
  temperature?: number;
}): Promise<Response> {
  try {
    const completion = (await create({ ...p, stream: false })) as ClaudeCompletion;
    return new Response(JSON.stringify(completion), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const status = e instanceof Anthropic.APIError && e.status ? e.status : 500;
    return new Response(JSON.stringify({ error: { message: e instanceof Error ? e.message : String(e) } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
