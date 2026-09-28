import { NextRequest, NextResponse } from 'next/server';
import { acceptQuote, declineQuote, FlowError, recordQuoteView } from '@/lib/finance/flow';
import { renderQuotePdf } from '@/lib/finance/pdf';
import { getFinanceSettings } from '@/lib/finance/settings';
import { getQuoteByToken } from '@/lib/finance/store';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

type Ctx = { params: Promise<{ token: string; action: string }> };

// Publiek: het token uit de mail is de enige guard. Een concept is nooit publiek.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token, action } = await params;
  if (action !== 'pdf') return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  const quote = await getQuoteByToken(token);
  if (!quote || quote.status === 'concept') return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  const pdf = await renderQuotePdf(quote, await getFinanceSettings());
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="Offerte ${quote.reference}.pdf"` },
  });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { token, action } = await params;
  const ip = getClientIp(request);
  if (!rateLimit(`offerte:${ip}`, 20, 60_000).success) return NextResponse.json({ error: 'Te veel verzoeken, probeer het zo opnieuw.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  try {
    // Weergave wordt vanuit de browser gemeld: mail-scanners die alleen de pagina ophalen tellen zo niet mee.
    if (action === 'view') {
      await recordQuoteView(token);
      return NextResponse.json({ success: true });
    }
    if (action === 'accept') {
      if (body.confirm !== true) return NextResponse.json({ error: 'Bevestig dat je akkoord gaat.' }, { status: 400 });
      const quote = await acceptQuote(token, {
        name: typeof body.name === 'string' ? body.name : '',
        role: typeof body.role === 'string' ? body.role : '',
        ip,
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ success: true, acceptedAt: quote.acceptedAt });
    }
    if (action === 'decline') {
      await declineQuote(token, typeof body.reason === 'string' ? body.reason : null);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Onbekende actie' }, { status: 404 });
  } catch (error) {
    if (error instanceof FlowError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(`Offerte ${action} error:`, error);
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw of mail me.' }, { status: 500 });
  }
}
