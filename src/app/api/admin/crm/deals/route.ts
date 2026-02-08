import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all deals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let deals;

    if (stage && stage !== 'all') {
      deals = await sql`
        SELECT d.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
        FROM deals d
        LEFT JOIN companies co ON co.id = d.company_id
        LEFT JOIN contacts c ON c.id = d.contact_id
        WHERE d.stage = ${stage}
        ORDER BY d.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (companyId) {
      deals = await sql`
        SELECT d.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
        FROM deals d
        LEFT JOIN companies co ON co.id = d.company_id
        LEFT JOIN contacts c ON c.id = d.contact_id
        WHERE d.company_id = ${companyId}
        ORDER BY d.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      deals = await sql`
        SELECT d.*,
          co.name as company_name,
          CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name
        FROM deals d
        LEFT JOIN companies co ON co.id = d.company_id
        LEFT JOIN contacts c ON c.id = d.contact_id
        ORDER BY
          CASE d.stage
            WHEN 'lead' THEN 1
            WHEN 'qualified' THEN 2
            WHEN 'proposal' THEN 3
            WHEN 'negotiation' THEN 4
            WHEN 'won' THEN 5
            WHEN 'lost' THEN 6
          END,
          d.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM deals WHERE stage NOT IN ('won', 'lost')`;
    const total = Number(countResult[0]?.total || 0);

    const transformedDeals = deals.map((d: Record<string, unknown>) => ({
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
    }));

    return NextResponse.json({ deals: transformedDeals, total, limit, offset });
  } catch (error) {
    console.error('Deals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch deals', deals: [] }, { status: 500 });
  }
}

// POST - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, contactId, title, value, stage, probability, expectedCloseDate, description, source } = body;

    if (!title) {
      return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO deals (company_id, contact_id, title, value, stage, probability, expected_close_date, description, source)
      VALUES (${companyId || null}, ${contactId || null}, ${title}, ${value || null},
              ${stage || 'lead'}, ${probability || 10}, ${expectedCloseDate || null},
              ${description || null}, ${source || null})
      RETURNING *
    `;

    const d = result[0];

    // Fetch related names
    let companyName = null;
    let contactName = null;

    if (d.company_id) {
      const company = await sql`SELECT name FROM companies WHERE id = ${d.company_id}`;
      companyName = company[0]?.name;
    }

    if (d.contact_id) {
      const contact = await sql`SELECT first_name, last_name FROM contacts WHERE id = ${d.contact_id}`;
      if (contact[0]) {
        contactName = `${contact[0].first_name} ${contact[0].last_name || ''}`.trim();
      }
    }

    // Log activity
    await sql`
      INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
      VALUES (${companyId || null}, ${contactId || null}, ${d.id}, 'note',
              'Deal aangemaakt', ${`Nieuwe deal: ${title}${value ? ` - €${value}` : ''}`})
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
        companyName,
        contactName,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Deals POST error:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
