import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';
import { formatEuro } from '@/lib/finance/money';

interface Mail {
  subject: string;
  html: string;
  text: string;
}

const P = 'margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const nlDate = (iso: string) =>
  new Date(iso).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long', year: 'numeric' });

const firstName = (full: string) => full.trim().split(/\s+/)[0] || '';

// ---------- offerte ----------

export function quoteSentEmail(d: {
  signerName: string;
  title: string;
  reference: string;
  url: string;
  validUntil: string;
  totalExclCents: number;
}): Mail {
  const hi = firstName(d.signerName) ? `Hoi ${esc(firstName(d.signerName))},` : 'Hoi,';
  const body = `
    <p style="${P}">${hi}</p>
    <p style="${P}">Hierbij mijn offerte <strong>${esc(d.title)}</strong>. Je kunt hem online bekijken en met één klik akkoord geven. De PDF zit als bijlage bij deze mail.</p>
    ${emailCard(`
      <p style="margin: 0; font-size: 15px; color: #0f172a;"><strong>Referentie:</strong> ${esc(d.reference)}</p>
      <p style="margin: 6px 0 0; font-size: 15px; color: #0f172a;"><strong>Investering:</strong> ${formatEuro(d.totalExclCents)} excl. btw</p>
      <p style="margin: 6px 0 0; font-size: 15px; color: #0f172a;"><strong>Geldig tot:</strong> ${nlDate(d.validUntil)}</p>`)}
    ${emailButton('Bekijk en geef akkoord', d.url)}
    <p style="${P} margin-top: 24px;">Vragen of iets aanpassen? Reageer gewoon op deze mail.</p>
    ${emailSignature()}`;
  return {
    subject: `Offerte ${d.reference}: ${d.title}`,
    html: emailShell({ preheader: `Offerte ${d.reference}, geldig tot ${nlDate(d.validUntil)}.`, title: 'Jouw offerte', subtitle: d.title, body }),
    text: `${hi.replace(/&[a-z]+;/g, '')}\n\nHierbij mijn offerte "${d.title}" (${d.reference}), ${formatEuro(d.totalExclCents)} excl. btw, geldig tot ${nlDate(d.validUntil)}.\nBekijk en geef akkoord: ${d.url}\n\nVincent van Munster\nWeAreImpact`,
  };
}

export function quoteAcceptedClientEmail(d: {
  signerName: string;
  title: string;
  reference: string;
  firstInvoiceNote: string;
}): Mail {
  const hi = firstName(d.signerName) ? `Hoi ${esc(firstName(d.signerName))},` : 'Hoi,';
  const body = `
    <p style="${P}">${hi}</p>
    <p style="${P}">Dank je wel voor je akkoord op <strong>${esc(d.title)}</strong> (${esc(d.reference)}). Fijn dat we hiermee aan de slag gaan.</p>
    ${emailCard(`<p style="margin: 0; font-size: 15px; color: #0f172a;"><strong>Wat er nu gebeurt</strong></p>
      <p style="margin: 6px 0 0; font-size: 15px; color: #334155;">Ik neem binnen twee werkdagen contact op voor de planning. ${esc(d.firstInvoiceNote)}</p>`)}
    <p style="${P}">Je bevestiging met datum en tijd staat als PDF in de bijlage.</p>
    ${emailSignature()}`;
  return {
    subject: `Bevestiging akkoord: ${d.title}`,
    html: emailShell({ preheader: 'Je akkoord is vastgelegd.', title: 'Akkoord ontvangen', subtitle: d.title, body }),
    text: `${hi.replace(/&[a-z]+;/g, '')}\n\nDank voor je akkoord op "${d.title}" (${d.reference}). ${d.firstInvoiceNote}\nJe bevestiging staat als PDF in de bijlage.\n\nVincent van Munster\nWeAreImpact`,
  };
}

