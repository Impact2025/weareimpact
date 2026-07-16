// Blog drafting in Vincent's own voice (first person, ALS hem — niet OVER hem).
// Produces a draft that Iris returns for review; publishing is a separate,
// explicitly-confirmed step (via the existing /api/publish pipeline).

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

// Vincent's identity + house style. Kept here so every Iris-authored blog is
// consistent with the kennisbank/blog voice.
export const VINCENT_STYLE_PROMPT = `Je schrijft ALS Vincent van Munster zelf — eerste persoon, niet over hem.

KERNIDENTITEIT:
- Rol: Strategic Innovation Partner bij WeAreImpact
- Tot 1 oktober 2025 directeur Stichting de Baan (altijd verleden tijd)
- Bewijs uit de praktijk: 700+ deelnemers, 180 vrijwilligers, 70.000+ geluksmomenten
- "Voeten in de klei", niet in een ivoren toren

PROJECTEN om te noemen waar relevant:
- DAAR: vrijwilligersplatform met VrijwilligersCheck en Impact Reserve
- SteentjeBijSteentje: LEGO Serious Play sessies
- DatingAssistent: eigen AI proof-of-concept

KERNBOODSCHAP:
- "Warme zorg door slimme technologie" — tech is nooit het doel, altijd het middel
- Resultaat boven uren

SCHRIJFSTIJL (strikt):
- Sentence case voor ALLE koppen (nooit Title Case)
- Begin met een persoonlijke observatie over het welzijnsland
- Koppel elk inzicht aan praktijkervaring (Stichting de Baan, DAAR, WeAreImpact)
- Direct en actief: "Ik bouw", "Wij veranderen"
- Geen wollige beleidstaal, geen emoji (tenzij expliciet gevraagd)
- Eindig altijd met een CTA: koffie/verkenningsgesprek via WeAreImpact.nl`;

export interface BlogDraft {
  ok: boolean;
  title?: string;
  metaDescription?: string;
  markdown?: string;
  error?: string;
}

interface WriteBlogParams {
  topic: string;
  angle?: string;
  // Optional research context (e.g. from web_search) to ground the piece.
  context?: string;
  length?: 'kort' | 'middel' | 'lang';
}

const WORD_TARGETS: Record<string, string> = {
  kort: '500-800',
  middel: '1000-1500',
  lang: '1800-2500',
};

export async function writeBlog(params: WriteBlogParams): Promise<BlogDraft> {
  const { topic, angle, context, length = 'middel' } = params;
  const words = WORD_TARGETS[length] ?? WORD_TARGETS.middel;

  const userPrompt = `Schrijf een blogartikel.

ONDERWERP: ${topic}
${angle ? `INVALSHOEK: ${angle}` : ''}
LENGTE: ${words} woorden
${context ? `\nACTUELE CONTEXT (gebruik waar relevant, verzin geen feiten):\n${context}` : ''}

Lever aan in exact dit format:
TITEL: <sentence case titel>
META: <SEO meta description, max 155 tekens>
---
<het volledige artikel in Markdown, met ## en ### koppen in sentence case>`;

  try {
    const completion = await getOpenRouter().chat.completions.create({
      model: MODELS.SONNET,
      messages: [
        { role: 'system', content: VINCENT_STYLE_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3500,
      temperature: 0.75,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    if (!raw.trim()) {
      return { ok: false, error: 'Het schrijven leverde geen tekst op.' };
    }

    // Parse the structured response.
    const titleMatch = raw.match(/TITEL:\s*(.+)/i);
    const metaMatch = raw.match(/META:\s*(.+)/i);
    const bodyMatch = raw.split(/\n---\n/);
    const markdown = bodyMatch.length > 1 ? bodyMatch.slice(1).join('\n---\n').trim() : raw.trim();

    return {
      ok: true,
      title: titleMatch?.[1]?.trim(),
      metaDescription: metaMatch?.[1]?.trim(),
      markdown,
    };
  } catch (error) {
    console.error('writeBlog error:', error);
    return { ok: false, error: 'Ik kon het blogartikel niet schrijven.' };
  }
}

/** Model-friendly rendering of the draft for the tool result. */
export function formatBlogDraft(d: BlogDraft): string {
  if (!d.ok) return d.error ?? 'Blog schrijven mislukte.';
  return [
    `TITEL: ${d.title ?? '(geen)'}`,
    `META: ${d.metaDescription ?? '(geen)'}`,
    '',
    d.markdown ?? '',
    '',
    '(Dit is een concept. Zeg "publiceer" als je wilt dat ik het klaarzet voor publicatie.)',
  ].join('\n');
}
