import { NextRequest, NextResponse } from 'next/server';
import { creditInvoice, FlowError, recordPayment, sendInvoice } from '@/lib/finance/flow';
import { parseEuroToCents } from '@/lib/finance/money';
import { renderInvoicePdf } from '@/lib/finance/pdf';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getInvoice } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string; action: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id, action } = await params;
  if (action !== 'pdf') return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 });
  const pdf = await renderInvoicePdf(invoice, await getFinanceSettings());
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Factuur ${invoice.number ?? 'concept'}.pdf"` },
  });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id, action } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    if (action === 'send') return NextResponse.json({ invoice: await sendInvoice(id, { reminder: Boolean(body.reminder) }) });
    if (action === 'payment') {
      const amount = body.amount !== undefined && body.amount !== '' ? parseEuroToCents(body.amount) : undefined;
      if (amount === null) return NextResponse.json({ error: 'Onleesbaar bedrag' }, { status: 400 });
      const paidOn = typeof body.paidOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.paidOn) ? body.paidOn : undefined;
      return NextResponse.json({ invoice: await recordPayment(id, { amountCents: amount, paidOn, method: body.method, note: body.note }) });
    }
    if (action === 'credit') return NextResponse.json({ invoice: await creditInvoice(id) }, { status: 201 });
    return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  } catch (error) {
    if (error instanceof FlowError) return NextResponse.json({ error: error.message }, { status: 422 });
    console.error(`Invoice ${action} error:`, error);
    return NextResponse.json({ error: 'Actie mislukt' }, { status: 500 });
  }
}
