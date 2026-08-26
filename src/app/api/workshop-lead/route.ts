import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateWorkshopHandoutEmail } from '@/lib/email/templates/workshop-handout';

export const dynamic = 'force-dynamic';

// Duwt de lead naar AgentOS' bridge (zie D:\apps\agentos\remote\api\bridge.js,
// op=workshop-lead — zelfde vorm als pushToIris in /api/impact-calculator).
// AgentOS haalt 'm binnen ~3 min op, verrijkt bedrijf/persoon en laat Iris er
// een verslag over schrijven naar Vincent. Bewust een korte timeout en nooit
// een throw naar de aanroeper: dit mag de bezoekersflow (lead opslaan +
// hand-outs mailen) nooit vertragen of laten falen.
async function pushToIris(payload: {
  email: string;
  naam?: string;
  organisatie?: string;
  rol?: string;
  pageViews: Array<{ path: string; title: string | null; createdAt: string }>;
}): Promise<boolean> {
  const url = process.env.AGENTOS_BRIDGE_URL;
  const token = process.env.AGENTOS_BRIDGE_TOKEN;
  if (!url || !token) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url.replace(/\/$/, '')}/api/bridge?op=workshop-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (error) {
    console.error('pushToIris (workshop-lead) mislukt:', error);
    return false;
  }
}

// Laatste paginabezoeken van deze bezoeker (page_views, gevuld door
// PageViewTracker) — dit is het antwoord op "wat heeft de bezoeker op de
// website gedaan", zonder een aparte trackingoplossing te bouwen.
async function recentPageViews(
  visitorId: string
): Promise<Array<{ path: string; title: string | null; createdAt: string }>> {
  if (!visitorId) return [];
  try {
    const rows = await sql`
      SELECT page_path, page_title, created_at
      FROM page_views
      WHERE visitor_id = ${visitorId}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return rows.map((r: Record<string, unknown>) => ({
      path: String(r.page_path),
      title: r.page_title ? String(r.page_title) : null,
      createdAt: String(r.created_at),
    }));
  } catch (error) {
    console.error('Ophalen page_views voor workshop-lead mislukt:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }
    const naam = typeof body?.naam === 'string' ? body.naam.trim().slice(0, 200) : '';
    const organisatie =
      typeof body?.organisatie === 'string' ? body.organisatie.trim().slice(0, 200) : '';
    const rol = typeof body?.rol === 'string' ? body.rol.trim().slice(0, 200) : '';
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId.slice(0, 100) : '';

    // Sla lead op (idempotent op e-mail — een tweede bezoek overschrijft geen
    // verder-in-de-funnel-status, zelfde patroon als impact_calculator_leads).
    await sql`
      INSERT INTO workshop_leads (email, naam, organisatie, rol, source)
      VALUES (${email}, ${naam || null}, ${organisatie || null}, ${rol || null}, '/lab')
      ON CONFLICT (email) DO UPDATE SET
        naam = COALESCE(EXCLUDED.naam, workshop_leads.naam),
        organisatie = COALESCE(EXCLUDED.organisatie, workshop_leads.organisatie),
        rol = COALESCE(EXCLUDED.rol, workshop_leads.rol),
        updated_at = NOW()
    `;

    const pageViews = await recentPageViews(visitorId);

    // Activity log
    try {
      await sql`
        INSERT INTO activity_log (type, title, description, metadata)
        VALUES (
          'lead',
          'AI Leadership Lab hand-outs aangevraagd',
          ${`${organisatie || naam || email}`},
          ${JSON.stringify({ email, naam, organisatie, rol, source: '/lab' })}
        )
      `;
    } catch (logErr) {
      console.error('activity_log insert (workshop-lead) mislukt:', logErr);
    }

    // Hand-outs mailen naar de bezoeker
    const template = generateWorkshopHandoutEmail({ email, naam, organisatie });
    const emailResult = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (!emailResult.success) {
      console.error('Versturen workshop hand-outs mislukt:', emailResult.error);
    } else {
      await sql`
        UPDATE workshop_leads SET email_sent = TRUE, updated_at = NOW() WHERE email = ${email}
      `;
    }

    // Iris (AgentOS) schrijft normaal een verslag met opgezochte bedrijfsinfo
    // en een aanbeveling voor Vincent. De kale-gegevens-mail hieronder is
    // uitsluitend het vangnet als die route niet lukt.
    const irisGepusht = await pushToIris({ email, naam, organisatie, rol, pageViews });
    if (!irisGepusht) {
      await sendEmail({
        to: 'v.munster@weareimpact.nl',
        subject: `Nieuwe AI Leadership Lab-lead: ${organisatie || naam || email}`,
        html: `
          <p><strong>Nieuwe lead via /lab (AI Leadership Lab)</strong></p>
          <p><em>Iris' verslag kon niet worden opgevraagd — dit zijn de kale gegevens.</em></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Naam: ${naam || '—'}</li>
            <li>Organisatie: ${organisatie || '—'}</li>
            <li>Rol: ${rol || '—'}</li>
          </ul>
        `,
        text: `Nieuwe AI Leadership Lab-lead: ${email} — ${organisatie || naam || '—'}`,
      });
    }

    return NextResponse.json({ success: true, emailSent: emailResult.success });
  } catch (error) {
    console.error('Workshop-lead error:', error);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
