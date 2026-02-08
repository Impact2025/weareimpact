import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');
    const filter = searchParams.get('filter'); // today, week, overdue, completed
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let tasks;
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (filter === 'today') {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.due_date = ${today} AND t.status != 'completed' AND t.status != 'cancelled'
        ORDER BY t.priority DESC, t.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filter === 'week') {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.due_date <= ${weekEnd} AND t.due_date >= ${today}
          AND t.status != 'completed' AND t.status != 'cancelled'
        ORDER BY t.due_date ASC, t.priority DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filter === 'overdue') {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.due_date < ${today} AND t.status != 'completed' AND t.status != 'cancelled'
        ORDER BY t.due_date ASC, t.priority DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (filter === 'completed' || status === 'completed') {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.status = 'completed'
        ORDER BY t.completed_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (companyId) {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.company_id = ${companyId}
        ORDER BY t.status ASC, t.due_date ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (dealId) {
      tasks = await sql`
        SELECT t.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_tasks t
        LEFT JOIN companies co ON co.id = t.company_id
        LEFT JOIN contacts c ON c.id = t.contact_id
        LEFT JOIN deals d ON d.id = t.deal_id
        WHERE t.deal_id = ${dealId}
        ORDER BY t.status ASC, t.due_date ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // All pending/in_progress tasks
      tasks = await sql`
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
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const transformedTasks = tasks.map((t: Record<string, unknown>) => ({
      id: t.id,
      companyId: t.company_id,
      contactId: t.contact_id,
      dealId: t.deal_id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.due_date,
      completedAt: t.completed_at,
      createdAt: t.created_at,
      companyName: t.company_name,
      contactName: t.contact_name,
      dealTitle: t.deal_title,
    }));

    // Get counts for tabs
    const counts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE due_date = ${today} AND status NOT IN ('completed', 'cancelled')) as today,
        COUNT(*) FILTER (WHERE due_date <= ${weekEnd} AND due_date >= ${today} AND status NOT IN ('completed', 'cancelled')) as week,
        COUNT(*) FILTER (WHERE due_date < ${today} AND status NOT IN ('completed', 'cancelled')) as overdue,
        COUNT(*) FILTER (WHERE status NOT IN ('completed', 'cancelled')) as pending
      FROM crm_tasks
    `;

    return NextResponse.json({
      tasks: transformedTasks,
      counts: {
        today: Number(counts[0]?.today || 0),
        week: Number(counts[0]?.week || 0),
        overdue: Number(counts[0]?.overdue || 0),
        pending: Number(counts[0]?.pending || 0),
      }
    });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks', tasks: [] }, { status: 500 });
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, contactId, dealId, title, description, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, due_date)
      VALUES (${companyId || null}, ${contactId || null}, ${dealId || null},
              ${title}, ${description || null}, ${priority || 'normal'}, ${dueDate || null})
      RETURNING *
    `;

    const t = result[0];

    // Fetch related names
    let companyName = null;
    let contactName = null;
    let dealTitle = null;

    if (t.company_id) {
      const company = await sql`SELECT name FROM companies WHERE id = ${t.company_id}`;
      companyName = company[0]?.name;
    }

    if (t.contact_id) {
      const contact = await sql`SELECT first_name, last_name FROM contacts WHERE id = ${t.contact_id}`;
      if (contact[0]) {
        contactName = `${contact[0].first_name} ${contact[0].last_name || ''}`.trim();
      }
    }

    if (t.deal_id) {
      const deal = await sql`SELECT title FROM deals WHERE id = ${t.deal_id}`;
      dealTitle = deal[0]?.title;
    }

    return NextResponse.json({
      task: {
        id: t.id,
        companyId: t.company_id,
        contactId: t.contact_id,
        dealId: t.deal_id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        companyName,
        contactName,
        dealTitle,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
