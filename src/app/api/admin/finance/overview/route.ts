import { NextResponse } from 'next/server';
import { getFinanceOverview } from '@/lib/finance/overview';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getFinanceOverview());
  } catch (error) {
    console.error('Finance overview error:', error);
    return NextResponse.json({ error: 'Overzicht laden mislukt' }, { status: 500 });
  }
}
