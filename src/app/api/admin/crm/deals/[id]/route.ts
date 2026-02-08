import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

const stageProbabilities: Record<string, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
};

// GET - Fetch single deal with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deals = await sql`
      SELECT d.*,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      LEFT JOIN contacts c ON c.id = d.contact_id
      WHERE d.id = ${id}
    `;

    if (deals.length === 0) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }

    const d = deals[0];

    // Get activities
    const activities = await sql`
      SELECT a.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
      FROM crm_activities a
      LEFT JOIN contacts c ON c.id = a.contact_id
      WHERE a.deal_id = ${id}
      ORDER BY a.created_at DESC
      LIMIT 20
    `;

    // Get tasks
    const tasks = await sql`
      SELECT t.*, CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
      FROM crm_tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      WHERE t.deal_id = ${id}
      ORDER BY t.status ASC, t.due_date ASC NULLS LAST
    `;

    return NextResponse.json({
      deal: {
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
        contactName: d.contact_name,
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
        contactName: a.contact_name,
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
      })),
    });
  } catch (error) {
    console.error('Deal GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

// PUT - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get current deal for comparison
    const currentDeal = await sql`SELECT * FROM deals WHERE id = ${id}`;
    if (currentDeal.length === 0) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }

    const oldStage = currentDeal[0].stage;
    const newStage = body.stage || oldStage;

    // Auto-update probability based on stage if not explicitly set
    let probability = body.probability;
    if (body.stage && body.probability === undefined) {
      probability = stageProbabilities[body.stage] ?? currentDeal[0].probability;
    }

    const result = await sql`
      UPDATE deals SET
        company_id = COALESCE(${body.companyId}, company_id),
        contact_id = COALESCE(${body.contactId}, contact_id),
        title = COALESCE(${body.title}, title),
        value = COALESCE(${body.value}, value),
        stage = COALESCE(${body.stage}, stage),
        probability = COALESCE(${probability}, probability),
        expected_close_date = COALESCE(${body.expectedCloseDate}, expected_close_date),
        description = COALESCE(${body.description}, description),
        source = COALESCE(${body.source}, source),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    const d = result[0];

    // Log stage change as activity
    if (oldStage !== newStage) {
      const stageLabels: Record<string, string> = {
        lead: 'Lead',
        qualified: 'Gekwalificeerd',
        proposal: 'Voorstel',
        negotiation: 'Onderhandeling',
        won: 'Gewonnen',
        lost: 'Verloren',
      };

      await sql`
        INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
        VALUES (${d.company_id}, ${d.contact_id}, ${d.id}, 'note',
                ${'Stage gewijzigd naar ' + stageLabels[newStage]},
                ${'Deal fase gewijzigd van ' + stageLabels[oldStage] + ' naar ' + stageLabels[newStage]})
      `;
    }

    return NextResponse.json({
      deal: {
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
      }
    });
  } catch (error) {
    console.error('Deal PUT error:', error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

// DELETE - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`
      DELETE FROM deals WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deal DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
