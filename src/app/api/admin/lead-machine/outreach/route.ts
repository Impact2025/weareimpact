import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import {
  generateOutreachEmail, generateFollowUpEmail, makeUnsubscribeToken, type OutreachLeadInput,
} from '@/lib/lead-machine/outreach';
import { judgeEmail } from '@/lib/lead-machine/emailPolicy';
import { loadCrmIndex } from '@/lib/lead-machine/crm';
import { mapPool } from '@/lib/lead-machine/mapPool';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Opvolgen na zoveel dagen stilte.
const FOLLOW_UP_AFTER_DAYS = 7;

function mapOutreach(r: Record<string, unknown>) {
  return {
    id: r.id,
    leadId: r.lead_id,
    toEmail: r.to_email,
    subject: r.subject,
    bodyText: r.body_text,
    status: r.status,
    kind: (r.kind as string) ?? 'first',
    warning: r.warning ?? null,
    messageId: r.message_id,
    error: r.error,
    createdAt: r.created_at,
    approvedAt: r.approved_at,
    sentAt: r.sent_at,
    leadName: r.lead_name,
    leadWebsite: r.lead_website,
    leadSegment: (r.lead_segment as string)?.trim() || null,
    leadSignal: r.lead_signal ?? null,
    leadHooks: Array.isArray(r.lead_hooks) ? r.lead_hooks : [],
    aiScore: r.ai_score != null ? Number(r.ai_score) : undefined,
  };
}

function leadInput(lead: Record<string, unknown>): OutreachLeadInput {
  return {
    name: lead.name as string,
    website: lead.website as string | null,
    city: lead.city as string | null,
    orgType: lead.org_type as string | null,
    segment: (lead.segment as string | null)?.trim() || null,
    summary: lead.summary as string | null,
    hooks: Array.isArray(lead.hooks) ? (lead.hooks as string[]) : [],
    signal: lead.signal as string | null,
    contactPerson: lead.contact_person as string | null,
    aiRationale: lead.ai_rationale as string | null,
    pitch: lead.profile_pitch as string | null,
  };
}

