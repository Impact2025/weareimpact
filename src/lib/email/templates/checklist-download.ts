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
<!-- Huisstijl WeAreImpact: cream bg (#FDFBF7), slate-900 koppen, oranje accent (#f97316/#ea580c) -->
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FDFBF7; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFBF7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #fed7aa; border-radius: 16px; overflow: hidden;">

          <!-- Header (cream, hart-logo + woordmerk, dark heading) -->
          <tr>
            <td style="background-color: #FDFBF7; padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #fed7aa;">
              <img src="https://weareimpact.nl/WeAreImpact_hart.png" alt="WeAreImpact" width="56" height="56" style="display: block; margin: 0 auto 14px; width: 56px; height: 56px;" />
              <p style="margin: 0 0 16px; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #0f172a;">
                WeAreImpact
              </p>
              <h1 style="margin: 0; color: #0f172a; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">
                AI-Proof Checklist
              </h1>
              <p style="margin: 10px 0 0; color: #334155; font-size: 16px;">
                15 praktische stappen voor sociale organisaties
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je download! Hier is je AI-Proof Checklist.
              </p>

              <!-- Download Button (bulletproof, site-oranje #ea580c) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="border-radius: 8px; background-color: #ea580c;">
                      <tr>
                        <td align="center" style="padding: 16px 44px;">
                          <a href="https://weareimpact.nl/downloads/AI-Proof_Checklist_WeAreImpact.pdf" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                            Download PDF Checklist
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Quick Wins Card (orange-50 bg + oranje border-left, gelijk aan site-blockquote) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 0 12px 12px 0; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
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

              <!-- What's Next (warmere orange-100 tint, on-brand) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffedd5; border-left: 4px solid #ea580c; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                      De komende dagen stuur ik je nog 3 korte e-mails met concrete tips, een Nederlandse case study, en hoe je van checklist naar concreet plan gaat.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Succes met de eerste stappen!
              </p>
              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                <strong>Vincent van Munster</strong><br>
                <span style="color: #ea580c; font-weight: 600;">WeAreImpact.nl</span>
              </p>

              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Vraag over de checklist? Reply gewoon op deze mail.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FDFBF7; padding: 24px 40px; border-top: 1px solid #fed7aa;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; text-align: center;">
                WeAreImpact - Innovatie met een sociaal hart
              </p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                <a href="https://weareimpact.nl" style="color: #ea580c; text-decoration: none; font-weight: 600;">weareimpact.nl</a>
                &nbsp;·&nbsp;
                <a href="mailto:v.munster@weareimpact.nl" style="color: #ea580c; text-decoration: none; font-weight: 600;">v.munster@weareimpact.nl</a>
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
