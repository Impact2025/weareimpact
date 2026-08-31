import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weareimpact.nl';

async function ensureColumns() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscriber_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        color VARCHAR(20) DEFAULT 'orange',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscriber_tag_map (
        subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES newsletter_subscriber_tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (subscriber_id, tag_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_newsletter_tag_map_tag ON newsletter_subscriber_tag_map(tag_id)
    `;

    await sql`
      ALTER TABLE newsletter_campaigns
      ADD COLUMN IF NOT EXISTS preview_text TEXT,
      ADD COLUMN IF NOT EXISTS content_text TEXT,
      ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bounce_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS unsubscribe_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS segment_id UUID,
      ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255) DEFAULT 'WeAreImpact',
      ADD COLUMN IF NOT EXISTS sender_email VARCHAR(255) DEFAULT 'nieuws@weareimpact.nl',
      ADD COLUMN IF NOT EXISTS reply_to VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100) DEFAULT 'newsletter',
      ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100) DEFAULT 'email',
      ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `;

    // Create recipient tracking table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
        subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'opened', 'clicked', 'bounced', 'unsubscribed')),
        sent_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_campaign ON newsletter_campaign_recipients(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_status ON newsletter_campaign_recipients(status);
    `;

    // Create click tracking table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_clicks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
        recipient_id UUID REFERENCES newsletter_campaign_recipients(id) ON DELETE SET NULL,
        link_url TEXT NOT NULL,
        clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_campaign ON newsletter_clicks(campaign_id);
    `;

    // Widen the status check to include 'sending'/'failed', and repoint
    // segment_id at the subscriber-tags table (it used to reference the
    // Lead Machine's `lead_lists`, which has no relation to newsletter
    // subscribers).
    await sql`
      ALTER TABLE newsletter_campaigns DROP CONSTRAINT IF EXISTS newsletter_campaigns_status_check
    `;
    await sql`
      ALTER TABLE newsletter_campaigns ADD CONSTRAINT newsletter_campaigns_status_check
      CHECK (status IN ('draft', 'sending', 'sent', 'scheduled', 'archived', 'failed'))
    `;
    await sql`
      ALTER TABLE newsletter_campaigns DROP CONSTRAINT IF EXISTS newsletter_campaigns_segment_id_fkey
    `;
    await sql`
      ALTER TABLE newsletter_campaigns ADD CONSTRAINT newsletter_campaigns_segment_id_fkey
      FOREIGN KEY (segment_id) REFERENCES newsletter_subscriber_tags(id) ON DELETE SET NULL
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_subscriber ON newsletter_campaign_recipients(subscriber_id)
    `;
  } catch (e) {
    // Tables exist already — best effort
    console.warn('ensureColumns warning:', e);
  }
}

// Transform DB row to camelCase
function transformCampaign(c: Record<string, unknown>) {
  return {
    id: c.id,
    title: c.title,
    subject: c.subject,
    previewText: c.preview_text,
    contentHtml: c.content_html,
    contentText: c.content_text,
    status: c.status,
    scheduledAt: c.scheduled_at,
    sentAt: c.sent_at,
    sentCount: c.sent_count,
    openCount: c.open_count,
    clickCount: c.click_count,
    bounceCount: c.bounce_count,
    unsubscribeCount: c.unsubscribe_count,
    segmentId: c.segment_id,
    senderName: c.sender_name,
    senderEmail: c.sender_email,
    replyTo: c.reply_to,
    utmSource: c.utm_source,
    utmMedium: c.utm_medium,
    utmCampaign: c.utm_campaign,
    metadata: c.metadata,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureColumns();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = sql`
      SELECT c.*, t.name as segment_name
      FROM newsletter_campaigns c
      LEFT JOIN newsletter_subscriber_tags t ON c.segment_id = t.id
    `;

    if (id) {
      query = sql`
        SELECT c.*, t.name as segment_name
        FROM newsletter_campaigns c
        LEFT JOIN newsletter_subscriber_tags t ON c.segment_id = t.id
        WHERE c.id = ${id}
        LIMIT 1
      `;
    } else if (status) {
      query = sql`
        SELECT c.*, t.name as segment_name
        FROM newsletter_campaigns c
        LEFT JOIN newsletter_subscriber_tags t ON c.segment_id = t.id
        WHERE c.status = ${status}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT c.*, t.name as segment_name
        FROM newsletter_campaigns c
        LEFT JOIN newsletter_subscriber_tags t ON c.segment_id = t.id
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
    }

    const campaigns = await query;

    const transformed = campaigns.map(transformCampaign);

    if (id) {
      return NextResponse.json({ campaign: transformed[0] || null });
    }

    // Get segments (subscriber tags) for dropdown, with live subscriber counts
    const segments = await sql`
      SELECT
        t.id,
        t.name,
        t.color,
        COUNT(m.subscriber_id) FILTER (WHERE s.status = 'active' AND s.verified_at IS NOT NULL) as subscriber_count
      FROM newsletter_subscriber_tags t
      LEFT JOIN newsletter_subscriber_tag_map m ON m.tag_id = t.id
      LEFT JOIN newsletter_subscribers s ON s.id = m.subscriber_id
      GROUP BY t.id, t.name, t.color
      ORDER BY t.name
    `;

    // Get stats
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
      FROM newsletter_campaigns
    `;

    return NextResponse.json({
      campaigns: transformed,
      segments,
      stats: stats[0] || { total: 0, drafts: 0, sent: 0, scheduled: 0 },
    });
  } catch (error) {
    console.error('Newsletter campaigns GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch campaigns';
    return NextResponse.json({ error: msg, campaigns: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureColumns();

    const body = await request.json();
    const {
      title,
      subject,
      preview_text,
      content_html,
      content_text,
      status = 'draft',
      scheduled_at,
      sender_name = 'WeAreImpact',
      sender_email = process.env.RESEND_FROM_EMAIL || 'nieuws@weareimpact.nl',
      reply_to,
      utm_campaign,
      segment_id,
    } = body;

    if (!title || !subject || !content_html) {
      return NextResponse.json(
        { error: 'Titel, onderwerp en content zijn verplicht' },
        { status: 400 }
      );
    }

    // Generate text content from HTML if not provided
    let generatedText = content_text;
    if (!generatedText && content_html) {
      generatedText = content_html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Set UTM campaign based on title if not provided
    const utmCampaignValue = utm_campaign || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const result = await sql`
      INSERT INTO newsletter_campaigns
        (title, subject, preview_text, content_html, content_text, status, scheduled_at,
         sender_name, sender_email, reply_to, utm_campaign, segment_id, metadata)
      VALUES
        (${title}, ${subject}, ${preview_text || null}, ${content_html}, ${generatedText},
         ${status}, ${scheduled_at || null}, ${sender_name}, ${sender_email},
         ${reply_to || null}, ${utmCampaignValue}, ${segment_id || null}, '{}')
      RETURNING id, title, subject, status, created_at
    `;

    const campaign = result[0];

    // Log activity
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES ('newsletter', 'Nieuwsbrief campagne aangemaakt', ${title}, ${JSON.stringify({ campaignId: campaign.id })})
      `;
    } catch {
      // best-effort
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: unknown) {
    console.error('Newsletter campaigns POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureColumns();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE newsletter_campaigns SET
        title = COALESCE(${updates.title}, title),
        subject = COALESCE(${updates.subject}, subject),
        preview_text = COALESCE(${updates.preview_text}, preview_text),
        content_html = COALESCE(${updates.content_html}, content_html),
        content_text = COALESCE(${updates.content_text}, content_text),
        status = COALESCE(${updates.status}, status),
        scheduled_at = COALESCE(${updates.scheduled_at}, scheduled_at),
        sender_name = COALESCE(${updates.sender_name}, sender_name),
        sender_email = COALESCE(${updates.sender_email}, sender_email),
        reply_to = COALESCE(${updates.reply_to}, reply_to),
        utm_campaign = COALESCE(${updates.utm_campaign}, utm_campaign),
        segment_id = COALESCE(${updates.segment_id}, segment_id),
        metadata = COALESCE(${updates.metadata ? JSON.stringify(updates.metadata) : null}, metadata),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, subject, status, scheduled_at, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign: result[0] });
  } catch (error) {
    console.error('Newsletter campaigns PUT error:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM newsletter_campaigns WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter campaigns DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
