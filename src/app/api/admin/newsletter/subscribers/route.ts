import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * API route: /api/admin/newsletter/subscribers
 * Lists newsletter subscribers with their tags, and assigns/removes tags.
 */

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const tagId = searchParams.get('tag_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);

    const subscribers = await sql`
      SELECT
        s.id, s.email, s.status, s.source, s.verified_at, s.created_at,
        COALESCE(
          json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
            FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM newsletter_subscribers s
      LEFT JOIN newsletter_subscriber_tag_map m ON m.subscriber_id = s.id
      LEFT JOIN newsletter_subscriber_tags t ON t.id = m.tag_id
      WHERE (${search} = '' OR s.email ILIKE ${'%' + search + '%'})
        AND (${tagId}::uuid IS NULL OR EXISTS (
          SELECT 1 FROM newsletter_subscriber_tag_map m2
          WHERE m2.subscriber_id = s.id AND m2.tag_id = ${tagId}::uuid
        ))
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ${limit}
    `;

    const counts = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' AND verified_at IS NOT NULL THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
      FROM newsletter_subscribers
    `;

    return NextResponse.json({ subscribers, stats: counts[0] });
  } catch (error) {
    console.error('Newsletter subscribers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers', subscribers: [] }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { subscriber_id, add_tag_id, remove_tag_id } = await request.json();

    if (!subscriber_id || (!add_tag_id && !remove_tag_id)) {
      return NextResponse.json({ error: 'subscriber_id and add_tag_id or remove_tag_id are required' }, { status: 400 });
    }

    if (add_tag_id) {
      await sql`
        INSERT INTO newsletter_subscriber_tag_map (subscriber_id, tag_id)
        VALUES (${subscriber_id}, ${add_tag_id})
        ON CONFLICT DO NOTHING
      `;
    }

    if (remove_tag_id) {
      await sql`
        DELETE FROM newsletter_subscriber_tag_map
        WHERE subscriber_id = ${subscriber_id} AND tag_id = ${remove_tag_id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscribers PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update subscriber tags' }, { status: 500 });
  }
}
