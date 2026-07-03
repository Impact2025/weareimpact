// Run with: node scripts/setup-kennisbank.js
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Simple frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const frontmatter = match[1];
  const body = match[2];
  const data = {};

  let currentKey = null;
  let inArray = false;
  let arrayValues = [];

  frontmatter.split('\n').forEach(line => {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '');
      if (inArray && currentKey) {
        arrayValues.push(value);
      }
      return;
    }

    // Save previous array
    if (inArray && currentKey && arrayValues.length > 0) {
      data[currentKey] = arrayValues;
      arrayValues = [];
      inArray = false;
    }

    // Key: value pair
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim().replace(/^["']|["']$/g, '');

      if (value === '') {
        // Start of array
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else {
        data[key] = value;
        currentKey = key;
        inArray = false;
      }
    }
  });

  // Save last array
  if (inArray && currentKey && arrayValues.length > 0) {
    data[currentKey] = arrayValues;
  }

  return { data, content: body };
}

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
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Setting up Kennisbank tables...\n');

  try {
    // Create kb_categories table
    console.log('Creating kb_categories table...');
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
    console.log('   kb_categories created\n');

    // Insert default categories
    console.log('Inserting default categories...');
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
    console.log('   Categories inserted\n');

    // Create kb_articles table
    console.log('Creating kb_articles table...');
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
    console.log('   kb_articles created\n');

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON kb_articles(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kb_articles_published ON kb_articles(published_at DESC)`;
    console.log('   Indexes created\n');

    // Import markdown articles
    console.log('Importing markdown articles...');
    const kennisbankDir = path.join(__dirname, '..', 'content', 'kennisbank');

    if (fs.existsSync(kennisbankDir)) {
      const files = fs.readdirSync(kennisbankDir).filter(f => f.endsWith('.md'));
      console.log(`   Found ${files.length} markdown files\n`);

      for (const file of files) {
        const filePath = path.join(kennisbankDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = parseFrontmatter(fileContents);

        const wordCount = content.split(/\s+/).length;
        const reading_time = parseInt(data.reading_time) || Math.ceil(wordCount / 200);
        const search_content = `${data.title || ''} ${data.subtitle || ''} ${data.excerpt || ''} ${content.replace(/<[^>]*>/g, ' ')}`;
        const tags = Array.isArray(data.tags) ? data.tags : [];
        const seo_keywords = Array.isArray(data.seo_keywords) ? data.seo_keywords : [];

        try {
          await sql`
            INSERT INTO kb_articles (
              slug, title, subtitle, excerpt, content, category_slug, tags,
              seo_title, seo_description, seo_keywords, featured_image, featured_image_alt,
              lead_magnet_title, lead_magnet_description, lead_magnet_type,
              author_name, author_title, reading_time, difficulty,
              status, search_content, published_at
            ) VALUES (
              ${data.slug || file.replace('.md', '')},
              ${data.title || file.replace('.md', '')},
              ${data.subtitle || null},
              ${data.excerpt || ''},
              ${content},
              ${data.category_slug || 'algemeen'},
              ${tags},
              ${data.seo_title || null},
              ${data.seo_description || null},
              ${seo_keywords},
              ${data.featured_image || null},
              ${data.featured_image_alt || null},
              ${data.lead_magnet_title || null},
              ${data.lead_magnet_description || null},
              ${data.lead_magnet_type || null},
              ${data.author_name || 'Vincent van Munster'},
              ${data.author_title || 'Sociaal Ondernemer & AI Expert'},
              ${reading_time},
              ${data.difficulty || 'beginner'},
              ${data.status || 'published'},
              ${search_content},
              ${new Date().toISOString()}
            )
            ON CONFLICT (slug) DO UPDATE SET
              title = EXCLUDED.title,
              subtitle = EXCLUDED.subtitle,
              excerpt = EXCLUDED.excerpt,
              content = EXCLUDED.content,
              category_slug = EXCLUDED.category_slug,
              tags = EXCLUDED.tags,
              seo_title = EXCLUDED.seo_title,
              seo_description = EXCLUDED.seo_description,
              seo_keywords = EXCLUDED.seo_keywords,
              featured_image = EXCLUDED.featured_image,
              featured_image_alt = EXCLUDED.featured_image_alt,
              lead_magnet_title = EXCLUDED.lead_magnet_title,
              lead_magnet_description = EXCLUDED.lead_magnet_description,
              lead_magnet_type = EXCLUDED.lead_magnet_type,
              reading_time = EXCLUDED.reading_time,
              difficulty = EXCLUDED.difficulty,
              search_content = EXCLUDED.search_content,
              updated_at = NOW()
          `;
          console.log(`   Imported: ${data.title || file}`);
        } catch (err) {
          console.log(`   Error importing ${file}: ${err.message}`);
        }
      }
    } else {
      console.log('   No content/kennisbank directory found');
    }

    // Update category article counts
    console.log('\nUpdating category counts...');
    await sql`
      UPDATE kb_categories SET article_count = (
        SELECT COUNT(*) FROM kb_articles
        WHERE kb_articles.category_slug = kb_categories.slug
        AND kb_articles.status = 'published'
      )
    `;

    // Show summary
    const articles = await sql`SELECT COUNT(*) as count FROM kb_articles`;
    const categories = await sql`SELECT slug, name, article_count FROM kb_categories ORDER BY sort_order`;

    console.log('\nSummary:');
    console.log(`   Total articles: ${articles[0].count}`);
    console.log('\n   Articles per category:');
    for (const cat of categories) {
      console.log(`   - ${cat.name}: ${cat.article_count}`);
    }

    console.log('\nKennisbank setup complete!\n');
    console.log('You can now:');
    console.log('  - Go to /admin/kennisbank to manage articles');
    console.log('  - Use the AI generator to create content');
    console.log('  - View articles at /kennisbank\n');

  } catch (error) {
    console.error('Error setting up kennisbank:', error);
    process.exit(1);
  }
}

setupKennisbank();
