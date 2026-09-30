import { emailShell, emailCard, emailButton, emailSignature, EMAIL_COLORS } from './emailLayout';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Naar de klant: gebundeld bericht over net afgeronde, klantzichtbare stappen. */
export function generateMilestonesDoneEmail(data: {
  projectName: string;
  portalUrl: string;
  done: { title: string }[];
}): { subject: string; html: string; text: string } {
  const n = data.done.length;
  const subject =
    n === 1 ? `Voortgang ${data.projectName}: ${data.done[0].title}` : `Voortgang ${data.projectName}: ${n} stappen afgerond`;

  const list = data.done
    .map((d) => `<li style="margin: 0 0 8px; font-size: 15px; color: #1e293b;">${esc(d.title)}</li>`)
    .join('');

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">Hoi,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Goed nieuws over <strong>${esc(data.projectName)}</strong>: ${n === 1 ? 'er is een stap afgerond' : `er zijn ${n} stappen afgerond`}.
              </p>
              ${emailCard(`<ul style="margin: 0; padding-left: 20px;">${list}</ul>`)}
              ${emailButton('Bekijk de voortgang', data.portalUrl)}
              <p style="margin: 20px 0 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Deze link is 7 dagen geldig en persoonlijk.</p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: n === 1 ? data.done[0].title : `${n} stappen afgerond in ${data.projectName}.`,
    title: 'Voortgang',
    subtitle: data.projectName,
    body,
    footerNote: 'Vragen? Antwoord gewoon op deze mail.',
  });

  const text = `Hoi,

Goed nieuws over ${data.projectName}: ${n === 1 ? 'er is een stap afgerond' : `er zijn ${n} stappen afgerond`}.

${data.done.map((d) => `- ${d.title}`).join('\n')}

Bekijk de voortgang: ${data.portalUrl}
(link is 7 dagen geldig en persoonlijk)

Vincent van Munster
WeAreImpact.nl`;

  return { subject, html, text };
}
