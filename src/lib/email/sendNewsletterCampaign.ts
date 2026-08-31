import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateNewsletterCampaignEmail } from '@/lib/email/templates/newsletter-campaign';
import { createRecipientToken } from '@/lib/email/tracking-token';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;

interface CampaignRow {
  id: string;
  title: string;
  subject: string;
  preview_text: string | null;
  content_html: string;
  content_text: string | null;
  sender_name: string;
  sender_email: string;
  reply_to: string | null;
  utm_campaign: string | null;
  segment_id: string | null;
}

/**
 * Resolve the subscriber list a campaign should go to: all verified, active
 * subscribers, or (when segment_id is set) only those tagged with that
 * segment's tag.
 */
async function resolveRecipients(segmentId: string | null): Promise<{ id: string; email: string }[]> {
  if (segmentId) {
    return (await sql`
      SELECT DISTINCT s.id, s.email
      FROM newsletter_subscribers s
      JOIN newsletter_subscriber_tag_map m ON m.subscriber_id = s.id
      WHERE s.status = 'active' AND s.verified_at IS NOT NULL AND m.tag_id = ${segmentId}
    `) as { id: string; email: string }[];
  }
  return (await sql`
    SELECT id, email FROM newsletter_subscribers
    WHERE status = 'active' AND verified_at IS NOT NULL
  `) as { id: string; email: string }[];
}

/**
 * Send (or fail cleanly) a newsletter campaign. Marks the campaign 'sending'
 * up front and always resolves to a terminal status ('sent' or 'failed') —
 * never leaves it lying in 'sent' when delivery didn't actually happen.
 * Safe to call from a request handler wrapped in `after()`, or from a cron job.
 */
export async function sendNewsletterCampaign(campaignId: string): Promise<{
  ok: boolean;
  sentCount: number;
  recipientCount: number;
  error?: string;
}> {
  const campaigns = (await sql`
    SELECT id, title, subject, preview_text, content_html, content_text,
           sender_name, sender_email, reply_to, utm_campaign, segment_id
    FROM newsletter_campaigns
    WHERE id = ${campaignId}
    LIMIT 1
  `) as CampaignRow[];

  if (campaigns.length === 0) {
    return { ok: false, sentCount: 0, recipientCount: 0, error: 'Campaign not found' };
  }
  const campaign = campaigns[0];

  const subscribers = await resolveRecipients(campaign.segment_id);

  if (subscribers.length === 0) {
    await sql`
      UPDATE newsletter_campaigns SET status = 'failed' WHERE id = ${campaignId}
    `;
    return { ok: false, sentCount: 0, recipientCount: 0, error: 'Geen actieve abonnees voor dit segment' };
  }

  await sql`
    UPDATE newsletter_campaigns SET status = 'sending' WHERE id = ${campaignId}
  `;

  const webVersionUrl = `${BASE_URL}/api/newsletter/preview/${campaignId}`;
  const fromAddress = `${campaign.sender_name} <${campaign.sender_email}>`;

  // Create a recipient row per subscriber up front so tracking links can be
  // signed against a stable recipient ID.
  const recipientRows = await Promise.all(
    subscribers.map(async (s) => {
      try {
        const result = await sql`
          INSERT INTO newsletter_campaign_recipients (campaign_id, subscriber_id, status, created_at)
          VALUES (${campaignId}, ${s.id}, 'queued', NOW())
          RETURNING id
        `;
        return { subscriberId: s.id, email: s.email, recipientId: result[0].id as string };
      } catch {
        return null;
      }
    })
  );
  const recipients = recipientRows.filter(
    (r): r is { subscriberId: string; email: string; recipientId: string } => r !== null
  );

  await sql`
    UPDATE newsletter_campaigns SET sent_count = 0 WHERE id = ${campaignId}
  `;

  const batchSize = 50;
  let sentCount = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        const token = await createRecipientToken(recipient.recipientId);
        const email = generateNewsletterCampaignEmail({
          campaignId,
          subject: campaign.subject,
          previewText: campaign.preview_text || undefined,
          contentHtml: campaign.content_html,
          contentText: campaign.content_text || undefined,
          senderName: campaign.sender_name,
          senderEmail: campaign.sender_email,
          replyTo: campaign.reply_to || undefined,
          utmCampaign: campaign.utm_campaign || undefined,
          recipientToken: token,
          webVersionUrl,
        });

        const result = await sendEmail({
          to: recipient.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
          from: fromAddress,
          replyTo: campaign.reply_to || undefined,
          headers: {
            'List-Unsubscribe': `<${email.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });

        if (!result.success) {
          throw new Error(result.error || 'send failed');
        }
        return recipient.recipientId;
      })
    );

    const succeededIds: string[] = [];
    const failedIds: string[] = [];
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') succeededIds.push(r.value);
      else failedIds.push(batch[idx].recipientId);
    });

    sentCount += succeededIds.length;

    await Promise.all([
      ...succeededIds.map((id) => sql`
        UPDATE newsletter_campaign_recipients SET status = 'sent', sent_at = NOW() WHERE id = ${id}
      `),
      ...failedIds.map((id) => sql`
        UPDATE newsletter_campaign_recipients SET status = 'failed' WHERE id = ${id}
      `),
    ]);

    await sql`
      UPDATE newsletter_campaigns SET sent_count = ${sentCount} WHERE id = ${campaignId}
    `;

    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const finalStatus = sentCount > 0 ? 'sent' : 'failed';
  await sql`
    UPDATE newsletter_campaigns
    SET status = ${finalStatus}, sent_at = NOW(), sent_count = ${sentCount}
    WHERE id = ${campaignId}
  `;

  try {
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES ('newsletter', 'Nieuwsbrief verzonden', ${campaign.subject}, ${JSON.stringify({ campaignId, sentCount, recipientCount: recipients.length })})
    `;
  } catch {
    // best-effort
  }

  return { ok: sentCount > 0, sentCount, recipientCount: recipients.length };
}
