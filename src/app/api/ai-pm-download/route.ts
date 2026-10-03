import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getDownload, downloadUrl } from '@/lib/ai-pm-downloads';
import { generateAiPmDownloadEmail } from '@/lib/email/templates/ai-pm-download';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`ai-pm-download:${ip}`, 8, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Te veel aanvragen. Probeer het later opnieuw.' }, { status: 429 });
    }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const organisatie = body.organisatie ? String(body.organisatie).trim().slice(0, 200) : null;
    const download = getDownload(String(body.resource ?? ''));

    if (!download) {
      return NextResponse.json({ error: 'Onbekende download' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    // Eenvoudige honeypot: bots vullen dit verborgen veld wel in.
    if (body.website) {
      return NextResponse.json({ success: true, url: downloadUrl(download) });
    }

    // Lead opslaan (zelfde tabel als de AI-Proof checklist) en activiteit loggen.
    // Let op: email_sent blijft bewust FALSE. De cron /api/cron/checklist-followups
    // selecteert op email_sent = TRUE; deze downloaders hebben geen opvolgmails
    // aangevraagd en de bevestigingsmail belooft er ook geen.
    await sql`
      INSERT INTO checklist_leads (email, organisatie, source, created_at)
      VALUES (${email}, ${organisatie}, ${'ai-pm-' + download.id}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        organisatie = COALESCE(EXCLUDED.organisatie, checklist_leads.organisatie),
        updated_at = NOW()
    `;
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES (
        'lead',
        ${'Download: ' + download.short},
        ${email},
        ${JSON.stringify({ email, organisatie, source: 'ai-pm-' + download.id })}
      )
    `;

    const tpl = generateAiPmDownloadEmail({ organisatie: organisatie ?? undefined, download });
    const sent = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (!sent.success) {
      console.error('AI-PM download mail mislukt:', sent.error);
    }

    // De link wordt ook direct teruggegeven, zodat de bezoeker niet op de mail hoeft te wachten.
    return NextResponse.json({ success: true, url: downloadUrl(download), emailed: sent.success });
  } catch (error) {
    console.error('AI-PM download error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
