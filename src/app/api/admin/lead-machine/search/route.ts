import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/scorer';
import { runLeadSearch, type ProfileKind } from '@/lib/lead-machine/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Handmatig zoeken wacht de gebruiker op: houd het ruim onder de 3 minuten.
const SEARCH_TIME_BUDGET_MS = 150_000;

export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { query, kind, maxResults = 10, scoringContext = DEFAULT_SCORING_CONTEXT, offset = 0 } = await request.json() as {
      query: string; kind?: ProfileKind; maxResults?: number; scoringContext?: string; offset?: number;
    };
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Zoekopdracht is verplicht' }, { status: 400 });
    }

    const run = await runLeadSearch({
      query,
      kind: kind === 'vacancy' ? 'vacancy' : 'search',
      maxResults,
      scoringContext,
      offset: Math.max(0, Math.min(Number(offset) || 0, 9)),
      timeBudgetMs: SEARCH_TIME_BUDGET_MS,
    });
    return NextResponse.json(run);
  } catch (error) {
    console.error('Lead Machine search error:', error);
    return NextResponse.json({ error: 'Zoeken mislukt', detail: String(error) }, { status: 500 });
  }
}
