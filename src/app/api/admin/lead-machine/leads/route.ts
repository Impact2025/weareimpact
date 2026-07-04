import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

function mapLead(r: Record<string, unknown>) {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    kvkNumber: r.kvk_number,
    name: r.name,
    tradeName: r.trade_name,
    sbiCode: r.sbi_code,
    sbiDescription: r.sbi_description,
    address: r.address,
    city: r.city,
    postalCode: r.postal_code,
    website: r.website,
    email: r.email,
    phone: r.phone,
    contactPerson: r.contact_person,
    aiScore: r.ai_score != null ? Number(r.ai_score) : undefined,
    aiRationale: r.ai_rationale,
    status: r.status,
    starred: r.starred,
    notes: r.notes,
    listId: r.list_id,
    crmCompanyId: r.crm_company_id,
    scrapedAt: r.scraped_at,
    scoredAt: r.scored_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// GET — fetch saved prospects
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Gedeelde filterfragmenten zodat lijst én totaal dezelfde selectie zien
    const searchFrag = search
      ? sql`AND (name ILIKE ${'%' + search + '%'} OR city ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})`
      : sql``;
    const statusFrag = status && status !== 'all' ? sql`AND status = ${status}` : sql``;

    const rows = await sql`
      SELECT * FROM prospect_leads
      WHERE tenant_id = 'weareimpact' ${searchFrag} ${statusFrag}
      ORDER BY starred DESC, ai_score DESC NULLS LAST, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRow = await sql`
      SELECT COUNT(*) as total FROM prospect_leads
      WHERE tenant_id = 'weareimpact' ${searchFrag} ${statusFrag}
    `;
    const total = Number(countRow[0]?.total ?? 0);

    return NextResponse.json({
      leads: rows.map(mapLead),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Prospect leads GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', leads: [] }, { status: 500 });
  }
}

// POST — save a new prospect
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      kvkNumber, name, tradeName, sbiCode, sbiDescription,
      address, city, postalCode, website, email, phone, contactPerson,
      aiScore, aiRationale, listId,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO prospect_leads (
        name, trade_name, kvk_number, sbi_code, sbi_description,
        address, city, postal_code, website, email, phone, contact_person,
        ai_score, ai_rationale, list_id,
        scraped_at, scored_at
      )
      VALUES (
        ${name}, ${tradeName ?? null}, ${kvkNumber ?? null}, ${sbiCode ?? null}, ${sbiDescription ?? null},
        ${address ?? null}, ${city ?? null}, ${postalCode ?? null}, ${website ?? null},
        ${email ?? null}, ${phone ?? null}, ${contactPerson ?? null},
        ${aiScore ?? null}, ${aiRationale ?? null}, ${listId ?? null},
        ${email || phone ? now : null}, ${aiScore != null ? now : null}
      )
      ON CONFLICT (kvk_number) WHERE kvk_number IS NOT NULL DO UPDATE SET
        name = EXCLUDED.name,
        website = COALESCE(EXCLUDED.website, prospect_leads.website),
        email = COALESCE(EXCLUDED.email, prospect_leads.email),
        phone = COALESCE(EXCLUDED.phone, prospect_leads.phone),
        ai_score = COALESCE(EXCLUDED.ai_score, prospect_leads.ai_score),
        ai_rationale = COALESCE(EXCLUDED.ai_rationale, prospect_leads.ai_rationale),
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ lead: mapLead(result[0]) }, { status: 201 });
  } catch (error) {
    console.error('Prospect leads POST error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

// PUT — update status / starred / notes
export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, starred, notes } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const result = await sql`
      UPDATE prospect_leads
      SET
        status = COALESCE(${status ?? null}, status),
        starred = COALESCE(${starred ?? null}, starred),
        notes = COALESCE(${notes ?? null}, notes),
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = 'weareimpact'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ lead: mapLead(result[0]) });
  } catch (error) {
    console.error('Prospect leads PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — remove a prospect
export async function DELETE(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    await sql`DELETE FROM prospect_leads WHERE id = ${id} AND tenant_id = 'weareimpact'`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prospect leads DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
