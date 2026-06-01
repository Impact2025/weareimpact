export function generateNewsletterVerificationEmail(data: {
  email: string;
  verifyUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Bevestig je aanmelding — WeAreImpact nieuwsbrief';

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestig aanmelding nieuwsbrief</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">

          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Bijna klaar!
              </h1>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.75); font-size: 16px;">
                Bevestig je aanmelding voor de WeAreImpact nieuwsbrief
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                Je hebt je aangemeld voor de nieuwsbrief van WeAreImpact. Klik op de knop hieronder om je aanmelding te bevestigen.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.verifyUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                      Bevestig aanmelding
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 14px; color: #94a3b8; text-align: center;">
                Of kopieer deze link in je browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #64748b; text-align: center; word-break: break-all;">
                ${data.verifyUrl}
              </p>

              <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                  <strong>Let op:</strong> deze link is 24 uur geldig. Heb jij je niet aangemeld? Dan hoef je niets te doen — we sturen je geen nieuwsbrief zonder bevestiging.
                </p>
              </div>

              <p style="margin: 32px 0 0; font-size: 16px; color: #1e293b; line-height: 1.6;">
                <strong>Vincent van Munster</strong><br>
                <span style="color: #64748b; font-size: 14px;">WeAreImpact</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
                WeAreImpact · KvK 70285888 · Nieuw-Vennep, Nederland<br>
                <a href="https://weareimpact.nl/privacy" style="color: #f97316; text-decoration: none;">Privacyverklaring</a>
                &nbsp;·&nbsp;
                <a href="https://weareimpact.nl" style="color: #f97316; text-decoration: none;">weareimpact.nl</a>
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
