import { NextRequest, NextResponse } from 'next/server';
import { listInvoices } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const invoices = await listInvoices({ companyId: p.get('companyId') ?? undefined, quoteId: p.get('quoteId') ?? undefined });
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Facturen laden mislukt' }, { status: 500 });
  }
}
