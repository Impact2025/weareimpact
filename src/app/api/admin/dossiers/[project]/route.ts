import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;

  const rows = await sql`
    SELECT p.slug, p.name, p.client_name, p.intake_notes, p.company_id, p.deal_id,
      co.name AS company_name, d.title AS deal_title, d.stage AS deal_stage
    FROM crm_projects p
    LEFT JOIN companies co ON co.id = p.company_id
    LEFT JOIN deals d ON d.id = p.deal_id
    WHERE p.slug = ${projectSlug}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ project: rows[0] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const body = await request.json();

  if ('intakeNotes' in body) {
    await sql`
      UPDATE crm_projects SET intake_notes = ${body.intakeNotes ?? null} WHERE slug = ${projectSlug}
    `;
  }
  // Koppeling met het CRM; null ontkoppelt
  if ('companyId' in body) {
    await sql`
      UPDATE crm_projects SET company_id = ${body.companyId || null} WHERE slug = ${projectSlug}
    `;
  }

  return NextResponse.json({ success: true });
}
