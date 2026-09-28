import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { mapLead } from '@/lib/lead-machine/mappers';
import { saveSearchResult } from '@/lib/lead-machine/pipeline';
import { pushLeadToCrm } from '@/lib/lead-machine/crmPush';
import { LEAD_STATUSES } from '@/lib/lead-machine/schema';
import type { SearchResult } from '@/lib/lead-machine/types';

export const dynamic = 'force-dynamic';

// GET — opgeslagen leads. Afgewezen leads alleen op expliciet verzoek.
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const segment = searchParams.get('segment');
    const source = searchParams.get('source');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    const esc = (s: string) => s.replace(/[\\%_]/g, '\\$&');
    const searchFrag = search
      ? sql`AND (name ILIKE ${'%' + esc(search) + '%'} OR city ILIKE ${'%' + esc(search) + '%'} OR email ILIKE ${'%' + esc(search) + '%'} OR domain ILIKE ${'%' + esc(search) + '%'})`
      : sql``;
    const statusFrag = status && status !== 'all'
      ? sql`AND status = ${status}`
      : sql`AND status <> 'rejected'`;
    const segmentFrag = segment && segment !== 'all' ? sql`AND segment = ${segment}` : sql``;
    const sourceFrag = source && source !== 'all' ? sql`AND source = ${source}` : sql``;

    const rows = await sql`
      SELECT * FROM prospect_leads
      WHERE tenant_id = 'weareimpact' ${searchFrag} ${statusFrag} ${segmentFrag} ${sourceFrag}
      ORDER BY starred DESC, ai_score DESC NULLS LAST, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countRow = await sql`
      SELECT COUNT(*) AS total FROM prospect_leads
      WHERE tenant_id = 'weareimpact' ${searchFrag} ${statusFrag} ${segmentFrag} ${sourceFrag}
    `;

    return NextResponse.json({ leads: rows.map(mapLead), total: Number(countRow[0]?.total ?? 0), limit, offset });
  } catch (error) {
    console.error('Prospect leads GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', leads: [] }, { status: 500 });
  }
}

// POST — een zoekresultaat opslaan (upsert op domein).
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const r = await request.json() as SearchResult;
    if (!r?.name || !r?.domain) {
      return NextResponse.json({ error: 'Naam en domein zijn verplicht' }, { status: 400 });
    }
    const id = await saveSearchResult({ ...r, hooks: r.hooks ?? [], source: r.source ?? 'manual' });
    if (!id) return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
    const row = await sql`SELECT * FROM prospect_leads WHERE id = ${id}`;
    return NextResponse.json({ lead: mapLead(row[0]) }, { status: 201 });
  } catch (error) {
    console.error('Prospect leads POST error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

// PUT — status (funnel), ster, notities, e-mailadres.
// Funnelstappen krijgen een eenmalige tijdstempel, zodat conversiecijfers
// kloppen ook als de status daarna verder schuift. Reageert een lead of plant
// die een gesprek, dan gaat hij automatisch het CRM in.
export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, starred, notes, email, lostReason } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    if (status != null && !(LEAD_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }
    if (email != null && email !== '' && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    const result = await sql`
      UPDATE prospect_leads SET
        status     = COALESCE(${status ?? null}, status),
        starred    = COALESCE(${starred ?? null}, starred),
        notes      = COALESCE(${notes ?? null}, notes),
        email      = CASE WHEN ${email ?? null}::text IS NULL THEN email ELSE NULLIF(${email ?? ''}, '') END,
        replied_at = CASE WHEN ${status ?? null} IN ('replied','meeting','converted') AND replied_at IS NULL THEN NOW() ELSE replied_at END,
        meeting_at = CASE WHEN ${status ?? null} IN ('meeting','converted') AND meeting_at IS NULL THEN NOW() ELSE meeting_at END,
        won_at     = CASE WHEN ${status ?? null} = 'converted' AND won_at IS NULL THEN NOW() ELSE won_at END,
        lost_at    = CASE WHEN ${status ?? null} = 'lost' AND lost_at IS NULL THEN NOW() ELSE lost_at END,
        lost_reason = CASE WHEN ${status ?? null} = 'lost' THEN COALESCE(${lostReason ?? null}, lost_reason) ELSE lost_reason END,
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = 'weareimpact'
      RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    let lead = result[0];
    if (status && ['replied', 'meeting', 'converted'].includes(status)) {
      // Openstaande concepten intrekken: wie reageert, krijgt geen opvolgmail meer.
      await sql`DELETE FROM lead_outreach WHERE lead_id = ${id} AND status IN ('draft','approved')`;
      const pushed = await pushLeadToCrm(id).catch((e) => { console.error('auto push-to-crm:', e); return null; });
      if (pushed) {
        const label = status === 'replied' ? 'Reageerde op outreach' : status === 'meeting' ? 'Gesprek gepland via outreach' : 'Klant geworden via Lead Machine';
        await sql`
          INSERT INTO crm_activities (company_id, type, subject, description, completed_at)
          VALUES (${pushed.companyId}, 'note', ${label}, ${'Status in de Lead Machine: ' + status}, NOW())
        `.catch(() => {});
        if (status === 'replied') {
          await sql`
            INSERT INTO crm_tasks (company_id, title, description, priority, due_date)
            VALUES (${pushed.companyId}, ${'Reageer op ' + (lead.name as string)}, 'Lead reageerde op de outreach — plan een kennismakingsgesprek.', 'high', CURRENT_DATE)
          `.catch(() => {});
        }
        lead = (await sql`SELECT * FROM prospect_leads WHERE id = ${id}`)[0];
      }
    }
    if (status === 'lost') {
      await sql`DELETE FROM lead_outreach WHERE lead_id = ${id} AND status IN ('draft','approved')`;
    }

    return NextResponse.json({ lead: mapLead(lead) });
  } catch (error) {
    console.error('Prospect leads PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — lead verwijderen. Het domein blijft in het grootboek, zodat de
// machine dezelfde organisatie niet morgen opnieuw aandraagt.
export async function DELETE(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const rows = await sql`DELETE FROM prospect_leads WHERE id = ${id} AND tenant_id = 'weareimpact' RETURNING domain, name`;
    const domain = rows[0]?.domain as string | undefined;
    if (domain) {
      await sql`
        INSERT INTO lead_seen (key, kind, outcome, reason)
        VALUES (${domain}, 'domain', 'verwijderd', ${'handmatig verwijderd: ' + (rows[0].name as string)})
        ON CONFLICT (tenant_id, key) DO UPDATE SET outcome = 'verwijderd', reason = EXCLUDED.reason, created_at = NOW()
      `.catch(() => {});
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prospect leads DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
