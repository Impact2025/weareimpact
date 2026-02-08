import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch single company with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const companies = await sql`
      SELECT * FROM companies WHERE id = ${id}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    const c = companies[0];

    // Get contacts
    const contacts = await sql`
      SELECT * FROM contacts WHERE company_id = ${id} ORDER BY is_primary DESC, created_at DESC
    `;

    // Get deals
    const deals = await sql`
      SELECT d.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
      FROM deals d
      LEFT JOIN contacts c ON c.id = d.contact_id
      WHERE d.company_id = ${id}
      ORDER BY d.created_at DESC
    `;

    // Get activities
    const activities = await sql`
      SELECT a.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name, d.title as deal_title
      FROM crm_activities a
      LEFT JOIN contacts c ON c.id = a.contact_id
      LEFT JOIN deals d ON d.id = a.deal_id
      WHERE a.company_id = ${id}
      ORDER BY a.created_at DESC
      LIMIT 20
    `;

    // Get tasks
    const tasks = await sql`
      SELECT t.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name, d.title as deal_title
      FROM crm_tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      LEFT JOIN deals d ON d.id = t.deal_id
      WHERE t.company_id = ${id} AND t.status != 'completed'
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `;

    return NextResponse.json({
      company: {
        id: c.id,
        name: c.name,
        website: c.website,
        industry: c.industry,
        size: c.size,
        address: c.address,
        city: c.city,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      },
      contacts: contacts.map((ct: Record<string, unknown>) => ({
        id: ct.id,
        companyId: ct.company_id,
        firstName: ct.first_name,
        lastName: ct.last_name,
        email: ct.email,
        phone: ct.phone,
        jobTitle: ct.job_title,
        isPrimary: ct.is_primary,
        notes: ct.notes,
        tags: ct.tags,
        source: ct.source,
        createdAt: ct.created_at,
        updatedAt: ct.updated_at,
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
        contactName: d.contact_name,
      })),
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
        contactName: a.contact_name,
        dealTitle: a.deal_title,
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
        contactName: t.contact_name,
        dealTitle: t.deal_title,
      })),
    });
  } catch (error) {
    console.error('Company GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

// PUT - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await sql`
      UPDATE companies SET
        name = COALESCE(${body.name}, name),
        website = COALESCE(${body.website}, website),
        industry = COALESCE(${body.industry}, industry),
        size = COALESCE(${body.size}, size),
        address = COALESCE(${body.address}, address),
        city = COALESCE(${body.city}, city),
        phone = COALESCE(${body.phone}, phone),
        email = COALESCE(${body.email}, email),
        notes = COALESCE(${body.notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    const c = result[0];
    return NextResponse.json({
      company: {
        id: c.id,
        name: c.name,
        website: c.website,
        industry: c.industry,
        size: c.size,
        address: c.address,
        city: c.city,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }
    });
  } catch (error) {
    console.error('Company PUT error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// DELETE - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM companies WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Company DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
