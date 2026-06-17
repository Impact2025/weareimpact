import { NextRequest } from 'next/server';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// Public, no-auth opt-out endpoint. Marks the lead behind the token as unsubscribed
// and suppresses any not-yet-sent outreach for that lead.
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');

  if (!token) {
    return htmlResponse('Ongeldige afmeldlink', 'Deze link is niet geldig.', 400);
  }

  try {
    const rows = await sql`
      SELECT lead_id FROM lead_outreach WHERE unsubscribe_token = ${token} LIMIT 1
    `;

    if (rows.length === 0) {
      return htmlResponse('Link niet gevonden', 'Deze afmeldlink is niet (meer) geldig.', 404);
    }

    const leadId = rows[0].lead_id as string;

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
    console.error('Unsubscribe error:', error);
    return htmlResponse('Er ging iets mis', 'Probeer het later opnieuw of mail naar v.munster@weareimpact.nl.', 500);
  }
}

function htmlResponse(title: string, message: string, status: number): Response {
  const html = `<!DOCTYPE html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:480px;margin:80px auto;padding:40px;background:#fff;border-radius:12px;text-align:center;">
    <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 24px;">${message}</p>
    <a href="https://weareimpact.nl" style="color:#f97316;text-decoration:none;font-weight:600;">Naar weareimpact.nl</a>
  </div>
</body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
