// Kwalificatie: is dit een organisatie die WeAreImpact kan helpen, en waarom?
//
// De eerste versie zag alleen titel + zoekfragment en gaf een 9 aan alles
// waar 'welzijn' in stond — ook aan een begrotingspagina. Nu leest het model
// de echte homepage-tekst, moet het eerst beoordelen óf het een zelfstandige
// organisatie is, en krijgt het een rubriek met ijkpunten. Haakjes voor de
// outreach moeten letterlijk op de site staan: niets verzinnen.

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';
import { mapPool } from './mapPool';
import { parseLlmJson } from './json';

export type Segment = 'A' | 'B' | 'C';

export interface QualifyInput {
  name: string;
  domain: string;
  title?: string;
  description?: string;
  pageText?: string;
  snippet?: string;
  city?: string;
  signal?: string; // bv. "vacature: kwartiermaker digitalisering (sep 2026)"
}

export interface Qualification {
  isOrganisation: boolean;
  name?: string;
  orgType?: string;
  segment?: Segment;
  city?: string;
  score: number | null; // null = kwalificatie mislukt, nooit een verzonnen middenscore
  rationale: string;
  summary?: string;
  hooks: string[];
  rejectReason?: string;
}

import { DEFAULT_SCORING_CONTEXT } from './presets';
export { DEFAULT_SCORING_CONTEXT };

const RUBRIC = `Beoordeel in deze volgorde:

1. IS HET EEN ORGANISATIE? Alleen "true" als de tekst de eigen website is van één zelfstandige organisatie. "false" bij: een document, beleidsstuk, nieuwsartikel, overzicht/sociale kaart van meerdere organisaties, platform of portal, vacaturesite, privépersoon, of een pagina zonder duidelijke eigenaar.

2. SEGMENT (alleen als het een organisatie is):
   A = organisatie met betaalde staf (grofweg 5+ medewerkers) die zelf een traject kan inkopen
   B = centrale, steunpunt, koepel of platform dat veel organisaties uit de doelgroep bereikt — partner/vermenigvuldiger
   C = kleine organisatie: door vrijwilligers gedragen, eenmanszaak of solopraktijk

3. SCORE 0-10 tegen het ideale-klantprofiel hierboven, met deze ijkpunten:
   9-10: segment A binnen het profiel én een concreet signaal op de site of uit de vacature (groei, digitalisering, werkdruk, nieuwe locatie, innovatieprogramma)
   7-8: segment A of B, duidelijk binnen het profiel, geen specifiek signaal
   5-6: binnen het profiel maar klein (segment C) of onduidelijke omvang
   2-4: raakvlak maar geen koper (landelijke koepel, kennisinstituut, leverancier of concurrent, adviesbureau)
   0-1: buiten het profiel, buiten Nederland, of geen organisatie
   Twijfel je, kies dan de lagere score.

4. HAAKJES: maximaal 3 korte, concrete feiten die LETTERLIJK in de tekst staan en een persoonlijke opening van een mail kunnen dragen (bv. een project, een doelgroep, een locatie, een aantal vrijwilligers). Niets verzinnen, niets afleiden. Geen haakje gevonden = lege lijst.`;

const OUTPUT = `Antwoord UITSLUITEND met geldige JSON:
{"is_organisation": true|false, "name": "officiële naam zoals op de site", "org_type": "kort, bv. welzijnsorganisatie", "segment": "A"|"B"|"C"|null, "city": "vestigingsplaats of null", "score": 0-10, "rationale": "één zin met het bewijs voor de score", "summary": "twee zinnen: wat doet de organisatie, voor wie", "hooks": ["…"], "reject_reason": "alleen bij is_organisation=false"}`;

export async function qualifyOrganisation(
  input: QualifyInput,
  scoringContext = DEFAULT_SCORING_CONTEXT,
): Promise<Qualification> {
  const content = [
    `Gevonden naam: ${input.name}`,
    `Domein: ${input.domain}`,
    input.title ? `Paginatitel: ${input.title}` : null,
    input.description ? `Metabeschrijving: ${input.description}` : null,
    input.city ? `Plaats (uit adres): ${input.city}` : null,
    input.signal ? `Koopsignaal: ${input.signal}` : null,
    input.pageText
      ? `Tekst van de homepage/contactpagina:\n"""\n${input.pageText.slice(0, 4000)}\n"""`
      : `Alleen zoekfragment beschikbaar (site niet bereikbaar): ${input.snippet ?? '—'}`,
  ].filter(Boolean).join('\n');

  try {
    const res = await getOpenRouter().chat.completions.create({
      model: MODELS.HAIKU,
      messages: [
        { role: 'system', content: `Je bent een nuchtere lead-kwalificeerder.\n\nIDEALE KLANT:\n${scoringContext}\n\n${RUBRIC}\n\n${OUTPUT}` },
        { role: 'user', content },
      ],
      max_tokens: 450,
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    const p = parseLlmJson<Record<string, unknown>>(res.choices[0]?.message?.content);
    if (!p) throw new Error('onleesbare JSON');

    const isOrg = p.is_organisation === true;
    const n = Number(p.score);
    const seg = typeof p.segment === 'string' && /^[ABC]$/.test(p.segment) ? (p.segment as Segment) : undefined;
    const pageText = (input.pageText ?? '').toLowerCase().replace(/\s+/g, ' ');
    // Haakjes die niet (grotendeels) in de brontekst terug te vinden zijn, vallen af.
    const hooks = (Array.isArray(p.hooks) ? p.hooks : [])
      .map((h) => String(h).trim())
      .filter((h) => h.length > 3 && h.length < 200)
      .filter((h) => {
        if (!pageText) return false;
        const words = h.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
        return words.length > 0 && words.filter((w) => pageText.includes(w)).length / words.length >= 0.7;
      })
      .slice(0, 3);

    return {
      isOrganisation: isOrg,
      name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 200) : undefined,
      orgType: typeof p.org_type === 'string' ? p.org_type.slice(0, 80) : undefined,
      segment: isOrg ? seg : undefined,
      city: typeof p.city === 'string' && p.city !== 'null' ? p.city.slice(0, 100) : undefined,
      score: isOrg ? (Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : null) : 0,
      rationale: String(p.rationale ?? '').slice(0, 300) || 'Geen onderbouwing',
      summary: typeof p.summary === 'string' ? p.summary.slice(0, 500) : undefined,
      hooks,
      rejectReason: isOrg ? undefined : String(p.reject_reason ?? 'geen zelfstandige organisatie').slice(0, 200),
    };
  } catch (err) {
    console.error('qualifyOrganisation error:', err);
    return { isOrganisation: true, score: null, rationale: 'Kwalificatie mislukt — handmatig beoordelen', hooks: [] };
  }
}

export async function qualifyMany(
  inputs: QualifyInput[],
  scoringContext = DEFAULT_SCORING_CONTEXT,
  timeBudgetMs?: number,
): Promise<Qualification[]> {
  const out = await mapPool(inputs, (i) => qualifyOrganisation(i, scoringContext), {
    concurrency: 4,
    minDelayMs: 150,
    retries: 1,
    backoffMs: 800,
    timeBudgetMs,
  });
  return out.map((q) => q ?? { isOrganisation: true, score: null, rationale: 'Niet beoordeeld (tijdslimiet)', hooks: [] });
}
