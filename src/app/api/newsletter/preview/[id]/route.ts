import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { generateNewsletterCampaignEmail } from '@/lib/email/templates/newsletter-campaign';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;

/**
 * API route: /api/newsletter/preview/[id]
 * Publicly renders a sent/scheduled newsletter campaign as a web page.
 */
export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const campaignId = pathname.split('/').pop();

  if (!campaignId) {
    return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
  }

  try {
    const campaigns = await sql`
      SELECT id, title, subject, preview_text, content_html, content_text,
             status, sent_at, sender_name, sender_email, reply_to
      FROM newsletter_campaigns
      WHERE id = ${campaignId}
      LIMIT 1
    `;

    if (campaigns.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[0];

    // Only allow preview if campaign is sent, scheduled, or admin is authenticated
    if (campaign.status === 'draft') {
      const isAuth = await isAdminAuthenticated();
      if (!isAuth) {
        return NextResponse.json({ error: 'Draft campaign not available' }, { status: 404 });
      }
    }

    const emailResult = generateNewsletterCampaignEmail({
      campaignId,
      subject: campaign.subject,
      previewText: campaign.preview_text,
      contentHtml: campaign.content_html,
      contentText: campaign.content_text,
      senderName: campaign.sender_name,
      senderEmail: campaign.sender_email,
      replyTo: campaign.reply_to || undefined,
      utmCampaign: campaign.utm_campaign || undefined,
      webVersionUrl: `${BASE_URL}/api/newsletter/preview/${campaignId}`,
    });

    return new NextResponse(emailResult.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Newsletter preview error:', error);
    return NextResponse.json({ error: 'Failed to render preview' }, { status: 500 });
  }
}
