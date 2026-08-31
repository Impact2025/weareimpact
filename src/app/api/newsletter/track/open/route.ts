import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { verifyRecipientToken } from '@/lib/email/tracking-token';

export const dynamic = 'force-dynamic';

/**
 * API route: /api/newsletter/track/open
 * Tracks email opens via a 1x1 pixel image. Query params: ?t=<signed recipient token>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recipientId = await verifyRecipientToken(searchParams.get('t'));

  if (recipientId) {
    try {
      const rows = await sql`
        SELECT campaign_id, opened_at FROM newsletter_campaign_recipients WHERE id = ${recipientId}
      `;
      const recipient = rows[0];

      // Only count the first open per recipient, so re-opens don't inflate the rate.
      if (recipient && !recipient.opened_at) {
        await sql`
          UPDATE newsletter_campaign_recipients
          SET opened_at = NOW(),
              status = CASE WHEN status IN ('queued', 'sent') THEN 'opened' ELSE status END
          WHERE id = ${recipientId}
        `;
        await sql`
          UPDATE newsletter_campaigns SET open_count = open_count + 1 WHERE id = ${recipient.campaign_id}
        `;
      }
    } catch (error) {
      console.error('Track open error:', error);
    }
  }

  return pixelGif();
}

/**
 * Return a 1x1 transparent GIF pixel.
 */
function pixelGif(): NextResponse {
  const gifBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const buffer = Buffer.from(gifBase64, 'base64');
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
