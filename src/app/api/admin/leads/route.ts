import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let leads;

    if (search) {
      leads = await sql`
        SELECT * FROM ai_scan_leads
        WHERE (
          email ILIKE ${'%' + search + '%'} OR
          name ILIKE ${'%' + search + '%'} OR
          organization ILIKE ${'%' + search + '%'}
        )
        ${sector && sector !== 'all' ? sql`AND sector = ${sector}` : sql``}
        ${status && status !== 'all' ? sql`AND status = ${status}` : sql``}
        ORDER BY starred DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (sector && sector !== 'all' && status && status !== 'all') {
      leads = await sql`
        SELECT * FROM ai_scan_leads
        WHERE sector = ${sector} AND status = ${status}
        ORDER BY starred DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (sector && sector !== 'all') {
      leads = await sql`
        SELECT * FROM ai_scan_leads
        WHERE sector = ${sector}
        ORDER BY starred DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status && status !== 'all') {
      leads = await sql`
        SELECT * FROM ai_scan_leads
        WHERE status = ${status}
        ORDER BY starred DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      leads = await sql`
        SELECT * FROM ai_scan_leads
        ORDER BY starred DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Get total count for pagination
    const countResult = await sql`SELECT COUNT(*) as total FROM ai_scan_leads`;
    const total = Number(countResult[0]?.total || 0);

    // Transform to camelCase
    const transformedLeads = leads.map((lead: Record<string, unknown>) => ({
      id: lead.id,
      email: lead.email,
      name: lead.name,
      organization: lead.organization,
      phone: lead.phone,
      sector: lead.sector,
      challenge: lead.challenge,
      aiUsage: lead.ai_usage,
      aiAdvice: lead.ai_advice,
      source: lead.source,
      status: lead.status,
      starred: lead.starred,
      notes: lead.notes,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    }));

    return NextResponse.json({
      leads: transformedLeads,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Leads GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', leads: [] },
      { status: 500 }
    );
  }
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      organization,
      phone,
      sector,
      challenge,
      aiUsage,
      aiAdvice,
      source = '/ai-scanner',
    } = body;

    if (!sector || !challenge || !aiUsage) {
      return NextResponse.json(
        { error: 'Missing required fields: sector, challenge, aiUsage' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO ai_scan_leads (
        email, name, organization, phone, sector, challenge, ai_usage, ai_advice, source
      ) VALUES (
        ${email || null}, ${name || null}, ${organization || null}, ${phone || null},
        ${sector}, ${challenge}, ${aiUsage}, ${aiAdvice || null}, ${source}
      )
      RETURNING id, email, sector, challenge, created_at
    `;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'scan',
        'Nieuwe AI scan afgerond',
        ${organization ? `${organization} - ${sector}` : `Nieuwe lead - ${sector}`},
        ${JSON.stringify({ leadId: result[0]?.id, sector, challenge })}
      )
    `;

    return NextResponse.json({
      lead: {
        id: result[0]?.id,
        email: result[0]?.email,
        sector: result[0]?.sector,
        challenge: result[0]?.challenge,
        createdAt: result[0]?.created_at,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Leads POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PUT - Update a lead
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE ai_scan_leads SET
        email = COALESCE(${updates.email}, email),
        name = COALESCE(${updates.name}, name),
        organization = COALESCE(${updates.organization}, organization),
        phone = COALESCE(${updates.phone}, phone),
        status = COALESCE(${updates.status}, status),
        starred = COALESCE(${updates.starred}, starred),
        notes = COALESCE(${updates.notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, status, starred
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Log status change
    if (updates.status) {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          ${'Lead status gewijzigd naar ' + updates.status},
          ${updates.organization || updates.email || 'Onbekend'},
          ${JSON.stringify({ leadId: id, newStatus: updates.status })}
        )
      `;
    }

    return NextResponse.json({ lead: result[0] });
  } catch (error) {
    console.error('Leads PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM ai_scan_leads WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leads DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
