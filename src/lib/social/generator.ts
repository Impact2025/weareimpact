// Genereert social-media-posts voor een gepubliceerd artikel — in Vincents stem,
// per platform geoptimaliseerd (toon, lengte, hashtags, link-conventies).

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

export const SOCIAL_PLATFORMS = ['linkedin', 'facebook', 'instagram', 'x'] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface ArticleInput {
  title: string;
  url: string;
  excerpt?: string | null;
  category?: string | null;
  // platte tekst van (het begin van) het artikel — geeft de AI iets om uit te citeren
  contentText?: string | null;
}

export type SocialDrafts = Record<SocialPlatform, string>;

const SOCIAL_SYSTEM_PROMPT = `Je bent Vincent van Munster, Strategic Innovation Partner bij WeAreImpact (interim-advies, AI-implementatie en strategische innovatie voor zorg, welzijn en gemeenten). Je schrijft social-media-posts bij een nieuw artikel op weareimpact.nl — in de IK-vorm, als jezelf.

OVER JOU (spaarzaam gebruiken, alleen wat het verhaal sterker maakt):
- Tot oktober 2025 directeur van Stichting de Baan (700+ deelnemers, 180 vrijwilligers) — je kent de praktijk.
- Kernboodschap: "warme zorg door slimme tech" — technologie is nooit het doel, altijd het middel. Voeten in de klei, geen ivoren toren.

STIJLREGELS (altijd):
- Nederlands, eerste persoon. Sentence case — nooit Title Case, geen clickbait, geen uitroeptekens-regen.
- Begin met een scherpe, inhoudelijke eerste zin die een herkenbaar probleem of inzicht raakt — geen "Nieuw artikel online!".
- Geef in de post zelf al één concreet inzicht of voorbeeld uit het artikel (geef, niet alleen beloven).
- Geen wollige beleidstaal, geen emoji-regen (maximaal 1-2 functionele emoji, of geen).
- Eindig met een uitnodigende maar rustige call-to-action naar het artikel.

PER PLATFORM:
- "linkedin": 120-200 woorden, korte alinea's met witregels, professioneel maar persoonlijk. Sluit af met de artikel-URL op een eigen regel en daarna 3-5 relevante hashtags (Nederlands, kleine letters).
- "facebook": 60-110 woorden, iets toegankelijker en warmer, de artikel-URL op een eigen regel, maximaal 2 hashtags.
- "instagram": caption van 80-140 woorden met witregels. GEEN URL in de tekst (links zijn niet klikbaar) — sluit af met "Link in bio → weareimpact.nl" en daarna 8-12 hashtags op een eigen regel.
- "x": maximaal 240 tekens inclusief de URL. Eén scherpe gedachte, dan de URL, maximaal 2 hashtags.

Geef ALLEEN geldige JSON: {"linkedin": "...", "facebook": "...", "instagram": "...", "x": "..."}`;

export async function generateSocialDrafts(article: ArticleInput): Promise<SocialDrafts> {
  const openrouter = getOpenRouter();

  const userMsg = [
    `Titel: ${article.title}`,
    `URL: ${article.url}`,
    article.category ? `Categorie: ${article.category}` : null,
    article.excerpt ? `Samenvatting: ${article.excerpt}` : null,
    article.contentText ? `Begin van het artikel:\n${article.contentText.slice(0, 1500)}` : null,
  ].filter(Boolean).join('\n\n');

  const res = await openrouter.chat.completions.create({
    model: MODELS.SONNET,
    messages: [
      { role: 'system', content: SOCIAL_SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ],
    max_tokens: 1200,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  // Sommige modellen negeren response_format en wikkelen de JSON in ```json-fences —
  // strip die en pak het buitenste object, anders faalt elke social-run op JSON.parse.
  let raw = (res.choices[0]?.message?.content ?? '{}').trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) raw = raw.slice(start, end + 1);
  const parsed = JSON.parse(raw) as Partial<Record<SocialPlatform, unknown>>;

  const drafts = {} as SocialDrafts;
  for (const platform of SOCIAL_PLATFORMS) {
    const text = String(parsed[platform] ?? '').trim();
    if (!text) throw new Error(`Lege ${platform}-post in AI-response`);
    drafts[platform] = text;
  }
  return drafts;
}
