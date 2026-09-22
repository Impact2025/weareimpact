import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type LinkType = 'company' | 'contact' | 'deal' | 'project';
const VALID_TYPES: LinkType[] = ['company', 'contact', 'deal', 'project'];

function buildNote(overview: string, actionItems: { description?: string; completed?: boolean }[]): string {
  const parts = [overview];
  const open = actionItems.filter((a) => !a.completed && a.description);
  if (open.length) {
    parts.push('\nActiepunten uit Omi-gesprek:\n' + open.map((a) => `- ${a.description}`).join('\n'));
  }
  return parts.filter(Boolean).join('\n').trim();
}

// POST - Koppel een Omi-memory aan CRM (company/contact/deal) of aan een
// klantdossier (project), of negeer 'm. Dit is het enige moment waarop een
// Omi-gesprek daadwerkelijk in het CRM/dossier terechtkomt.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  const memoryRows = await sql`SELECT * FROM omi_memories WHERE id = ${id}`;
  const memory = memoryRows[0];
  if (!memory) {
    return NextResponse.json({ error: 'Omi-gesprek niet gevonden' }, { status: 404 });
  }

  if (action === 'ignore') {
    await sql`UPDATE omi_memories SET status = 'ignored' WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  if (action !== 'link') {
    return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
  }

  const { type, targetId, label } = body as { type: LinkType; targetId: string; label?: string };
  if (!VALID_TYPES.includes(type) || !targetId) {
    return NextResponse.json({ error: 'type en targetId zijn verplicht' }, { status: 400 });
  }

  const actionItems = Array.isArray(memory.action_items) ? memory.action_items : [];
  const note = buildNote(memory.overview || '', actionItems);
  const subject = memory.title || 'Omi-gesprek';

  let activityId: string | null = null;
  let resolvedLabel = label || null;

  if (type === 'project') {
    // Klantdossier: log als afspraak (agreement) + zet openstaande
    // actiepunten apart in de takenlijst van het dossier.
    if (!resolvedLabel) {
      const project = await sql`SELECT name FROM crm_projects WHERE slug = ${targetId}`;
      resolvedLabel = project[0]?.name || targetId;
    }

    await sql`
      INSERT INTO crm_agreements (project_slug, title, description, decided_at)
      VALUES (${targetId}, ${subject}, ${note || null}, CURRENT_DATE)
    `;

    const open = actionItems.filter((a: { description?: string; completed?: boolean }) => !a.completed && a.description);
    for (const item of open) {
      await sql`
        INSERT INTO crm_actions (project_slug, title, owner, source)
        VALUES (${targetId}, ${item.description}, 'vincent', 'manual')
      `;
    }
  } else {
    const companyId = type === 'company' ? targetId : null;
    const contactId = type === 'contact' ? targetId : null;
    const dealId = type === 'deal' ? targetId : null;

    const result = await sql`
      INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description, completed_at)
      VALUES (${companyId}, ${contactId}, ${dealId}, 'note', ${subject}, ${note || null}, NOW())
      RETURNING id
    `;
    activityId = result[0]?.id || null;

    if (!resolvedLabel) {
      if (type === 'company') {
        const c = await sql`SELECT name FROM companies WHERE id = ${targetId}`;
        resolvedLabel = c[0]?.name || targetId;
      } else if (type === 'contact') {
        const c = await sql`SELECT first_name, last_name FROM contacts WHERE id = ${targetId}`;
        resolvedLabel = c[0] ? `${c[0].first_name} ${c[0].last_name || ''}`.trim() : targetId;
      } else if (type === 'deal') {
        const d = await sql`SELECT title FROM deals WHERE id = ${targetId}`;
        resolvedLabel = d[0]?.title || targetId;
      }
    }
  }

  await sql`
    UPDATE omi_memories
    SET status = 'linked', linked_type = ${type}, linked_id = ${targetId},
        linked_label = ${resolvedLabel}, activity_id = ${activityId}
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}
