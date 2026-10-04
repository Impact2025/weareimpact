import { emailShell, emailButton, emailCard } from './emailLayout';
import { SEGMENT_LABELS, WARM_SCORE, type LeadSegment } from '@/lib/ai-pm-leads';

interface Data {
  email: string;
  organisatie: string | null;
  documentTitle: string;
  segment: LeadSegment;
  score: number;
  sourcePage: string | null;
  referrer: string | null;
  utm: string | null;
  followupOptin: boolean;
  previousResources: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Melding aan Vincent bij een nieuwe aanvraag van een template-download. */
export function generateAiPmDownloadNotificationEmail(d: Data): { subject: string; html: string; text: string } {
  const warm = d.score >= WARM_SCORE;
  const who = d.organisatie ? `${d.organisatie} (${d.email})` : d.email;
  const subject = `${warm ? 'Warme lead: ' : 'Download: '}${d.documentTitle} · ${d.organisatie || SEGMENT_LABELS[d.segment]}`;

  const rows: [string, string][] = [
    ['Wie', who],
    ['Segment', `${SEGMENT_LABELS[d.segment]} · score ${d.score}/5${warm ? ' (warm)' : ''}`],
    ['Document', d.documentTitle],
    ['Eerder aangevraagd (30 dagen)', d.previousResources > 0 ? `${d.previousResources} document(en)` : 'nee, eerste keer'],
    ['Pagina', d.sourcePage || 'onbekend'],
    ['Herkomst', d.utm || d.referrer || 'direct'],
    ['Opt-in voor tips', d.followupOptin ? 'ja (dubbele bevestiging volgt)' : 'nee, geen opvolgmails'],
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding: 6px 12px 6px 0; font-size: 13px; color: #64748b; vertical-align: top; white-space: nowrap;">${k}</td><td style="padding: 6px 0; font-size: 15px; color: #0f172a;">${esc(v)}</td></tr>`,
    )
    .join('');

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Er is een template gedownload via de AI-projectmanager-pagina's.
              </p>
              ${emailCard(`<table cellpadding="0" cellspacing="0" width="100%">${table}</table>`)}
              ${emailButton('Open de inbox', 'https://weareimpact.nl/admin/inbox')}
              <p style="margin: 18px 0 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                Deze persoon heeft alleen om het document gevraagd. Er volgt geen automatische opvolging; een persoonlijke reactie mag, alleen als het past.
              </p>`;

  const html = emailShell({
    preheader: `${who} downloadde ${d.documentTitle}`,
    title: warm ? 'Warme lead' : 'Nieuwe download',
    subtitle: d.documentTitle,
    body,
  });

  const text = [
    warm ? 'WARME LEAD' : 'NIEUWE DOWNLOAD',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Inbox: https://weareimpact.nl/admin/inbox',
  ].join('\n');

  return { subject, html, text };
}
