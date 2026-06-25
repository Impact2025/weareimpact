import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { postId, articleId, slug, visitorId } = await request.json();
    const effectivePostId = postId || articleId;

    if (!slug && !effectivePostId) {
      return NextResponse.json(
        { error: 'slug or postId is required' },
        { status: 400 }
      );
    }

    if (effectivePostId) {
      await sql`
        UPDATE posts
        SET views = views + 1
        WHERE id = ${effectivePostId}::uuid
      `;
    } else {
      await sql`
        UPDATE posts
        SET views = views + 1
        WHERE slug = ${slug}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog view tracking error:', error);
    return NextResponse.json({ success: false });
  }
}
