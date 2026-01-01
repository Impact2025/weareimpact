-- WeAreImpact Kennisbank Schema Extension
-- Run AFTER schema.sql

-- ============================================
-- ENABLE VECTOR EXTENSION (for AI search)
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- KENNISBANK CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color for UI
  sort_order INTEGER DEFAULT 0,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO kb_categories (slug, name, description, icon, color, sort_order) VALUES
  ('sociaal-ondernemen', 'Sociaal Ondernemen', 'Van startup tot certificering - alles over sociaal ondernemerschap', '🏢', '#f97316', 1),
  ('ai-tech', 'AI & Technologie', 'Praktische AI-toepassingen voor non-profits en welzijnsorganisaties', '🤖', '#3b82f6', 2),
  ('vrijwilligers', 'Vrijwilligersmanagement', 'Beleid, werving en behoud van vrijwilligers', '👥', '#10b981', 3),
  ('impact-meten', 'Impact Meten', 'Methoden en tools om je maatschappelijke impact te meten', '📊', '#8b5cf6', 4),
  ('subsidie-funding', 'Subsidie & Funding', 'Fondsenwerving, subsidies en financiering', '💰', '#eab308', 5),
  ('lego-serious-play', 'LEGO Serious Play', 'Methode, toepassingen en facilitatie', '🎯', '#ef4444', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- KENNISBANK ARTICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic content
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content

  -- Categorization
  category_slug TEXT NOT NULL REFERENCES kb_categories(slug),
  tags TEXT[] DEFAULT '{}',

  -- SEO fields
  seo_title TEXT, -- max 60 chars
  seo_description TEXT, -- max 160 chars
  seo_keywords TEXT[] DEFAULT '{}',
  canonical_url TEXT,

  -- Rich content
  featured_image TEXT,
  featured_image_alt TEXT,
  table_of_contents JSONB DEFAULT '[]', -- [{id, title, level}]
  faq_items JSONB DEFAULT '[]', -- [{question, answer}]

  -- Lead magnet
  lead_magnet_title TEXT,
  lead_magnet_description TEXT,
  lead_magnet_file TEXT,
  lead_magnet_type TEXT, -- 'pdf', 'template', 'checklist', 'spreadsheet'

  -- AI/Search (vector field for semantic search)
  embedding vector(1536),
  search_content TEXT, -- denormalized searchable text

  -- Metadata
  author_name TEXT DEFAULT 'Vincent van Munster',
  author_title TEXT DEFAULT 'Sociaal Ondernemer & AI Expert',
  reading_time INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Analytics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category_slug);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_published ON kb_articles(published_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_kb_articles_search ON kb_articles
  USING GIN (to_tsvector('dutch', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(search_content, '')));

-- Vector similarity search index (IVFFlat for performance)
CREATE INDEX IF NOT EXISTS idx_kb_articles_embedding ON kb_articles
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- KENNISBANK FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kb_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_feedback_article ON kb_feedback(article_id);

-- ============================================
-- KENNISBANK SEARCH QUERIES (for analytics & content gaps)
-- ============================================
CREATE TABLE IF NOT EXISTS kb_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  query_normalized TEXT, -- lowercase, trimmed
  results_count INTEGER DEFAULT 0,
  clicked_article_id UUID REFERENCES kb_articles(id),
  session_id TEXT,
  visitor_id TEXT,
  source TEXT DEFAULT 'search', -- 'search', 'chat', 'voice'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_queries_created ON kb_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_queries_normalized ON kb_queries(query_normalized);

-- ============================================
-- LEAD MAGNET DOWNLOADS
-- ============================================
CREATE TABLE IF NOT EXISTS kb_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES kb_articles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  lead_magnet_type TEXT,
  source TEXT DEFAULT 'article',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_downloads_email ON kb_downloads(email);
CREATE INDEX IF NOT EXISTS idx_kb_downloads_article ON kb_downloads(article_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on kb_articles
DROP TRIGGER IF EXISTS update_kb_articles_updated_at ON kb_articles;
CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update category article count
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE kb_categories
    SET article_count = (
      SELECT COUNT(*) FROM kb_articles
      WHERE category_slug = NEW.category_slug AND status = 'published'
    )
    WHERE slug = NEW.category_slug;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE kb_categories
    SET article_count = (
      SELECT COUNT(*) FROM kb_articles
      WHERE category_slug = OLD.category_slug AND status = 'published'
    )
    WHERE slug = OLD.category_slug;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_count ON kb_articles;
CREATE TRIGGER update_category_count
  AFTER INSERT OR UPDATE OR DELETE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_category_article_count();

-- ============================================
-- HYBRID SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION kb_hybrid_search(
  search_query TEXT,
  query_embedding vector(1536) DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  match_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  category_slug TEXT,
  reading_time INTEGER,
  published_at TIMESTAMPTZ,
  similarity_score FLOAT,
  text_rank FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.category_slug,
    a.reading_time,
    a.published_at,
    CASE
      WHEN query_embedding IS NOT NULL AND a.embedding IS NOT NULL
      THEN 1 - (a.embedding <=> query_embedding)
      ELSE 0.0
    END as similarity_score,
    ts_rank(
      to_tsvector('dutch', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.search_content, '')),
      plainto_tsquery('dutch', search_query)
    ) as text_rank,
    -- Combined score: 60% semantic, 40% keyword (when embedding available)
    CASE
      WHEN query_embedding IS NOT NULL AND a.embedding IS NOT NULL
      THEN (1 - (a.embedding <=> query_embedding)) * 0.6 +
           ts_rank(
             to_tsvector('dutch', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.search_content, '')),
             plainto_tsquery('dutch', search_query)
           ) * 0.4
      ELSE ts_rank(
             to_tsvector('dutch', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.search_content, '')),
             plainto_tsquery('dutch', search_query)
           )
    END as combined_score
  FROM kb_articles a
  WHERE
    a.status = 'published'
    AND (category_filter IS NULL OR a.category_slug = category_filter)
    AND (
      to_tsvector('dutch', coalesce(a.title, '') || ' ' || coalesce(a.excerpt, '') || ' ' || coalesce(a.search_content, ''))
      @@ plainto_tsquery('dutch', search_query)
      OR (query_embedding IS NOT NULL AND a.embedding IS NOT NULL AND 1 - (a.embedding <=> query_embedding) > 0.3)
    )
  ORDER BY combined_score DESC
  LIMIT match_limit;
