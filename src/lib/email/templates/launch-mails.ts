import { emailShell, emailCard, emailButton, emailSignature, EMAIL_COLORS } from './emailLayout';
import type { LaunchOverview } from '@/lib/launch/briefing';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

/** Naar de klant: wat staat er bij jou open, met een verse inloglink voor het portaal. */
export function generateLaunchClientReminderEmail(data: {
  projectName: string;
  portalUrl: string;
  tasks: { title: string; dueDate: string | null }[];
}): { subject: string; html: string; text: string } {
  const subject = `Even jouw input nodig voor ${data.projectName}`;
  const list = data.tasks
    .map(
      (t) => `
                <li style="margin: 0 0 8px; font-size: 15px; color: #1e293b;">
                  <strong>${esc(t.title)}</strong>${t.dueDate ? ` <span style="color: ${EMAIL_COLORS.muted};">— graag voor ${fmt(t.dueDate)}</span>` : ''}
                </li>`,
    )
    .join('');

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">Hoi,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                We komen samen goed op stoom met <strong>${esc(data.projectName)}</strong>. Om de lancering op schema te houden hebben we nog een paar dingen van jou nodig:
              </p>
              ${emailCard(`<ul style="margin: 0; padding-left: 20px;">${list}</ul>`)}
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">
                In het portaal zie je precies wat er staat en hoe ver we zijn. Het kost je een paar minuten.
              </p>
              ${emailButton('Open het portaal', data.portalUrl)}
              <p style="margin: 20px 0 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Deze link is 7 dagen geldig en persoonlijk.</p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: `${data.tasks.length} ${data.tasks.length === 1 ? 'ding' : 'dingen'} wachten op jou voor ${data.projectName}.`,
    title: 'Even jouw input',
    subtitle: data.projectName,
    body,
    footerNote: 'Vragen? Antwoord gewoon op deze mail.',
  });

  const text = `Hoi,

Om de lancering van ${data.projectName} op schema te houden hebben we nog dit van jou nodig:

${data.tasks.map((t) => `- ${t.title}${t.dueDate ? ` (voor ${fmt(t.dueDate)})` : ''}`).join('\n')}

Open het portaal: ${data.portalUrl}
(link is 7 dagen geldig en persoonlijk)

Vincent van Munster
WeAreImpact.nl`;

  return { subject, html, text };
}

/** Naar Vincent: alleen launches met een risico. */
export function generateLaunchDigestEmail(data: {
  atRisk: LaunchOverview[];
  onTrack: LaunchOverview[];
  remindersSent: string[];
}): { subject: string; html: string; text: string } {
  const subject = `LaunchAssist: ${data.atRisk.length} ${data.atRisk.length === 1 ? 'launch' : 'launches'} vragen aandacht`;
  const base = 'https://weareimpact.nl/admin/dossiers';

  const cards = data.atRisk
    .map(
      (o) => `
              ${emailCard(
                `<p style="margin: 0 0 8px; font-size: 16px; color: #0f172a; font-weight: 700;">${esc(o.name)} <span style="color: ${EMAIL_COLORS.muted}; font-weight: 400;">· ${o.percent}%</span></p>
                 <ul style="margin: 0 0 12px; padding-left: 20px;">${o.risks.map((r) => `<li style="font-size: 14px; color: #334155; margin: 0 0 4px;">${esc(r)}</li>`).join('')}</ul>
                 <a href="${base}/${o.slug}/launch" style="color: #ea580c; font-weight: 600; font-size: 14px; text-decoration: none;">Open launch-board →</a>`,
                'amber',
              )}`,
    )
    .join('');

  const footer = [
    data.onTrack.length ? `${data.onTrack.length} op koers: ${data.onTrack.map((o) => esc(o.name)).join(', ')}.` : '',
    data.remindersSent.length ? `Herinnering naar klant gestuurd voor: ${data.remindersSent.map(esc).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const html = emailShell({
    preheader: data.atRisk.map((o) => o.name).join(', '),
    title: 'LaunchAssist',
    subtitle: 'Wat vandaag aandacht vraagt',
    body: `${cards}${footer ? `<p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.muted};">${footer}</p>` : ''}`,
    footerNote: 'Dagelijkse controle door LaunchAssist',
  });

  const text = `${data.atRisk.map((o) => `${o.name} (${o.percent}%)\n${o.risks.map((r) => `  - ${r}`).join('\n')}\n  ${base}/${o.slug}/launch`).join('\n\n')}${
    footer ? `\n\n${footer.replace(/&amp;/g, '&')}` : ''
  }`;

  return { subject, html, text };
}
