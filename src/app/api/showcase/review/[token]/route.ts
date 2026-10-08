import { NextRequest, NextResponse } from 'next/server';
import { decideReview } from '@/lib/showcase/case';
import { ShowcaseError } from '@/lib/showcase/flow';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ token: string }> };

// Publiek: het token uit de mail is de enige guard.
export async function POST(request: NextRequest, { params }: Ctx) {
  const { token } = await params;
  if (!rateLimit(`showcase-review:${getClientIp(request)}`, 15, 60_000).success) {
    return NextResponse.json({ error: 'Te veel verzoeken, probeer het zo opnieuw.' }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === 'akkoord') await decideReview(token, { action: 'akkoord', name: String(body.name ?? '') });
    else if (body.action === 'opmerking') await decideReview(token, { action: 'opmerking', text: String(body.text ?? '') });
    else if (body.action === 'afwijzen') await decideReview(token, { action: 'afwijzen' });
    else return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ShowcaseError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error('Showcase-review error:', error);
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw of mail me.' }, { status: 500 });
  }
}
