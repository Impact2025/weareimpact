import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all kennisbank articles (including drafts) for admin
export async function GET() {
  try {
    const articles = await sql`
      SELECT
        id, slug, title, subtitle, excerpt, category_slug, tags,
        featured_image, reading_time, difficulty, status,
        views, published_at, created_at, updated_at
      FROM kb_articles
      ORDER BY updated_at DESC NULLS LAST
    `;

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching kennisbank articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
