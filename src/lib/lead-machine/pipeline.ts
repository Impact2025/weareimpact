// De Lead Machine-pijplijn (v2), gedeeld door handmatig zoeken, de cron en Iris.
//
//   bronnen ─► filter ─► ontdubbelen ─► website bezoeken ─► kwalificeren ─► resultaat
//   (zoeken, overzichts-   (geen org?     (al opgeslagen, al   (homepage +     (is het een org,
//    pagina's, vacatures)   weg, mét       in CRM, eerder        contactpagina)  segment, score,
//                           reden)         afgewezen)                            haakjes)
//
// Elke afwijzing krijgt een reden en een stap, zodat je in de UI kunt zien
// wát er is weggefilterd en waarom — geen stille zwarte doos meer.

import { sql } from '@/lib/db/neon';
import { discover } from './discovery';
import { expandDirectory } from './directory';
import { findVacancySignals } from './signals';
import { scrapeMany } from './scraper';
import { qualifyMany, DEFAULT_SCORING_CONTEXT, type QualifyInput } from './scorer';
import { classifyResult, cleanOrgName } from './validate';
import { homepageOf, registrableDomain } from './domain';
import { loadCrmIndex } from './crm';
import type { LeadSource, RejectedResult, SearchResult, SearchRunResult } from './types';

export type ProfileKind = 'search' | 'vacancy';

export interface RunSearchOptions {
  query: string;            // één of meer zoekregels, gescheiden door een nieuwe regel
  kind?: ProfileKind;
  maxResults?: number;      // max aantal NIEUWE organisaties dat we bezoeken + kwalificeren
  scoringContext?: string;
  offset?: number;          // resultaatpagina (profielcursor)
  timeBudgetMs?: number;
}

interface Candidate {
  name: string;
  url: string;              // homepage
  domain: string;
  source: LeadSource;
  sourceUrl?: string;
  snippet?: string;
  signal?: string;
  city?: string;
}

const MAX_DIRECTORIES_PER_RUN = 5;

export function splitQueries(query: string): string[] {
  return query.split(/\n+/).map((q) => q.trim()).filter(Boolean).slice(0, 8);
}

async function loadSeen(): Promise<Map<string, { outcome: string; reason: string | null }>> {
  const rows = await sql`SELECT key, outcome, reason FROM lead_seen WHERE tenant_id = 'weareimpact'`
    .catch(() => [] as Record<string, unknown>[]);
  return new Map(rows.map((r) => [String(r.key), { outcome: String(r.outcome), reason: (r.reason as string) ?? null }]));
}

export async function recordSeen(entries: Array<{ key: string; kind: string; outcome: string; reason?: string }>) {
  for (const e of entries) {
    await sql`
      INSERT INTO lead_seen (key, kind, outcome, reason)
      VALUES (${e.key}, ${e.kind}, ${e.outcome}, ${e.reason ?? null})
      ON CONFLICT (tenant_id, key) DO UPDATE SET outcome = EXCLUDED.outcome, reason = EXCLUDED.reason, created_at = NOW()
    `.catch((err) => console.error('recordSeen error:', err));
  }
}

// Afgewezen rijen tellen niet mee: die gingen vaak over een document óp een
// domein (begroting op haarlemmermeer.nl), niet over de organisatie zelf. Wat
// echt geen organisatie is, staat in lead_seen.
async function loadSavedDomains(): Promise<Map<string, string>> {
  const rows = await sql`
    SELECT domain, website, name FROM prospect_leads
    WHERE tenant_id = 'weareimpact' AND status <> 'rejected'
  `.catch(() => [] as Record<string, unknown>[]);
  const map = new Map<string, string>();
  for (const r of rows) {
    const d = (r.domain as string) || registrableDomain(r.website as string);
    if (d) map.set(d, String(r.name));
  }
  return map;
}

