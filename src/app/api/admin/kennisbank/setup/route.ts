import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST - Create kennisbank tables
export async function POST() {
  try {
    // Create kb_categories table
    await sql`
      CREATE TABLE IF NOT EXISTS kb_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        article_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Insert default categories
    await sql`
      INSERT INTO kb_categories (slug, name, description, icon, color, sort_order) VALUES
        ('sociaal-ondernemen', 'Sociaal Ondernemen', 'Van startup tot certificering', 'building', '#f97316', 1),
        ('ai-tech', 'AI & Technologie', 'Praktische AI-toepassingen', 'brain', '#3b82f6', 2),
        ('vrijwilligers', 'Vrijwilligersmanagement', 'Beleid, werving en behoud', 'users', '#10b981', 3),
        ('impact-meten', 'Impact Meten', 'Methoden en tools', 'target', '#8b5cf6', 4),
        ('subsidie-funding', 'Subsidie & Funding', 'Fondsenwerving en financiering', 'dollar-sign', '#eab308', 5),
        ('lego-serious-play', 'LEGO Serious Play', 'Methode en facilitatie', 'blocks', '#ef4444', 6)
      ON CONFLICT (slug) DO NOTHING
    `;

    // Create kb_articles table
    await sql`
      CREATE TABLE IF NOT EXISTS kb_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        category_slug TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT[] DEFAULT '{}',
        featured_image TEXT,
        featured_image_alt TEXT,
        table_of_contents JSONB DEFAULT '[]',
        faq_items JSONB DEFAULT '[]',
        lead_magnet_title TEXT,
        lead_magnet_description TEXT,
        lead_magnet_file TEXT,
        lead_magnet_type TEXT,
        search_content TEXT,
        author_name TEXT DEFAULT 'Vincent van Munster',
        author_title TEXT DEFAULT 'Sociaal Ondernemer & AI Expert',
        reading_time INTEGER DEFAULT 0,
        difficulty TEXT DEFAULT 'beginner',
        views INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status)`;

    return NextResponse.json({
      success: true,
      message: 'Kennisbank tables created successfully',
    });
  } catch (error) {
    console.error('Error setting up kennisbank:', error);
    return NextResponse.json(
      { error: 'Failed to create tables', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Check if tables exist
export async function GET() {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'kb_articles'
      ) as exists
    `;

    return NextResponse.json({
      tablesExist: result[0]?.exists || false,
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json(
      { error: 'Failed to check tables' },
      { status: 500 }
    );
  }
}
