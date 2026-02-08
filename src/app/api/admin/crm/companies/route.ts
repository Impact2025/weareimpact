import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all companies with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let companies;

    if (search) {
      companies = await sql`
        SELECT
          c.*,
          COUNT(DISTINCT co.id) as contact_count,
          COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won', 'lost')) as deal_count,
          COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won', 'lost')), 0) as pipeline_value
        FROM companies c
        LEFT JOIN contacts co ON co.company_id = c.id
        LEFT JOIN deals d ON d.company_id = c.id
        WHERE c.name ILIKE ${'%' + search + '%'}
          OR c.email ILIKE ${'%' + search + '%'}
          OR c.city ILIKE ${'%' + search + '%'}
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (industry && industry !== 'all') {
      companies = await sql`
        SELECT
          c.*,
          COUNT(DISTINCT co.id) as contact_count,
          COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won', 'lost')) as deal_count,
          COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won', 'lost')), 0) as pipeline_value
        FROM companies c
        LEFT JOIN contacts co ON co.company_id = c.id
        LEFT JOIN deals d ON d.company_id = c.id
        WHERE c.industry = ${industry}
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      companies = await sql`
        SELECT
          c.*,
          COUNT(DISTINCT co.id) as contact_count,
          COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won', 'lost')) as deal_count,
          COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won', 'lost')), 0) as pipeline_value
        FROM companies c
        LEFT JOIN contacts co ON co.company_id = c.id
        LEFT JOIN deals d ON d.company_id = c.id
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM companies`;
    const total = Number(countResult[0]?.total || 0);

    const transformedCompanies = companies.map((c: Record<string, unknown>) => ({
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
      contactCount: Number(c.contact_count || 0),
      dealCount: Number(c.deal_count || 0),
      pipelineValue: Number(c.pipeline_value || 0),
    }));

    return NextResponse.json({ companies: transformedCompanies, total, limit, offset });
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies', companies: [] }, { status: 500 });
  }
}

// POST - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website, industry, size, address, city, phone, email, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO companies (name, website, industry, size, address, city, phone, email, notes)
      VALUES (${name}, ${website || null}, ${industry || null}, ${size || null},
              ${address || null}, ${city || null}, ${phone || null}, ${email || null}, ${notes || null})
      RETURNING *
    `;

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
    }, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
