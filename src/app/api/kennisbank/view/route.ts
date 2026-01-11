import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { articleId, visitorId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId is required' },
        { status: 400 }
      );
    }

    // Increment view count
    await sql`
      UPDATE kb_articles
      SET views = views + 1
      WHERE id = ${articleId}::uuid
    `;

    // Track unique views if visitor ID provided
    // This is a simple approach - could be enhanced with session tracking
    if (visitorId) {
      // Check if this visitor has viewed this article before (within last 24 hours)
      const existingView = await sql`
        SELECT id FROM kb_feedback
        WHERE article_id = ${articleId}::uuid
          AND visitor_id = ${visitorId}
          AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1
      `;

      // If first view from this visitor (in 24h), also increment unique views
      if (existingView.length === 0) {
        await sql`
          UPDATE kb_articles
          SET unique_views = unique_views + 1
          WHERE id = ${articleId}::uuid
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View tracking error:', error);
    // Don't fail the request for view tracking errors
    return NextResponse.json({ success: false });
  }
}
