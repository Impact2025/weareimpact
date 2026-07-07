import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { runDueProfiles } from '@/lib/lead-machine/runProfiles';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// The cron fires once a day, so anything not processed in this run waits until
// tomorrow. Profiles are picked oldest-first and only stamped when attempted,
// so a skipped profile is first in line on the next run. The time budget keeps
// us safely inside maxDuration.
const MAX_PROFILES_PER_RUN = 4;
const TIME_BUDGET_MS = 45_000;

async function authorize(request: NextRequest): Promise<boolean> {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;

  // Allow an authenticated admin to trigger a run manually from the UI
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
    // Harde crash buiten runDueProfiles: alsnog loggen zodat het zichtbaar blijft.
    try {
      const { sql } = await import('@/lib/db/neon');
      await sql`
        INSERT INTO lead_search_runs (trigger, profiles_run, total_found, total_saved, status, error)
        VALUES ('cron', 0, 0, 0, 'error', ${String(error).slice(0, 2000)})
      `;
    } catch { /* logging mag nooit de 500 blokkeren */ }
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
