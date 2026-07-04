import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { DEFAULT_SCORING_CONTEXT } from '@/lib/lead-machine/scorer';
import { runLeadSearch } from '@/lib/lead-machine/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 55;

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

    const results = await runLeadSearch({ query, maxResults, scoringContext });
    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error('Lead Machine search error:', error);
    return NextResponse.json({ error: 'Zoeken mislukt', detail: String(error) }, { status: 500 });
  }
}
