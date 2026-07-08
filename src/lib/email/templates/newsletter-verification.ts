import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';

export function generateNewsletterVerificationEmail(data: {
  email: string;
  verifyUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Bevestig je aanmelding — WeAreImpact nieuwsbrief';

  const body = `
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je hebt je aangemeld voor de nieuwsbrief van WeAreImpact. Klik op de knop hieronder om je aanmelding te bevestigen.
              </p>

              ${emailButton('Bevestig aanmelding', data.verifyUrl)}

              <p style="margin: 24px 0 8px; font-size: 14px; color: #94a3b8; text-align: center;">
                Of kopieer deze link in je browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #64748b; text-align: center; word-break: break-all;">
                ${data.verifyUrl}
              </p>

              ${emailCard(`
                <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.6;">
                  <strong>Let op:</strong> deze link is 24 uur geldig. Heb jij je niet aangemeld? Dan hoef je niets te doen — we sturen je geen nieuwsbrief zonder bevestiging.
                </p>
              `, 'amber')}

              ${emailSignature()}
  `.trim();

  const html = emailShell({
    preheader: 'Nog één klik: bevestig je aanmelding voor de WeAreImpact nieuwsbrief.',
    title: 'Bijna klaar!',
    subtitle: 'Bevestig je aanmelding voor de WeAreImpact nieuwsbrief',
    body,
  });

  const text = `
BEVESTIG JE AANMELDING — WEAREIMPACT NIEUWSBRIEF
=================================================

Je hebt je aangemeld voor de nieuwsbrief van WeAreImpact.

Bevestig je aanmelding via deze link:
${data.verifyUrl}

Deze link is 24 uur geldig.

Heb je je niet aangemeld? Dan hoef je niets te doen.

Vincent van Munster
WeAreImpact — weareimpact.nl
  `.trim();

  return { subject, html, text };
}
