import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { renderOutreachHtml, renderOutreachText, unsubscribeHeaders } from '@/lib/lead-machine/outreach';
import { judgeEmail } from '@/lib/lead-machine/emailPolicy';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Leads in deze statussen krijgen nooit (nog) een koude mail, ook niet als er
// een goedgekeurd concept klaarstaat van vóór de statuswijziging.
const NO_MAIL_STATUSES = new Set(['replied', 'meeting', 'converted', 'lost', 'archived', 'rejected']);

// POST — goedgekeurde outreach versturen. Body: { ids?: string[] } (standaard: alles 'approved').
// Mens-in-de-lus: alleen wat expliciet is goedgekeurd gaat de deur uit.
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] | undefined = Array.isArray(body.ids) && body.ids.length ? body.ids : undefined;
    const max = Math.min(Number(body.max ?? 25), 25); // harde cap per keer — bezorgbaarheid

    const idFrag = ids ? sql`AND o.id = ANY(${ids}::uuid[])` : sql``;
    const items = await sql`
      SELECT o.*, l.unsubscribed, l.crm_company_id, l.name AS lead_name, l.status AS lead_status, l.domain AS lead_domain
      FROM lead_outreach o
      LEFT JOIN prospect_leads l ON l.id = o.lead_id
      WHERE o.tenant_id = 'weareimpact' AND o.status = 'approved' ${idFrag}
      ORDER BY o.approved_at ASC
      LIMIT ${max}
    `;

    if (items.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: 'Geen goedgekeurde mails om te versturen.' });
    }

    let sent = 0, failed = 0, skipped = 0;

    for (const item of items) {
      // Laatste veiligheidscontroles vlak voor verzending.
      const verdict = judgeEmail(item.to_email as string, item.lead_domain as string | undefined);
      const reason = item.unsubscribed ? 'Lead afgemeld'
        : NO_MAIL_STATUSES.has(item.lead_status as string) ? `Lead staat op '${item.lead_status}'`
        : !verdict.ok ? `Adres geweigerd: ${verdict.reason}`
        : null;
      if (reason) {
        await sql`UPDATE lead_outreach SET status = 'skipped', error = ${reason}, updated_at = NOW() WHERE id = ${item.id}`;
        skipped++;
        continue;
      }

      // Claim vóór verzending: approved → sent is atomair, zodat een dubbelklik nooit dubbel mailt.
      const claimed = await sql`
        UPDATE lead_outreach SET status = 'sent', updated_at = NOW()
        WHERE id = ${item.id} AND status = 'approved'
        RETURNING id
      `;
      if (claimed.length === 0) continue;

      const token = item.unsubscribe_token as string;
      const result = await sendEmail({
        from: process.env.OUTREACH_FROM_EMAIL || undefined,
        to: item.to_email as string,
        subject: item.subject as string,
        html: renderOutreachHtml(item.body_text as string, token),
        text: renderOutreachText(item.body_text as string, token),
        headers: unsubscribeHeaders(token),
      });

      if (result.success) {
        await sql`
          UPDATE lead_outreach
          SET message_id = ${result.messageId ?? null}, sent_at = NOW(), error = NULL, updated_at = NOW()
          WHERE id = ${item.id}
        `;
        await sql`
          UPDATE prospect_leads SET
            status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
            first_contacted_at = COALESCE(first_contacted_at, NOW()),
            last_contacted_at = NOW(), updated_at = NOW()
          WHERE id = ${item.lead_id}
        `;
        if (item.crm_company_id) {
          await sql`
            INSERT INTO crm_activities (company_id, type, subject, description, completed_at)
            VALUES (${item.crm_company_id}, 'email', ${(item.kind === 'followup' ? 'Opvolging: ' : 'Outreach: ') + (item.subject as string)}, ${item.body_text}, NOW())
          `.catch(() => {});
        }
        sent++;
      } else {
        await sql`
          UPDATE lead_outreach SET status = 'failed', error = ${result.error ?? 'Onbekende fout'}, updated_at = NOW()
          WHERE id = ${item.id}
        `;
        failed++;
      }
    }

    return NextResponse.json({
      sent, failed, skipped,
      message: `${sent} verzonden${failed ? `, ${failed} mislukt` : ''}${skipped ? `, ${skipped} overgeslagen` : ''}.`,
    });
  } catch (error) {
    console.error('Outreach send error:', error);
    return NextResponse.json({ error: 'Versturen mislukt' }, { status: 500 });
  }
}
