import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';
import { AI_PM_DOWNLOADS, trackedUrl, type AiPmDownload } from '@/lib/ai-pm-downloads';

interface Data {
  organisatie?: string;
  download: AiPmDownload;
  leadId: string;
}

export function generateAiPmDownloadEmail({ organisatie, download, leadId }: Data): {
  subject: string;
  html: string;
  text: string;
} {
  const url = trackedUrl(leadId, download.id);
  const isToolkit = download.id === 'toolkit';
  const listHtml = isToolkit
    ? emailCard(`
                <p style="margin: 0 0 10px; font-size: 14px; color: #1e293b;"><strong>Of download ze los:</strong></p>
                ${AI_PM_DOWNLOADS.map((d) => `<p style="margin: 0 0 6px; font-size: 14px;"><a href="${trackedUrl(leadId, d.id)}" style="color: #ea580c;">${d.short}</a></p>`).join('')}
              `)
    : '';
  const textLines = AI_PM_DOWNLOADS.map((d) => `- ${d.short}: ${trackedUrl(leadId, d.id)}`);
  const listText = isToolkit ? ['', 'Los te downloaden:', ...textLines, ''].join('\n') : '';
  const greeting = `Hoi${organisatie ? ` (${organisatie})` : ''},`;
  const subject = `Je download: ${download.short}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">${greeting}</p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je aanvraag. Hier is <strong>${download.title}</strong>.
              </p>

              ${emailButton(isToolkit ? 'Download de toolkit (zip)' : 'Download de PDF', url)}

              ${listHtml}

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  Tip: gebruik dit document samen met de opdrachtgever en de projectmanager, niet alleen met het projectteam. En leg je besluit vast, ook als het &ldquo;stoppen&rdquo; is.
                </p>
              `)}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je krijgt van mij geen vervolgmails naar aanleiding van deze download, tenzij je bij het aanvragen zelf hebt gekozen voor de tips. Wil je er iets over bespreken of hulp bij een AI-project? Reply gewoon op deze mail, of plan een gratis gesprek van 30 minuten via weareimpact.nl/ai-projectmanager.
              </p>
              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: `Je download: ${download.title}`,
    title: download.short,
    subtitle: 'AI-projectmanagement · WeAreImpact',
    body,
  });

  const text = `${greeting}

Bedankt voor je aanvraag. Hier is ${download.title}:
${url}
${listText}
Je krijgt van mij geen vervolgmails naar aanleiding van deze download, tenzij je bij het aanvragen zelf hebt gekozen voor de tips. Hulp bij een AI-project? Reply op deze mail of plan een gratis gesprek via https://weareimpact.nl/ai-projectmanager

Vincent van Munster
WeAreImpact.nl
`;

  return { subject, html, text };
}
