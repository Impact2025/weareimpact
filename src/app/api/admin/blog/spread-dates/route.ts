import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/blog/spread-dates
 *
 * Geeft elke GEPUBLICEERDE blogpost een UNIEKE publicatiedatum, gelijkmatig
 * verspreid over een instelbaar bereik. Drafts worden nooit aangeraakt.
 *
 * Body (optioneel):
 *   { "from": "2025-10-01", "to": "2026-06-29" }
 *
 * Default bereik: 2025-10-01 t/m vandaag.
 *
 * Garanties:
 *   - geen dubbele datums (dag-niveau)
 *   - realistische publicatie-uren (9,10,11,14,15,16)
 *   - chronologische toewijzing op created_at (oudste post = vroegste datum)
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  let body: { from?: string; to?: string } = {};
  try {
    body = await request.json();
  } catch {
    // lege body is prima → defaults
  }

  const startDate = new Date((body.from ?? '2025-10-01') + 'T00:00:00Z');
  const endDate = body.to
    ? new Date(body.to + 'T00:00:00Z')
    : new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
    return NextResponse.json(
      { error: 'Ongeldig datumbereik (from moet voor to liggen, formaat YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  try {
    const posts = await sql`
      SELECT id, title FROM posts
      WHERE status = 'published'
      ORDER BY created_at ASC
    `;

    const count = posts.length;
    if (count === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Bouw lijst van beschikbare unieke dagen in het bereik.
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / dayMs);

    if (totalDays + 1 < count) {
      return NextResponse.json(
        {
          error: `Bereik te klein: ${totalDays + 1} dagen beschikbaar voor ${count} posts. Vergroot het bereik.`,
        },
        { status: 400 }
      );
    }

    const publishHours = [9, 10, 11, 14, 15, 16];
    const usedDays = new Set<string>();
    let updated = 0;

    for (let i = 0; i < count; i++) {
      // Gelijkmatige spreiding; schuif door bij een botsing.
      const fraction = count === 1 ? 0 : i / (count - 1);
      let dayOffset = Math.round(fraction * totalDays);

      let date = new Date(startDate.getTime() + dayOffset * dayMs);
      let dayKey = date.toISOString().split('T')[0];
      while (usedDays.has(dayKey) && dayOffset < totalDays) {
        dayOffset++;
        date = new Date(startDate.getTime() + dayOffset * dayMs);
        dayKey = date.toISOString().split('T')[0];
      }
      // Als vooruit vol zit, ga achteruit zoeken.
      while (usedDays.has(dayKey) && dayOffset > 0) {
        dayOffset--;
        date = new Date(startDate.getTime() + dayOffset * dayMs);
        dayKey = date.toISOString().split('T')[0];
      }
      usedDays.add(dayKey);

      const hour = publishHours[i % publishHours.length];
      date.setUTCHours(hour, 0, 0, 0);

      await sql`
        UPDATE posts
        SET published_at = ${date.toISOString()}
        WHERE id = ${posts[i].id}
      `;
      updated++;
    }

    return NextResponse.json({
      success: true,
      updated,
      range: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Error spreading blog dates:', error);
    return NextResponse.json(
      { error: 'Kon datums niet verspreiden' },
      { status: 500 }
    );
  }
}
