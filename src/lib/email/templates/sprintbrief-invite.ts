import { emailShell, emailButton, emailCard } from './emailLayout';

interface SprintbriefInviteData {
  customerName: string;
  sprintTitle: string;
  sprintbriefUrl: string;
}

// Naar de klant, direct na goedkeuring van de Fit & Focus-intake (zie
// api/booking/respond/route.ts). Bevat de link naar de sprint-specifieke
// Sprintbrief — de gerichte vragenlijst waarmee Vincent zich voorbereidt.
export function generateSprintbriefInviteEmail(data: SprintbriefInviteData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Voorbereiding op je Sprint: de Sprintbrief`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi ${data.customerName},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je intake voor <strong>${data.sprintTitle}</strong> staat vast. Om op de sprintdag zelf
                direct aan de slag te kunnen, vraag ik je vooraf een korte Sprintbrief in te vullen —
                zo weet ik precies waar het proces begint en eindigt, en heb ik alvast een paar
                geanonimiseerde voorbeelden om mee te werken.
              </p>

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  Duurt ongeveer 10-15 minuten. Hoe vollediger, hoe meer we op locatie meteen kunnen bouwen
                  in plaats van nog te moeten uitzoeken.
                </p>
              `)}

              ${emailButton('Vul de Sprintbrief in', data.sprintbriefUrl)}

              <p style="margin: 28px 0 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Tot op locatie!<br>
                <strong style="color: #0f172a;">Vincent van Munster</strong>
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Vul de Sprintbrief in voor ${data.sprintTitle} — ${data.sprintbriefUrl}`,
    title: 'Nog één stap: de Sprintbrief',
    subtitle: 'WeAreImpact',
    body,
  });

  const text = `
NOG ÉÉN STAP: DE SPRINTBRIEF

Hoi ${data.customerName},

Je intake voor ${data.sprintTitle} staat vast. Vul vooraf de Sprintbrief in zodat
ik op de sprintdag direct aan de slag kan:

${data.sprintbriefUrl}

Tot op locatie!
Vincent van Munster
  `.trim();

  return { subject, html, text };
}