/** Naar Vincent zelf: bekeken / akkoord / afgewezen. */
export function quoteNoticeEmail(d: {
  kind: 'bekeken' | 'akkoord' | 'afgewezen';
  clientName: string;
  reference: string;
  title: string;
  who?: string;
  reason?: string | null;
  adminUrl: string;
}): Mail {
  const head = {
    bekeken: `${d.clientName} heeft de offerte geopend`,
    akkoord: `${d.clientName} is akkoord`,
    afgewezen: `${d.clientName} heeft de offerte afgewezen`,
  }[d.kind];
  const detail =
    d.kind === 'akkoord'
      ? `Akkoord gegeven door ${esc(d.who ?? '')}. De deal staat op gewonnen en de facturen staan klaar als concept.`
      : d.kind === 'afgewezen'
        ? `Reden: ${d.reason ? esc(d.reason) : 'niet opgegeven'}.`
        : 'Dit is de eerste keer dat de offerte is geopend. Nu is een goed moment om te bellen.';
  const body = `
    <p style="${P}">${esc(head)}. ${detail}</p>
    ${emailCard(`<p style="margin: 0; font-size: 15px; color: #0f172a;">${esc(d.title)}<br><span style="color:#64748b">${esc(d.reference)}</span></p>`)}
    ${emailButton('Open in admin', d.adminUrl)}`;
  return {
    subject: head,
    html: emailShell({ title: head, body }),
    text: `${head}. ${detail.replace(/<[^>]+>/g, '')}\n${d.adminUrl}`,
  };
}

// ---------- factuur ----------

export function invoiceSentEmail(d: {
  signerName: string;
  number: string;
  title: string;
  termLabel: string | null;
  totalCents: number;
  dueOn: string;
  iban: string;
  url: string;
  reminder?: boolean;
}): Mail {
  const hi = firstName(d.signerName) ? `Hoi ${esc(firstName(d.signerName))},` : 'Hoi,';
  const intro = d.reminder
    ? `Volgens mijn administratie staat factuur <strong>${esc(d.number)}</strong> nog open. Mogelijk is hij aan je aandacht ontsnapt. Zou je de betaling willen controleren? Als je al betaald hebt, kun je deze herinnering negeren.`
    : `Hierbij factuur <strong>${esc(d.number)}</strong> voor <strong>${esc(d.title)}</strong>${d.termLabel ? ` (${esc(d.termLabel)})` : ''}. De PDF zit als bijlage.`;
  const body = `
    <p style="${P}">${hi}</p>
    <p style="${P}">${intro}</p>
    ${emailCard(`
      <p style="margin: 0; font-size: 15px; color: #0f172a;"><strong>Bedrag:</strong> ${formatEuro(d.totalCents)} incl. btw</p>
      <p style="margin: 6px 0 0; font-size: 15px; color: #0f172a;"><strong>Uiterlijk betalen:</strong> ${nlDate(d.dueOn)}</p>
      ${d.iban ? `<p style="margin: 6px 0 0; font-size: 15px; color: #0f172a;"><strong>IBAN:</strong> ${esc(d.iban)}</p>` : ''}
      <p style="margin: 6px 0 0; font-size: 15px; color: #0f172a;"><strong>Onder vermelding van:</strong> ${esc(d.number)}</p>`)}
    ${emailButton('Bekijk factuur', d.url)}
    ${emailSignature()}`;
  const subject = d.reminder ? `Herinnering factuur ${d.number}` : `Factuur ${d.number}: ${d.title}`;
  return {
    subject,
    html: emailShell({ preheader: `${formatEuro(d.totalCents)}, te betalen voor ${nlDate(d.dueOn)}.`, title: d.reminder ? 'Betalingsherinnering' : 'Factuur', subtitle: d.number, body }),
    text: `${hi.replace(/&[a-z]+;/g, '')}\n\n${d.reminder ? 'Herinnering: ' : ''}Factuur ${d.number} voor "${d.title}", ${formatEuro(d.totalCents)} incl. btw, uiterlijk ${nlDate(d.dueOn)}${d.iban ? ` naar ${d.iban}` : ''} onder vermelding van ${d.number}.\n${d.url}\n\nVincent van Munster\nWeAreImpact`,
  };
}
