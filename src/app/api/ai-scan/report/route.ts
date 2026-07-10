import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateScanReportEmail } from '@/lib/email/templates/scan-report';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  VALID_SECTORS,
  VALID_CHALLENGES,
  SECTOR_NAMES,
  CHALLENGE_LABELS,
} from '@/lib/ai/scan-config';

export const dynamic = 'force-dynamic';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const {
      email,
      naam,
      organisatie,
      sector,
      challenge,
      aiUsage,
      advies,
    } = body ?? {};

    // Validatie
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    if (!VALID_SECTORS.includes(sector) || !VALID_CHALLENGES.includes(challenge)) {
      return NextResponse.json({ error: 'Ongeldige scangegevens' }, { status: 400 });
    }
    const adviceText = typeof advies === 'string' ? advies.slice(0, 4000) : '';

    const sectorName = SECTOR_NAMES[sector] || sector;
    const challengeLabel = CHALLENGE_LABELS[challenge] || challenge;

    // Koppel contactgegevens aan de meest recente anonieme lead met dezelfde
    // sector+challenge (binnen 30 min), anders maak een nieuwe rij.
    let leadId: string | null = null;
    try {
      const updated = await sql`
        UPDATE ai_scan_leads
        SET email = ${email},
            name = ${naam || null},
            organization = ${organisatie || null},
            ai_advice = COALESCE(NULLIF(${adviceText}, ''), ai_advice),
            updated_at = NOW()
        WHERE id = (
          SELECT id FROM ai_scan_leads
          WHERE sector = ${sector}
            AND challenge = ${challenge}
            AND email IS NULL
            AND created_at > NOW() - INTERVAL '30 minutes'
          ORDER BY created_at DESC
          LIMIT 1
        )
        RETURNING id
      `;
      leadId = updated[0]?.id ?? null;

      if (!leadId) {
        const inserted = await sql`
          INSERT INTO ai_scan_leads
            (email, name, organization, sector, challenge, ai_usage, ai_advice, source, status)
          VALUES
            (${email}, ${naam || null}, ${organisatie || null}, ${sector}, ${challenge},
             ${aiUsage || 'onbekend'}, ${adviceText}, '/ai-scan', 'new')
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

    // Notificatie naar Vincent
    await sendEmail({
      to: 'v.munster@weareimpact.nl',
      subject: `Nieuwe AI-scan lead: ${organisatie || naam || email}`,
      html: `
        <p><strong>Nieuwe lead via de AI-scan</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Naam: ${naam || '—'}</li>
          <li>Organisatie: ${organisatie || '—'}</li>
          <li>Sector: ${sectorName}</li>
          <li>Grootste energielek: ${challengeLabel}</li>
          <li>AI-niveau: ${aiUsage || '—'}</li>
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
