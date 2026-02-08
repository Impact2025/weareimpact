import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const contactId = searchParams.get('contactId');
    const dealId = searchParams.get('dealId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let activities;

    if (companyId) {
      activities = await sql`
        SELECT a.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_activities a
        LEFT JOIN companies co ON co.id = a.company_id
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN deals d ON d.id = a.deal_id
        WHERE a.company_id = ${companyId}
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (contactId) {
      activities = await sql`
        SELECT a.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_activities a
        LEFT JOIN companies co ON co.id = a.company_id
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN deals d ON d.id = a.deal_id
        WHERE a.contact_id = ${contactId}
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (dealId) {
      activities = await sql`
        SELECT a.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_activities a
        LEFT JOIN companies co ON co.id = a.company_id
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN deals d ON d.id = a.deal_id
        WHERE a.deal_id = ${dealId}
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Get recent activities across all
      activities = await sql`
        SELECT a.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
          d.title as deal_title
        FROM crm_activities a
        LEFT JOIN companies co ON co.id = a.company_id
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN deals d ON d.id = a.deal_id
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const transformedActivities = activities.map((a: Record<string, unknown>) => ({
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
      companyName: a.company_name,
      contactName: a.contact_name,
      dealTitle: a.deal_title,
    }));

    return NextResponse.json({ activities: transformedActivities });
  } catch (error) {
    console.error('Activities GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities', activities: [] }, { status: 500 });
  }
}

// POST - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, contactId, dealId, type, subject, description, outcome } = body;

    if (!type || !subject) {
      return NextResponse.json({ error: 'Type en onderwerp zijn verplicht' }, { status: 400 });
    }

    const validTypes = ['call', 'email', 'meeting', 'note'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Ongeldig activiteit type' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description, outcome, completed_at)
      VALUES (${companyId || null}, ${contactId || null}, ${dealId || null},
              ${type}, ${subject}, ${description || null}, ${outcome || null}, NOW())
      RETURNING *
    `;

    const a = result[0];

    // Fetch related names
    let companyName = null;
    let contactName = null;
    let dealTitle = null;

    if (a.company_id) {
      const company = await sql`SELECT name FROM companies WHERE id = ${a.company_id}`;
      companyName = company[0]?.name;
    }

    if (a.contact_id) {
      const contact = await sql`SELECT first_name, last_name FROM contacts WHERE id = ${a.contact_id}`;
      if (contact[0]) {
        contactName = `${contact[0].first_name} ${contact[0].last_name || ''}`.trim();
      }
    }

    if (a.deal_id) {
      const deal = await sql`SELECT title FROM deals WHERE id = ${a.deal_id}`;
      dealTitle = deal[0]?.title;
    }

    return NextResponse.json({
      activity: {
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
        companyName,
        contactName,
        dealTitle,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Activities POST error:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
