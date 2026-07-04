import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

function mapProfile(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    query: r.query,
    maxResults: Number(r.max_results ?? 10),
    scoringContext: r.scoring_context,
    minScore: Number(r.min_score ?? 6),
    cadence: r.cadence,
    active: r.active,
    lastRunAt: r.last_run_at,
    createdAt: r.created_at,
  };
}

export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await sql`
      SELECT * FROM lead_search_profiles
      WHERE tenant_id = 'weareimpact'
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ profiles: rows.map(mapProfile) });
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
    const { name, query, maxResults, scoringContext, minScore, cadence } = await request.json();
    if (!name || !query) {
      return NextResponse.json({ error: 'Naam en zoekopdracht zijn verplicht' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO lead_search_profiles (name, query, max_results, scoring_context, min_score, cadence)
      VALUES (
        ${name}, ${query}, ${Math.min(Number(maxResults) || 10, 30)},
        ${scoringContext ?? null}, ${Math.min(Math.max(Number(minScore ?? 6), 0), 10)},
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
    const { id, active, name, query, minScore, cadence } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    if (cadence != null && !['daily', 'weekly'].includes(cadence)) {
      return NextResponse.json({ error: 'Ongeldige cadence' }, { status: 400 });
    }
    const clampedMinScore =
      minScore != null ? Math.min(Math.max(Number(minScore) || 0, 0), 10) : null;

    const result = await sql`
      UPDATE lead_search_profiles SET
        active = COALESCE(${active ?? null}, active),
        name = COALESCE(${name ?? null}, name),
        query = COALESCE(${query ?? null}, query),
        min_score = COALESCE(${clampedMinScore}, min_score),
        cadence = COALESCE(${cadence ?? null}, cadence),
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
