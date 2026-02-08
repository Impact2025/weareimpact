import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch CRM dashboard stats
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Pipeline stats by stage
    const pipelineByStage = await sql`
      SELECT
        stage,
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as total_value,
        COALESCE(SUM(value * probability / 100), 0) as weighted_value
      FROM deals
      WHERE stage NOT IN ('won', 'lost')
      GROUP BY stage
      ORDER BY
        CASE stage
          WHEN 'lead' THEN 1
          WHEN 'qualified' THEN 2
          WHEN 'proposal' THEN 3
          WHEN 'negotiation' THEN 4
        END
    `;

    // Total pipeline
    const pipelineTotal = await sql`
      SELECT
        COUNT(*) as deal_count,
        COALESCE(SUM(value), 0) as total_value,
        COALESCE(SUM(value * probability / 100), 0) as weighted_value
      FROM deals
      WHERE stage NOT IN ('won', 'lost')
    `;

    // Tasks counts
    const taskCounts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE due_date = ${today} AND status NOT IN ('completed', 'cancelled')) as today,
        COUNT(*) FILTER (WHERE status NOT IN ('completed', 'cancelled')) as pending,
        COUNT(*) FILTER (WHERE due_date < ${today} AND status NOT IN ('completed', 'cancelled')) as overdue
      FROM crm_tasks
    `;

    // Recent wins (last 30 days)
    const recentWins = await sql`
      SELECT d.title, d.value, d.updated_at, co.name as company_name
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      WHERE d.stage = 'won' AND d.updated_at >= NOW() - INTERVAL '30 days'
      ORDER BY d.updated_at DESC
      LIMIT 5
    `;

    // Recent activities
    const recentActivities = await sql`
      SELECT a.*,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        d.title as deal_title
      FROM crm_activities a
      LEFT JOIN companies co ON co.id = a.company_id
      LEFT JOIN contacts c ON c.id = a.contact_id
      LEFT JOIN deals d ON d.id = a.deal_id
      ORDER BY a.created_at DESC
      LIMIT 10
    `;

    // Upcoming tasks
    const upcomingTasks = await sql`
      SELECT t.*,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN companies co ON co.id = t.company_id
      LEFT JOIN contacts c ON c.id = t.contact_id
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
      LIMIT 10
    `;

    // Entity counts
    const entityCounts = await sql`
      SELECT
        (SELECT COUNT(*) FROM companies) as companies,
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM deals WHERE stage NOT IN ('won', 'lost')) as active_deals
    `;

    // Deals won this week
    const wonThisWeek = await sql`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as value
      FROM deals
      WHERE stage = 'won' AND updated_at >= ${weekAgo}
    `;

    return NextResponse.json({
      pipeline: {
        totalValue: Number(pipelineTotal[0]?.total_value || 0),
        weightedValue: Number(pipelineTotal[0]?.weighted_value || 0),
        dealCount: Number(pipelineTotal[0]?.deal_count || 0),
        byStage: pipelineByStage.map((s: Record<string, unknown>) => ({
          stage: s.stage,
          count: Number(s.count),
          value: Number(s.total_value),
          weightedValue: Number(s.weighted_value),
        })),
      },
      tasks: {
        today: Number(taskCounts[0]?.today || 0),
        pending: Number(taskCounts[0]?.pending || 0),
        overdue: Number(taskCounts[0]?.overdue || 0),
      },
      recentWins: recentWins.map((w: Record<string, unknown>) => ({
        title: w.title,
        value: Number(w.value || 0),
        companyName: w.company_name,
        closedAt: w.updated_at,
      })),
      recentActivities: recentActivities.map((a: Record<string, unknown>) => ({
        id: a.id,
        companyId: a.company_id,
        contactId: a.contact_id,
        dealId: a.deal_id,
        type: a.type,
        subject: a.subject,
        description: a.description,
        createdAt: a.created_at,
        companyName: a.company_name,
        contactName: a.contact_name,
        dealTitle: a.deal_title,
      })),
      upcomingTasks: upcomingTasks.map((t: Record<string, unknown>) => ({
        id: t.id,
        companyId: t.company_id,
        contactId: t.contact_id,
        dealId: t.deal_id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        companyName: t.company_name,
        contactName: t.contact_name,
        dealTitle: t.deal_title,
      })),
      counts: {
        companies: Number(entityCounts[0]?.companies || 0),
        contacts: Number(entityCounts[0]?.contacts || 0),
        activeDeals: Number(entityCounts[0]?.active_deals || 0),
      },
      wonThisWeek: {
        count: Number(wonThisWeek[0]?.count || 0),
        value: Number(wonThisWeek[0]?.value || 0),
      },
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