END;
$$;

-- ============================================
-- CONTENT GAP ANALYSIS VIEW
-- ============================================
CREATE OR REPLACE VIEW kb_content_gaps AS
SELECT
  query_normalized as query,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  MAX(created_at) as last_searched
FROM kb_queries
WHERE
  created_at > NOW() - INTERVAL '30 days'
  AND results_count < 3
GROUP BY query_normalized
HAVING COUNT(*) >= 3
ORDER BY search_count DESC;

-- ============================================
-- DASHBOARD STATS VIEW (extended)
-- ============================================
CREATE OR REPLACE VIEW kb_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM kb_articles WHERE status = 'published') as total_articles,
  (SELECT COUNT(*) FROM kb_categories) as total_categories,
  (SELECT COALESCE(SUM(views), 0) FROM kb_articles) as total_views,
  (SELECT COALESCE(SUM(helpful_votes), 0) FROM kb_articles) as total_helpful,
  (SELECT COALESCE(SUM(unhelpful_votes), 0) FROM kb_articles) as total_unhelpful,
  (SELECT COUNT(*) FROM kb_queries WHERE created_at > NOW() - INTERVAL '7 days') as searches_last_week,
  (SELECT COUNT(*) FROM kb_downloads WHERE created_at > NOW() - INTERVAL '7 days') as downloads_last_week,
  (SELECT COUNT(DISTINCT email) FROM kb_downloads) as unique_leads;
