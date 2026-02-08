import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch single contact with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contacts = await sql`
      SELECT c.*, co.name as company_name
      FROM contacts c
      LEFT JOIN companies co ON co.id = c.company_id
      WHERE c.id = ${id}
    `;

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'Contact niet gevonden' }, { status: 404 });
    }

    const c = contacts[0];

    // Get activities
    const activities = await sql`
      SELECT a.*, d.title as deal_title
      FROM crm_activities a
      LEFT JOIN deals d ON d.id = a.deal_id
      WHERE a.contact_id = ${id}
      ORDER BY a.created_at DESC
      LIMIT 20
    `;

    // Get deals
    const deals = await sql`
      SELECT d.*, co.name as company_name
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      WHERE d.contact_id = ${id}
      ORDER BY d.created_at DESC
    `;

    // Get tasks
    const tasks = await sql`
      SELECT t.*, d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.contact_id = ${id} AND t.status != 'completed'
      ORDER BY t.due_date ASC NULLS LAST
    `;

    return NextResponse.json({
      contact: {
        id: c.id,
        companyId: c.company_id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        jobTitle: c.job_title,
        isPrimary: c.is_primary,
        notes: c.notes,
        tags: c.tags,
        source: c.source,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        companyName: c.company_name,
      },
      activities: activities.map((a: Record<string, unknown>) => ({
        id: a.id,
        companyId: a.company_id,
        contactId: a.contact_id,
        dealId: a.deal_id,
        type: a.type,
        subject: a.subject,
        description: a.description,
        outcome: a.outcome,
        completedAt: a.completed_at,
        createdAt: a.created_at,
        dealTitle: a.deal_title,
      })),
      deals: deals.map((d: Record<string, unknown>) => ({
        id: d.id,
        companyId: d.company_id,
        contactId: d.contact_id,
        title: d.title,
        value: d.value ? Number(d.value) : null,
        stage: d.stage,
        probability: d.probability,
        expectedCloseDate: d.expected_close_date,
        description: d.description,
        source: d.source,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        companyName: d.company_name,
      })),
      tasks: tasks.map((t: Record<string, unknown>) => ({
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
        dealTitle: t.deal_title,
      })),
    });
  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

// PUT - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If setting as primary, unset others first
    if (body.isPrimary && body.companyId) {
      await sql`UPDATE contacts SET is_primary = false WHERE company_id = ${body.companyId} AND id != ${id}`;
    }

    const result = await sql`
      UPDATE contacts SET
        company_id = COALESCE(${body.companyId}, company_id),
        first_name = COALESCE(${body.firstName}, first_name),
        last_name = COALESCE(${body.lastName}, last_name),
        email = COALESCE(${body.email}, email),
        phone = COALESCE(${body.phone}, phone),
        job_title = COALESCE(${body.jobTitle}, job_title),
        is_primary = COALESCE(${body.isPrimary}, is_primary),
        notes = COALESCE(${body.notes}, notes),
        tags = COALESCE(${body.tags ? sql`${body.tags}::text[]` : null}, tags),
        source = COALESCE(${body.source}, source),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contact niet gevonden' }, { status: 404 });
    }

    const c = result[0];
    return NextResponse.json({
      contact: {
        id: c.id,
        companyId: c.company_id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        jobTitle: c.job_title,
        isPrimary: c.is_primary,
        notes: c.notes,
        tags: c.tags,
        source: c.source,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }
    });
  } catch (error) {
    console.error('Contact PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

// DELETE - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM contacts WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contact niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