// GET — outreach-items (optioneel per status) + tellingen + hoeveel opvolging klaarstaat
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const status = new URL(request.url).searchParams.get('status');
    const statusFrag = status && status !== 'all' ? sql`AND o.status = ${status}` : sql``;

    const rows = await sql`
      SELECT o.*, l.name AS lead_name, l.website AS lead_website, l.ai_score,
             l.segment AS lead_segment, l.signal AS lead_signal, l.hooks AS lead_hooks
      FROM lead_outreach o
      LEFT JOIN prospect_leads l ON l.id = o.lead_id
      WHERE o.tenant_id = 'weareimpact' ${statusFrag}
      ORDER BY o.created_at DESC
      LIMIT 200
    `;

    const counts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'sent') AS sent,
        COUNT(*) FILTER (WHERE status = 'failed') AS failed,
        COUNT(*) FILTER (WHERE status = 'skipped') AS skipped
      FROM lead_outreach WHERE tenant_id = 'weareimpact'
    `;

    const due = await sql`
      SELECT COUNT(DISTINCT l.id) AS n
      FROM prospect_leads l
      JOIN lead_outreach o ON o.lead_id = l.id AND o.status = 'sent' AND COALESCE(o.kind,'first') = 'first'
      WHERE l.tenant_id = 'weareimpact' AND l.status = 'contacted'
        AND COALESCE(l.unsubscribed, FALSE) = FALSE
        AND o.sent_at < NOW() - make_interval(days => ${FOLLOW_UP_AFTER_DAYS})
        AND NOT EXISTS (SELECT 1 FROM lead_outreach f WHERE f.lead_id = l.id AND f.kind = 'followup')
    `;

    const eligible = await sql`
      SELECT COUNT(*) AS n FROM prospect_leads l
      WHERE l.tenant_id = 'weareimpact' AND l.status = 'new' AND l.email IS NOT NULL
        AND COALESCE(l.unsubscribed, FALSE) = FALSE
        AND NOT EXISTS (SELECT 1 FROM lead_outreach o WHERE o.lead_id = l.id)
    `;

    const c = counts[0] ?? {};
    return NextResponse.json({
      outreach: rows.map(mapOutreach),
      counts: {
        draft: Number(c.draft ?? 0), approved: Number(c.approved ?? 0), sent: Number(c.sent ?? 0),
        failed: Number(c.failed ?? 0), skipped: Number(c.skipped ?? 0),
      },
      followUpDue: Number(due[0]?.n ?? 0),
      eligibleNew: Number(eligible[0]?.n ?? 0),
      followUpAfterDays: FOLLOW_UP_AFTER_DAYS,
    });
  } catch (error) {
    console.error('Outreach GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', outreach: [] }, { status: 500 });
  }
}

// POST — concepten genereren.
// Body: { kind?: 'first' | 'followup', leadIds?: string[], minScore?: number, max?: number }
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const kind: 'first' | 'followup' = body.kind === 'followup' ? 'followup' : 'first';
    const leadIds: string[] | undefined = Array.isArray(body.leadIds) && body.leadIds.length ? body.leadIds : undefined;
    const minScore = Number(body.minScore ?? 0);
    const max = Math.min(Number(body.max ?? 15), 25);

    if (kind === 'followup') return generateFollowUps(leadIds, max);

    const idFrag = leadIds ? sql`AND l.id = ANY(${leadIds}::uuid[])` : sql`AND COALESCE(l.ai_score, 0) >= ${minScore}`;
    const leads = await sql`
      SELECT l.*, p.pitch AS profile_pitch
      FROM prospect_leads l
      LEFT JOIN lead_search_profiles p ON p.id = l.profile_id
      WHERE l.tenant_id = 'weareimpact'
        AND l.status = 'new'
        AND l.email IS NOT NULL
        AND COALESCE(l.unsubscribed, FALSE) = FALSE
        AND NOT EXISTS (SELECT 1 FROM lead_outreach o WHERE o.lead_id = l.id AND o.status IN ('draft','approved','sent'))
        ${idFrag}
      ORDER BY (l.signal IS NOT NULL) DESC, l.ai_score DESC NULLS LAST
      LIMIT ${max}
    `;

    if (leads.length === 0) {
      return NextResponse.json({ created: 0, skipped: [], message: 'Geen nieuwe leads met een mailadres die nog een concept nodig hebben.' });
    }

    const crm = await loadCrmIndex();
    const skipped: Array<{ name: string; reason: string }> = [];
    const todo = leads.filter((lead) => {
      const verdict = judgeEmail(lead.email as string, lead.domain as string);
      if (!verdict.ok) { skipped.push({ name: lead.name as string, reason: verdict.reason }); return false; }
      const inCrm = crm.match(lead.domain as string, lead.name as string);
      if (inCrm && inCrm.id !== lead.crm_company_id) {
        skipped.push({ name: lead.name as string, reason: `staat al in het CRM als ${inCrm.name} — benader via het CRM-plan` });
        return false;
      }
      return true;
    });

    const drafts = await mapPool(todo, (lead) => generateOutreachEmail(leadInput(lead)), { concurrency: 3, minDelayMs: 200 });

    let created = 0;
    for (let i = 0; i < todo.length; i++) {
      const lead = todo[i];
      const draft = drafts[i];
      if (!draft) { skipped.push({ name: lead.name as string, reason: 'AI kon geen goed concept schrijven — probeer later opnieuw' }); continue; }
      const verdict = judgeEmail(lead.email as string, lead.domain as string);
      const warnings = [
        verdict.ok && verdict.kind === 'generic' ? `algemeen adres (${lead.email}) — overweeg een persoon te zoeken` : null,
        !(Array.isArray(lead.hooks) && lead.hooks.length) && !lead.signal ? 'geen concreet haakje van hun site — check de opening' : null,
      ].filter(Boolean).join(' · ') || null;

      const ins = await sql`
        INSERT INTO lead_outreach (lead_id, to_email, subject, body_text, unsubscribe_token, kind, warning)
        VALUES (${lead.id}, ${lead.email}, ${draft.subject}, ${draft.body}, ${makeUnsubscribeToken()}, 'first', ${warnings})
        ON CONFLICT (lead_id) WHERE status IN ('draft', 'approved') DO NOTHING
        RETURNING id
      `;
      if (ins.length > 0) created++;
    }

    return NextResponse.json({
      created,
      skipped,
      message: `${created} concept${created !== 1 ? 'en' : ''} klaargezet${skipped.length ? `, ${skipped.length} overgeslagen` : ''}.`,
    });
  } catch (error) {
    console.error('Outreach POST error:', error);
    return NextResponse.json({ error: 'Genereren mislukt' }, { status: 500 });
  }
}

async function generateFollowUps(leadIds: string[] | undefined, max: number) {
  const idFrag = leadIds ? sql`AND l.id = ANY(${leadIds}::uuid[])` : sql``;
  const rows = await sql`
    SELECT DISTINCT ON (l.id) l.*, p.pitch AS profile_pitch,
           o.subject AS prev_subject, o.body_text AS prev_body, o.sent_at AS prev_sent_at,
           o.to_email AS prev_to, o.unsubscribe_token AS prev_token
    FROM prospect_leads l
    JOIN lead_outreach o ON o.lead_id = l.id AND o.status = 'sent' AND COALESCE(o.kind,'first') = 'first'
    LEFT JOIN lead_search_profiles p ON p.id = l.profile_id
    WHERE l.tenant_id = 'weareimpact'
      AND l.status = 'contacted'
      AND COALESCE(l.unsubscribed, FALSE) = FALSE
      AND o.sent_at < NOW() - make_interval(days => ${FOLLOW_UP_AFTER_DAYS})
      AND NOT EXISTS (SELECT 1 FROM lead_outreach f WHERE f.lead_id = l.id AND f.kind = 'followup')
      ${idFrag}
    ORDER BY l.id, o.sent_at DESC
    LIMIT ${max}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ created: 0, skipped: [], message: `Geen leads die al ${FOLLOW_UP_AFTER_DAYS} dagen op een reactie wachten.` });
  }

  const drafts = await mapPool(rows, (r) => generateFollowUpEmail(leadInput(r), {
    subject: r.prev_subject as string,
    body: r.prev_body as string,
    sentAt: new Date(r.prev_sent_at as string).toISOString(),
  }), { concurrency: 3, minDelayMs: 200 });

  let created = 0;
  const skipped: Array<{ name: string; reason: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const d = drafts[i];
    if (!d) { skipped.push({ name: r.name as string, reason: 'AI kon geen opvolgmail schrijven' }); continue; }
    // Eigen token per mail; afmelden werkt per lead, dus geldt voor de hele reeks.
    const ins = await sql`
      INSERT INTO lead_outreach (lead_id, to_email, subject, body_text, unsubscribe_token, kind)
      VALUES (${r.id}, ${r.prev_to}, ${d.subject}, ${d.body}, ${makeUnsubscribeToken()}, 'followup')
      ON CONFLICT (lead_id) WHERE status IN ('draft', 'approved') DO NOTHING
      RETURNING id
    `;
    if (ins.length > 0) created++;
  }
  return NextResponse.json({
    created, skipped,
    message: `${created} opvolgmail${created !== 1 ? 's' : ''} klaargezet.`,
  });
}

