import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

export interface ScoreInput {
  name: string;
  snippet?: string;
  domain?: string;
  city?: string;
}

export interface ScoreResult {
  // null = scoren mislukt; nooit een verzonnen middenscore teruggeven
  score: number | null;
  rationale: string;
}

// Default context for WeAreImpact — override per app/tenant via scoringContext param
export const DEFAULT_SCORING_CONTEXT = `Je bent een lead qualifier voor WeAreImpact. WeAreImpact levert interim advies, AI-implementatie en strategische innovatie aan organisaties in het sociaal domein.

Ideale klanten (score 8-10): welzijnsorganisaties, maatschappelijke dienstverleners, gemeenten, stichtingen en non-profits in zorg/welzijn.
Minder relevant (score 0-4): commercieel zonder maatschappelijke doelstelling, eenmanszaak, niet-Nederlands.`;

const BASE_PROMPT = `Geef ALLEEN geldige JSON: {"score": <0-10>, "rationale": "<max 12 woorden in het Nederlands>"}`;

export async function scoreProspect(
  input: ScoreInput,
  scoringContext = DEFAULT_SCORING_CONTEXT,
): Promise<ScoreResult> {
  const openrouter = getOpenRouter();

  const userMsg = [
    `Naam: ${input.name}`,
    input.domain ? `Website: ${input.domain}` : null,
    input.city ? `Stad: ${input.city}` : null,
    input.snippet ? `Beschrijving: ${input.snippet.slice(0, 200)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await openrouter.chat.completions.create({
      model: MODELS.HAIKU,
      messages: [
        { role: 'system', content: `${scoringContext}\n\n${BASE_PROMPT}` },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 80,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const raw = res.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const n = Number(parsed.score);
    return {
      score: Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : null,
      rationale: String(parsed.rationale ?? 'Score niet beschikbaar').slice(0, 120),
    };
  } catch {
    return { score: null, rationale: 'Scoren mislukt — handmatig beoordelen' };
  }
}

export async function scoreMany(
  inputs: ScoreInput[],
  scoringContext = DEFAULT_SCORING_CONTEXT,
  concurrency = 5,
): Promise<ScoreResult[]> {
  const results: ScoreResult[] = new Array(inputs.length);
  const queue = inputs.map((input, i) => ({ input, i }));

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!;
      results[item.i] = await scoreProspect(item.input, scoringContext);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker));
  return results;
}
