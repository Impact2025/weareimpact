import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateScanReportEmail } from '@/lib/email/templates/scan-report';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  VALID_AI_USAGE,
  SECTOR_NAMES,
  getChallenge,
} from '@/lib/ai/scan-config';

export const dynamic = 'force-dynamic';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`ai-scan-report:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Te veel aanvragen. Probeer het later opnieuw.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();

    // Validatie + normalisatie (lengte-limieten tegen misbruik)
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    const naam = typeof body?.naam === 'string' ? body.naam.trim().slice(0, 200) : '';
    const organisatie =
      typeof body?.organisatie === 'string' ? body.organisatie.trim().slice(0, 200) : '';
    const sector = String(body?.sector ?? '');
    const challenge = String(body?.challenge ?? '');

    const challengeInfo = getChallenge(sector, challenge);
    if (!challengeInfo) {
      return NextResponse.json({ error: 'Ongeldige scangegevens' }, { status: 400 });
    }

    const aiUsage = VALID_AI_USAGE.includes(body?.aiUsage) ? body.aiUsage : 'onbekend';
    const adviceText = typeof body?.advies === 'string' ? body.advies.slice(0, 4000) : '';
    const leadIdInput =
      typeof body?.leadId === 'string' && UUID_RE.test(body.leadId) ? body.leadId : null;

    const sectorName = SECTOR_NAMES[sector] || sector;
    const challengeLabel = challengeInfo.label;

    // Koppel contactgegevens aan de lead die /api/ai-scan aanmaakte (via het
    // leadId dat de client uit de X-Scan-Lead-Id header haalde). Alleen een
    // nog-anonieme lead met dezelfde sector+challenge is koppelbaar — zo kan
    // een geraden/gerecycled id nooit andermans lead overschrijven.
    let leadId: string | null = null;
    try {
      if (leadIdInput) {
        const updated = await sql`
          UPDATE ai_scan_leads
          SET email = ${email},
              name = ${naam || null},
              organization = ${organisatie || null},
              ai_advice = COALESCE(NULLIF(${adviceText}, ''), ai_advice),
              updated_at = NOW()
          WHERE id = ${leadIdInput}
            AND email IS NULL
            AND sector = ${sector}
            AND challenge = ${challenge}
          RETURNING id
        `;
        leadId = updated[0]?.id ?? null;
      }

      if (!leadId) {
        const inserted = await sql`
          INSERT INTO ai_scan_leads
            (email, name, organization, sector, challenge, ai_usage, ai_advice, source, status)
          VALUES
            (${email}, ${naam || null}, ${organisatie || null}, ${sector}, ${challenge},
             ${aiUsage}, ${adviceText}, '/ai-scan', 'new')
          RETURNING id
        `;
        leadId = inserted[0]?.id ?? null;
      }
    } catch (dbErr) {
      console.error('Failed to persist scan report lead:', dbErr);
    }

    // Activity log
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'AI-scan rapport aangevraagd',
          ${`${sectorName} — ${email}`},
          ${JSON.stringify({ leadId, email, naam, organisatie, sector, challenge })}
        )
      `;
    } catch (logErr) {
      console.error('activity_log insert failed:', logErr);
    }

    // Rapport-mail naar bezoeker
    const template = generateScanReportEmail({
      email,
      naam,
      organisatie,
      sectorName,
      challengeLabel,
      advies: adviceText || 'Je persoonlijke advies staat op de website.',
    });
    const emailResult = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (!emailResult.success) {
      console.error('Failed to send scan report email:', emailResult.error);
    }

    // Notificatie naar Vincent — bezoekersinput altijd escapen
    await sendEmail({
      to: 'v.munster@weareimpact.nl',
      subject: `Nieuwe AI-scan lead: ${organisatie || naam || email}`,
      html: `
        <p><strong>Nieuwe lead via de AI-scan</strong></p>
        <ul>
          <li>Email: ${escapeHtml(email)}</li>
          <li>Naam: ${escapeHtml(naam) || '—'}</li>
          <li>Organisatie: ${escapeHtml(organisatie) || '—'}</li>
          <li>Sector: ${sectorName}</li>
          <li>Grootste energielek: ${challengeLabel}</li>
          <li>AI-niveau: ${aiUsage}</li>
        </ul>
      `,
      text: `Nieuwe AI-scan lead: ${email} — ${sectorName} — ${challengeLabel}`,
    });

    return NextResponse.json({ success: true, emailSent: emailResult.success });
  } catch (error) {
    console.error('AI Scan report error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
