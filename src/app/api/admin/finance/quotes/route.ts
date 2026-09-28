import { NextRequest, NextResponse } from 'next/server';
import { createQuoteFromTemplate } from '@/lib/finance/create';
import { listQuotes } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const quotes = await listQuotes({ companyId: p.get('companyId') ?? undefined, dealId: p.get('dealId') ?? undefined });
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Quotes GET error:', error);
    return NextResponse.json({ error: 'Offertes laden mislukt' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const quote = await createQuoteFromTemplate({
      templateKey: typeof body.templateKey === 'string' ? body.templateKey : 'sprint',
      dealId: typeof body.dealId === 'string' ? body.dealId : null,
      companyId: typeof body.companyId === 'string' ? body.companyId : null,
    });
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('Quotes POST error:', error);
    return NextResponse.json({ error: 'Offerte aanmaken mislukt' }, { status: 500 });
  }
}
