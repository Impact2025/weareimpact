import { NextRequest, NextResponse } from 'next/server';
import { duplicateQuote } from '@/lib/finance/create';
import { FlowError, resendQuote, sendQuote, sendQuoteTestMail } from '@/lib/finance/flow';
import { renderQuotePdf } from '@/lib/finance/pdf';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getQuote } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string; action: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id, action } = await params;
  if (action !== 'pdf') return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  const quote = await getQuote(id);
  if (!quote) return NextResponse.json({ error: 'Offerte niet gevonden' }, { status: 404 });
  const pdf = await renderQuotePdf(quote, await getFinanceSettings());
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Offerte ${quote.reference}.pdf"` },
  });
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id, action } = await params;
  try {
    if (action === 'send') {
      return NextResponse.json({ quote: await sendQuote(id) });
    }
    if (action === 'resend') {
      return NextResponse.json({ to: await resendQuote(id) });
    }
    if (action === 'testmail') {
      return NextResponse.json({ to: await sendQuoteTestMail(id) });
    }
    if (action === 'duplicate') {
      const source = await getQuote(id);
      if (!source) return NextResponse.json({ error: 'Offerte niet gevonden' }, { status: 404 });
      return NextResponse.json({ quote: await duplicateQuote(source) }, { status: 201 });
    }
    return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  } catch (error) {
    if (error instanceof FlowError) return NextResponse.json({ error: error.message }, { status: 422 });
    console.error(`Quote ${action} error:`, error);
    return NextResponse.json({ error: 'Actie mislukt' }, { status: 500 });
  }
}
