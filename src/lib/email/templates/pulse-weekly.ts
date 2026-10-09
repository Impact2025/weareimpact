import { emailShell, emailButton, emailSignature, EMAIL_COLORS } from './emailLayout';

/** Naar de klant: uitnodiging voor de wekelijkse weekcheck-chat met Iris. */
export function generatePulseEmail(data: { projectName: string; chatUrl: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Even bijpraten over deze week? Iris wacht op je';
  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">Hoi Stéphanie,</p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                De week zit erop. Iris stelt je graag drie korte vragen over onze samenwerking aan ${data.projectName}: of we op de juiste route zitten, wat je het meest heeft geholpen en waar we moeten bijsturen. Het kost ongeveer twee minuten.
              </p>
              ${emailButton('Chat met Iris', data.chatUrl)}
              <p style="margin: 20px 0 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Deze link is 7 dagen geldig en persoonlijk.</p>
              ${emailSignature()}
  `.trim();
  const html = emailShell({
    preheader: 'Twee minuten, drie vragen.',
    title: 'Weekcheck',
    subtitle: data.projectName,
    body,
    footerNote: 'Vragen? Antwoord gewoon op deze mail.',
  });
  const text = `Hoi Stéphanie,

De week zit erop. Iris stelt je graag drie korte vragen over onze samenwerking aan ${data.projectName}: zitten we op de juiste route, wat heeft je het meest geholpen en waar moeten we bijsturen. Twee minuten.

Chat met Iris: ${data.chatUrl}

Vincent van Munster
WeAreImpact.nl`;
  return { subject, html, text };
}
