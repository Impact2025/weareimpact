import { NextRequest, NextResponse } from 'next/server';
import { renderInvoicePdf } from '@/lib/finance/pdf';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getInvoiceByToken } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Publiek via het token in de mail. Conceptfacturen (nog geen nummer) zijn nooit publiek.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);
  if (!invoice || invoice.status === 'concept') return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  const pdf = await renderInvoicePdf(invoice, await getFinanceSettings());
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Factuur ${invoice.number}.pdf"` },
  });
}
