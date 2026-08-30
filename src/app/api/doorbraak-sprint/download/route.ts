import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

const NOTIFY_EMAIL = 'v.munster@weareimpact.nl';
const SITE_URL = 'https://weareimpact.nl';

const SPRINTBRIEF_URL = `${SITE_URL}/downloads/sprintbrief-opdrachtovereenkomst.html`;
const WEL_NIET_URL = `${SITE_URL}/downloads/wel-niet-kaart-medewerkers.html`;

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS doorbraak_sprint_downloads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      organisatie TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, organisatie } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    const org = typeof organisatie === 'string' ? organisatie.trim().slice(0, 200) : '';

    await ensureTable();

    await sql`
      INSERT INTO doorbraak_sprint_downloads (email, organisatie)
      VALUES (${email}, ${org || null})
    `;

    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'Sprint-bijlagen gedownload',
          ${`${email} vroeg de Sprintbrief en Wel/Niet-kaart aan`},
          ${JSON.stringify({ email, organisatie: org, source: 'doorbraak-sprint' })}::jsonb
        )
      `;
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    await Promise.all([
      sendEmail({
        to: NOTIFY_EMAIL,
        subject: `Nieuwe lead: ${email} vroeg de Sprint-bijlagen aan`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Nieuwe lead via /doorbraak-sprint</h2>
            <p style="color: #475569;">${email}${org ? ` (${org})` : ''} vroeg de 1-A4 Sprintbrief en de Wel/Niet-kaart aan.</p>
            <div style="margin-top: 24px;">
              <a href="${SITE_URL}/admin/leads" style="background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Bekijk alle leads</a>
            </div>
          </div>
        `,
      }),
      sendEmail({
        to: email,
        subject: 'Jouw Sprint-templates: Sprintbrief & Wel/Niet-kaart',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Jouw templates staan klaar</h2>
            <p style="color: #475569; margin-bottom: 24px;">
              Hier zijn de twee operationele templates uit de AI Diagnose &amp; Doorbraak Sprint. Print ze, of gebruik ze als voorbereiding op de Fit &amp; Focus-intake.
            </p>
            <div style="margin: 24px 0;">
              <a href="${SPRINTBRIEF_URL}" style="display: block; background: #ea580c; color: white; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 12px;">Open de 1-A4 Sprintbrief &amp; Opdrachtovereenkomst</a>
              <a href="${WEL_NIET_URL}" style="display: block; background: #0f172a; color: white; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open de Wel/Niet-kaart voor medewerkers</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="color: #94a3b8; font-size: 13px;">
              Vragen of wil je meteen een intake inplannen? Ga naar
              <a href="${SITE_URL}/doorbraak-sprint" style="color: #ea580c;">weareimpact.nl/doorbraak-sprint</a>.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
              WeAreImpact — Vincent van Munster
            </p>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sprint bijlagen download error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