// PUT — concept bewerken en/of goedkeuren (of terug naar concept)
export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, subject, bodyText, status, toEmail } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    if (status && !['draft', 'approved'].includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }
    if (toEmail != null) {
      const current = await sql`SELECT l.domain FROM lead_outreach o JOIN prospect_leads l ON l.id = o.lead_id WHERE o.id = ${id}`;
      const verdict = judgeEmail(toEmail, current[0]?.domain as string | undefined);
      if (!verdict.ok) return NextResponse.json({ error: `Dit adres kan niet: ${verdict.reason}` }, { status: 400 });
    }

    const result = await sql`
      UPDATE lead_outreach SET
        subject = COALESCE(${subject ?? null}, subject),
        body_text = COALESCE(${bodyText ?? null}, body_text),
        to_email = COALESCE(${toEmail ?? null}, to_email),
        status = COALESCE(${status ?? null}, status),
        approved_at = CASE WHEN ${status ?? null} = 'approved' THEN NOW() ELSE approved_at END,
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = 'weareimpact' AND status IN ('draft', 'approved')
      RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden of al verzonden' }, { status: 404 });
    }
    return NextResponse.json({ outreach: mapOutreach(result[0]) });
  } catch (error) {
    console.error('Outreach PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — concept of goedgekeurd item verwijderen (verzonden mails blijven)
export async function DELETE(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });
    await sql`
      DELETE FROM lead_outreach
      WHERE id = ${id} AND tenant_id = 'weareimpact' AND status IN ('draft', 'approved')
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Outreach DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
