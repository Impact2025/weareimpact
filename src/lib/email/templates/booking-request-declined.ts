import { emailShell, EMAIL_COLORS } from './emailLayout';

interface BookingRequestDeclinedData {
  customerName: string;
  bookingType: string;
}

/** Naar de klant als Vincent de aanvraag afwijst — nooit stil laten hangen,
 * een aanvraag die zomaar verdwijnt is erger dan een nette afwijzing. */
export function generateBookingRequestDeclinedEmail(data: BookingRequestDeclinedData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Over je aanvraag: ${data.bookingType}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hoi ${data.customerName},
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor je aanvraag voor een ${data.bookingType.toLowerCase()}. Het voorgestelde
                moment past helaas niet in de agenda van Vincent.
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #334155;">
                Hij neemt zelf contact met je op om samen een ander moment te vinden, of mail gerust
                naar <a href="mailto:v.munster@weareimpact.nl" style="color: ${EMAIL_COLORS.orangeDark}; text-decoration: none;">v.munster@weareimpact.nl</a>.
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Met vriendelijke groet,<br>
                <strong style="color: #0f172a;">Vincent van Munster</strong>
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Het voorgestelde moment voor "${data.bookingType}" past helaas niet — Vincent zoekt een alternatief.`,
    title: 'Over je aanvraag',
    subtitle: 'WeAreImpact',
    body,
  });

  const text = `
Hoi ${data.customerName},

Bedankt voor je aanvraag voor een ${data.bookingType.toLowerCase()}. Het voorgestelde moment
past helaas niet in de agenda van Vincent.

Hij neemt zelf contact met je op om samen een ander moment te vinden, of mail gerust naar
v.munster@weareimpact.nl.

Met vriendelijke groet,
Vincent van Munster
  `.trim();

  return { subject, html, text };
}
