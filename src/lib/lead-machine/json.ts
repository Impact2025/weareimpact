// LLM-JSON veilig lezen. Sommige providers (Bedrock via OpenRouter) negeren
// response_format en wikkelen de JSON in een ```json-codeblok, of praten erna
// nog door. Pak het eerste {...}-blok; null als er niets leesbaars is.
export function parseLlmJson<T = Record<string, unknown>>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
