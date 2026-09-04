import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSprintTitle } from '@/lib/intake/sprintbrief-questions';

export const dynamic = 'force-dynamic';

async function ensureSession(dealId: string, sprintSlug: string) {
  const existing = await sql`SELECT * FROM sprint_sessions WHERE deal_id = ${dealId} LIMIT 1`;
  if (existing.length > 0) return existing[0];

  const inserted = await sql`
    INSERT INTO sprint_sessions (deal_id, sprint_slug)
    VALUES (${dealId}, ${sprintSlug})
    RETURNING *
  `;
  return inserted[0];
}

// GET - het volledige werkdossier voor de sprint-sessie: dealcontext,
// Sprintbrief-antwoorden en de fasenotities.
export async function GET(request: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { dealId } = await params;

  try {
    const deals = await sql`
      SELECT d.*, co.name as company_name, co.website as company_website,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        c.email as contact_email, c.phone as contact_phone
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      LEFT JOIN contacts c ON c.id = d.contact_id
      WHERE d.id = ${dealId}
    `;
    const deal = deals[0];
    if (!deal) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }

    const sprintSlug = (deal.source as string)?.replace('sprint:', '') || 'sprint-triage';
    const session = await ensureSession(dealId, sprintSlug);

    const sprintbriefs = await sql`
      SELECT answers, created_at FROM sprintbrief_submissions
      WHERE deal_id = ${dealId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      deal: {
        id: deal.id,
        title: deal.title,
        stage: deal.stage,
        companyName: deal.company_name,
        companyWebsite: deal.company_website,
        contactName: deal.contact_name,
        contactEmail: deal.contact_email,
        contactPhone: deal.contact_phone,
      },
      sprintSlug,
      sprintTitle: getSprintTitle(sprintSlug),
      sprintbrief: sprintbriefs[0]?.answers || null,
      session: {
        id: session.id,
        status: session.status,
        diagnoseNotes: session.diagnose_notes || '',
        doorbraakNotes: session.doorbraak_notes || '',
        borgingNotes: session.borging_notes || '',
        sopDraft: session.sop_draft || '',
      },
    });
  } catch (error) {
    console.error('Sprint session GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sprint session' }, { status: 500 });
  }
}

// PATCH - notities per fase opslaan (autosave vanuit het admin-scherm)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ dealId: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { dealId } = await params;

  try {
    const body = await request.json();
    const { phase, notes, status } = body as {
      phase?: 'diagnose' | 'doorbraak' | 'borging';
      notes?: string;
      status?: 'gepland' | 'bezig' | 'afgerond';
    };

    const deals = await sql`SELECT source FROM deals WHERE id = ${dealId}`;
    if (deals.length === 0) {
      return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 });
    }
    const sprintSlug = (deals[0].source as string)?.replace('sprint:', '') || 'sprint-triage';
    await ensureSession(dealId, sprintSlug);

    if (phase && typeof notes === 'string') {
      const column = `${phase}_notes`;
      if (column === 'diagnose_notes') {
        await sql`UPDATE sprint_sessions SET diagnose_notes = ${notes}, updated_at = NOW() WHERE deal_id = ${dealId}`;
      } else if (column === 'doorbraak_notes') {
        await sql`UPDATE sprint_sessions SET doorbraak_notes = ${notes}, updated_at = NOW() WHERE deal_id = ${dealId}`;
      } else if (column === 'borging_notes') {
        await sql`UPDATE sprint_sessions SET borging_notes = ${notes}, updated_at = NOW() WHERE deal_id = ${dealId}`;
      }
    }

    if (status) {
      await sql`UPDATE sprint_sessions SET status = ${status}, updated_at = NOW() WHERE deal_id = ${dealId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sprint session PATCH error:', error);
    return NextResponse.json({ error: 'Failed to save sprint session' }, { status: 500 });
  }
}
