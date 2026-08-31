import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { verifyRecipientToken } from '@/lib/email/tracking-token';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://weareimpact.nl';

/**
 * API route: /api/newsletter/track/unsubscribe
 * Query params: ?t=<signed recipient token>
 * GET handles a human clicking the link in their inbox (redirects to a
 * confirmation page). POST handles RFC 8058 one-click unsubscribe, which
 * mail clients (Gmail, Outlook) issue automatically alongside the
 * List-Unsubscribe-Post header — no redirect, just a 200.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ok = await unsubscribe(searchParams.get('t'));
  return NextResponse.redirect(
    ok ? `${BASE_URL}/newsletter/bevestigd?unsubscribed=true` : `${BASE_URL}/newsletter/error?reason=invalid_token`
  );
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ok = await unsubscribe(searchParams.get('t'));
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 400 });
}

async function unsubscribe(token: string | null): Promise<boolean> {
  const recipientId = await verifyRecipientToken(token);
  if (!recipientId) return false;

  try {
    const rows = await sql`
      SELECT campaign_id, subscriber_id FROM newsletter_campaign_recipients WHERE id = ${recipientId}
    `;
    const recipient = rows[0];
    if (!recipient) return false;

    await sql`
      UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE id = ${recipient.subscriber_id}
    `;

    await sql`
      UPDATE newsletter_campaign_recipients
      SET status = 'unsubscribed'
      WHERE id = ${recipientId}
    `;

    await sql`
      UPDATE newsletter_campaigns
      SET unsubscribe_count = unsubscribe_count + 1
      WHERE id = ${recipient.campaign_id}
    `;

    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES ('newsletter', 'Afmelden nieuwsbrief', '', ${JSON.stringify({ subscriberId: recipient.subscriber_id, campaignId: recipient.campaign_id })})
      `;
    } catch {
      // best-effort
    }

    return true;
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return false;
  }
}
