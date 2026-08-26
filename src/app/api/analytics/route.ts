import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST - Track a page view (one bundled write per visit: pageview + duration together,
// sent via sendBeacon on page leave — avoids a separate DB round trip on every page load)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorId,
      pagePath,
      pageTitle,
      referrer,
      userAgent,
      device,
      durationSeconds,
    } = body;

    if (!visitorId || !pagePath) {
      return NextResponse.json(
        { error: 'Visitor ID and page path are required' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO page_views (visitor_id, page_path, page_title, referrer, user_agent, device, duration_seconds)
      VALUES (${visitorId}, ${pagePath}, ${pageTitle || null}, ${referrer || null}, ${userAgent || null}, ${device || null}, ${durationSeconds || null})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Analytics POST error:', error);
    // Don't fail silently for analytics - just return success
    return NextResponse.json({ success: true });
  }
}

// GET - Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get page views by day
    const viewsByDay = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) as unique_visitors
      FROM page_views
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Get top pages
    const topPages = await sql`
      SELECT
        page_path,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        AVG(duration_seconds) as avg_duration
      FROM page_views
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `;

    // Get device breakdown
    const deviceBreakdown = await sql`
      SELECT
        COALESCE(device, 'unknown') as device,
        COUNT(*) as count
      FROM page_views
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY device
      ORDER BY count DESC
    `;

    // Get referrer breakdown
    const referrerBreakdown = await sql`
      SELECT
        COALESCE(
          CASE
            WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
            WHEN referrer LIKE '%google%' THEN 'Google'
            WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
            WHEN referrer LIKE '%facebook%' THEN 'Facebook'
            WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'X/Twitter'
            ELSE 'Other'
          END,
          'Direct'
        ) as source,
        COUNT(*) as count
      FROM page_views
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY source
      ORDER BY count DESC
    `;

    // Summary stats
    const summary = await sql`
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        AVG(duration_seconds) as avg_duration
      FROM page_views
      WHERE created_at >= ${startDate.toISOString()}
    `;

    return NextResponse.json({
      period,
      summary: {
        totalViews: Number(summary[0]?.total_views || 0),
        uniqueVisitors: Number(summary[0]?.unique_visitors || 0),
        avgDuration: Math.round(Number(summary[0]?.avg_duration || 0)),
      },
      viewsByDay: viewsByDay.map((row: Record<string, unknown>) => ({
        date: row.date,
        views: Number(row.views),
        uniqueVisitors: Number(row.unique_visitors),
      })),
      topPages: topPages.map((row: Record<string, unknown>) => ({
        path: row.page_path,
        views: Number(row.views),
        uniqueVisitors: Number(row.unique_visitors),
        avgDuration: Math.round(Number(row.avg_duration || 0)),
      })),
      deviceBreakdown: deviceBreakdown.map((row: Record<string, unknown>) => ({
        device: row.device,
        count: Number(row.count),
      })),
      referrerBreakdown: referrerBreakdown.map((row: Record<string, unknown>) => ({
        source: row.source,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({
      period: '30d',
      summary: { totalViews: 0, uniqueVisitors: 0, avgDuration: 0 },
      viewsByDay: [],
      topPages: [],
      deviceBreakdown: [],
      referrerBreakdown: [],
    });
  }
}
