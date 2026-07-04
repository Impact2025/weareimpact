import { NextRequest } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Public, no-auth opt-out endpoint.
//
// GET toont alleen een bevestigingspagina — mailscanners (Outlook SafeLinks,
// spamfilters) volgen GET-links automatisch, dus de afmelding zelf mag NOOIT
// op GET gebeuren.
// POST voert de afmelding uit: gebruikt door het bevestigingsformulier én door
// one-click List-Unsubscribe-Post (RFC 8058) vanuit mailclients.

async function findLeadIdByToken(token: string): Promise<string | null> {
  const rows = await sql`
    SELECT lead_id FROM lead_outreach WHERE unsubscribe_token = ${token} LIMIT 1
  `;
  return rows.length > 0 ? (rows[0].lead_id as string) : null;
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');

  if (!token) {
    return htmlResponse('Ongeldige afmeldlink', 'Deze link is niet geldig.', 400);
  }

  try {
    const leadId = await findLeadIdByToken(token);
    if (!leadId) {
      return htmlResponse('Link niet gevonden', 'Deze afmeldlink is niet (meer) geldig.', 404);
    }
    return confirmPage(token);
  } catch (error) {
    console.error('Unsubscribe GET error:', error);
    return htmlResponse('Er ging iets mis', 'Probeer het later opnieuw of mail naar v.munster@weareimpact.nl.', 500);
  }
}

export async function POST(request: NextRequest) {
  // Token uit de query (one-click POST't naar de List-Unsubscribe-URL as-is),
  // met het formulierveld als fallback.
  let token = new URL(request.url).searchParams.get('token');
  if (!token) {
    try {
      const form = await request.formData();
      token = String(form.get('token') ?? '') || null;
    } catch {
      // geen form body — token blijft null
    }
  }

  if (!token) {
    return htmlResponse('Ongeldige afmeldlink', 'Deze link is niet geldig.', 400);
  }

  try {
    const leadId = await findLeadIdByToken(token);
    if (!leadId) {
      return htmlResponse('Link niet gevonden', 'Deze afmeldlink is niet (meer) geldig.', 404);
    }

    await sql`
      UPDATE prospect_leads
      SET unsubscribed = TRUE, unsubscribed_at = NOW(), status = 'archived', updated_at = NOW()
      WHERE id = ${leadId}
    `;
    // Cancel any queued/draft outreach so nothing else goes out
    await sql`
      UPDATE lead_outreach
      SET status = 'skipped', error = 'Afgemeld door ontvanger', updated_at = NOW()
      WHERE lead_id = ${leadId} AND status IN ('draft', 'approved')
    `;

    return htmlResponse(
      'Je bent afgemeld',
      'Je ontvangt geen e-mails meer van WeAreImpact. Excuses voor het ongemak.',
      200,
    );
  } catch (error) {
    console.error('Unsubscribe POST error:', error);
    return htmlResponse('Er ging iets mis', 'Probeer het later opnieuw of mail naar v.munster@weareimpact.nl.', 500);
  }
}

function confirmPage(token: string): Response {
  // Token is 32 hex chars (of base36 bij oude mails) — veilig in een attribuut,
  // maar we encoderen voor de zekerheid altijd.
  const encoded = encodeURIComponent(token);
  const html = pageShell(
    'Afmelden bij WeAreImpact',
    `<p style="color:#475569;line-height:1.6;margin:0 0 24px;">
      Wil je geen e-mails meer van WeAreImpact ontvangen? Bevestig het hieronder.
    </p>
    <form method="post" action="/api/outreach/unsubscribe?token=${encoded}" style="margin:0 0 16px;">
      <button type="submit" style="background:#f97316;color:#fff;border:0;border-radius:8px;padding:12px 24px;font-size:15px;font-weight:600;cursor:pointer;">
        Ja, meld mij af
      </button>
    </form>`,
  );
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function htmlResponse(title: string, message: string, status: number): Response {
  const html = pageShell(
    title,
    `<p style="color:#475569;line-height:1.6;margin:0 0 24px;">${message}</p>`,
  );
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function pageShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:480px;margin:80px auto;padding:40px;background:#fff;border-radius:12px;text-align:center;">
    <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
    ${body}
    <a href="https://weareimpact.nl" style="color:#f97316;text-decoration:none;font-weight:600;">Naar weareimpact.nl</a>
  </div>
</body></html>`;
}
