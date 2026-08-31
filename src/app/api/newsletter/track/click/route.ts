import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { verifyRecipientToken } from '@/lib/email/tracking-token';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';

/**
 * API route: /api/newsletter/track/click
 * Logs a link click, then redirects to the destination. Query params:
 * ?t=<signed recipient token> &u=<destination url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('u');

  // Only ever redirect to an http(s) URL — never let this become an open
  // redirect to arbitrary schemes (javascript:, data:, etc).
  const safeDestination = isSafeHttpUrl(destination) ? destination! : SITE_URL;

  const recipientId = await verifyRecipientToken(searchParams.get('t'));
  if (recipientId) {
    try {
      const rows = await sql`
        SELECT campaign_id, clicked_at FROM newsletter_campaign_recipients WHERE id = ${recipientId}
      `;
      const recipient = rows[0];

      if (recipient) {
        await sql`
          INSERT INTO newsletter_clicks (campaign_id, recipient_id, link_url)
          VALUES (${recipient.campaign_id}, ${recipientId}, ${safeDestination})
        `;

        // Only count the first click per recipient toward the campaign's click rate.
        if (!recipient.clicked_at) {
          await sql`
            UPDATE newsletter_campaign_recipients
            SET clicked_at = NOW(), status = 'clicked'
            WHERE id = ${recipientId}
          `;
          await sql`
            UPDATE newsletter_campaigns SET click_count = click_count + 1 WHERE id = ${recipient.campaign_id}
          `;
        }
      }
    } catch (error) {
      console.error('Track click error:', error);
    }
  }

  return NextResponse.redirect(safeDestination);
}

function isSafeHttpUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
