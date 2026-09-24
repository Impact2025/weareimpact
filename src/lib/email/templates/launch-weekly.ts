import { emailShell, emailCard, emailButton, emailSignature, EMAIL_COLORS } from './emailLayout';
import type { WeeklyReport } from '@/lib/launch/weekly';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

const list = (items: string[]) =>
  `<ul style="margin: 0; padding-left: 20px;">${items
    .map((i) => `<li style="margin: 0 0 6px; font-size: 15px; color: #1e293b;">${esc(i)}</li>`)
    .join('')}</ul>`;

const heading = (t: string) =>
  `<p style="margin: 0 0 10px; font-size: 13px; color: ${EMAIL_COLORS.ink}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">${t}</p>`;

const clientLine = (t: { title: string; dueDate: string | null }) =>
  t.dueDate ? `${t.title} (graag voor ${fmt(t.dueDate)})` : t.title;

/** Naar de klant: wekelijks voortgangsbericht, uit echte dossierdata. */
export function generateLaunchWeeklyEmail(data: {
  report: WeeklyReport;
  portalUrl: string;
}): { subject: string; html: string; text: string } {
  const r = data.report;
  const subject = `Voortgang ${r.projectName}: ${r.percent}% klaar`;
  const showGoLive = r.goLiveDate !== null && r.daysToGoLive !== null && r.daysToGoLive >= 0;
  const when = showGoLive ? ` De geplande lancering is op <strong>${fmt(r.goLiveDate as string)}</strong>.` : '';

  const bars = r.phases
    .map((p) => {
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      const color = pct === 100 ? '#10b981' : '#f97316';
      return `<tr>
        <td style="padding: 4px 0; font-size: 14px; color: #334155; width: 45%;">${esc(p.phase)}</td>
        <td style="padding: 4px 0;"><div style="background: #e5e7eb; border-radius: 3px; height: 8px;"><div style="background: ${color}; width: ${pct}%; height: 8px; border-radius: 3px;"></div></div></td>
        <td style="padding: 4px 0 4px 10px; font-size: 13px; color: ${EMAIL_COLORS.muted}; width: 50px;">${p.done}/${p.total}</td>
      </tr>`;
    })
    .join('');

  const blocks = [
    r.doneThisWeek.length ? emailCard(`${heading('Afgelopen week afgerond')}${list(r.doneThisWeek)}`) : '',
    r.upNext.length ? emailCard(`${heading('Hier werken we nu aan')}${list(r.upNext)}`) : '',
    r.clientTasks.length ? emailCard(`${heading('Dit hebben we van jou nodig')}${list(r.clientTasks.map(clientLine))}`, 'amber') : '',
  ].join('');

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">Hoi,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Een korte update over <strong>${esc(r.projectName)}</strong>: we zijn voor <strong>${r.percent}%</strong> klaar.${when}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">${bars}</table>
              ${blocks}
              ${emailButton('Bekijk alles in het portaal', data.portalUrl)}
              <p style="margin: 20px 0 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Deze link is 7 dagen geldig en persoonlijk.</p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: `${r.percent}% klaar${r.doneThisWeek.length ? `, ${r.doneThisWeek.length} afgerond deze week` : ''}.`,
    title: 'Voortgang',
    subtitle: r.projectName,
    body,
    footerNote: 'Vragen? Antwoord gewoon op deze mail.',
  });

  const section = (title: string, items: string[]) =>
    items.length ? `${title}:\n${items.map((i) => `- ${i}`).join('\n')}\n\n` : '';
  const text = `Hoi,

Een korte update over ${r.projectName}: we zijn voor ${r.percent}% klaar.${showGoLive ? ` De geplande lancering is op ${fmt(r.goLiveDate as string)}.` : ''}

${section('Afgelopen week afgerond', r.doneThisWeek)}${section('Hier werken we nu aan', r.upNext)}${section('Dit hebben we van jou nodig', r.clientTasks.map(clientLine))}Bekijk alles in het portaal: ${data.portalUrl}

Vincent van Munster
WeAreImpact.nl`;

  return { subject, html, text };
}
