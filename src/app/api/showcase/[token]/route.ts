import { NextRequest, NextResponse } from 'next/server';
import { ShowcaseError, submitAnswers, submitFollowup } from '@/lib/showcase/flow';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

type Ctx = { params: Promise<{ token: string }> };

// Publiek: het token uit de mail is de enige guard. Twee stappen: antwoorden, dan eventueel de vervolgvraag.
export async function POST(request: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const ip = getClientIp(request);
  if (!rateLimit(`vraag:${ip}`, 20, 60_000).success) {
    return NextResponse.json({ error: 'Te veel verzoeken, probeer het zo opnieuw.' }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === 'followup') {
      await submitFollowup(token, typeof body.text === 'string' ? body.text : '');
      return NextResponse.json({ success: true });
    }
    const result = await submitAnswers(token, body.answers && typeof body.answers === 'object' ? body.answers : {});
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ShowcaseError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error('Showcase-antwoord error:', error);
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw of mail me.' }, { status: 500 });
  }
}
