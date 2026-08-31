import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * API route: /api/admin/newsletter-recipients
 * Returns the recipients of a newsletter campaign.
 */

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaign_id is required' },
        { status: 400 }
      );
    }

    const recipients = await sql`
      SELECT
        r.id,
        s.email,
        r.status,
        r.sent_at,
        r.opened_at,
        r.clicked_at,
        r.created_at
      FROM newsletter_campaign_recipients r
      JOIN newsletter_subscribers s ON r.subscriber_id = s.id
      WHERE r.campaign_id = ${campaignId}
      ORDER BY r.created_at DESC
      LIMIT 200
    `;

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Newsletter recipients GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    );
  }
}
