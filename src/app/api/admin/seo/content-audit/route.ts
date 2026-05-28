import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

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
  score: number;          // 0–100
  issues: string[];
};

function score(row: Omit<AuditRow, 'score' | 'issues'>): { score: number; issues: string[] } {
  const issues: string[] = [];
  let s = 100;

  if (row.word_count_est < 300) { issues.push('Te weinig tekst (<300 woorden)'); s -= 40; }
  else if (row.word_count_est < 600) { issues.push('Weinig tekst (<600 woorden)'); s -= 15; }

  if (!row.has_seo_description) { issues.push('Geen meta-omschrijving'); s -= 20; }
  if (!row.has_seo_title)       { issues.push('Geen SEO-titel'); s -= 10; }
  if (!row.has_featured_image)  { issues.push('Geen uitgelichte afbeelding'); s -= 10; }
  if (!row.has_excerpt)         { issues.push('Geen excerpt'); s -= 10; }
  if (row.source === 'kennisbank' && !row.has_faq) {
    issues.push('Geen FAQ-sectie');
    s -= 5;
  }

  return { score: Math.max(0, s), issues };
}

export async function GET() {
  const rows: AuditRow[] = [];

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
      const base = { ...r, source: 'kennisbank' as const, edit_url: `/admin/kennisbank/${r.id}/edit` };
      const { score: s, issues } = score(base);
      rows.push({ ...base, score: s, issues });
    }
  } catch { /* DB unavailable */ }

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
      const { score: s, issues } = score(base);
      rows.push({ ...base, score: s, issues });
    }
  } catch { /* DB unavailable */ }

  // Sort: worst first
  rows.sort((a, b) => a.score - b.score);

  const summary = {
    total: rows.length,
    critical: rows.filter((r) => r.score < 40).length,
    warning:  rows.filter((r) => r.score >= 40 && r.score < 70).length,
    good:     rows.filter((r) => r.score >= 70).length,
  };

  return NextResponse.json({ rows, summary });
}
