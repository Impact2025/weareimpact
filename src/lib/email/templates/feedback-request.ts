import { emailShell, emailButton } from './emailLayout';

interface FeedbackRequestData {
  firstName: string;
  subjectName: string;
  feedbackUrl: string;
}

// Naar de klant in de nazorgfase (na livegang of afgeronde sprint), handmatig
// verstuurd vanuit het bedrijf in het CRM. Eén vraag, 0-10, plus toelichting.
export function generateFeedbackRequestEmail(data: FeedbackRequestData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Eén vraag over onze samenwerking';
  const greeting = data.firstName ? `Hoi ${data.firstName},` : 'Hoi,';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                ${greeting}
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                ${data.subjectName} draait nu een tijdje. Ik wil graag weten hoe het bevalt, eerlijk,
                ook als er iets beter kan. Het is één vraag en kost je een halve minuut.
              </p>

              ${emailButton('Geef je oordeel', data.feedbackUrl)}

              <p style="margin: 28px 0 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Dank je wel!<br>
                <strong style="color: #0f172a;">Vincent van Munster</strong>
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Hoe bevalt ${data.subjectName}? Eén vraag, een halve minuut.`,
    title: 'Hoe bevalt het?',
    subtitle: 'WeAreImpact',
    body,
  });

  const text = `
HOE BEVALT HET?

${greeting}

${data.subjectName} draait nu een tijdje. Ik wil graag weten hoe het bevalt, eerlijk,
ook als er iets beter kan. Eén vraag, een halve minuut:

${data.feedbackUrl}

Dank je wel!
Vincent van Munster
  `.trim();

  return { subject, html, text };
}
