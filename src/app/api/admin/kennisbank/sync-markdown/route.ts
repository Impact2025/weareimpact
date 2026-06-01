import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

// POST - Sync all markdown files from content/kennisbank/ into the database
export async function POST() {
  const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

  if (!fs.existsSync(kennisbankDir)) {
    return NextResponse.json({ error: 'content/kennisbank directory not found' }, { status: 404 });
  }

  const files = fs.readdirSync(kennisbankDir).filter((f) => f.endsWith('.md'));
  const results: { slug: string; status: 'inserted' | 'skipped' | 'error'; error?: string }[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(kennisbankDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw);

      const slug = data.slug || file.replace('.md', '');

      // Skip if slug already exists
      const existing = await sql`SELECT id FROM kb_articles WHERE slug = ${slug} LIMIT 1`;
      if (existing.length > 0) {
        results.push({ slug, status: 'skipped' });
        continue;
      }

      const title = data.title || slug;
      const subtitle = data.subtitle || null;
      const excerpt = data.excerpt || '';
      const category_slug = data.category_slug || 'algemeen';
      const tags: string[] = data.tags || [];
      const seo_title = data.seo_title || null;
      const seo_description = data.seo_description || null;
      const seo_keywords: string[] = data.seo_keywords || [];
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

      await sql`
        INSERT INTO kb_articles (
          slug, title, subtitle, excerpt, content, category_slug, tags,
          seo_title, seo_description, seo_keywords,
          difficulty, reading_time, author_name, author_title,
          lead_magnet_title, lead_magnet_description, lead_magnet_type,
          faq_items, search_content, status, published_at
        ) VALUES (
          ${slug}, ${title}, ${subtitle}, ${excerpt}, ${content}, ${category_slug}, ${tags},
          ${seo_title}, ${seo_description}, ${seo_keywords},
          ${difficulty}, ${reading_time}, ${author_name}, ${author_title},
          ${lead_magnet_title}, ${lead_magnet_description}, ${lead_magnet_type},
          ${faq_items}, ${search_content}, 'published', ${published_at}
        )
      `;

      results.push({ slug, status: 'inserted' });
    } catch (err) {
      results.push({ slug: file, status: 'error', error: String(err) });
    }
  }

  const inserted = results.filter((r) => r.status === 'inserted').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({ success: true, inserted, skipped, errors, results });
}

// GET - Preview which markdown files are not yet in the database
export async function GET() {
  const kennisbankDir = path.join(process.cwd(), 'content', 'kennisbank');

  if (!fs.existsSync(kennisbankDir)) {
    return NextResponse.json({ error: 'content/kennisbank directory not found' }, { status: 404 });
  }

  const files = fs.readdirSync(kennisbankDir).filter((f) => f.endsWith('.md'));
  const preview: { slug: string; title: string; synced: boolean }[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(kennisbankDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(raw);
      const slug = data.slug || file.replace('.md', '');

      const existing = await sql`SELECT id FROM kb_articles WHERE slug = ${slug} LIMIT 1`;
      preview.push({ slug, title: data.title || slug, synced: existing.length > 0 });
    } catch {
      preview.push({ slug: file, title: file, synced: false });
    }
  }

  return NextResponse.json({ total: preview.length, preview });
}
