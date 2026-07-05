import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { ensureSocialTable, postSocialById } from '@/lib/social/service';

export const dynamic = 'force-dynamic';

function mapPost(r: Record<string, unknown>) {
  return {
    id: r.id,
    platform: r.platform,
    content: r.content,
    status: r.status,
    externalId: r.external_id,
    error: r.error,
    articleTitle: r.article_title,
    articleUrl: r.article_url,
    imageUrl: r.image_url,
    postedAt: r.posted_at,
    createdAt: r.created_at,
  };
}

// GET — lijst social posts (nieuwste eerst, optioneel per status)
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await ensureSocialTable();
    const status = new URL(request.url).searchParams.get('status');
    const statusFrag = status && status !== 'all' ? sql`AND status = ${status}` : sql``;

    const rows = await sql`
      SELECT * FROM social_posts
      WHERE tenant_id = 'weareimpact' ${statusFrag}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const counts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'posted') as posted,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM social_posts WHERE tenant_id = 'weareimpact'
    `;

    return NextResponse.json({
      posts: rows.map(mapPost),
      counts: {
        draft: Number(counts[0]?.draft ?? 0),
        posted: Number(counts[0]?.posted ?? 0),
        failed: Number(counts[0]?.failed ?? 0),
      },
    });
  } catch (error) {
    console.error('Social GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', posts: [] }, { status: 500 });
  }
}

// POST — plaats een concept/mislukte post nu. Body: { id }
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const result = await postSocialById(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? 'Plaatsen mislukt' }, { status: 422 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Social POST error:', error);
    return NextResponse.json({ error: 'Plaatsen mislukt' }, { status: 500 });
  }
}

// PUT — bewerk de tekst van een nog niet geplaatste post. Body: { id, content }
export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, content } = await request.json();
    if (!id || !content?.trim()) {
      return NextResponse.json({ error: 'ID en content zijn verplicht' }, { status: 400 });
    }

    const result = await sql`
      UPDATE social_posts
      SET content = ${content.trim()}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = 'weareimpact' AND status IN ('draft', 'failed')
      RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden of al geplaatst' }, { status: 404 });
    }
    return NextResponse.json({ post: mapPost(result[0]) });
  } catch (error) {
    console.error('Social PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — verwijder een post (concepten en mislukte; geplaatste blijven als log)
export async function DELETE(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    await sql`
      DELETE FROM social_posts
      WHERE id = ${id} AND tenant_id = 'weareimpact' AND status IN ('draft', 'failed')
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Social DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
