// Read-only: haal de `content` kolom van een post op uit de Neon DB.
// Gebruikt DATABASE_URL uit .env.local. Doet GEEN write.
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// laad .env.local (minimal .env parser)
const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const sql = neon(process.env.DATABASE_URL);
const slug = process.argv[2];
if (!slug) { console.error('gebruik: node read-post-content.mjs <slug>'); process.exit(1); }

const rows = await sql`SELECT id, slug, title, content, excerpt, category, tags, seo_title, seo_description
  FROM posts WHERE slug = ${slug} LIMIT 1`;
if (!rows.length) { console.error('Post niet gevonden:', slug); process.exit(2); }
const p = rows[0];
console.log(JSON.stringify({
  id: p.id, slug: p.slug, title: p.title,
  content: p.content, excerpt: p.excerpt, category: p.category,
  tags: p.tags, seo_title: p.seo_title, seo_description: p.seo_description,
}, null, 2));
