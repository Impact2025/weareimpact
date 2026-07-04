import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { renderOutreachHtml, renderOutreachText, unsubscribeHeaders } from '@/lib/lead-machine/outreach';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST — send approved outreach. Body: { ids?: string[] } (default: all 'approved').
// Human-in-the-loop: only items the user explicitly approved are sent.
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;
    const max = Math.min(Number(body.max ?? 25), 25); // hard cap per call — deliverability guardrail

    const items = ids && ids.length > 0
      ? await sql`
          SELECT o.*, l.unsubscribed, l.crm_company_id, l.name AS lead_name
          FROM lead_outreach o
          LEFT JOIN prospect_leads l ON l.id = o.lead_id
          WHERE o.tenant_id = 'weareimpact' AND o.status = 'approved' AND o.id = ANY(${ids}::uuid[])
          LIMIT ${max}
        `
      : await sql`
          SELECT o.*, l.unsubscribed, l.crm_company_id, l.name AS lead_name
          FROM lead_outreach o
          LEFT JOIN prospect_leads l ON l.id = o.lead_id
          WHERE o.tenant_id = 'weareimpact' AND o.status = 'approved'
          ORDER BY o.approved_at ASC
          LIMIT ${max}
        `;

    if (items.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: 'Geen goedgekeurde mails om te versturen.' });
    }

    let sent = 0, failed = 0, skipped = 0;

    for (const item of items) {
      // Final opt-out safety check
      if (item.unsubscribed) {
        await sql`UPDATE lead_outreach SET status = 'skipped', error = 'Lead afgemeld', updated_at = NOW() WHERE id = ${item.id}`;
        skipped++;
        continue;
      }

      // Claim vóór verzending: approved → sent is atomair, zodat twee
      // gelijktijdige requests (dubbelklik op "Versturen") nooit dubbel mailen.
      const claimed = await sql`
        UPDATE lead_outreach SET status = 'sent', updated_at = NOW()
        WHERE id = ${item.id} AND status = 'approved'
        RETURNING id
      `;
      if (claimed.length === 0) continue; // al geclaimd door een parallelle request

      const token = item.unsubscribe_token as string;
      const result = await sendEmail({
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
        // Advance the lead and stamp last contact
        await sql`
          UPDATE prospect_leads
          SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
              last_contacted_at = NOW(), updated_at = NOW()
          WHERE id = ${item.lead_id}
        `;
        // Mirror into the CRM activity timeline when the lead is linked to a company
        if (item.crm_company_id) {
          await sql`
            INSERT INTO crm_activities (company_id, type, subject, description)
            VALUES (${item.crm_company_id}, 'email', ${'Outreach: ' + (item.subject as string)}, ${item.body_text})
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
      message: `${sent} verzonden${failed ? `, ${failed} mislukt` : ''}${skipped ? `, ${skipped} overgeslagen (afgemeld)` : ''}.`,
    });
  } catch (error) {
    console.error('Outreach send error:', error);
    return NextResponse.json({ error: 'Versturen mislukt' }, { status: 500 });
  }
}
