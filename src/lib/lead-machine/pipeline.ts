// Shared lead-search pipeline — used by the on-demand search route and the cron job.
// Discover organizations → scrape contact info → AI-score → flag already-saved.

import { discoverOrganizations } from './discovery';
import { scrapeMany } from './scraper';
import { scoreMany, DEFAULT_SCORING_CONTEXT } from './scorer';
import { sql } from '@/lib/db/neon';
import type { SearchResult } from './types';

export interface RunSearchOptions {
  query: string;
  maxResults?: number;
  scoringContext?: string;
}

// Kaal hostname (zonder www) — dé identiteit van een web-discovered lead.
function hostnameOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`)
      .hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export async function runLeadSearch({
  query,
  maxResults = 10,
  scoringContext = DEFAULT_SCORING_CONTEXT,
}: RunSearchOptions): Promise<SearchResult[]> {
  const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);

  // 1 — Discover organizations via DuckDuckGo
  const discovered = await discoverOrganizations(query.trim(), limit);
  if (discovered.length === 0) return [];

  // 2 — Scrape contact info from each website
  const contactMap = await scrapeMany(
    discovered.map((d) => ({ kvkNumber: d.domain, website: d.url })),
    5,
  );

  // 3 — AI score all organizations
  const scores = await scoreMany(
    discovered.map((d) => ({ name: d.name, domain: d.domain, snippet: d.snippet })),
    scoringContext,
    5,
  );

  // 4 — Check which domains are already saved
  const domains = discovered.map((d) => d.domain);
  const saved = await sql`
    SELECT website FROM prospect_leads
    WHERE tenant_id = 'weareimpact'
      AND website ILIKE ANY(${domains.map((d) => `%${d}%`)})
  `.catch(() => [] as Array<{ website: string }>);
  const savedDomains = new Set(
    saved.map((r: Record<string, unknown>) => hostnameOf(String(r.website ?? '')) ?? String(r.website ?? '')),
  );

  // 5 — Assemble + sort by score desc
  const results: SearchResult[] = discovered.map((d, i) => {
    const contact = contactMap.get(d.domain) ?? {};
    const score = scores[i];
    return {
      kvkNumber: d.domain, // reuse kvkNumber field as unique key
      name: d.name,
      website: d.url,
      email: contact.email,
      phone: contact.phone,
      aiScore: score.score ?? undefined,
      aiRationale: score.rationale,
      alreadySaved: savedDomains.has(d.domain),
      sbiDescription: d.snippet?.slice(0, 150),
    };
  });

  results.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  return results;
}

// Persist a search result as a prospect lead (idempotent on website domain when no KVK).
// Returns the lead id if inserted/updated, or null if skipped.
export async function saveSearchResult(r: SearchResult): Promise<string | null> {
  if (!r.name) return null;
  const now = new Date().toISOString();

  try {
    // Dedup op genormaliseerd domein: web-discovered leads hebben geen KVK-nummer
    // en dezelfde organisatie kan via verschillende URL's (met/zonder www, deeplink)
    // gevonden worden. SQL prefiltert breed, JS vergelijkt exact op hostname.
    const domain = r.website ? hostnameOf(r.website) : null;
    const candidates = domain
      ? await sql`
          SELECT id, website FROM prospect_leads
          WHERE tenant_id = 'weareimpact' AND website ILIKE ${'%' + domain + '%'}
        `
      : [];
    const existing = candidates.find(
      (row: Record<string, unknown>) => hostnameOf(String(row.website ?? '')) === domain,
    );

    if (existing) {
      const id = existing.id as string;
      await sql`
        UPDATE prospect_leads SET
          email = COALESCE(${r.email ?? null}, email),
          phone = COALESCE(${r.phone ?? null}, phone),
          ai_score = COALESCE(${r.aiScore ?? null}, ai_score),
          ai_rationale = COALESCE(${r.aiRationale ?? null}, ai_rationale),
          sbi_description = COALESCE(${r.sbiDescription ?? null}, sbi_description),
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return id;
    }

    const inserted = await sql`
      INSERT INTO prospect_leads (
        name, website, email, phone, ai_score, ai_rationale, sbi_description,
        scraped_at, scored_at
      )
      VALUES (
        ${r.name}, ${r.website ?? null}, ${r.email ?? null}, ${r.phone ?? null},
        ${r.aiScore ?? null}, ${r.aiRationale ?? null}, ${r.sbiDescription ?? null},
        ${r.email || r.phone ? now : null}, ${r.aiScore != null ? now : null}
      )
      RETURNING id
    `;
    return inserted[0]?.id as string ?? null;
  } catch (error) {
    console.error('saveSearchResult error:', error);
    return null;
  }
}
