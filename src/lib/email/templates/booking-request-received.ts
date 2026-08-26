import { emailShell, emailCard, EMAIL_COLORS } from './emailLayout';

interface BookingRequestReceivedData {
  customerName: string;
  bookingType: string;
  startTime: string;
  duration: number;
}

/** Naar de klant, meteen na het invullen van de afspraaktool — géén
 * bevestiging: de afspraak staat pas vast zodra Vincent de aanvraag
 * goedkeurt (zie api/booking/respond/route.ts). */
export function generateBookingRequestReceivedEmail(data: BookingRequestReceivedData): {
  subject: string;
  html: string;
  text: string;
} {
  const date = new Date(data.startTime);
  const formattedDate = date.toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  const subject = `Aanvraag ontvangen: ${data.bookingType}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi ${data.customerName},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je aanvraag voor een gesprek met Vincent is ontvangen. Hij bevestigt 'm persoonlijk
                zodra hij zijn agenda heeft gecheckt — je hoort dan meteen of dit moment past.
              </p>

              ${emailCard(`
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom: 16px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Type Gesprek</p><p style="margin: 6px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.bookingType}</p></td></tr>
                  <tr><td style="padding-bottom: 16px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Gewenste datum</p><p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p></td></tr>
                  <tr><td><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Gewenste tijd</p><p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedTime} (${data.duration} minuten)</p></td></tr>
                </table>
              `)}

              <p style="margin: 28px 0 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Tot snel!<br>
                <strong style="color: #0f172a;">Vincent van Munster</strong>
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Je aanvraag "${data.bookingType}" op ${formattedDate} is ontvangen — Vincent bevestigt persoonlijk.`,
    title: 'Aanvraag ontvangen',
    subtitle: 'WeAreImpact',
    body,
  });

  const text = `
AANVRAAG ONTVANGEN

Hoi ${data.customerName},

Je aanvraag voor een gesprek met Vincent is ontvangen. Hij bevestigt 'm persoonlijk
zodra hij zijn agenda heeft gecheckt.

Type: ${data.bookingType}
Gewenste datum: ${formattedDate}
Gewenste tijd: ${formattedTime} (${data.duration} minuten)

Tot snel!
Vincent van Munster
  `.trim();

  return { subject, html, text };
}
