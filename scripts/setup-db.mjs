import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dGa6SXwq5IHv@ep-soft-term-aggiz0yx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  console.log('🚀 Setting up WeAreImpact database...\n');

  try {
    // 1. Create UUID extension
    console.log('📦 Creating UUID extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 2. Create posts table
    console.log('📝 Creating posts table...');
    await sql`
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
      )
    `;

    // 3. Create scan_leads table
    console.log('📊 Creating scan_leads table...');
    await sql`
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
      )
    `;

    // 4. Create chat_sessions table
    console.log('💬 Creating chat_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        visitor_id TEXT,
        messages JSONB DEFAULT '[]',
        topic TEXT,
        source TEXT DEFAULT 'chat',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 5. Create newsletter_subscribers table
    console.log('📧 Creating newsletter_subscribers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
        source TEXT DEFAULT 'blog',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 6. Create analytics_events table
    console.log('📈 Creating analytics_events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type TEXT NOT NULL,
        page_path TEXT,
        metadata JSONB DEFAULT '{}',
        visitor_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 7. Create admin_users table
    console.log('👤 Creating admin_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      )
    `;

    // 8. Create indexes
    console.log('🔍 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_scan_leads_created ON scan_leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type)`;

    // 9. Insert sample blog post
    console.log('✍️  Inserting sample blog post...');
    await sql`
      INSERT INTO posts (title, slug, excerpt, content, category, status, reading_time, published_at)
      VALUES (
        'De toekomst van AI in de welzijnssector',
        'toekomst-ai-welzijn',
        'Hoe kunstmatige intelligentie de manier verandert waarop we welzijnswerk organiseren en uitvoeren.',
        '# De toekomst van AI in de welzijnssector

De welzijnssector staat aan de vooravond van een revolutie. Kunstmatige intelligentie biedt ongekende mogelijkheden om hulpverlening persoonlijker, efficiënter en toegankelijker te maken.

## De huidige uitdagingen

Welzijnsorganisaties kampen met structurele problemen zoals capaciteitstekort, wachtlijsten en administratieve last.

## Hoe AI kan helpen

AI is geen vervanging voor menselijk contact, maar een versterking ervan.

Wil je meer weten? Neem contact op voor een vrijblijvend gesprek.',
        'ai',
        'published',
        8,
        NOW()
      )
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('\n✨ Database setup complete!\n');

    // Test the connection
    const posts = await sql`SELECT COUNT(*) as count FROM posts`;
    const leads = await sql`SELECT COUNT(*) as count FROM scan_leads`;

    console.log('📊 Current stats:');
    console.log(`   - Posts: ${posts[0].count}`);
    console.log(`   - Scan Leads: ${leads[0].count}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
