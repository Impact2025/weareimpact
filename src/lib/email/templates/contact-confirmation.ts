import { emailShell, emailButton, emailCard, emailSignature, EMAIL_COLORS } from './emailLayout';

interface ContactConfirmationData {
  name: string;
  email: string;
  message: string;
}

export function generateContactConfirmationEmail(data: ContactConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Bedankt voor je bericht - WeAreImpact';

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi ${data.name},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je bericht! Ik heb het goed ontvangen en neem binnen enkele uren contact met je op.
              </p>

              ${emailCard(`
                <p style="margin: 0 0 8px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Verwachte reactietijd
                </p>
                <p style="margin: 0 0 8px; font-size: 30px; color: ${EMAIL_COLORS.ink}; font-weight: 800;">
                  &lt; 4 uur
                </p>
                <p style="margin: 0; font-size: 14px; color: ${EMAIL_COLORS.muted};">
                  tijdens kantooruren
                </p>
              `)}

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                  Jouw bericht
                </p>
                <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              `)}

              <p style="margin: 0 0 12px; font-size: 14px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                Wat kun je verwachten?
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${([
                  ['Persoonlijke reactie', 'Geen standaard antwoord, maar een echte reactie op jouw vraag'],
                  ['Verkenningsgesprek', 'Indien relevant: een vrijblijvend kennismakingsgesprek'],
                  ['Concrete vervolgstappen', 'Duidelijke afspraken over hoe we verder kunnen'],
                ])
                  .map(
                    ([t, d], i) => `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <span style="display: inline-block; width: 24px; height: 24px; background-color: ${EMAIL_COLORS.orange}; border-radius: 50%; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">${i + 1}</span>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 500;">${t}</p>
                            <p style="margin: 4px 0 0; font-size: 14px; color: ${EMAIL_COLORS.muted};">${d}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`
                  )
                  .join('')}
              </table>

              ${emailSignature()}

              <p style="margin: 24px 0 0; font-size: 14px; color: ${EMAIL_COLORS.muted}; font-style: italic;">
                PS: Dringend? Bel me gerust op 06 14 47 09 77
              </p>
  `.trim();

  const html = emailShell({
    preheader: 'Bedankt voor je bericht — ik neem binnen enkele uren contact met je op.',
    title: 'Bericht ontvangen!',
    subtitle: 'Ik neem snel contact met je op',
    body,
  });

  const text = `
BERICHT ONTVANGEN!
==================

Hoi ${data.name},

Bedankt voor je bericht! Ik heb het goed ontvangen en neem binnen enkele uren contact met je op.

VERWACHTE REACTIETIJD: < 4 UUR
(tijdens kantooruren)

JOUW BERICHT:
-------------
${data.message}

WAT KUN JE VERWACHTEN?
----------------------
1. Persoonlijke reactie - Geen standaard antwoord, maar een echte reactie op jouw vraag
2. Verkenningsgesprek - Indien relevant: een vrijblijvend kennismakingsgesprek
3. Concrete vervolgstappen - Duidelijke afspraken over hoe we verder kunnen

Vincent van Munster
WeAreImpact.nl

PS: Dringend? Bel me gerust op 06 14 47 09 77
  `.trim();

  return { subject, html, text };
}

export function generateContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nieuw contactformulier: ${data.name}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Er is een nieuw bericht binnengekomen via het contactformulier.
              </p>

              ${emailCard(`
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Naam:</strong> <span style="color: #475569; margin-left: 8px;">${data.name}</span></td></tr>
                  <tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Email:</strong> <a href="mailto:${data.email}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; margin-left: 8px;">${data.email}</a></td></tr>
                  ${data.phone ? `<tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Telefoon:</strong> <a href="tel:${data.phone}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; margin-left: 8px;">${data.phone}</a></td></tr>` : ''}
                </table>
              `)}

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Bericht</p>
                <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              `, 'amber')}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                <tr>
                  <td>
                    <a href="mailto:${data.email}" style="display: inline-block; background-color: ${EMAIL_COLORS.orangeDark}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">Beantwoorden</a>
                    ${data.phone ? `<a href="tel:${data.phone}" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Bellen</a>` : ''}
                  </td>
                </tr>
              </table>
  `.trim();

  const html = emailShell({
    preheader: `Nieuw bericht van ${data.name} via weareimpact.nl`,
    title: 'Nieuw contactformulier',
    body,
  });

  const text = `
NIEUW CONTACTFORMULIER
======================

Naam: ${data.name}
Email: ${data.email}
${data.phone ? `Telefoon: ${data.phone}` : ''}

Bericht:
--------
${data.message}
  `.trim();

  return { subject, html, text };
}
