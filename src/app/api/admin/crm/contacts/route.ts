import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET - Fetch all contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let contacts;

    if (search) {
      contacts = await sql`
        SELECT c.*, co.name as company_name
        FROM contacts c
        LEFT JOIN companies co ON co.id = c.company_id
        WHERE c.first_name ILIKE ${'%' + search + '%'}
          OR c.last_name ILIKE ${'%' + search + '%'}
          OR c.email ILIKE ${'%' + search + '%'}
          OR co.name ILIKE ${'%' + search + '%'}
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (companyId) {
      contacts = await sql`
        SELECT c.*, co.name as company_name
        FROM contacts c
        LEFT JOIN companies co ON co.id = c.company_id
        WHERE c.company_id = ${companyId}
        ORDER BY c.is_primary DESC, c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      contacts = await sql`
        SELECT c.*, co.name as company_name
        FROM contacts c
        LEFT JOIN companies co ON co.id = c.company_id
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM contacts`;
    const total = Number(countResult[0]?.total || 0);

    const transformedContacts = contacts.map((c: Record<string, unknown>) => ({
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
    }));

    return NextResponse.json({ contacts: transformedContacts, total, limit, offset });
  } catch (error) {
    console.error('Contacts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts', contacts: [] }, { status: 500 });
  }
}

// POST - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, firstName, lastName, email, phone, jobTitle, isPrimary, notes, tags, source } = body;

    if (!firstName) {
      return NextResponse.json({ error: 'Voornaam is verplicht' }, { status: 400 });
    }

    // If isPrimary, unset other primary contacts for this company
    if (isPrimary && companyId) {
      await sql`UPDATE contacts SET is_primary = false WHERE company_id = ${companyId}`;
    }

    const result = await sql`
      INSERT INTO contacts (company_id, first_name, last_name, email, phone, job_title, is_primary, notes, tags, source)
      VALUES (${companyId || null}, ${firstName}, ${lastName || null}, ${email || null},
              ${phone || null}, ${jobTitle || null}, ${isPrimary || false}, ${notes || null},
              ${tags ? sql`${tags}::text[]` : null}, ${source || null})
      RETURNING *
    `;

    const c = result[0];

    // Fetch company name if exists
    let companyName = null;
    if (c.company_id) {
      const company = await sql`SELECT name FROM companies WHERE id = ${c.company_id}`;
      companyName = company[0]?.name;
    }

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
        companyName,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Contacts POST error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