export async function runLeadSearch({
  query,
  kind = 'search',
  maxResults = 10,
  scoringContext = DEFAULT_SCORING_CONTEXT,
  offset = 0,
  timeBudgetMs = 120_000,
}: RunSearchOptions): Promise<SearchRunResult> {
  const startedAt = Date.now();
  const left = () => Math.max(0, timeBudgetMs - (Date.now() - startedAt));
  const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);
  const queries = splitQueries(query);

  const rejected: RejectedResult[] = [];
  const errors: string[] = [];
  const providers = new Set<string>();
  const seenLedger = await loadSeen();
  const newSeen: Array<{ key: string; kind: string; outcome: string; reason?: string }> = [];
  const stats = { searched: 0, directories: 0, candidates: 0, known: 0, evaluated: 0, accepted: 0 };

  // ── 1. Bronnen verzamelen ──────────────────────────────────────────────────
  const candidates = new Map<string, Candidate>();
  const addCandidate = (c: Omit<Candidate, 'domain' | 'url'> & { url: string }) => {
    const domain = registrableDomain(c.url);
    const home = homepageOf(c.url);
    if (!domain || !home || candidates.has(domain)) return;
    candidates.set(domain, { ...c, url: home, domain });
  };

  if (kind === 'vacancy') {
    for (const q of queries) {
      if (left() < 30_000) break;
      const run = await findVacancySignals(q, {
        offset,
        isSeen: (u) => seenLedger.has(u),
        maxEmployers: Math.max(4, Math.ceil(limit / queries.length) + 2),
      });
      providers.add(run.provider);
      errors.push(...run.errors);
      stats.searched += run.seenVacancies.length;
      for (const v of run.seenVacancies) newSeen.push({ key: v.url, kind: 'vacancy', outcome: 'vacature', reason: v.outcome });
      for (const c of run.candidates) {
        addCandidate({ name: c.name, url: c.url, source: 'vacancy', sourceUrl: c.sourceUrl, signal: c.signal, city: c.city });
      }
    }
  } else {
    const directories: Array<{ url: string; title: string }> = [];
    for (const q of queries) {
      const { results, provider, errors: errs } = await discover(q, 20, offset);
      providers.add(provider);
      errors.push(...errs);
      stats.searched += results.length;
      for (const r of results) {
        const c = classifyResult(r.title, r.url, r.snippet);
        if (c.kind === 'organisation') {
          addCandidate({ name: cleanOrgName(r.title, r.url), url: r.url, source: 'search', sourceUrl: r.url, snippet: r.snippet });
        } else if (c.kind === 'directory') {
          directories.push({ url: r.url, title: r.title });
        } else {
          rejected.push({ name: r.title, url: r.url, reason: c.reason, stage: 'filter' });
        }
      }
    }

    // Overzichtspagina's uitklappen tot organisaties (begrensd; eerder uitgeklapt = overslaan).
    for (const d of directories) {
      if (stats.directories >= MAX_DIRECTORIES_PER_RUN || left() < 40_000) {
        rejected.push({ name: d.title, url: d.url, reason: 'overzichtspagina — volgende run uitklappen', stage: 'filter' });
        continue;
      }
      if (seenLedger.has(d.url)) {
        rejected.push({ name: d.title, url: d.url, reason: 'overzichtspagina, eerder al uitgeklapt', stage: 'bekend' });
        continue;
      }
      stats.directories++;
      const found = await expandDirectory(d.url, { maxCandidates: 25, maxProfiles: 12 });
      newSeen.push({ key: d.url, kind: 'directory', outcome: 'uitgeklapt', reason: `${found.length} organisaties` });
      if (found.length === 0) {
        rejected.push({ name: d.title, url: d.url, reason: 'overzichtspagina zonder leesbare links (waarschijnlijk JavaScript)', stage: 'filter' });
      }
      for (const f of found) addCandidate({ name: f.name, url: f.url, source: 'directory', sourceUrl: f.via });
    }
  }

  stats.candidates = candidates.size;

  // ── 2. Ontdubbelen tegen opgeslagen leads, het CRM en het grootboek ────────
  const [saved, crm] = await Promise.all([loadSavedDomains(), loadCrmIndex()]);
  const fresh: Candidate[] = [];
  for (const c of candidates.values()) {
    const savedName = saved.get(c.domain);
    const inCrm = crm.match(c.domain, c.name);
    const seen = seenLedger.get(c.domain);
    if (savedName) {
      rejected.push({ name: c.name, url: c.url, reason: `staat al in de Lead Machine (${savedName})`, stage: 'bekend' });
    } else if (inCrm) {
      rejected.push({ name: c.name, url: c.url, reason: `staat al in het CRM als ${inCrm.name}`, stage: 'bekend' });
    } else if (seen) {
      rejected.push({ name: c.name, url: c.url, reason: `eerder beoordeeld: ${seen.reason ?? seen.outcome}`, stage: 'bekend' });
    } else {
      fresh.push(c);
    }
  }
  stats.known = candidates.size - fresh.length;

  // Signaalkandidaten eerst (die hebben een actuele aanleiding); daarna zoek- en
  // overzichtskandidaten om en om. Overzichtspagina's bevatten ook footerlinks
  // naar landelijke instanties, dus die mogen de batch niet domineren.
  const bySource = (s: LeadSource) => fresh.filter((c) => c.source === s);
  const interleaved: Candidate[] = [...bySource('vacancy')];
  const [fromSearch, fromDirectory] = [bySource('search'), bySource('directory')];
  for (let i = 0; i < Math.max(fromSearch.length, fromDirectory.length); i++) {
    if (fromSearch[i]) interleaved.push(fromSearch[i]);
    if (fromDirectory[i]) interleaved.push(fromDirectory[i]);
  }
  const batch = interleaved.slice(0, limit);

  // ── 3. Websites bezoeken ───────────────────────────────────────────────────
  const scraped = await scrapeMany(
    batch.map((c) => ({ key: c.domain, website: c.url })),
    { concurrency: 4, timeBudgetMs: Math.max(10_000, left() - 35_000) },
  );

  const reachable: Candidate[] = [];
  for (const c of batch) {
    const info = scraped.get(c.domain);
    if (!info?.reachable) {
      // Niet in het grootboek: een site die vandaag plat ligt, kan morgen werken.
      rejected.push({ name: c.name, url: c.url, reason: 'website niet bereikbaar', stage: 'website' });
      continue;
    }
    // Een redirect naar een ander domein (bv. fusie of overname): volg het nieuwe domein.
    const finalDomain = registrableDomain(info.finalUrl);
    if (finalDomain && finalDomain !== c.domain) {
      if (saved.has(finalDomain) || crm.match(finalDomain)) {
        rejected.push({ name: c.name, url: c.url, reason: `stuurt door naar ${finalDomain}, dat al bekend is`, stage: 'bekend' });
        continue;
      }
    }
    reachable.push(c);
  }

  // ── 4. Kwalificeren ────────────────────────────────────────────────────────
  const inputs: QualifyInput[] = reachable.map((c) => {
    const info = scraped.get(c.domain)!;
    return {
      name: info.schemaName || c.name,
      domain: c.domain,
      title: info.title,
      description: info.description,
      pageText: info.pageText,
      snippet: c.snippet,
      city: info.city ?? c.city,
      signal: c.signal,
    };
  });
  const quals = await qualifyMany(inputs, scoringContext, Math.max(5_000, left() - 10_000));
  stats.evaluated = reachable.length;

  const results: SearchResult[] = [];
  reachable.forEach((c, i) => {
    const info = scraped.get(c.domain)!;
    const q = quals[i];
    if (!q.isOrganisation) {
      rejected.push({ name: q.name || c.name, url: c.url, reason: q.rejectReason ?? 'geen zelfstandige organisatie', stage: 'kwalificatie' });
      newSeen.push({ key: c.domain, kind: 'domain', outcome: 'geen organisatie', reason: q.rejectReason });
      return;
    }
    const website = info.finalUrl ? homepageOf(info.finalUrl) ?? c.url : c.url;
    results.push({
      domain: c.domain,
      name: q.name || info.schemaName || c.name,
      website,
      email: info.email,
      emailCandidates: info.emailCandidates,
      phone: info.phone,
      kvkNumber: info.kvkNumber,
      address: info.address,
      postalCode: info.postalCode,
      city: q.city || info.city || c.city,
      contactPerson: info.contactPerson,
      aiScore: q.score ?? undefined,
      aiRationale: q.rationale,
      orgType: q.orgType,
      segment: q.segment,
      summary: q.summary,
      hooks: q.hooks,
      source: c.source,
      sourceUrl: c.sourceUrl,
      signal: c.signal,
      snippet: c.snippet,
    });
  });
  stats.accepted = results.length;

  await recordSeen(newSeen);

  results.sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));
  return {
    results,
    rejected,
    stats,
    provider: [...providers].join('+') || 'none',
    errors: [...new Set(errors)],
    freshCandidates: fresh.length,
  };
}

