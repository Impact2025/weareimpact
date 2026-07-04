import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// POST — push one or more prospect_leads into the CRM companies table
// Body: { leadId: string } or { leadIds: string[] }
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids: string[] = body.leadIds ?? (body.leadId ? [body.leadId] : []);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Geen lead-IDs opgegeven' }, { status: 400 });
    }

    const results: Array<{ leadId: string; companyId: string; name: string; alreadyExisted: boolean }> = [];

    for (const leadId of ids) {
      const rows = await sql`
        SELECT * FROM prospect_leads
        WHERE id = ${leadId} AND tenant_id = 'weareimpact'
      `;
      if (rows.length === 0) continue;
      const lead = rows[0];

      // Already pushed — just return the existing link
      if (lead.crm_company_id) {
        results.push({ leadId, companyId: lead.crm_company_id as string, name: lead.name as string, alreadyExisted: true });
        continue;
      }

      const notes = [
        lead.ai_rationale ? `AI-score ${lead.ai_score}/10: ${lead.ai_rationale}` : null,
        lead.sbi_description ? `Sector: ${lead.sbi_description}` : null,
        `Bron: Lead Machine`,
      ].filter(Boolean).join('\n');

      // Upsert company by name + city to avoid duplicates.
      // Escape ILIKE-wildcards: namen komen van gescrapete pagina's en kunnen
      // % of _ bevatten ("100% Zorg") — anders matcht dat als patroon.
      const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');
      const existing = await sql`
        SELECT id FROM companies
        WHERE name ILIKE ${escapeLike(lead.name as string)}
          AND (city ILIKE ${escapeLike((lead.city as string) ?? '')} OR city IS NULL)
        LIMIT 1
      `;

      let companyId: string;
      if (existing.length > 0) {
        companyId = existing[0].id as string;
        // Enrich any missing fields
        await sql`
          UPDATE companies SET
            website  = COALESCE(NULLIF(website, ''),  ${(lead.website as string) ?? null}),
            email    = COALESCE(NULLIF(email, ''),    ${(lead.email as string) ?? null}),
            phone    = COALESCE(NULLIF(phone, ''),    ${(lead.phone as string) ?? null}),
            address  = COALESCE(NULLIF(address, ''),  ${(lead.address as string) ?? null}),
            city     = COALESCE(NULLIF(city, ''),     ${(lead.city as string) ?? null}),
            updated_at = NOW()
          WHERE id = ${companyId}
        `;
        results.push({ leadId, companyId, name: lead.name as string, alreadyExisted: true });
      } else {
        const ins = await sql`
          INSERT INTO companies (name, website, email, phone, address, city, industry, notes)
          VALUES (
            ${lead.name as string},
            ${(lead.website as string) ?? null},
            ${(lead.email as string) ?? null},
            ${(lead.phone as string) ?? null},
            ${(lead.address as string) ?? null},
            ${(lead.city as string) ?? null},
            'Welzijn & Zorg',
            ${notes}
          )
          RETURNING id
        `;
        companyId = ins[0].id as string;
        results.push({ leadId, companyId, name: lead.name as string, alreadyExisted: false });
      }

      // Link back to prospect_lead
      await sql`
        UPDATE prospect_leads SET crm_company_id = ${companyId}, updated_at = NOW()
        WHERE id = ${leadId}
      `;
    }

    const pushed = results.filter((r) => !r.alreadyExisted).length;
    const enriched = results.filter((r) => r.alreadyExisted).length;

    return NextResponse.json({ results, pushed, enriched });
  } catch (error) {
    console.error('push-to-crm error:', error);
    return NextResponse.json({ error: 'Push mislukt', detail: String(error) }, { status: 500 });
  }
}
