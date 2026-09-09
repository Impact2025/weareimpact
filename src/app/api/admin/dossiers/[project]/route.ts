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
    SELECT slug, name, client_name, intake_notes
    FROM crm_projects
    WHERE slug = ${projectSlug}
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
  const { intakeNotes } = await request.json();

  await sql`
    UPDATE crm_projects SET intake_notes = ${intakeNotes ?? null} WHERE slug = ${projectSlug}
  `;

  return NextResponse.json({ success: true });
}
