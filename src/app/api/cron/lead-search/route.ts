import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { runDueProfiles } from '@/lib/lead-machine/runProfiles';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// De cron draait één keer per dag. Profielen gaan oudste-eerst en worden pas
// afgestempeld als ze echt gedraaid hebben (niet bij een zoekprovider-storing),
// dus wat vandaag niet lukt, is morgen als eerste aan de beurt.
const MAX_PROFILES_PER_RUN = 4;
const TIME_BUDGET_MS = 270_000;

async function authorize(request: NextRequest): Promise<boolean> {
  // Vercel Cron stuurt: Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!await authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runDueProfiles({
      maxProfiles: MAX_PROFILES_PER_RUN,
      timeBudgetMs: TIME_BUDGET_MS,
      trigger: 'cron',
    });
    if (result.ran === 0) {
      return NextResponse.json({ ...result, message: 'Geen profielen die nu aan de beurt zijn.' });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron lead-search error:', error);
    try {
      const { sql } = await import('@/lib/db/neon');
      await sql`
        INSERT INTO lead_search_runs (trigger, profiles_run, total_found, total_saved, status, error)
        VALUES ('cron', 0, 0, 0, 'error', ${String(error).slice(0, 2000)})
      `;
    } catch { /* loggen mag de 500 nooit blokkeren */ }
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
