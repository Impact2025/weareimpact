-- Newsletter subscriber tags (used to segment campaigns; independent from
-- the KVK/Lead Machine's `lead_lists`, which has no relation to newsletter
-- subscribers)
CREATE TABLE IF NOT EXISTS newsletter_subscriber_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(20) DEFAULT 'orange',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many: which subscribers carry which tags
CREATE TABLE IF NOT EXISTS newsletter_subscriber_tag_map (
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES newsletter_subscriber_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (subscriber_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_tag_map_tag ON newsletter_subscriber_tag_map(tag_id);

-- Newsletter Campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text TEXT,
  content_html TEXT NOT NULL,
  content_text TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'scheduled', 'archived', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  segment_id UUID REFERENCES newsletter_subscriber_tags(id) ON DELETE SET NULL,
  sender_name VARCHAR(255) DEFAULT 'WeAreImpact',
  sender_email VARCHAR(255) DEFAULT 'nieuws@weareimpact.nl',
  reply_to VARCHAR(255),
  utm_source VARCHAR(100) DEFAULT 'newsletter',
  utm_medium VARCHAR(100) DEFAULT 'email',
  utm_campaign VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled ON newsletter_campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent ON newsletter_campaigns(sent_at) DESC;

-- Newsletter campaign recipients (track which subscribers received which campaign)
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
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_subscriber ON newsletter_campaign_recipients(subscriber_id);

-- Newsletter click tracking (individual links)
CREATE TABLE IF NOT EXISTS newsletter_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES newsletter_campaign_recipients(id) ON DELETE SET NULL,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_campaign ON newsletter_clicks(campaign_id);
