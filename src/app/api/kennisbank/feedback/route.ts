import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { articleId, helpful, feedbackText, visitorId } = await request.json();

    if (!articleId || typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'articleId and helpful are required' },
        { status: 400 }
      );
    }

    // Insert feedback
    await sql`
      INSERT INTO kb_feedback (article_id, helpful, feedback_text, visitor_id)
      VALUES (${articleId}::uuid, ${helpful}, ${feedbackText || null}, ${visitorId || null})
    `;

    // Update article vote counts
    if (helpful) {
      await sql`
        UPDATE kb_articles
        SET helpful_votes = helpful_votes + 1
        WHERE id = ${articleId}::uuid
      `;
    } else {
      await sql`
        UPDATE kb_articles
        SET unhelpful_votes = unhelpful_votes + 1
        WHERE id = ${articleId}::uuid
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
