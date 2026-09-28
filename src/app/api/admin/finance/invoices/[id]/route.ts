import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { setBoekhoudRef } from '@/lib/finance/flow';
import { getInvoice, listEvents } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const invoice = await getInvoice(id);
    if (!invoice) return NextResponse.json({ error: 'Factuur niet gevonden' }, { status: 404 });
    const [events, payments] = await Promise.all([
      listEvents('invoice', id),
      sql`SELECT id, amount_cents, paid_on::text AS paid_on, method, note FROM invoice_payments WHERE invoice_id = ${id} ORDER BY paid_on DESC, created_at DESC`,
    ]);
    return NextResponse.json({
      invoice,
      events,
      payments: payments.map((p) => ({ id: p.id, amountCents: Number(p.amount_cents), paidOn: p.paid_on, method: p.method, note: p.note })),
    });
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ error: 'Factuur laden mislukt' }, { status: 500 });
  }
}

// Alleen de boekhoudreferentie mag na verzenden nog veranderen. Bedragen en regels
// liggen vast; corrigeren gaat via een creditnota.
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if ('boekhoudRef' in body) await setBoekhoudRef(id, typeof body.boekhoudRef === 'string' ? body.boekhoudRef : null);
    return NextResponse.json({ invoice: await getInvoice(id) });
  } catch (error) {
    console.error('Invoice PATCH error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const rows = await sql`DELETE FROM invoices WHERE id = ${id} AND status = 'concept' AND number IS NULL RETURNING id`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Alleen een concept zonder nummer kan worden verwijderd.' }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invoice DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
