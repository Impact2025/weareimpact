import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience } from '@/lib/crm/portal-session';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VINCENT = 'v.munster@weareimpact.nl';
const MAX_COMMENT = 2000;

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Klant rondt een eigen stap af en/of laat een opmerking achter. Vincent krijgt een mail. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string; id: string }> },
) {
  const { project: projectSlug, audience, id } = await params;
  if (!isAudience(audience)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  if (!(await isValidPortalSessionToken(token, projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, MAX_COMMENT) : '';
  const complete = body.complete === true;
  if (!comment && !complete) {
    return NextResponse.json({ error: 'Niets om op te slaan' }, { status: 400 });
  }

  // Alleen klantzichtbare stappen van de klant zelf, en niet als ze nog op iets anders wachten.
  const rows = await sql`
    SELECT m.id, m.title, m.status, p.name AS project_name,
           EXISTS (SELECT 1 FROM crm_milestones d WHERE d.id = m.depends_on AND d.status <> 'done') AS blocked
    FROM crm_milestones m
    JOIN crm_projects p ON p.slug = m.project_slug
    WHERE m.id = ${id} AND m.project_slug = ${projectSlug} AND m.client_visible = TRUE AND m.owner = 'klant'
  `;
  const milestone = rows[0];
  if (!milestone) return NextResponse.json({ error: 'Stap niet gevonden' }, { status: 404 });
  if (complete && milestone.blocked) {
    return NextResponse.json({ error: 'Deze stap kan pas na een eerdere stap.' }, { status: 409 });
  }

  if (comment) {
    await sql`
      INSERT INTO crm_milestone_comments (milestone_id, project_slug, author, body)
      VALUES (${id}, ${projectSlug}, 'klant', ${comment})
    `;
  }
  const completedNow = complete && milestone.status !== 'done';
  if (completedNow) {
    await sql`
      UPDATE crm_milestones
      SET status = 'done', completed_at = COALESCE(completed_at, NOW()), updated_at = NOW()
      WHERE id = ${id} AND project_slug = ${projectSlug}
    `;
  }

  if (completedNow || comment) {
    const what = completedNow ? 'heeft een stap afgerond' : 'heeft een opmerking geplaatst';
    const html = `
      <p><strong>${esc(milestone.project_name)}</strong>: de klant ${what}.</p>
      <p><strong>${esc(milestone.title)}</strong></p>
      ${comment ? `<blockquote style="margin:0;padding:8px 12px;border-left:3px solid #f59e0b;background:#fafafa;white-space:pre-wrap">${esc(comment)}</blockquote>` : ''}
    `;
    const text = `${milestone.project_name}: de klant ${what}.\n${milestone.title}${comment ? `\n\n${comment}` : ''}`;
    try {
      await sendEmail({
        to: VINCENT,
        subject: `${completedNow ? 'Afgerond' : 'Opmerking'} door klant: ${milestone.title}`,
        html,
        text,
      });
    } catch (error) {
      console.error('Mail naar Vincent mislukt (non-fatal):', error);
    }
  }

  return NextResponse.json({ ok: true, completed: completedNow });
}
