import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  visitors: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  scans: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  chats: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  posts: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changeCount: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'scan' | 'chat' | 'blog' | 'lead';
    title: string;
    description?: string;
    createdAt: string;
  }>;
  leadsOverview: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };
  topPages: Array<{
    path: string;
    views: number;
  }>;
  chatsBySource: {
    widget: number;
    booking: number;
    scan: number;
    kennisbank: number;
  };
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all queries in parallel for performance
    const [
      visitorsThisMonth,
      visitorsLastMonth,
      visitorsTotal,
      scansThisMonth,
      scansLastMonth,
      scansTotal,
      chatsThisMonth,
      chatsLastMonth,
      chatsTotal,
      postsThisMonth,
      postsTotal,
      recentActivity,
      leadsOverview,
      topPages,
      chatsBySource,
    ] = await Promise.all([
      // Visitors this month
      sql`SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= ${startOfMonth.toISOString()}`,
      // Visitors last month
      sql`SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= ${startOfLastMonth.toISOString()} AND created_at < ${startOfMonth.toISOString()}`,
      // Total visitors
      sql`SELECT COUNT(DISTINCT visitor_id) as count FROM page_views`,

      // Scans this month
      sql`SELECT COUNT(*) as count FROM ai_scan_leads WHERE created_at >= ${startOfMonth.toISOString()}`,
      // Scans last month
      sql`SELECT COUNT(*) as count FROM ai_scan_leads WHERE created_at >= ${startOfLastMonth.toISOString()} AND created_at < ${startOfMonth.toISOString()}`,
      // Total scans
      sql`SELECT COUNT(*) as count FROM ai_scan_leads`,

      // Chats this month
      sql`SELECT COUNT(*) as count FROM chat_sessions WHERE created_at >= ${startOfMonth.toISOString()}`,
      // Chats last month
      sql`SELECT COUNT(*) as count FROM chat_sessions WHERE created_at >= ${startOfLastMonth.toISOString()} AND created_at < ${startOfMonth.toISOString()}`,
      // Total chats
      sql`SELECT COUNT(*) as count FROM chat_sessions`,

      // Posts this month
      sql`SELECT COUNT(*) as count FROM posts WHERE status = 'published' AND created_at >= ${startOfMonth.toISOString()}`,
      // Total posts
      sql`SELECT COUNT(*) as count FROM posts WHERE status = 'published'`,

      // Recent activity (last 10 items)
      sql`SELECT id, type, title, description, created_at FROM activity_log ORDER BY created_at DESC LIMIT 10`,

      // Leads overview
      sql`SELECT
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
        COUNT(*) FILTER (WHERE status = 'converted') as converted
      FROM ai_scan_leads`,

      // Top pages (last 30 days)
      sql`SELECT page_path as path, COUNT(*) as views
        FROM page_views
        WHERE created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 5`,

      // Chats by source
      sql`SELECT
        COUNT(*) FILTER (WHERE source = 'widget') as widget,
        COUNT(*) FILTER (WHERE source = 'booking') as booking,
        COUNT(*) FILTER (WHERE source = 'scan') as scan,
        COUNT(*) FILTER (WHERE source = 'kennisbank') as kennisbank
      FROM chat_sessions`,
    ]);

    // Build response
    const stats: DashboardStats = {
      visitors: {
        total: Number(visitorsTotal[0]?.count || 0),
        thisMonth: Number(visitorsThisMonth[0]?.count || 0),
        lastMonth: Number(visitorsLastMonth[0]?.count || 0),
        changePercent: calculateChange(
          Number(visitorsThisMonth[0]?.count || 0),
          Number(visitorsLastMonth[0]?.count || 0)
        ),
      },
      scans: {
        total: Number(scansTotal[0]?.count || 0),
        thisMonth: Number(scansThisMonth[0]?.count || 0),
        lastMonth: Number(scansLastMonth[0]?.count || 0),
        changePercent: calculateChange(
          Number(scansThisMonth[0]?.count || 0),
          Number(scansLastMonth[0]?.count || 0)
        ),
      },
      chats: {
        total: Number(chatsTotal[0]?.count || 0),
        thisMonth: Number(chatsThisMonth[0]?.count || 0),
        lastMonth: Number(chatsLastMonth[0]?.count || 0),
        changePercent: calculateChange(
          Number(chatsThisMonth[0]?.count || 0),
          Number(chatsLastMonth[0]?.count || 0)
        ),
      },
      posts: {
        total: Number(postsTotal[0]?.count || 0),
        thisMonth: Number(postsThisMonth[0]?.count || 0),
        lastMonth: 0, // Not tracked for posts
        changeCount: Number(postsThisMonth[0]?.count || 0),
      },
      recentActivity: (recentActivity || []).map((activity: Record<string, unknown>) => ({
        id: activity.id as string,
        type: activity.type as 'scan' | 'chat' | 'blog' | 'lead',
        title: activity.title as string,
        description: activity.description as string | undefined,
        createdAt: activity.created_at as string,
      })),
      leadsOverview: {
        new: Number(leadsOverview[0]?.new || 0),
        contacted: Number(leadsOverview[0]?.contacted || 0),
        qualified: Number(leadsOverview[0]?.qualified || 0),
        converted: Number(leadsOverview[0]?.converted || 0),
      },
      topPages: (topPages || []).map((page: Record<string, unknown>) => ({
        path: page.path as string,
        views: Number(page.views),
      })),
      chatsBySource: {
        widget: Number(chatsBySource[0]?.widget || 0),
        booking: Number(chatsBySource[0]?.booking || 0),
        scan: Number(chatsBySource[0]?.scan || 0),
        kennisbank: Number(chatsBySource[0]?.kennisbank || 0),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return empty stats on error instead of failing
    return NextResponse.json({
      visitors: { total: 0, thisMonth: 0, lastMonth: 0, changePercent: 0 },
      scans: { total: 0, thisMonth: 0, lastMonth: 0, changePercent: 0 },
      chats: { total: 0, thisMonth: 0, lastMonth: 0, changePercent: 0 },
      posts: { total: 0, thisMonth: 0, lastMonth: 0, changeCount: 0 },
      recentActivity: [],
      leadsOverview: { new: 0, contacted: 0, qualified: 0, converted: 0 },
      topPages: [],
      chatsBySource: { widget: 0, booking: 0, scan: 0, kennisbank: 0 },
    });
  }
}
