import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { generateOutreachEmail, makeUnsubscribeToken } from '@/lib/lead-machine/outreach';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function isAuthenticated() {
  const store = await cookies();
  return !!store.get('admin_session')?.value;
}

function mapOutreach(r: Record<string, unknown>) {
  return {
    id: r.id,
    leadId: r.lead_id,
    toEmail: r.to_email,
    subject: r.subject,
    bodyText: r.body_text,
    status: r.status,
    messageId: r.message_id,
    error: r.error,
    createdAt: r.created_at,
    approvedAt: r.approved_at,
    sentAt: r.sent_at,
    leadName: r.lead_name,
    aiScore: r.ai_score != null ? Number(r.ai_score) : undefined,
  };
}

// GET — list outreach items (optionally by status)
export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const status = new URL(request.url).searchParams.get('status');

    const rows = status && status !== 'all'
      ? await sql`
          SELECT o.*, l.name AS lead_name, l.ai_score
          FROM lead_outreach o
          LEFT JOIN prospect_leads l ON l.id = o.lead_id
          WHERE o.tenant_id = 'weareimpact' AND o.status = ${status}
          ORDER BY o.created_at DESC
          LIMIT 200
        `
      : await sql`
          SELECT o.*, l.name AS lead_name, l.ai_score
          FROM lead_outreach o
          LEFT JOIN prospect_leads l ON l.id = o.lead_id
          WHERE o.tenant_id = 'weareimpact'
          ORDER BY o.created_at DESC
          LIMIT 200
        `;

    const counts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM lead_outreach WHERE tenant_id = 'weareimpact'
    `;

    return NextResponse.json({
      outreach: rows.map(mapOutreach),
      counts: {
        draft: Number(counts[0]?.draft ?? 0),
        approved: Number(counts[0]?.approved ?? 0),
        sent: Number(counts[0]?.sent ?? 0),
        failed: Number(counts[0]?.failed ?? 0),
      },
    });
  } catch (error) {
    console.error('Outreach GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', outreach: [] }, { status: 500 });
  }
}

// POST — generate draft emails for given leadIds (or all eligible leads).
// Eligible = has email, not unsubscribed, not already contacted, no existing draft/sent outreach.
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const leadIds: string[] | undefined = Array.isArray(body.leadIds) ? body.leadIds : undefined;
    const minScore = Number(body.minScore ?? 0);
    const max = Math.min(Number(body.max ?? 20), 30);

    const leads = leadIds && leadIds.length > 0
      ? await sql`
          SELECT * FROM prospect_leads
          WHERE tenant_id = 'weareimpact'
            AND id = ANY(${leadIds}::uuid[])
            AND email IS NOT NULL
            AND COALESCE(unsubscribed, FALSE) = FALSE
            AND id NOT IN (SELECT lead_id FROM lead_outreach WHERE lead_id IS NOT NULL AND status IN ('draft','approved','sent'))
        `
      : await sql`
          SELECT * FROM prospect_leads
          WHERE tenant_id = 'weareimpact'
            AND email IS NOT NULL
            AND COALESCE(unsubscribed, FALSE) = FALSE
            AND status = 'new'
            AND COALESCE(ai_score, 0) >= ${minScore}
            AND id NOT IN (SELECT lead_id FROM lead_outreach WHERE lead_id IS NOT NULL AND status IN ('draft','approved','sent'))
          ORDER BY ai_score DESC NULLS LAST
          LIMIT ${max}
        `;

    if (leads.length === 0) {
      return NextResponse.json({ created: 0, message: 'Geen leads met e-mail die nog een concept nodig hebben.' });
    }

    let created = 0;
    for (const lead of leads) {
      try {
        const draft = await generateOutreachEmail({
          name: lead.name as string,
          website: lead.website as string | null,
          city: lead.city as string | null,
          snippet: lead.sbi_description as string | null,
          aiRationale: lead.ai_rationale as string | null,
        });

        await sql`
          INSERT INTO lead_outreach (lead_id, to_email, subject, body_text, unsubscribe_token)
          VALUES (${lead.id}, ${lead.email}, ${draft.subject}, ${draft.body}, ${makeUnsubscribeToken()})
        `;
        created++;
      } catch (err) {
        console.error(`Draft generation failed for lead ${lead.id}:`, err);
      }
    }

    return NextResponse.json({ created, message: `${created} concept${created !== 1 ? 'en' : ''} aangemaakt.` });
  } catch (error) {
    console.error('Outreach POST error:', error);
    return NextResponse.json({ error: 'Genereren mislukt' }, { status: 500 });
  }
}

// PUT — edit a draft (subject/body) and/or change status (approve / back to draft)
export async function PUT(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, subject, bodyText, status } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    if (status && !['draft', 'approved'].includes(status)) {
      return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 });
    }

    const result = await sql`
      UPDATE lead_outreach SET
        subject = COALESCE(${subject ?? null}, subject),
        body_text = COALESCE(${bodyText ?? null}, body_text),
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

// DELETE — remove a draft/approved outreach (cannot delete sent)
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
