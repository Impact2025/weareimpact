import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback } from '@/lib/crm/aftercare';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Publiek: het token uit de mail is de enige guard; één antwoord per token.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return NextResponse.json({ error: 'Kies een score van 0 tot 10' }, { status: 400 });
  }
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) || null : null;

  try {
    const saved = await submitFeedback(token, score, comment);
    if (!saved) {
      return NextResponse.json({ error: 'Deze link is al gebruikt of ongeldig' }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
