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

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging contactformulier</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Bericht ontvangen!
              </h1>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.8); font-size: 16px;">
                Ik neem snel contact met je op
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Hoi ${data.name},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Bedankt voor je bericht! Ik heb het goed ontvangen en neem binnen enkele uren contact met je op.
              </p>

              <!-- Response Time Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">
                      Verwachte reactietijd
                    </p>
                    <p style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700;">
                      &lt; 4 uur
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">
                      tijdens kantooruren
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Jouw bericht
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 0 0 16px;">
                    <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Wat kun je verwachten?
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #f97316; border-radius: 50%; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">1</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 500;">Persoonlijke reactie</p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Geen standaard antwoord, maar een echte reactie op jouw vraag</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #f97316; border-radius: 50%; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">2</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 500;">Verkenningsgesprek</p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Indien relevant: een vrijblijvend kennismakingsgesprek</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #f97316; border-radius: 50%; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">3</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 500;">Concrete vervolgstappen</p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Duidelijke afspraken over hoe we verder kunnen</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                <strong>Vincent van Munster</strong><br>
                <span style="color: #64748b;">Strategic Innovation Partner</span>
              </p>

              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Dringend? Bel me gerust op 06 14 47 09 77
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; text-align: center;">
                WeAreImpact - Innovatie met een sociaal hart
              </p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                <a href="https://weareimpact.nl" style="color: #f97316; text-decoration: none;">weareimpact.nl</a>
                &nbsp;·&nbsp;
                <a href="mailto:vincent@weareimpact.nl" style="color: #f97316; text-decoration: none;">vincent@weareimpact.nl</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

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
Strategic Innovation Partner

PS: Dringend? Bel me gerust op 06 14 47 09 77

---
WeAreImpact - Innovatie met een sociaal hart
weareimpact.nl | vincent@weareimpact.nl
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

export function generateContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Nieuw contactformulier: ${data.name}`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #f97316; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 20px;">Nieuw Contactformulier</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Naam:</strong><br>
                    <span style="color: #1e293b; font-size: 16px;">${data.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Email:</strong><br>
                    <a href="mailto:${data.email}" style="color: #f97316; font-size: 16px;">${data.email}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #64748b;">Telefoon:</strong><br>
                    <a href="tel:${data.phone}" style="color: #f97316; font-size: 16px;">${data.phone}</a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 16px 0;">
                    <strong style="color: #64748b;">Bericht:</strong><br>
                    <p style="margin: 8px 0 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap; background-color: #f8fafc; padding: 16px; border-radius: 8px;">${data.message}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td>
                    <a href="mailto:${data.email}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-right: 8px;">Beantwoorden</a>
                    ${data.phone ? `<a href="tel:${data.phone}" style="display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Bellen</a>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

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

  return {
    subject,
    html,
    text,
  };
}
