import { NextRequest, NextResponse } from 'next/server';
import { parseQuoteInput } from '@/lib/finance/input';
import { deleteQuoteDraft, getQuote, listEvents, listInvoices, updateQuoteDraft } from '@/lib/finance/store';
import { validateQuote } from '@/lib/finance/flow';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const quote = await getQuote(id);
    if (!quote) return NextResponse.json({ error: 'Offerte niet gevonden' }, { status: 404 });
    const [events, invoices] = await Promise.all([listEvents('quote', id), listInvoices({ quoteId: id })]);
    return NextResponse.json({ quote, events, invoices, problems: quote.status === 'concept' ? validateQuote(quote) : [] });
  } catch (error) {
    console.error('Quote GET error:', error);
    return NextResponse.json({ error: 'Offerte laden mislukt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const { input, error } = parseQuoteInput(await request.json().catch(() => null));
    if (!input) return NextResponse.json({ error }, { status: 400 });
    const quote = await updateQuoteDraft(id, input);
    if (!quote) {
      return NextResponse.json({ error: 'Alleen een concept kan worden aangepast. Maak een nieuwe versie.' }, { status: 409 });
    }
    return NextResponse.json({ quote, problems: validateQuote(quote) });
  } catch (error) {
    console.error('Quote PUT error:', error);
    const message = error instanceof Error && /unique/i.test(error.message) ? 'Deze referentie bestaat al.' : 'Opslaan mislukt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const ok = await deleteQuoteDraft(id);
    if (!ok) return NextResponse.json({ error: 'Alleen een concept kan worden verwijderd.' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
