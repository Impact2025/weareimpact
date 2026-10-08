import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { runShowcaseRound } from '@/lib/showcase/flow';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

// Elk uur. Zet afspraken op 'geweest' en maakt de vraagmomenten aan die nu aan de beurt zijn.
// Zonder SHOWCASE_AUTOSEND=on blijven ze klaar staan voor Vincent. `?dry=1` laat alleen zien wat er zou gebeuren.
export async function GET(request: NextRequest) {
  if (!(await authorize(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const dry = new URL(request.url).searchParams.get('dry') === '1';
    return NextResponse.json(await runShowcaseRound({ dry }));
  } catch (error) {
    console.error('Showcase ronde error:', error);
    return NextResponse.json({ error: 'Ronde mislukt' }, { status: 500 });
  }
}
