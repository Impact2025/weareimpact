import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { runAndStoreChecks } from '@/lib/launch/run-checks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Draait alle checks tegen de site en vinkt taken met een geslaagde check_key automatisch af. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;

  const rows = await sql`SELECT site_url, probe_url FROM crm_projects WHERE slug = ${slug}`;
  if (rows.length === 0) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  if (!rows[0].site_url) {
    return NextResponse.json({ error: 'Stel eerst de site-URL in' }, { status: 400 });
  }

  try {
    const results = await runAndStoreChecks(slug, rows[0].site_url as string, (rows[0].probe_url as string) ?? null);
    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ error: `Ongeldige site-URL: ${(e as Error).message}` }, { status: 400 });
  }
}
