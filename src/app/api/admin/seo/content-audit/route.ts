import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type AuditRow = {
  id: string;
  source: 'kennisbank' | 'blog';
  slug: string;
  title: string;
  status: string;
  reading_time: number;
  word_count_est: number;
  has_seo_title: boolean;
  has_seo_description: boolean;
  has_featured_image: boolean;
  has_excerpt: boolean;
  has_faq: boolean;
  views: number;
  published_at: string | null;
  edit_url: string;
  score: number;
  issues: string[];
  markdown_only?: boolean;
};

function scoreRow(row: Omit<AuditRow, 'score' | 'issues'>): { score: number; issues: string[] } {
  const issues: string[] = [];
  let s = 100;

  if (row.word_count_est < 300)       { issues.push('Te weinig tekst (<300 woorden)'); s -= 40; }
  else if (row.word_count_est < 600)  { issues.push('Weinig tekst (<600 woorden)'); s -= 15; }

  if (!row.has_seo_description) { issues.push('Geen meta-omschrijving'); s -= 20; }
  if (!row.has_seo_title)       { issues.push('Geen SEO-titel'); s -= 10; }
  if (!row.has_featured_image)  { issues.push('Geen uitgelichte afbeelding'); s -= 10; }
  if (!row.has_excerpt)         { issues.push('Geen excerpt'); s -= 10; }
  if (row.source === 'kennisbank' && !row.has_faq) { issues.push('Geen FAQ-sectie'); s -= 5; }
  if (row.markdown_only)        { issues.push('Alleen markdown — niet in database'); s -= 15; }

  return { score: Math.max(0, s), issues };
}

function wordCountFromContent(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET() {
  const rows: AuditRow[] = [];
  const dbKbSlugs = new Set<string>();

  // ── 1. DB: kennisbank ────────────────────────────────────────────────────
  try {
    const kb = await sql`
      SELECT
        id::text,
        slug,
        title,
        status,
        COALESCE(reading_time, 1)            AS reading_time,
        COALESCE(reading_time, 1) * 200      AS word_count_est,
        (seo_title IS NOT NULL AND seo_title <> '')                       AS has_seo_title,
        (seo_description IS NOT NULL AND seo_description <> '')           AS has_seo_description,
        (featured_image IS NOT NULL AND featured_image <> '')             AS has_featured_image,
        (excerpt IS NOT NULL AND excerpt <> '')                           AS has_excerpt,
        (faq_items IS NOT NULL AND jsonb_array_length(faq_items) > 0)    AS has_faq,
        COALESCE(views, 0)                   AS views,
        published_at
      FROM kb_articles
      WHERE status = 'published'
      ORDER BY reading_time ASC, views ASC
    ` as {
      id: string; slug: string; title: string; status: string;
      reading_time: number; word_count_est: number;
      has_seo_title: boolean; has_seo_description: boolean;
      has_featured_image: boolean; has_excerpt: boolean; has_faq: boolean;
      views: number; published_at: string | null;
    }[];

    for (const r of kb) {
      dbKbSlugs.add(r.slug);
      const base = { ...r, source: 'kennisbank' as const, edit_url: `/admin/kennisbank/${r.id}/edit` };
      const { score, issues } = scoreRow(base);
      rows.push({ ...base, score, issues });
    }
  } catch { /* DB unavailable */ }

  // ── 2. Markdown-only kennisbank (not in DB) ──────────────────────────────
  try {
    const mdDir = path.join(process.cwd(), 'content', 'kennisbank');
    if (fs.existsSync(mdDir)) {
      const files = fs.readdirSync(mdDir).filter((f) => f.endsWith('.md'));
      for (const file of files) {
        const slug = file.replace(/\.md$/, '');
        if (dbKbSlugs.has(slug)) continue; // already in DB → skip

        const raw = fs.readFileSync(path.join(mdDir, file), 'utf-8');
        const { data, content } = matter(raw);
        const wc = wordCountFromContent(content);

        const base: Omit<AuditRow, 'score' | 'issues'> = {
          id: `md-${slug}`,
          source: 'kennisbank',
          slug,
          title: (data.title as string) || slug,
          status: 'markdown',
          reading_time: Math.ceil(wc / 200),
          word_count_est: wc,
          has_seo_title: Boolean(data.seo_title),
          has_seo_description: Boolean(data.seo_description || data.description),
          has_featured_image: Boolean(data.featured_image),
          has_excerpt: Boolean(data.excerpt),
          has_faq: false,
          views: 0,
          published_at: (data.published_at as string) || null,
          edit_url: `/kennisbank/${slug}`,
          markdown_only: true,
        };
        const { score, issues } = scoreRow(base);
        rows.push({ ...base, score, issues });
      }
    }
  } catch { /* filesystem unavailable */ }

  // ── 3. DB: blog posts ────────────────────────────────────────────────────
  try {
    const blog = await sql`
      SELECT
        id::text,
        slug,
        title,
        status,
        COALESCE(reading_time, 1)            AS reading_time,
        COALESCE(reading_time, 1) * 200      AS word_count_est,
        (seo_title IS NOT NULL AND seo_title <> '')                       AS has_seo_title,
        (seo_description IS NOT NULL AND seo_description <> '')           AS has_seo_description,
        (cover_image IS NOT NULL AND cover_image <> '')                   AS has_featured_image,
        (excerpt IS NOT NULL AND excerpt <> '')                           AS has_excerpt,
        FALSE                                                             AS has_faq,
        COALESCE(views, 0)                   AS views,
        published_at
      FROM posts
      WHERE status = 'published'
      ORDER BY reading_time ASC, views ASC
    ` as {
      id: string; slug: string; title: string; status: string;
      reading_time: number; word_count_est: number;
      has_seo_title: boolean; has_seo_description: boolean;
      has_featured_image: boolean; has_excerpt: boolean; has_faq: boolean;
      views: number; published_at: string | null;
    }[];

    for (const r of blog) {
      const base = { ...r, source: 'blog' as const, edit_url: `/admin/blog/${r.id}/edit` };
      const { score, issues } = scoreRow(base);
      rows.push({ ...base, score, issues });
    }
  } catch { /* DB unavailable */ }

  // Sort: worst first
  rows.sort((a, b) => a.score - b.score);

  const summary = {
    total: rows.length,
    critical:      rows.filter((r) => r.score < 40).length,
    warning:       rows.filter((r) => r.score >= 40 && r.score < 70).length,
    good:          rows.filter((r) => r.score >= 70).length,
    markdown_only: rows.filter((r) => r.markdown_only).length,
  };

  return NextResponse.json({ rows, summary });
}
