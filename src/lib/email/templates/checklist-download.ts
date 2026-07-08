interface ChecklistDownloadData {
  email: string;
  organisatie?: string;
}

export function generateChecklistDownloadEmail(data: ChecklistDownloadData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Hier is je AI-Proof Checklist';

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI-Proof Checklist</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #ea580c; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="https://weareimpact.nl/WeAreImpact_hart.png" alt="WeAreImpact" width="60" height="60" style="display: block; margin: 0 auto 20px; width: 60px; height: 60px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                AI-Proof Checklist
              </h1>
              <p style="margin: 12px 0 0; color: #ffffff; font-size: 16px;">
                15 praktische stappen voor sociale organisaties
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Bedankt voor je download! Hier is je AI-Proof Checklist.
              </p>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="border-radius: 8px; background-color: #f97316; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                      <tr>
                        <td align="center" style="padding: 16px 40px;">
                          <a href="https://weareimpact.nl/downloads/AI-Proof_Checklist_WeAreImpact.pdf" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                            Download PDF Checklist
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Quick Wins Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Mijn advies: begin met de Quick Wins
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b;">
                            <strong style="color: #f97316;">1.</strong> Inventariseer welke AI-tools je team gebruikt <span style="color: #64748b;">(30 min)</span>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b;">
                            <strong style="color: #f97316;">2.</strong> Schrijf een simpele one-pager met spelregels <span style="color: #64748b;">(60 min)</span>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; color: #1e293b;">
                            <strong style="color: #f97316;">3.</strong> Plan een bestuurssessie over AI <span style="color: #64748b;">(5 min)</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                      De komende dagen stuur ik je nog 3 korte e-mails met concrete tips, een Nederlandse case study, en hoe je van checklist naar concreet plan gaat.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #475569;">
                Succes met de eerste stappen!
              </p>
              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                <strong>Vincent van Munster</strong><br>
                <span style="color: #64748b;">WeAreImpact.nl</span>
              </p>

              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Vraag over de checklist? Reply gewoon op deze mail.
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
                <a href="mailto:v.munster@weareimpact.nl" style="color: #f97316; text-decoration: none;">v.munster@weareimpact.nl</a>
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
AI-PROOF CHECKLIST
15 praktische stappen voor sociale organisaties

Hoi${data.organisatie ? ` (${data.organisatie})` : ''},

Bedankt voor je download!

Download de checklist hier:
https://weareimpact.nl/downloads/AI-Proof_Checklist_WeAreImpact.pdf

MIJN ADVIES: BEGIN MET DE QUICK WINS
------------------------------------
1. Inventariseer welke AI-tools je team gebruikt (30 min)
2. Schrijf een simpele one-pager met spelregels (60 min)
3. Plan een bestuurssessie over AI (5 min)

De komende dagen stuur ik je nog 3 korte e-mails met concrete tips, een Nederlandse case study, en hoe je van checklist naar concreet plan gaat.

Succes met de eerste stappen!

Vincent van Munster
WeAreImpact.nl

PS: Vraag over de checklist? Reply gewoon op deze mail.

---
WeAreImpact - Innovatie met een sociaal hart
weareimpact.nl | v.munster@weareimpact.nl
  `.trim();

  return {
    subject,
    html,
    text,
  };
}
