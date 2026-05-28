import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { discoverOrganizations } from '@/lib/lead-machine/discovery';
import { scrapeMany } from '@/lib/lead-machine/scraper';
import { scoreMany, DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/scorer';
import { sql } from '@/lib/db/neon';
import type { SearchResult } from '@/lib/lead-machine/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 55;

async function isAuthenticated() {
  const store = await cookies();
  return !!store.get('admin_session')?.value;
}

export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      query,
      maxResults = 10,
      scoringContext = DEFAULT_SCORING_CONTEXT,
    } = await request.json() as {
      query: string;
      maxResults?: number;
      scoringContext?: string;
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Zoekopdracht is verplicht' }, { status: 400 });
    }

    const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);

    // 1 — Discover organizations via DuckDuckGo
    const discovered = await discoverOrganizations(query.trim(), limit);

    if (discovered.length === 0) {
      return NextResponse.json({ results: [], total: 0 });
    }

    // 2 — Scrape contact info from each website
    const contactMap = await scrapeMany(
      discovered.map((d) => ({ kvkNumber: d.domain, website: d.url })),
      5,
    );

    // 3 — AI score all organizations
    const scores = await scoreMany(
      discovered.map((d) => ({
        name: d.name,
        domain: d.domain,
        snippet: d.snippet,
      })),
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
      saved.map((r: Record<string, unknown>) => {
        const w = String(r.website ?? '');
        try { return new URL(w).hostname.replace(/^www\./, ''); } catch { return w; }
      }),
    );

    // 5 — Assemble results
    const results: SearchResult[] = discovered.map((d, i) => {
      const contact = contactMap.get(d.domain) ?? {};
      const score = scores[i];
      return {
        kvkNumber: d.domain, // reuse kvkNumber field as unique key
        name: d.name,
        website: d.url,
        email: contact.email,
        phone: contact.phone,
        aiScore: score.score,
        aiRationale: score.rationale,
        alreadySaved: savedDomains.has(d.domain),
        // Extra discovery fields stored in sbiDescription for display
        sbiDescription: d.snippet?.slice(0, 150),
      };
    });

    // Sort by AI score descending
    results.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error('Lead Machine search error:', error);
    return NextResponse.json({ error: 'Zoeken mislukt', detail: String(error) }, { status: 500 });
  }
}
