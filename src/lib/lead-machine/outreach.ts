// Outreach: schrijft een korte koude mail ALS Vincent (eerste persoon), plus een
// AVG-conforme HTML-wrapper (afzenderidentificatie + werkende afmelding).
//
// Regels die de eerste versie miste:
//  - Mislukt het model, dan is er GEEN concept (null). Vroeger kwam er stilletjes
//    een generieke "Beste, ik verdiep me graag in organisaties zoals…"-mail uit
//    die niemand als noodtekst herkende.
//  - De opening steunt op haakjes die letterlijk op de site van de organisatie
//    staan (zie scorer.ts) of op het koopsignaal. Geen haakje = een eerlijke,
//    algemene opening; nooit verzonnen feiten of cijfers.

import { getOpenRouter, MODELS } from '@/lib/ai/openrouter';
import { parseLlmJson } from './json';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weareimpact.nl';

export const DEFAULT_PITCH = `De Doorbraak Sprint: in een kort traject pak ik samen met het team één knelpunt aan waar nu te veel tijd in gaat (administratie, planning, verantwoording, werving van vrijwilligers) en zetten we daar een werkende, praktische AI-oplossing voor neer. Minder regeldruk, meer tijd voor mensen. Niets gaat de deur uit zonder menselijke controle.`;

export interface OutreachLeadInput {
  name: string;
  website?: string | null;
  city?: string | null;
  orgType?: string | null;
  segment?: string | null;
  summary?: string | null;
  hooks?: string[] | null;
  signal?: string | null;
  contactPerson?: string | null;
  aiRationale?: string | null;
  pitch?: string | null;
}

export interface OutreachDraft {
  subject: string;
  body: string; // platte tekst, alinea's gescheiden door een lege regel
}

const IDENTITY = `Je bent Vincent van Munster, Strategic Innovation Partner bij WeAreImpact. Je schrijft in de ik-vorm, als jezelf.

OVER JOU (gebruik hooguit één feit, alleen als het de ontvanger iets zegt):
- Tot oktober 2025 was je directeur van Stichting de Baan (700+ deelnemers, 180 vrijwilligers). Noem je dit, gebruik dan precies "tot oktober 2025 was ik directeur van Stichting de Baan" en omschrijf de stichting niet anders (dus geen "zorginstelling"). Je kent de werkvloer: voeten in de klei, geen ivoren toren.
- Kernboodschap: warme zorg door slimme tech. Technologie is nooit het doel, altijd het middel. Resultaat boven uren.`;

const STYLE = `STIJL:
- Nederlands, eerste persoon, je/jullie-vorm, nuchter en oprecht. Geen wollige beleidstaal, geen verkooptaal, geen superlatieven, geen emoji, geen uitroeptekens.
- Onderwerp in sentence case, maximaal 60 tekens, geen clickbait.
- Aanhef: "Beste <voornaam>," als er een contactpersoon met naam is, anders "Beste team van <organisatie>,".
- Leid met procesontlasting en menselijke maat (tijd terug voor mensen, minder regeldruk), niet met technologie.
- Eindig met één concrete, laagdrempelige vraag: een kort kennismakingsgesprek of koffie.
- GEEN handtekening, groet of afmeldtekst — die worden automatisch toegevoegd.
- VERZIN NIETS: gebruik alleen de feiten hieronder. Geen cijfers, projecten of namen die niet zijn aangeleverd.`;

const SEGMENT_ANGLE: Record<string, string> = {
  A: 'Invalshoek: deze organisatie kan zelf een traject inkopen. Verbind het aanbod aan wat ze doen.',
  B: 'Invalshoek: deze organisatie bereikt veel andere organisaties. Stel samenwerking voor (bv. een kennissessie voor hun achterban), geen verkoop.',
  C: 'Invalshoek: kleine organisatie. Bied iets van waarde zonder verkoopdruk (een praktische tip of gratis kennismaking), geen traject.',
};

function leadFacts(lead: OutreachLeadInput): string {
  return [
    `Organisatie: ${lead.name}`,
    lead.orgType ? `Soort: ${lead.orgType}` : null,
    lead.city ? `Plaats: ${lead.city}` : null,
    lead.contactPerson ? `Contactpersoon: ${lead.contactPerson}` : null,
    lead.summary ? `Wat ze doen: ${lead.summary}` : null,
    lead.hooks?.length ? `Feiten van hun eigen website (bruikbaar voor de opening):\n${lead.hooks.map((h) => `- ${h}`).join('\n')}` : 'Feiten van hun website: geen — open dan algemeen maar oprecht over hun soort werk.',
    lead.signal ? `Actueel signaal: ${lead.signal} (noem dit voorzichtig: "ik zag dat jullie …")` : null,
  ].filter(Boolean).join('\n');
}

