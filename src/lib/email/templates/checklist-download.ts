import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';

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

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi${data.organisatie ? ` (${data.organisatie})` : ''},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je download! Hier is je AI-Proof Checklist.
              </p>

              ${emailButton('Download PDF Checklist', 'https://weareimpact.nl/downloads/AI-Proof_Checklist_WeAreImpact.pdf')}

              ${emailCard(`
                <p style="margin: 0 0 16px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">
                  Mijn advies: begin met de Quick Wins
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 8px 0;"><p style="margin: 0; font-size: 15px; color: #1e293b;"><strong style="color: #f97316;">1.</strong> Inventariseer welke AI-tools je team gebruikt <span style="color: #64748b;">(30 min)</span></p></td></tr>
                  <tr><td style="padding: 8px 0;"><p style="margin: 0; font-size: 15px; color: #1e293b;"><strong style="color: #f97316;">2.</strong> Schrijf een simpele one-pager met spelregels <span style="color: #64748b;">(60 min)</span></p></td></tr>
                  <tr><td style="padding: 8px 0;"><p style="margin: 0; font-size: 15px; color: #1e293b;"><strong style="color: #f97316;">3.</strong> Plan een bestuurssessie over AI <span style="color: #64748b;">(5 min)</span></p></td></tr>
                </table>
              `)}

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  De komende dagen stuur ik je nog 3 korte e-mails met concrete tips, een Nederlandse case study, en hoe je van checklist naar concreet plan gaat.
                </p>
              `, 'amber')}

              <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Succes met de eerste stappen!
              </p>
              ${emailSignature()}
              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Vraag over de checklist? Reply gewoon op deze mail.
              </p>
  `.trim();

  const html = emailShell({
    preheader: 'Je AI-Proof Checklist met 15 praktische stappen voor sociale organisaties.',
    title: 'AI-Proof Checklist',
    subtitle: '15 praktische stappen voor sociale organisaties',
    body,
  });

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
  `.trim();

  return { subject, html, text };
}
