import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { suggestQueries } from '@/lib/lead-machine/queryPlanner';

export const dynamic = 'force-dynamic';

// POST { description, kind } → { queries: string[] }
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { description, kind } = await request.json();
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Beschrijf eerst je doelgroep' }, { status: 400 });
    }
    const queries = await suggestQueries(description, kind === 'vacancy' ? 'vacancy' : 'search');
    if (queries.length === 0) {
      return NextResponse.json({ error: 'Geen zoekregels kunnen maken — probeer het opnieuw' }, { status: 502 });
    }
    return NextResponse.json({ queries });
  } catch (error) {
    console.error('suggest-queries error:', error);
    return NextResponse.json({ error: 'Mislukt' }, { status: 500 });
  }
}
