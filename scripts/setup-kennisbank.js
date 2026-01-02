// Run with: node scripts/setup-kennisbank.js
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function setupKennisbank() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('🚀 Setting up Kennisbank tables...\n');

  try {
    // Create kb_categories table
    console.log('📁 Creating kb_categories table...');
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
    console.log('   ✅ kb_categories created\n');

    // Insert default categories
    console.log('📝 Inserting default categories...');
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
    console.log('   ✅ Categories inserted\n');

    // Create kb_articles table
    console.log('📄 Creating kb_articles table...');
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
    console.log('   ✅ kb_articles created\n');

    // Create indexes
    console.log('🔍 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_published ON kb_articles(published_at DESC)`;
    console.log('   ✅ Indexes created\n');

    console.log('✨ Kennisbank setup complete!\n');
    console.log('You can now:');
    console.log('  • Go to /admin/kennisbank to manage articles');
    console.log('  • Use the AI generator to create content');
    console.log('  • View articles at /kennisbank\n');

  } catch (error) {
    console.error('❌ Error setting up kennisbank:', error);
    process.exit(1);
  }
}

setupKennisbank();
