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

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Afspraak Bevestigd</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ✓ Afspraak Bevestigd
              </h1>
              <p style="margin: 12px 0 0; color: #cbd5e1; font-size: 16px;">
                WeAreImpact
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Hoi ${data.customerName},
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #475569;">
                Je afspraak met Vincent van Munster is bevestigd! Ik kijk ernaar uit om met je in gesprek te gaan.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Type Gesprek</p>
                          <p style="margin: 6px 0 0; font-size: 18px; color: #1e293b; font-weight: 600;">${data.bookingType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Datum</p>
                          <p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tijd</p>
                          <p style="margin: 6px 0 0; font-size: 16px; color: #1e293b; font-weight: 500;">${formattedTime} (${data.duration} minuten)</p>
                        </td>
                      </tr>
                      ${data.meetLink ? `
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Videocall Link</p>
                          <p style="margin: 6px 0 0;">
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
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${data.meetLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                      Deelnemen aan gesprek
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Footer Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                      <strong>Let op:</strong> Voeg deze afspraak toe aan je agenda. Je ontvangt 15 minuten voor aanvang een herinnering.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #475569;">
                Tot dan!<br>
                <strong style="color: #1e293b;">Vincent van Munster</strong>
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

  return {
    subject,
    html,
    text,
  };
}
