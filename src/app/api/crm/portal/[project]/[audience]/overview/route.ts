import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience } from '@/lib/crm/portal-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string }> },
) {
  const { project: projectSlug, audience } = await params;
  if (!isAudience(audience)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  if (!(await isValidPortalSessionToken(token, projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Het projectoverzicht (mijlpalen/afspraken/actiepunten) is project-breed,
  // niet per doelgroep — beide doelgroepen zien dezelfde gedeelde, expliciet
  // client_visible-gemaakte voortgang.
  const [milestones, agreements, actions] = await Promise.all([
    sql`
      SELECT id, title, description, status, due_date
      FROM crm_milestones
      WHERE project_slug = ${projectSlug} AND client_visible = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `,
    sql`
      SELECT id, title, description, decided_at
      FROM crm_agreements
      WHERE project_slug = ${projectSlug} AND client_visible = TRUE
      ORDER BY decided_at DESC, created_at DESC
    `,
    sql`
      SELECT id, title, owner, status, due_date
      FROM crm_actions
      WHERE project_slug = ${projectSlug} AND client_visible = TRUE
      ORDER BY (status = 'done'), due_date NULLS LAST, created_at ASC
    `,
  ]);

  return NextResponse.json({ milestones, agreements, actions });
}
