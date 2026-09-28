import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

function mapProfile(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    kind: (r.kind as string) === 'vacancy' ? 'vacancy' : 'search',
    query: r.query,
    maxResults: Number(r.max_results ?? 10),
    scoringContext: r.scoring_context ?? null,
    pitch: r.pitch ?? null,
    minScore: Number(r.min_score ?? 6),
    cadence: r.cadence,
    active: r.active,
    cursor: Number(r.cursor ?? 0),
    lastRunAt: r.last_run_at,
    lastStatus: r.last_status ?? null,
    lastError: r.last_error ?? null,
    lastFound: r.last_found != null ? Number(r.last_found) : null,
    lastSaved: r.last_saved != null ? Number(r.last_saved) : null,
    createdAt: r.created_at,
  };
}

const clampScore = (v: unknown) => Math.min(Math.max(Number(v ?? 6) || 0, 0), 10);
const clampMax = (v: unknown) => Math.min(Math.max(Number(v) || 10, 1), 30);
const cleanQuery = (q: string) => q.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 8).join('\n');

export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await sql`
      SELECT p.*,
        (SELECT COUNT(*) FROM prospect_leads l WHERE l.profile_id = p.id AND l.status <> 'rejected') AS leads_total
      FROM lead_search_profiles p
      WHERE p.tenant_id = 'weareimpact'
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({
      profiles: rows.map((r) => ({ ...mapProfile(r), leadsTotal: Number(r.leads_total ?? 0) })),
    });
  } catch (error) {
    console.error('Profiles GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', profiles: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, kind, query, maxResults, scoringContext, pitch, minScore, cadence } = await request.json();
    if (!name?.trim() || !query?.trim()) {
      return NextResponse.json({ error: 'Naam en zoekopdracht zijn verplicht' }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO lead_search_profiles (name, kind, query, max_results, scoring_context, pitch, min_score, cadence)
      VALUES (
        ${name.trim()}, ${kind === 'vacancy' ? 'vacancy' : 'search'}, ${cleanQuery(query)}, ${clampMax(maxResults)},
        ${scoringContext?.trim() || null}, ${pitch?.trim() || null}, ${clampScore(minScore)},
        ${cadence === 'daily' ? 'daily' : 'weekly'}
      )
      RETURNING *
    `;
    return NextResponse.json({ profile: mapProfile(result[0]) }, { status: 201 });
  } catch (error) {
    console.error('Profiles POST error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, active, name, kind, query, maxResults, scoringContext, pitch, minScore, cadence } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    if (cadence != null && !['daily', 'weekly'].includes(cadence)) {
      return NextResponse.json({ error: 'Ongeldige frequentie' }, { status: 400 });
    }
    if (kind != null && !['search', 'vacancy'].includes(kind)) {
      return NextResponse.json({ error: 'Ongeldig soort profiel' }, { status: 400 });
    }

    const result = await sql`
      UPDATE lead_search_profiles SET
        active = COALESCE(${active ?? null}, active),
        name = COALESCE(${name?.trim() || null}, name),
        kind = COALESCE(${kind ?? null}, kind),
        query = COALESCE(${query ? cleanQuery(query) : null}, query),
        max_results = COALESCE(${maxResults != null ? clampMax(maxResults) : null}, max_results),
        scoring_context = CASE WHEN ${scoringContext !== undefined} THEN ${scoringContext?.trim() || null} ELSE scoring_context END,
        pitch = CASE WHEN ${pitch !== undefined} THEN ${pitch?.trim() || null} ELSE pitch END,
        min_score = COALESCE(${minScore != null ? clampScore(minScore) : null}, min_score),
        cadence = COALESCE(${cadence ?? null}, cadence),
        -- Andere zoekopdracht = opnieuw bij de eerste resultaatpagina beginnen.
        cursor = CASE WHEN ${query ? cleanQuery(query) : null}::text IS NOT NULL AND ${query ? cleanQuery(query) : null} <> query THEN 0 ELSE cursor END,
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = 'weareimpact'
      RETURNING *
    `;
    if (result.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json({ profile: mapProfile(result[0]) });
  } catch (error) {
    console.error('Profiles PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    await sql`DELETE FROM lead_search_profiles WHERE id = ${id} AND tenant_id = 'weareimpact'`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profiles DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
