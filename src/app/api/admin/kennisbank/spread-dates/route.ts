import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST - Spread all article dates evenly between Dec 1, 2025 and today
export async function POST() {
  try {
    const articles = await sql`
      SELECT id, title FROM kb_articles
      ORDER BY created_at ASC
    `;

    if (articles.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    const startDate = new Date('2025-12-01T09:00:00Z');
    const endDate = new Date('2026-04-22T18:00:00Z');
    const totalMs = endDate.getTime() - startDate.getTime();
    const count = articles.length;

    // Spread dates evenly, adding some variety in publish times
    const publishTimes = [9, 10, 11, 14, 15, 16]; // Realistic publish hours
    let updated = 0;

    for (let i = 0; i < count; i++) {
      const fraction = count === 1 ? 0 : i / (count - 1);
      const dateMs = startDate.getTime() + fraction * totalMs;
      const date = new Date(dateMs);

      // Set a realistic publish hour
      const hour = publishTimes[i % publishTimes.length];
      date.setUTCHours(hour, 0, 0, 0);

      await sql`
        UPDATE kb_articles
        SET published_at = ${date.toISOString()}
        WHERE id = ${articles[i].id}
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
    console.error('Error spreading dates:', error);
    return NextResponse.json(
      { error: 'Failed to spread dates' },
      { status: 500 }
    );
  }
}

// GET - Preview what dates would be assigned
export async function GET() {
  try {
    const articles = await sql`
      SELECT id, title, published_at FROM kb_articles
      ORDER BY created_at ASC
    `;

    const startDate = new Date('2025-12-01T09:00:00Z');
    const endDate = new Date('2026-04-22T18:00:00Z');
    const totalMs = endDate.getTime() - startDate.getTime();
    const count = articles.length;
    const publishTimes = [9, 10, 11, 14, 15, 16];

    const preview = articles.map((article, i) => {
      const fraction = count === 1 ? 0 : i / (count - 1);
      const dateMs = startDate.getTime() + fraction * totalMs;
      const date = new Date(dateMs);
      date.setUTCHours(publishTimes[i % publishTimes.length], 0, 0, 0);

      return {
        id: article.id,
        title: article.title,
        currentDate: article.published_at,
        newDate: date.toISOString().split('T')[0],
      };
    });

    return NextResponse.json({ articles: preview, total: count });
  } catch (error) {
    console.error('Error previewing dates:', error);
    return NextResponse.json(
      { error: 'Failed to preview dates' },
      { status: 500 }
    );
  }
}