// Sla een beoordeelde organisatie op (upsert op registreerbaar domein of KvK).
export async function saveSearchResult(r: SearchResult, profileId?: string | null): Promise<string | null> {
  if (!r.name || !r.domain) return null;
  const now = new Date().toISOString();
  try {
    const existing = r.kvkNumber
      ? await sql`
          SELECT id FROM prospect_leads
          WHERE tenant_id = 'weareimpact' AND (domain = ${r.domain} OR kvk_number = ${r.kvkNumber})
          LIMIT 1`
      : await sql`
          SELECT id FROM prospect_leads
          WHERE tenant_id = 'weareimpact' AND domain = ${r.domain}
          LIMIT 1`;

    if (existing.length > 0) {
      const id = existing[0].id as string;
      await sql`
        UPDATE prospect_leads SET
          email = COALESCE(email, ${r.email ?? null}),
          email_candidates = ${JSON.stringify(r.emailCandidates ?? [])}::jsonb,
          phone = COALESCE(phone, ${r.phone ?? null}),
          contact_person = COALESCE(contact_person, ${r.contactPerson ?? null}),
          city = COALESCE(city, ${r.city ?? null}),
          ai_score = COALESCE(${r.aiScore ?? null}, ai_score),
          ai_rationale = COALESCE(${r.aiRationale ?? null}, ai_rationale),
          summary = COALESCE(${r.summary ?? null}, summary),
          hooks = CASE WHEN jsonb_array_length(${JSON.stringify(r.hooks ?? [])}::jsonb) > 0
                       THEN ${JSON.stringify(r.hooks ?? [])}::jsonb ELSE hooks END,
          signal = COALESCE(${r.signal ?? null}, signal),
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return id;
    }

    const inserted = await sql`
      INSERT INTO prospect_leads (
        name, domain, website, email, email_candidates, phone, contact_person, kvk_number,
        address, postal_code, city, ai_score, ai_rationale, org_type, segment, summary, hooks,
        signal, source, source_url, profile_id, sbi_description, scraped_at, scored_at
      ) VALUES (
        ${r.name.slice(0, 255)}, ${r.domain}, ${r.website}, ${r.email ?? null},
        ${JSON.stringify(r.emailCandidates ?? [])}::jsonb, ${r.phone ?? null}, ${r.contactPerson ?? null},
        ${r.kvkNumber ?? null}, ${r.address ?? null}, ${r.postalCode?.slice(0, 10) ?? null}, ${r.city ?? null},
        ${r.aiScore ?? null}, ${r.aiRationale ?? null}, ${r.orgType ?? null}, ${r.segment ?? null},
        ${r.summary ?? null}, ${JSON.stringify(r.hooks ?? [])}::jsonb, ${r.signal ?? null},
        ${r.source}, ${r.sourceUrl ?? null}, ${profileId ?? null}, ${r.orgType ?? null},
        ${now}, ${r.aiScore != null ? now : null}
      )
      ON CONFLICT (kvk_number) WHERE kvk_number IS NOT NULL DO NOTHING
      RETURNING id
    `;
    return (inserted[0]?.id as string) ?? null;
  } catch (error) {
    console.error('saveSearchResult error:', error);
    return null;
  }
}