async function draft(system: string, user: string, maxTokens: number): Promise<OutreachDraft | null> {
  try {
    const res = await getOpenRouter().chat.completions.create({
      model: MODELS.SONNET,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });
    const p = parseLlmJson<{ subject?: string; body?: string }>(res.choices[0]?.message?.content);
    const subject = String(p?.subject ?? '').trim().slice(0, 120);
    const body = String(p?.body ?? '').trim();
    if (!subject || body.length < 80) return null;
    return { subject, body };
  } catch (error) {
    console.error('outreach draft error:', error);
    return null;
  }
}

export async function generateOutreachEmail(lead: OutreachLeadInput): Promise<OutreachDraft | null> {
  const system = `${IDENTITY}

Je schrijft een korte, persoonlijke eerste mail aan een organisatie die je nog niet kent.

AANBOD:
${lead.pitch?.trim() || DEFAULT_PITCH}

${SEGMENT_ANGLE[lead.segment ?? ''] ?? SEGMENT_ANGLE.A}

${STYLE}
- Lengte: 80-130 woorden, 3-4 korte alinea's.
- Open met een concrete observatie over deze organisatie (gebruik een feit of het signaal), niet met jezelf.

Geef ALLEEN geldige JSON: {"subject": "…", "body": "…"}`;
  return draft(system, leadFacts(lead), 600);
}

export async function generateFollowUpEmail(
  lead: OutreachLeadInput,
  previous: { subject: string; body: string; sentAt: string },
): Promise<OutreachDraft | null> {
  const system = `${IDENTITY}

Je schrijft één korte opvolgmail op je eerdere mail, die onbeantwoord bleef.

${STYLE}
- Lengte: 40-80 woorden, 2-3 korte alinea's.
- Verwijs kort naar je vorige mail, voeg één nieuwe, nuttige invalshoek toe (geen herhaling), en maak het makkelijk om nee te zeggen ("past het nu niet, dan hoor ik dat ook graag").
- Onderwerp: "Re: " + het vorige onderwerp.

Geef ALLEEN geldige JSON: {"subject": "…", "body": "…"}`;
  const user = `${leadFacts(lead)}

Vorige mail (verstuurd ${previous.sentAt.slice(0, 10)}):
Onderwerp: ${previous.subject}
${previous.body}`;
  return draft(system, user, 400);
}

// ── Rendering ────────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function paragraphsToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
}

// Bewust sober: een koude mail die eruitziet als een nieuwsbrief belandt vaker in
// de reclamemap en leest minder persoonlijk.
export function renderOutreachHtml(body: string, token: string): string {
  const unsub = unsubscribeUrl(token);
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;font-size:15px;line-height:1.6;">
  <div style="max-width:560px;">
    ${paragraphsToHtml(body)}
    <p style="margin:24px 0 0;">Hartelijke groet,<br>
    <strong>Vincent van Munster</strong><br>
    Strategic Innovation Partner, WeAreImpact<br>
    <a href="${SITE_URL}" style="color:#ea580c;text-decoration:none;">weareimpact.nl</a> · 06 - 144 709 77</p>
    <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
      WeAreImpact · v.munster@weareimpact.nl · KvK 70285888 · BTW NL858236369B01<br>
      Je ontvangt deze mail omdat ik denk dat WeAreImpact relevant kan zijn voor jullie organisatie.
      Liever geen mail meer? <a href="${unsub}" style="color:#94a3b8;text-decoration:underline;">Afmelden</a>, dan mail ik je niet meer.
    </p>
  </div>
</body>
</html>`;
}

export function renderOutreachText(body: string, token: string): string {
  return `${body}

Hartelijke groet,
Vincent van Munster
Strategic Innovation Partner, WeAreImpact
weareimpact.nl · 06 - 144 709 77

—
WeAreImpact · v.munster@weareimpact.nl · KvK 70285888 · BTW NL858236369B01
Liever geen mail meer? Afmelden: ${unsubscribeUrl(token)}`;
}

export function makeUnsubscribeToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// RFC 8058 one-click unsubscribe — vereist door Gmail/Yahoo en goed voor bezorging.
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
