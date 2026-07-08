import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import {
  generateChecklistFollowup1Email,
  generateChecklistFollowup2Email,
  generateChecklistFollowup3Email,
} from '@/lib/email/templates/checklist-followup';

export const dynamic = 'force-dynamic';

const GENERATORS = {
  '1': generateChecklistFollowup1Email,
  '2': generateChecklistFollowup2Email,
  '3': generateChecklistFollowup3Email,
} as const;

export async function POST(request: NextRequest) {
  try {
    const { email, organisatie, step } = await request.json();
    const gen = GENERATORS[step as keyof typeof GENERATORS];

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    if (!gen) {
      return NextResponse.json({ error: 'Ongeldige stap (1, 2 of 3)' }, { status: 400 });
    }

    const tmpl = gen({ organisatie });
    const result = await sendEmail({
      to: email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Verzenden mislukt', detail: result.error }, { status: 502 });
    }

    // Markeer in de lead-record welke follow-ups verzonden zijn
    await sql`
      UPDATE checklist_leads
      SET email_sent = TRUE,
          followup_step = ${Number(step)},
          updated_at = NOW()
      WHERE email = ${email}
    `;

    return NextResponse.json({ success: true, step });
  } catch (error) {
    console.error('Checklist followup error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
