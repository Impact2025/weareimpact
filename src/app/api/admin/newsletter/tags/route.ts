import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * API route: /api/admin/newsletter/tags
 * Manages subscriber tags — the building block for campaign segmentation.
 */

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tags = await sql`
      SELECT
        t.id,
        t.name,
        t.color,
        t.created_at,
        COUNT(m.subscriber_id) FILTER (WHERE s.status = 'active' AND s.verified_at IS NOT NULL) as subscriber_count
      FROM newsletter_subscriber_tags t
      LEFT JOIN newsletter_subscriber_tag_map m ON m.tag_id = t.id
      LEFT JOIN newsletter_subscribers s ON s.id = m.subscriber_id
      GROUP BY t.id, t.name, t.color, t.created_at
      ORDER BY t.name
    `;
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Newsletter tags GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags', tags: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, color = 'orange' } = await request.json();
    const trimmed = typeof name === 'string' ? name.trim() : '';

    if (!trimmed) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO newsletter_subscriber_tags (name, color)
      VALUES (${trimmed}, ${color})
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name, color, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Een tag met deze naam bestaat al' }, { status: 409 });
    }

    return NextResponse.json({ tag: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Newsletter tags POST error:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    // Campaigns that used this tag as their segment fall back to "all subscribers"
    // rather than being blocked by an FK error.
    await sql`UPDATE newsletter_campaigns SET segment_id = NULL WHERE segment_id = ${id}`;

    const result = await sql`
      DELETE FROM newsletter_subscriber_tags WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter tags DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
