import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email/send';
import {
  generateChecklistFollowup1Email,
  generateChecklistFollowup2Email,
  generateChecklistFollowup3Email,
} from '@/lib/email/templates/checklist-followup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Day offsets (relative to lead created_at) at which each follow-up is due.
const STEP_DAYS = { 1: 2, 2: 4, 3: 6 } as const;
const GENERATORS = {
  1: generateChecklistFollowup1Email,
  2: generateChecklistFollowup2Email,
  3: generateChecklistFollowup3Email,
} as const;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Leads that downloaded the checklist (email_sent) and haven't finished all 3 follow-ups.
    const leads = await sql`
      SELECT email, organisatie, created_at, followup_step
      FROM checklist_leads
      WHERE email_sent = TRUE
        AND followup_step < 3
      ORDER BY created_at ASC
    `;

    const today = new Date();
    const sent: string[] = [];
    const skippedStale: string[] = [];
    const failed: { email: string; error: string }[] = [];

    for (const lead of leads as any[]) {
      const ageDays = Math.floor(
        (today.getTime() - new Date(lead.created_at).getTime()) / 86_400_000
      );

      // Determine which step (if any) is due based on age.
      let dueStep: 1 | 2 | 3 | 0 = 0;
      if (ageDays >= STEP_DAYS[3]) dueStep = 3;
      else if (ageDays >= STEP_DAYS[2]) dueStep = 2;
      else if (ageDays >= STEP_DAYS[1]) dueStep = 1;

      // No step due yet (lead is < 2 days old) — leave for a future run.
      if (dueStep === 0) continue;

      // Lead is older than the full window but somehow never finished:
      // mark complete WITHOUT back-filling old emails (avoids a stale dump).
      if (ageDays > STEP_DAYS[3] && lead.followup_step < dueStep) {
        // dueStep will be 3 here; if followup_step is already >=1 we only send the gap.
      }

      // Send every step the lead is due for but hasn't received yet.
      let step = (lead.followup_step + 1) as 1 | 2 | 3;
      while (step <= dueStep) {
        const gen = GENERATORS[step];
        const tmpl = gen({ organisatie: lead.organisatie ?? undefined });
        const res = await sendEmail({
          to: lead.email,
          subject: tmpl.subject,
          html: tmpl.html,
          text: tmpl.text,
        });
        if (!res.success) {
          failed.push({ email: lead.email, error: String(res.error).slice(0, 300) });
          break; // don't advance step on failure
        }
        sent.push(`${lead.email} (stap ${step})`);
        await sql`
          UPDATE checklist_leads
          SET followup_step = ${step}, updated_at = NOW()
          WHERE email = ${lead.email}
        `;
        step = (step + 1) as 1 | 2 | 3;
      }

      // If the lead is past the window and still not at step 3 (e.g. step was 0
      // but age > 6d), close it out without sending stale mail.
      if (ageDays > STEP_DAYS[3] && lead.followup_step < 3) {
        await sql`
          UPDATE checklist_leads
          SET followup_step = 3, updated_at = NOW()
          WHERE email = ${lead.email} AND followup_step < 3
        `;
        skippedStale.push(lead.email);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: leads.length,
      sent,
      skippedStale,
      failed,
    });
  } catch (error) {
    console.error('Cron checklist-followups error:', error);
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
