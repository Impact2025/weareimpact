import { emailShell, emailButton, emailCard, EMAIL_COLORS } from './emailLayout';

interface BookingNotificationData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerOrganization?: string;
  bookingType: string;
  startTime: string;
  endTime: string;
  duration: number;
  meetLink?: string;
}

export function generateBookingNotificationEmail(data: BookingNotificationData): {
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

  const subject = `Nieuwe afspraak: ${data.bookingType} met ${data.customerName}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Er is een nieuwe afspraak geboekt via de website.
              </p>

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: ${EMAIL_COLORS.ink}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Klantgegevens</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Naam:</strong> <span style="color: #475569; margin-left: 8px;">${data.customerName}</span></td></tr>
                  <tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Email:</strong> <a href="mailto:${data.customerEmail}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; margin-left: 8px;">${data.customerEmail}</a></td></tr>
                  ${data.customerPhone ? `<tr><td style="padding-bottom: 8px;"><strong style="color: #1e293b;">Telefoon:</strong> <a href="tel:${data.customerPhone}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; margin-left: 8px;">${data.customerPhone}</a></td></tr>` : ''}
                  ${data.customerOrganization ? `<tr><td><strong style="color: #1e293b;">Organisatie:</strong> <span style="color: #475569; margin-left: 8px;">${data.customerOrganization}</span></td></tr>` : ''}
                </table>
              `)}

              ${emailCard(`
                <p style="margin: 0 0 12px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Afspraakdetails</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom: 12px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Type Gesprek</p><p style="margin: 4px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.bookingType}</p></td></tr>
                  <tr><td style="padding-bottom: 12px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Datum</p><p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p></td></tr>
                  <tr><td style="padding-bottom: 12px;"><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Tijd</p><p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedTime} (${data.duration} minuten)</p></td></tr>
                  ${data.meetLink ? `<tr><td><p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.muted};">Google Meet</p><p style="margin: 4px 0 0;"><a href="${data.meetLink}" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none; font-weight: 500; font-size: 16px;">${data.meetLink}</a></p></td></tr>` : ''}
                </table>
              `)}

              ${data.meetLink ? emailButton('Open Google Meet', data.meetLink) : ''}
  `.trim();

  const html = emailShell({
    preheader: `Nieuwe afspraak: ${data.bookingType} met ${data.customerName} op ${formattedDate}.`,
    title: 'Nieuwe Afspraak',
    subtitle: 'Via weareimpact.nl',
    body,
    footerNote: 'Deze email is automatisch verzonden door WeAreImpact',
  });

  const text = `
NIEUWE AFSPRAAK

Er is een nieuwe afspraak geboekt via de website.

KLANTGEGEVENS:
--------------
Naam: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Telefoon: ${data.customerPhone}` : ''}
${data.customerOrganization ? `Organisatie: ${data.customerOrganization}` : ''}

AFSPRAAKDETAILS:
----------------
Type: ${data.bookingType}
Datum: ${formattedDate}
Tijd: ${formattedTime} (${data.duration} minuten)
${data.meetLink ? `Google Meet: ${data.meetLink}` : ''}
  `.trim();

  return { subject, html, text };
}
