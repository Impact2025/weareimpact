import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateChecklistDownloadEmail } from '@/lib/email/templates/checklist-download';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, organisatie } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Save lead to database
    await sql`
      INSERT INTO checklist_leads (email, organisatie, source, created_at)
      VALUES (${email}, ${organisatie || null}, 'ai-proof-checklist', NOW())
      ON CONFLICT (email) DO UPDATE SET
        organisatie = COALESCE(EXCLUDED.organisatie, checklist_leads.organisatie),
        updated_at = NOW()
    `;

    // Log activity
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'lead',
        'AI-Proof Checklist download',
        ${email},
        ${JSON.stringify({ email, organisatie, source: 'ai-proof-checklist' })}
      )
    `;

    // Send email with checklist
    const emailTemplate = generateChecklistDownloadEmail({ email, organisatie });
    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send checklist email:', emailResult.error);
      // Still return success - lead is saved, email can be retried
    } else {
      // Mark email as sent
      await sql`
        UPDATE checklist_leads
        SET email_sent = TRUE, updated_at = NOW()
        WHERE email = ${email}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checklist download error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}
