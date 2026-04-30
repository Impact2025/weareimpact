import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { articleId, email, leadMagnetType } = await request.json();

    if (!articleId || !email) {
      return NextResponse.json(
        { error: 'articleId and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get article details — markdown articles use a non-UUID id like "kb-slug"
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);

    let article: { id: string; title: string; slug: string; lead_magnet_file: string | null; lead_magnet_title: string | null } | null = null;

    if (isUuid) {
      const articles = await sql`
        SELECT id, title, slug, lead_magnet_file, lead_magnet_title
        FROM kb_articles
        WHERE id = ${articleId}::uuid
      `;
      if (articles.length > 0) article = articles[0] as { id: string; title: string; slug: string; lead_magnet_file: string | null; lead_magnet_title: string | null };
    }

    // For markdown-based articles (non-UUID id), still log the lead without a DB lookup
    if (!article && !isUuid) {
      article = { id: articleId, title: articleId, slug: articleId.replace(/^kb-/, ''), lead_magnet_file: null, lead_magnet_title: null };
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Record the download/lead (only for DB articles with a real UUID)
    if (isUuid) {
      await sql`
        INSERT INTO kb_downloads (article_id, email, lead_magnet_type, source)
        VALUES (${articleId}::uuid, ${email}, ${leadMagnetType || 'unknown'}, 'article')
      `;
    }

    // Log activity
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'Lead magnet download',
          ${`${email} downloaded "${article.lead_magnet_title || article.title}"`},
          ${JSON.stringify({ articleId, articleSlug: article.slug, email, type: leadMagnetType })}
        )
      `;
    } catch (logError) {
      // Don't fail if activity logging fails
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({
      success: true,
      downloadUrl: article.lead_magnet_file || null,
      message: 'Bedankt! Je download start zo.',
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}
