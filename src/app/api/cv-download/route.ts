import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sql } from '@/lib/db/neon';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, organisatie, hp } = body;

    // Honeypot — silent pass for bots
    if (hp && hp.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Geldig e-mailadres is verplicht' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOrg = (typeof organisatie === 'string' ? organisatie.trim() : '') || null;
    const clientIp = getClientIp(request);

    // Save lead to DB (non-fatal)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS cv_download_leads (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          organisatie VARCHAR(255),
          ip_address VARCHAR(45),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sql`
        INSERT INTO cv_download_leads (name, email, organisatie, ip_address)
        VALUES (${trimmedName}, ${trimmedEmail}, ${trimmedOrg}, ${clientIp})
      `;
      // Activity log (non-fatal)
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'CV aangevraagd',
          ${trimmedName + ' — ' + trimmedEmail},
          ${JSON.stringify({ name: trimmedName, email: trimmedEmail, organisatie: trimmedOrg, source: 'interim-cv' })}
        )
      `.catch(() => {});
    } catch (dbErr) {
      console.error('cv_download_leads DB error:', dbErr);
    }

    // Read PDF from public folder
    const pdfPath = path.join(process.cwd(), 'public', 'cv-vincent-van-munster.pdf');
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = fs.readFileSync(pdfPath);
    } catch {
      console.error('CV PDF not found at:', pdfPath);
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'E-mailservice niet beschikbaar. Neem direct contact op.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@weareimpact.nl';

    // Email to requester with CV attached
    const confirmHtml = `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px">
    <div style="color:#f97316;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px">WeAreImpact</div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 6px;line-height:1.2">CV Vincent van Münster</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0">Strategic Innovation Partner &amp; Interim Manager</p>
  </div>
  <div style="padding:40px">
    <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 16px">Beste ${trimmedName},</p>
    <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 16px">Bedankt voor uw interesse in mijn profiel! Het CV is als bijlage bij deze e-mail gevoegd.</p>
    <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 28px">Wilt u een vrijblijvende verkenning inplannen? Ik neem graag 30 minuten de tijd om te kijken of we een goede match zijn.</p>
    <div style="background:#f8fafc;border-radius:12px;padding:24px;border-left:4px solid #f97316;margin-bottom:32px">
      <div style="font-weight:800;color:#0f172a;font-size:15px;margin-bottom:10px">Direct contact</div>
      <div style="color:#64748b;font-size:14px;line-height:2">
        📞 06 – 144 709 77<br>
        ✉️ v.munster@weareimpact.nl<br>
        🔗 <a href="https://www.weareimpact.nl/interim" style="color:#f97316;text-decoration:none">weareimpact.nl/interim</a>
      </div>
    </div>
    <div style="background:#fff7ed;border-radius:10px;padding:16px 20px;margin-bottom:32px">
      <div style="font-size:12px;font-weight:700;color:#c2410c;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Beschikbaar per direct</div>
      <div style="color:#7c3aed;font-size:13px">16–24 uur/week · Regio Amsterdam / Haarlem / Leiden · €125–€140 per uur</div>
    </div>
    <p style="color:#94a3b8;font-size:13px;line-height:1.7;border-top:1px solid #f1f5f9;padding-top:24px;margin:0">
      Met vriendelijke groet,<br>
      <strong style="color:#334155">Vincent van Münster</strong><br>
      Strategic Innovation Partner · WeAreImpact
    </p>
  </div>
</div>`;

    const confirmResult = await resend.emails.send({
      from: fromEmail,
      to: [trimmedEmail],
      subject: 'CV Vincent van Münster — WeAreImpact',
      html: confirmHtml,
      replyTo: 'v.munster@weareimpact.nl',
      ...(pdfBuffer
        ? { attachments: [{ filename: 'CV-Vincent-van-Munster.pdf', content: pdfBuffer }] }
        : {}),
    });

    if (confirmResult.error) {
      console.error('Resend error (to requester):', confirmResult.error);
      return NextResponse.json({ error: 'Versturen mislukt. Probeer het opnieuw of e-mail direct naar v.munster@weareimpact.nl' }, { status: 500 });
    }

    // Notification to Vincent
    const notifyHtml = `
<div style="font-family:system-ui,sans-serif;max-width:500px">
  <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 20px">📄 CV aangevraagd via weareimpact.nl</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;color:#64748b;font-weight:600;width:110px;vertical-align:top">Naam</td><td style="padding:8px 0;color:#0f172a;font-weight:700">${trimmedName}</td></tr>
    <tr><td style="padding:8px 0;color:#64748b;font-weight:600;vertical-align:top">E-mail</td><td style="padding:8px 0"><a href="mailto:${trimmedEmail}" style="color:#f97316;font-weight:700">${trimmedEmail}</a></td></tr>
    <tr><td style="padding:8px 0;color:#64748b;font-weight:600;vertical-align:top">Organisatie</td><td style="padding:8px 0;color:#0f172a">${trimmedOrg || '—'}</td></tr>
  </table>
  <p style="color:#94a3b8;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #f1f5f9">
    ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', dateStyle: 'full', timeStyle: 'short' })}
  </p>
</div>`;

    await resend.emails.send({
      from: fromEmail,
      to: ['v.munster@weareimpact.nl'],
      subject: `CV aangevraagd — ${trimmedName}${trimmedOrg ? ` (${trimmedOrg})` : ''}`,
      html: notifyHtml,
      replyTo: trimmedEmail,
    }).catch((err) => console.error('Notify Vincent failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CV download route error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het opnieuw.' }, { status: 500 });
  }
}
