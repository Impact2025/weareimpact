import { emailShell, emailButton, emailCard, emailSignature, EMAIL_COLORS } from './emailLayout';

interface BookingConfirmationData {
  customerName: string;
  bookingType: string;
  startTime: string;
  endTime: string;
  duration: number;
  meetLink?: string;
}

export function generateBookingConfirmationEmail(data: BookingConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const date = new Date(data.startTime);
  const formattedDate = date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Bevestiging: ${data.bookingType} op ${formattedDate}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi ${data.customerName},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Je afspraak met Vincent van Munster is bevestigd! Ik kijk ernaar uit om met je in gesprek te gaan.
              </p>

              ${emailCard(`
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom: 16px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Type Gesprek</p><p style="margin: 6px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.bookingType}</p></td></tr>
                  <tr><td style="padding-bottom: 16px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Datum</p><p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p></td></tr>
                  <tr><td style="padding-bottom: 16px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tijd</p><p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedTime} (${data.duration} minuten)</p></td></tr>
                  ${data.meetLink ? `<tr><td><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Videocall Link</p><p style="margin: 6px 0 0;"><a href="${data.meetLink}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; font-weight: 500; font-size: 16px;">${data.meetLink}</a></p></td></tr>` : ''}
                </table>
              `)}

              ${data.meetLink ? emailButton('Deelnemen aan gesprek', data.meetLink) : ''}

              ${emailCard(`
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                  <strong>Let op:</strong> Voeg deze afspraak toe aan je agenda. Je ontvangt 15 minuten voor aanvang een herinnering.
                </p>
              `, 'amber')}

              <p style="margin: 28px 0 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Tot dan!<br>
                <strong style="color: #0f172a;">Vincent van Munster</strong>
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Je afspraak "${data.bookingType}" is bevestigd voor ${formattedDate}.`,
    title: '✓ Afspraak Bevestigd',
    subtitle: 'WeAreImpact',
    body,
  });

  const text = `
AFSPRAAK BEVESTIGD

Hoi ${data.customerName},

Je afspraak met Vincent van Munster is bevestigd!

DETAILS:
--------
Type: ${data.bookingType}
Datum: ${formattedDate}
Tijd: ${formattedTime} (${data.duration} minuten)
${data.meetLink ? `Link: ${data.meetLink}` : ''}

Tot dan!

Vincent van Munster
WeAreImpact
weareimpact.nl
v.munster@weareimpact.nl
  `.trim();

  return { subject, html, text };
}
