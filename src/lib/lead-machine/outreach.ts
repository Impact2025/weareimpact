// Outreach email generation — writes a cold-outreach email AS Vincent (first person),
// in his voice, plus an AVG-compliant HTML wrapper (sender identification + opt-out).

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weareimpact.nl';

export interface OutreachLeadInput {
  name: string;
  website?: string | null;
  city?: string | null;
  snippet?: string | null;      // sbi_description / discovery snippet
  aiRationale?: string | null;  // why this org scored well
}

export interface OutreachDraft {
  subject: string;
  body: string; // plain text, paragraphs separated by blank lines
}

// Vincent's identity + style, condensed for a short outreach email.
const OUTREACH_SYSTEM_PROMPT = `Je bent Vincent van Munster, Strategic Innovation Partner bij WeAreImpact. Je schrijft een korte, persoonlijke koude acquisitie-e-mail AAN een organisatie in het sociaal domein — in de IK-vorm, als jezelf.

OVER JOU (gebruik spaarzaam, alleen wat relevant is):
- WeAreImpact: interim-advies, AI-implementatie en strategische innovatie voor zorg/welzijn.
- Tot oktober 2025 was je directeur van Stichting de Baan (700+ deelnemers, 180 vrijwilligers).
- Kernboodschap: "warme zorg door slimme tech" — technologie is nooit het doel, altijd het middel. Resultaat boven uren. Voeten in de klei, geen ivoren toren.

STIJLREGELS:
- Schrijf in het Nederlands, in de eerste persoon ("ik", "wij").
- Sentence case in het onderwerp (nooit Title Case), geen clickbait, geen uitroeptekens.
- Begin met een concrete, oprechte observatie over de ontvangende organisatie (gebruik hun naam/omschrijving) — laat zien dat je je verdiept hebt.
- Kort: 90-150 woorden, 3-4 korte alinea's. Geen wollige beleidstaal, geen emoji.
- Eén heldere, laagdrempelige call-to-action: een vrijblijvend verkennings- of koffiegesprek.
- Geen overdreven verkooptaal; je biedt waarde, je dringt niet aan.
- Sluit NIET af met een handtekening of afmeldtekst — die worden automatisch toegevoegd. Eindig met de CTA-zin.

Geef ALLEEN geldige JSON terug: {"subject": "<onderwerp>", "body": "<e-mailtekst, alinea's gescheiden door een lege regel>"}`;

export async function generateOutreachEmail(lead: OutreachLeadInput): Promise<OutreachDraft> {
  const openrouter = getOpenRouter();

  const userMsg = [
    `Organisatie: ${lead.name}`,
    lead.city ? `Plaats: ${lead.city}` : null,
    lead.website ? `Website: ${lead.website}` : null,
    lead.snippet ? `Wat ik over ze vond: ${lead.snippet}` : null,
    lead.aiRationale ? `Waarom ze passen bij WeAreImpact: ${lead.aiRationale}` : null,
  ].filter(Boolean).join('\n');

  try {
    const res = await openrouter.chat.completions.create({
      model: MODELS.SONNET,
      messages: [
        { role: 'system', content: OUTREACH_SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = res.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const subject = String(parsed.subject ?? '').trim() || `Even kennismaken — ${lead.name}`;
    const body = String(parsed.body ?? '').trim();
    if (!body) throw new Error('empty body');
    return { subject, body };
  } catch (error) {
    console.error('generateOutreachEmail error:', error);
    // Fallback so a single failure never blocks a batch
    return {
      subject: `Even kennismaken — ${lead.name}`,
      body: `Beste,\n\nIk verdiep me graag in organisaties zoals ${lead.name}. Vanuit WeAreImpact help ik teams in zorg en welzijn met praktische AI en strategische innovatie — warme zorg door slimme tech, resultaat boven uren.\n\nZou een kort, vrijblijvend kennismakingsgesprek interessant zijn? Ik kom graag een keer langs of bel even.`,
    };
  }
}

// Convert plain-text paragraphs to simple, email-safe HTML paragraphs.
function paragraphsToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
}

// Wrap the AI body in an AVG-compliant HTML email:
// clear sender identification + working opt-out link (both legally required for outreach).
export function renderOutreachHtml(body: string, token: string): string {
  const unsub = unsubscribeUrl(token);
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;font-size:15px;line-height:1.6;">
        <tr><td>
          ${paragraphsToHtml(body)}
          <p style="margin:24px 0 0;">Met vriendelijke groet,<br>
          <strong>Vincent van Munster</strong><br>
          Strategic Innovation Partner — WeAreImpact</p>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #e2e8f0;margin-top:24px;">
          <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
            WeAreImpact · <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">weareimpact.nl</a> · v.munster@weareimpact.nl<br>
            KvK 70285888 · BTW NL858236369B01<br>
            Je ontvangt deze eenmalige e-mail omdat ik denk dat WeAreImpact relevant kan zijn voor jouw organisatie.
            Geen interesse? <a href="${unsub}" style="color:#94a3b8;text-decoration:underline;">Afmelden — dan mail ik je niet meer</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Plain-text version (deliverability + accessibility).
export function renderOutreachText(body: string, token: string): string {
  return `${body}

Met vriendelijke groet,
Vincent van Munster
Strategic Innovation Partner — WeAreImpact

—
WeAreImpact · weareimpact.nl · v.munster@weareimpact.nl
KvK 70285888 · BTW NL858236369B01
Geen interesse? Afmelden: ${unsubscribeUrl(token)}`;
}

export function makeUnsubscribeToken(): string {
  // 32 hex chars uit CSPRNG — onvoorspelbaar, past in VARCHAR(64)
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// RFC 8058 one-click unsubscribe headers — vereist door Gmail/Yahoo voor
// bulkverzenders en goed voor deliverability.
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
