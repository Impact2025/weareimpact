import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { runDueProfiles } from '@/lib/lead-machine/runProfiles';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// POST { id } — één profiel nu draaien (knop "Nu draaien"), los van de planning.
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    const result = await runDueProfiles({ profileId: id, trigger: 'manual', timeBudgetMs: 240_000 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile run error:', error);
    return NextResponse.json({ error: 'Draaien mislukt', detail: String(error) }, { status: 500 });
  }
}
