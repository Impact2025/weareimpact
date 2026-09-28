import { NextRequest, NextResponse } from 'next/server';
import { getFinanceSettings, saveFinanceSettings } from '@/lib/finance/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ settings: await getFinanceSettings() });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ settings: await saveFinanceSettings(body) });
  } catch (error) {
    console.error('Finance settings error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
