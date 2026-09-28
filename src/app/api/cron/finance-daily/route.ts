import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { dailyFinanceCheck } from '@/lib/finance/flow';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

// Dagelijks: taken voor klaarstaande en achterstallige facturen en voor verlopende
// offertes. Verstuurt bewust zelf geen herinneringen aan klanten; dat blijft één klik.
export async function GET(request: NextRequest) {
  if (!(await authorize(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await dailyFinanceCheck());
  } catch (error) {
    console.error('Finance daily error:', error);
    return NextResponse.json({ error: 'Controle mislukt' }, { status: 500 });
  }
}
