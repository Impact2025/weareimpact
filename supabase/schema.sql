-- WeAreImpact Database Schema for Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL CHECK (category IN ('ai', 'impact', 'strategie', 'nieuws')),
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_name TEXT DEFAULT 'Vincent van Munster',
  reading_time INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- ============================================
-- AI SCAN LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scan_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  answers JSONB NOT NULL,
  result TEXT,
  matched_traject TEXT,
  source TEXT DEFAULT 'scanner',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_leads_created ON scan_leads(created_at DESC);

-- ============================================
-- CHAT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT,
  messages JSONB DEFAULT '[]',
  topic TEXT,
  source TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'blog',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- ============================================
-- ANALYTICS EVENTS TABLE (simple tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR DASHBOARD STATS
-- ============================================

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM posts WHERE status = 'published') as total_posts,
  (SELECT COUNT(*) FROM scan_leads) as total_scans,
  (SELECT COUNT(*) FROM chat_sessions) as total_chats,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active') as total_subscribers,
  (SELECT COALESCE(SUM(views), 0) FROM posts) as total_views;

-- ============================================
-- INSERT SAMPLE BLOG POST
-- ============================================
INSERT INTO posts (title, slug, excerpt, content, category, status, reading_time, published_at)
VALUES (
  'De toekomst van AI in de welzijnssector',
  'toekomst-ai-welzijn',
  'Hoe kunstmatige intelligentie de manier verandert waarop we welzijnswerk organiseren en uitvoeren.',
  '# De toekomst van AI in de welzijnssector

De welzijnssector staat aan de vooravond van een revolutie. Kunstmatige intelligentie biedt ongekende mogelijkheden om hulpverlening persoonlijker, efficiënter en toegankelijker te maken.

## De huidige uitdagingen

Welzijnsorganisaties kampen met structurele problemen:

- **Capaciteitstekort**: Er zijn simpelweg niet genoeg handen om alle hulpvragen te beantwoorden
- **Wachtlijsten**: Mensen moeten soms maanden wachten op hulp
- **Administratieve last**: Hulpverleners besteden veel tijd aan documentatie

## Hoe AI kan helpen

AI is geen vervanging voor menselijk contact, maar een versterking ervan.

Wil je meer weten over hoe AI jouw organisatie kan versterken? Neem contact op voor een vrijblijvend gesprek.',
  'ai',
  'published',
  8,
  NOW()
) ON CONFLICT (slug) DO NOTHING;
