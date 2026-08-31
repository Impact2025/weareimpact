import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendNewsletterCampaign } from '@/lib/email/sendNewsletterCampaign';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * API route: /api/admin/newsletter/send
 * Sends (or schedules) a newsletter campaign to its resolved recipient list.
 */
export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      campaign_id,
      send_now = false,
      scheduled_at,
    } = body;

    if (!campaign_id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const campaigns = await sql`
      SELECT id, subject, status FROM newsletter_campaigns WHERE id = ${campaign_id} LIMIT 1
    `;

    if (campaigns.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[0];

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Deze campagne is al verzonden of wordt al verzonden' },
        { status: 409 }
      );
    }

    if (send_now) {
      // Run the actual send after the response is flushed, using after() so
      // the serverless function stays alive until it finishes instead of
      // being torn down the moment we respond (the old `void sendCampaign()`
      // fire-and-forget pattern could get killed mid-send on Vercel).
      after(async () => {
        try {
          await sendNewsletterCampaign(campaign_id);
        } catch (error) {
          console.error('Background newsletter send failed:', error);
          await sql`UPDATE newsletter_campaigns SET status = 'failed' WHERE id = ${campaign_id}`.catch(() => {});
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Verzending gestart — dit kan een paar minuten duren voor grote lijsten.',
      });
    } else if (scheduled_at) {
      await sql`
        UPDATE newsletter_campaigns
        SET status = 'scheduled', scheduled_at = ${new Date(scheduled_at).toISOString()}
        WHERE id = ${campaign_id}
      `;

      try {
        await sql`
          INSERT INTO activity_log (type, title, description, metadata)
          VALUES ('newsletter', 'Nieuwsbrief gepland', ${campaign.subject}, ${JSON.stringify({ campaignId: campaign_id, scheduledAt: scheduled_at })})
        `;
      } catch {
        // best-effort
      }

      return NextResponse.json({
        success: true,
        message: `Nieuwsbrief gepland voor ${new Date(scheduled_at).toLocaleString('nl-NL')}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Specify send_now=true or scheduled_at' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Send newsletter error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
