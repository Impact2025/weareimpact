import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Verify admin authentication
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  return !!sessionCookie?.value;
}

// Map ai_scan_leads status to deal stage
function statusToStage(status: string): string {
  switch (status) {
    case 'new':
      return 'lead';
    case 'contacted':
      return 'lead';
    case 'qualified':
      return 'qualified';
    case 'converted':
      return 'won';
    default:
      return 'lead';
  }
}

// Map sector to industry
function sectorToIndustry(sector: string): string {
  switch (sector) {
    case 'zorg':
      return 'zorg';
    case 'overheid':
      return 'overheid';
    case 'mkb':
      return 'zakelijk';
    case 'nonprofit':
      return 'nonprofit';
    default:
      return 'anders';
  }
}

interface MigrationResult {
  success: boolean;
  companiesCreated: number;
  contactsCreated: number;
  dealsCreated: number;
  errors: string[];
}

// POST - Run migration
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result: MigrationResult = {
      success: true,
      companiesCreated: 0,
      contactsCreated: 0,
      dealsCreated: 0,
      errors: [],
    };

    // Get all leads
    const leads = await sql`
      SELECT * FROM ai_scan_leads
      ORDER BY created_at ASC
    `;

    if (leads.length === 0) {
      return NextResponse.json({
        ...result,
        message: 'Geen leads om te migreren.',
      });
    }

    // Track created companies by organization name to avoid duplicates
    const companyMap = new Map<string, string>();

    for (const lead of leads) {
      try {
        let companyId: string | null = null;
        let contactId: string | null = null;

        // Create or get company if organization exists
        if (lead.organization) {
          const orgName = (lead.organization as string).trim();

          if (companyMap.has(orgName.toLowerCase())) {
            companyId = companyMap.get(orgName.toLowerCase())!;
          } else {
            // Check if company already exists
            const existingCompany = await sql`
              SELECT id FROM companies WHERE LOWER(name) = LOWER(${orgName}) LIMIT 1
            `;

            if (existingCompany.length > 0) {
              companyId = existingCompany[0].id as string;
            } else {
              // Create new company
              const newCompany = await sql`
                INSERT INTO companies (name, industry, email, phone, notes, created_at)
                VALUES (
                  ${orgName},
                  ${sectorToIndustry(lead.sector as string)},
                  ${lead.email || null},
                  ${lead.phone || null},
                  ${lead.ai_advice ? `AI Scan resultaat:\n${lead.ai_advice}` : null},
                  ${lead.created_at}
                )
                RETURNING id
              `;
              companyId = newCompany[0].id as string;
              result.companiesCreated++;
            }
            companyMap.set(orgName.toLowerCase(), companyId);
          }
        }

        // Create contact if we have name or email
        if (lead.name || lead.email) {
          // Parse name into first/last
          const fullName = (lead.name as string) || '';
          const nameParts = fullName.trim().split(/\s+/);
          const firstName = nameParts[0] || 'Onbekend';
          const lastName = nameParts.slice(1).join(' ') || null;

          // Check if contact already exists (by email)
          if (lead.email) {
            const existingContact = await sql`
              SELECT id FROM contacts WHERE LOWER(email) = LOWER(${lead.email}) LIMIT 1
            `;

            if (existingContact.length > 0) {
              contactId = existingContact[0].id as string;
            }
          }

          if (!contactId) {
            const newContact = await sql`
              INSERT INTO contacts (
                company_id, first_name, last_name, email, phone,
                source, is_primary, notes, created_at
              )
              VALUES (
                ${companyId},
                ${firstName},
                ${lastName},
                ${lead.email || null},
                ${lead.phone || null},
                'ai_scanner',
                true,
                ${lead.notes || null},
                ${lead.created_at}
              )
              RETURNING id
            `;
            contactId = newContact[0].id as string;
            result.contactsCreated++;
          }
        }

        // Create deal if we have a company
        if (companyId) {
          const stage = statusToStage(lead.status as string);
          const title = lead.organization
            ? `AI Scan - ${lead.organization}`
            : `AI Scan Lead ${lead.id.slice(0, 8)}`;

          // Check if deal already exists
          const existingDeal = await sql`
            SELECT id FROM deals
            WHERE company_id = ${companyId}
              AND title LIKE 'AI Scan%'
            LIMIT 1
          `;

          if (existingDeal.length === 0) {
            await sql`
              INSERT INTO deals (
                company_id, contact_id, title, stage, source, description, created_at
              )
              VALUES (
                ${companyId},
                ${contactId},
                ${title},
                ${stage},
                'ai_scanner',
                ${lead.ai_advice || null},
                ${lead.created_at}
              )
            `;
            result.dealsCreated++;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Lead ${lead.id}: ${errorMsg}`);
      }
    }

    result.success = result.errors.length === 0;

    return NextResponse.json({
      ...result,
      message: `Migratie voltooid: ${result.companiesCreated} bedrijven, ${result.contactsCreated} contacten, ${result.dealsCreated} deals aangemaakt.`,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Preview migration (count leads that would be migrated)
export async function GET() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total_leads,
        COUNT(DISTINCT organization) FILTER (WHERE organization IS NOT NULL) as unique_orgs,
        COUNT(*) FILTER (WHERE email IS NOT NULL) as with_email,
        COUNT(*) FILTER (WHERE name IS NOT NULL) as with_name,
        COUNT(*) FILTER (WHERE status = 'new') as status_new,
        COUNT(*) FILTER (WHERE status = 'contacted') as status_contacted,
        COUNT(*) FILTER (WHERE status = 'qualified') as status_qualified,
        COUNT(*) FILTER (WHERE status = 'converted') as status_converted
      FROM ai_scan_leads
    `;

    const existingCrm = await sql`
      SELECT
        (SELECT COUNT(*) FROM companies) as companies,
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM deals) as deals
    `;

    return NextResponse.json({
      leads: {
        total: Number(stats[0]?.total_leads || 0),
        uniqueOrganizations: Number(stats[0]?.unique_orgs || 0),
        withEmail: Number(stats[0]?.with_email || 0),
        withName: Number(stats[0]?.with_name || 0),
        byStatus: {
          new: Number(stats[0]?.status_new || 0),
          contacted: Number(stats[0]?.status_contacted || 0),
          qualified: Number(stats[0]?.status_qualified || 0),
          converted: Number(stats[0]?.status_converted || 0),
        },
      },
      existingCrm: {
        companies: Number(existingCrm[0]?.companies || 0),
        contacts: Number(existingCrm[0]?.contacts || 0),
        deals: Number(existingCrm[0]?.deals || 0),
      },
    });
  } catch (error) {
    console.error('Migration preview error:', error);
    return NextResponse.json({ error: 'Failed to get migration preview' }, { status: 500 });
  }
}
