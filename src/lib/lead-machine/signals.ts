// Koopsignalen uit vacatures.
//
// Een welzijnsorganisatie die een kwartiermaker digitalisering, informatie-
// manager of projectleider innovatie zoekt, heeft precies het probleem dat
// WeAreImpact oplost — en heeft het nú. De vacature is het bewijs, nooit de
// lead zelf: de lead is de werkgever, op diens eigen website.
// (Concept geporteerd uit AgentOS prospecting/vacature_leads.py.)
//
// Eerlijkheidsregels:
//  - uitzend-, detacherings- en wervingsbureaus zijn geen werkgever
//  - geen eigen website gevonden = geen lead (wordt geteld, niet verzonnen)

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';
import { discover, type DiscoveryResult } from './discovery';
import { classifyResult } from './validate';
import { registrableDomain } from './domain';
import { parseLlmJson } from './json';

export interface SignalCandidate {
  name: string;
  url: string;
  city?: string;
  signal: string;      // "Vacature: Kwartiermaker digitalisering"
  sourceUrl: string;   // de vacaturepagina
}

const BEMIDDELAARS = /(randstad|tempo-?team|olympia|youngcapital|adecco|manpower|brunel|michael ?page|start ?people|yacht|hays|uitzend|detacher|werving|recruit|interim ?bureau|flex|staffing|jobs?\b|vacaturebank)/i;

interface Extracted { employer: string | null; city: string | null; role: string | null; intermediary: boolean }

// Eén LLM-call voor een hele batch vacatures: werkgever, plaats, functie en
// 'is dit een bemiddelaar?'.
async function extractEmployers(items: DiscoveryResult[]): Promise<Extracted[]> {
  if (items.length === 0) return [];
  const list = items.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet ?? ''}`).join('\n');
  try {
    const res = await getOpenRouter().chat.completions.create({
      model: MODELS.HAIKU,
      messages: [
        {
          role: 'system',
          content: 'Je haalt uit vacature-zoekresultaten de werkgever. Gebruik alleen wat er staat; onbekend = null. Een uitzend-, detacherings- of wervingsbureau is GEEN werkgever: zet dan intermediary=true. Antwoord UITSLUITEND met JSON: {"items":[{"employer":"naam of null","city":"plaats of null","role":"functietitel of null","intermediary":true|false}]} in dezelfde volgorde.',
        },
        { role: 'user', content: list },
      ],
      max_tokens: 1200,
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    const p = parseLlmJson<{ items?: Extracted[] }>(res.choices[0]?.message?.content);
    return items.map((_, i) => p?.items?.[i] ?? { employer: null, city: null, role: null, intermediary: false });
  } catch (err) {
    console.error('extractEmployers error:', err);
    return items.map(() => ({ employer: null, city: null, role: null, intermediary: false }));
  }
}

// Zoek de eigen website van een werkgever: eerste resultaat dat als organisatie
// wordt herkend, en waarvan de domeinnaam op de werkgeversnaam lijkt.
async function findOwnWebsite(employer: string, city: string | null): Promise<{ url: string; errors: string[] } | null> {
  const { results, errors } = await discover(`${employer} ${city ?? ''}`.trim(), 8);
  const key = employer.toLowerCase().replace(/^(stichting|vereniging)\s+/, '').replace(/[^a-z0-9]/g, '');
  for (const r of results) {
    if (classifyResult(r.title, r.url, r.snippet).kind !== 'organisation') continue;
    const dom = (registrableDomain(r.url) ?? '').split('.')[0].replace(/[^a-z0-9]/g, '');
    const titleKey = r.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key.length >= 4 && (dom.includes(key.slice(0, 6)) || key.includes(dom) || titleKey.includes(key))) {
      return { url: r.url, errors };
    }
  }
  return errors.length ? { url: '', errors } : null;
}

export interface SignalRun {
  candidates: SignalCandidate[];
  seenVacancies: Array<{ url: string; outcome: string }>;
  errors: string[];
  provider: string;
}

export async function findVacancySignals(
  query: string,
  opts: { offset?: number; isSeen: (url: string) => boolean; maxEmployers?: number },
): Promise<SignalRun> {
  const { results, errors, provider } = await discover(query, 20, opts.offset ?? 0);
  const fresh = results.filter((r) => !opts.isSeen(r.url));
  const extracted = await extractEmployers(fresh);

  const candidates: SignalCandidate[] = [];
  const seenVacancies: SignalRun['seenVacancies'] = [];
  const employersDone = new Set<string>();

  for (let i = 0; i < fresh.length; i++) {
    const r = fresh[i];
    const e = extracted[i];
    if (!e.employer) { seenVacancies.push({ url: r.url, outcome: 'geen werkgever te herkennen' }); continue; }
    if (e.intermediary || BEMIDDELAARS.test(e.employer)) { seenVacancies.push({ url: r.url, outcome: `bemiddelaar: ${e.employer}` }); continue; }
    const k = e.employer.toLowerCase();
    if (employersDone.has(k)) { seenVacancies.push({ url: r.url, outcome: 'werkgever al in deze run' }); continue; }
    if (employersDone.size >= (opts.maxEmployers ?? 8)) break; // rest blijft ongezien → volgende run

    employersDone.add(k);
    const site = await findOwnWebsite(e.employer, e.city);
    if (site?.errors.length) errors.push(...site.errors);
    if (!site?.url) { seenVacancies.push({ url: r.url, outcome: `geen eigen website gevonden voor ${e.employer}` }); continue; }

    candidates.push({
      name: e.employer,
      url: site.url,
      city: e.city ?? undefined,
      signal: `Vacature: ${e.role ?? r.title}`.slice(0, 200),
      sourceUrl: r.url,
    });
    seenVacancies.push({ url: r.url, outcome: `werkgever ${e.employer}` });
  }

  return { candidates, seenVacancies, errors, provider };
}
