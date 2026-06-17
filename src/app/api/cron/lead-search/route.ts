import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runDueProfiles } from '@/lib/lead-machine/runProfiles';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Process at most this many profiles per invocation (each search is slow). Frequent
// cron + cadence filtering means overdue profiles get picked up on subsequent runs.
const MAX_PROFILES_PER_RUN = 2;

async function authorize(request: NextRequest): Promise<boolean> {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;

  // Allow an authenticated admin to trigger a run manually from the UI
  const store = await cookies();
  return !!store.get('admin_session')?.value;
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
    const result = await runDueProfiles({ maxProfiles: MAX_PROFILES_PER_RUN });
    if (result.ran === 0) {
      return NextResponse.json({ ...result, message: 'Geen profielen die nu aan de beurt zijn.' });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron lead-search error:', error);
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
