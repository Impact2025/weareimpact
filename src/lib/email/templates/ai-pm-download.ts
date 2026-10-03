import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';
import { downloadUrl, type AiPmDownload } from '@/lib/ai-pm-downloads';

interface Data {
  organisatie?: string;
  download: AiPmDownload;
}

export function generateAiPmDownloadEmail({ organisatie, download }: Data): {
  subject: string;
  html: string;
  text: string;
} {
  const url = downloadUrl(download);
  const greeting = `Hoi${organisatie ? ` (${organisatie})` : ''},`;
  const subject = `Je download: ${download.short}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">${greeting}</p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je aanvraag. Hier is <strong>${download.title}</strong>.
              </p>

              ${emailButton('Download de PDF', url)}

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  Tip: gebruik dit document samen met de opdrachtgever en de projectmanager, niet alleen met het projectteam. En leg je besluit vast, ook als het &ldquo;stoppen&rdquo; is.
                </p>
              `)}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je krijgt van mij geen vervolgmails of nieuwsbrief naar aanleiding van deze download. Wil je er iets over bespreken of hulp bij een AI-project? Reply gewoon op deze mail, of plan een gratis gesprek van 30 minuten via weareimpact.nl/ai-projectmanager.
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

Je krijgt van mij geen vervolgmails of nieuwsbrief naar aanleiding van deze download. Hulp bij een AI-project? Reply op deze mail of plan een gratis gesprek via https://weareimpact.nl/ai-projectmanager

Vincent van Munster
WeAreImpact.nl
`;

  return { subject, html, text };
}
