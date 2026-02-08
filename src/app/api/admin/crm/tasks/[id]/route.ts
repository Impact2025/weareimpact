import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tasks = await sql`
      SELECT t.*,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN companies co ON co.id = t.company_id
      LEFT JOIN contacts c ON c.id = t.contact_id
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.id = ${id}
    `;

    if (tasks.length === 0) {
      return NextResponse.json({ error: 'Taak niet gevonden' }, { status: 404 });
    }

    const t = tasks[0];

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
        companyName: t.company_name,
        contactName: t.contact_name,
        dealTitle: t.deal_title,
      }
    });
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle completion
    let completedAt = undefined;
    if (body.status === 'completed') {
      completedAt = new Date().toISOString();
    } else if (body.status && body.status !== 'completed') {
      completedAt = null;
    }

    const result = await sql`
      UPDATE crm_tasks SET
        company_id = COALESCE(${body.companyId}, company_id),
        contact_id = COALESCE(${body.contactId}, contact_id),
        deal_id = COALESCE(${body.dealId}, deal_id),
        title = COALESCE(${body.title}, title),
        description = COALESCE(${body.description}, description),
        priority = COALESCE(${body.priority}, priority),
        status = COALESCE(${body.status}, status),
        due_date = COALESCE(${body.dueDate}, due_date),
        completed_at = CASE
          WHEN ${body.status}::text = 'completed' THEN NOW()
          WHEN ${body.status}::text IS NOT NULL AND ${body.status}::text != 'completed' THEN NULL
          ELSE completed_at
        END
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Taak niet gevonden' }, { status: 404 });
    }

    const t = result[0];

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
      }
    });
  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM crm_tasks WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Taak niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
