import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { getTemplate } from '@/lib/launch/templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Zaait de taken van een template in het dossier. Bestaande taken (zelfde titel) blijven ongemoeid. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;
  const { template } = await request.json();
  const tpl = getTemplate(template);
  if (!tpl) return NextResponse.json({ error: 'Onbekende template' }, { status: 400 });

  const existing = await sql`SELECT title, sort_order FROM crm_milestones WHERE project_slug = ${slug}`;
  const titles = new Set(existing.map((r) => r.title as string));
  let sort = existing.reduce((max, r) => Math.max(max, Number(r.sort_order)), -1) + 1;

  let added = 0;
  for (const task of tpl.tasks) {
    if (titles.has(task.title)) continue;
    await sql`
      INSERT INTO crm_milestones (project_slug, title, description, phase, owner, blocking, check_key, sort_order, client_visible)
      VALUES (${slug}, ${task.title}, ${task.description ?? null}, ${task.phase}, ${task.owner},
              ${!!task.blocking}, ${task.checkKey ?? null}, ${sort++}, ${!!task.clientVisible})
    `;
    added++;
  }
  await sql`UPDATE crm_projects SET template = ${tpl.key} WHERE slug = ${slug}`;

  return NextResponse.json({ success: true, added });
}
