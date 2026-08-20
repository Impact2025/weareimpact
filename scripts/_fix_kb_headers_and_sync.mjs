import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function syncNewMarkdownArticles() {
  const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');
  const targetSlugs = [
    'iris-ai-manager-agentos-praktijkverhaal',
    'human-in-the-loop-goedkeuringswachtrij-ai-agents',
  ];

  let colorToggle = 0;

  for (const slug of targetSlugs) {
    const file = `${slug}.md`;
    const filePath = path.join(kennisbankDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (file not found): ${file}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);

    const existing = await sql`SELECT id FROM kb_articles WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) {
      console.log(`SKIP (already synced): ${slug}`);
      continue;
    }

    const title = data.title || slug;
    const subtitle = data.subtitle || null;
    const excerpt = data.excerpt || '';
    const category_slug = data.category_slug || 'algemeen';
    const tags = data.tags || [];
    const seo_title = data.seo_title || null;
    const seo_description = data.seo_description || null;
    const seo_keywords = data.seo_keywords || [];
    const difficulty = data.difficulty || 'beginner';
    const reading_time = data.reading_time || Math.ceil(content.split(/\s+/).length / 200);
    const author_name = data.author_name || 'Vincent van Munster';
    const author_title = data.author_title || 'Strategic Innovation Partner, WeAreImpact';
    const lead_magnet_title = data.lead_magnet_title || null;
    const lead_magnet_description = data.lead_magnet_description || null;
    const lead_magnet_type = data.lead_magnet_type || null;
    const faq_items = data.faq_items ? JSON.stringify(data.faq_items) : '[]';
    const published_at = data.published_at ? new Date(data.published_at).toISOString() : new Date().toISOString();
    const search_content = `${title} ${subtitle || ''} ${excerpt} ${content}`;
    const header_color = colorToggle % 2 === 0 ? 'orange' : 'slate';
    colorToggle++;

    await sql`
      INSERT INTO kb_articles (
        slug, title, subtitle, excerpt, content, category_slug, tags,
        seo_title, seo_description, seo_keywords,
        difficulty, reading_time, author_name, author_title,
        lead_magnet_title, lead_magnet_description, lead_magnet_type,
        faq_items, search_content, status, published_at,
        header_type, header_color
      ) VALUES (
        ${slug}, ${title}, ${subtitle}, ${excerpt}, ${content}, ${category_slug}, ${tags},
        ${seo_title}, ${seo_description}, ${seo_keywords},
        ${difficulty}, ${reading_time}, ${author_name}, ${author_title},
        ${lead_magnet_title}, ${lead_magnet_description}, ${lead_magnet_type},
        ${faq_items}, ${search_content}, 'published', ${published_at},
        'color', ${header_color}
      )
    `;
    console.log(`INSERTED: ${slug} (header_color=${header_color})`);
  }
}

async function fixMissingHeaders() {
  const rows = await sql`
    SELECT id, slug, category_slug
    FROM kb_articles
    WHERE status = 'published' AND header_type = 'image' AND featured_image IS NULL
    ORDER BY category_slug, slug
  `;

  let i = 0;
  for (const row of rows) {
    const header_color = i % 2 === 0 ? 'orange' : 'slate';
    i++;
    await sql`
      UPDATE kb_articles
      SET header_type = 'color', header_color = ${header_color}
      WHERE id = ${row.id}
    `;
    console.log(`FIXED HEADER: ${row.slug} -> ${header_color}`);
  }
  console.log(`\nTotal fixed: ${rows.length}`);
}

async function main() {
  console.log('--- Syncing new markdown articles ---');
  await syncNewMarkdownArticles();
  console.log('\n--- Fixing missing headers ---');
  await fixMissingHeaders();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
