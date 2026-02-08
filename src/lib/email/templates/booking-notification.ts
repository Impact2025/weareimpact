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

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe Afspraak</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Nieuwe Afspraak
              </h1>
              <p style="margin: 12px 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">
                Via weareimpact.nl
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Er is een nieuwe afspraak geboekt via de website.
              </p>

              <!-- Customer Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Klantgegevens</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <strong style="color: #1e293b;">Naam:</strong>
                          <span style="color: #475569; margin-left: 8px;">${data.customerName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <strong style="color: #1e293b;">Email:</strong>
                          <a href="mailto:${data.customerEmail}" style="color: #f97316; text-decoration: none; margin-left: 8px;">${data.customerEmail}</a>
                        </td>
                      </tr>
                      ${data.customerPhone ? `
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <strong style="color: #1e293b;">Telefoon:</strong>
                          <a href="tel:${data.customerPhone}" style="color: #f97316; text-decoration: none; margin-left: 8px;">${data.customerPhone}</a>
                        </td>
                      </tr>
                      ` : ''}
                      ${data.customerOrganization ? `
                      <tr>
                        <td>
                          <strong style="color: #1e293b;">Organisatie:</strong>
                          <span style="color: #475569; margin-left: 8px;">${data.customerOrganization}</span>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Afspraakdetails</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b;">Type Gesprek</p>
                          <p style="margin: 4px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.bookingType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b;">Datum</p>
                          <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b;">Tijd</p>
                          <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedTime} (${data.duration} minuten)</p>
                        </td>
                      </tr>
                      ${data.meetLink ? `
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 13px; color: #64748b;">Google Meet</p>
                          <p style="margin: 4px 0 0;">
                            <a href="${data.meetLink}" style="color: #f97316; text-decoration: none; font-weight: 500; font-size: 16px;">${data.meetLink}</a>
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${data.meetLink ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.meetLink}" style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Open Google Meet
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                Deze email is automatisch verzonden door WeAreImpact
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

  return {
    subject,
    html,
    text,
  };
}
