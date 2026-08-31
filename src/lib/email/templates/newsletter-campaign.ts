import { emailShell, emailCard } from './emailLayout';

/**
 * Strip HTML tags to produce a plain-text version of the email body.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*script.*?>.*?<\s*\/\s*script.*?>/gi, '')
    .replace(/<\s*style.*?>.*?<\s*\/\s*style.*?>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => {
      const map: Record<string, string> = {
        nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'"
      };
      return map[m] ?? m;
    })
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://weareimpact.nl';

interface CampaignData {
  campaignId: string;
  subject: string;
  previewText?: string;
  contentHtml: string;
  contentText?: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /**
   * Signed token identifying the recipient row (see tracking-token.ts).
   * Present for a real send — enables open/click tracking and a working
   * unsubscribe link. Absent for the admin "preview" page, where those
   * links are neutralized instead of pointing at a non-existent recipient.
   */
  recipientToken?: string;
  webVersionUrl?: string;
}

/**
 * Generate a fully branded newsletter email for Resend.
 * Wraps the user's HTML in the WeAreImpact email shell with an unsubscribe
 * footer, an open-tracking pixel, and click-tracked links.
 */
export function generateNewsletterCampaignEmail(data: CampaignData): {
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
} {
  const {
    subject,
    previewText,
    contentHtml,
    contentText,
    senderName,
    senderEmail,
    utmSource = 'newsletter',
    utmMedium = 'email',
    utmCampaign = 'newsletter',
    recipientToken,
    webVersionUrl,
  } = data;

  const unsubscribeUrl = recipientToken
    ? `${BASE_URL}/api/newsletter/track/unsubscribe?t=${recipientToken}`
    : `${BASE_URL}/newsletter/bevestigd`;

  const wrapClick = recipientToken
    ? (url: string) => `${BASE_URL}/api/newsletter/track/click?t=${recipientToken}&u=${encodeURIComponent(url)}`
    : undefined;

  // Append UTM params to all links in the content, then route them through
  // the click-tracking redirect (when we have a recipient to attribute to).
  const trackedContent = processLinks(contentHtml, utmSource, utmMedium, utmCampaign, wrapClick);

  const trackingPixel = recipientToken
    ? `<img src="${BASE_URL}/api/newsletter/track/open?t=${recipientToken}" width="1" height="1" style="display:none;" alt="" />`
    : '';

  const body = `
    ${webVersionUrl ? `<p style="margin: 0 0 16px; font-size: 13px; text-align: right; color: #94a3b8;"><a href="${webVersionUrl}" style="color: #ea580c; text-decoration: none;">Webversie bekijken</a></p>` : ''}

    ${trackedContent}

    ${trackingPixel}

    ${emailCard(`
      <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.6;">
        <strong>Mis je emails?</strong> Voeg <strong>${senderEmail}</strong> toe aan je adressenboek.
      </p>
    `, 'amber')}

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94a3b8; line-height: 1.6;">
      <span>
        Je ontvangt deze nieuwsbrief omdat je je hebt aangemeld via weareimpact.nl.
      </span>
      <a href="${unsubscribeUrl}" style="color: #ea580c; text-decoration: none; white-space: nowrap;">Afmelden</a>
    </div>
  `.trim();

  const html = emailShell({
    preheader: previewText || 'Nieuwe updates from WeAreImpact',
    title: subject,
    subtitle: senderName,
    body,
    footerNote: `© ${new Date().getFullYear()} WeAreImpact — AI, welzijn en sociale innovatie`,
  });

  const text = contentText || stripHtml(contentHtml);
  const fullText = `
${subject}
${previewText ? previewText : ''}
=================================================

${text}

---

Deze nieuwsbrief is verzonden door ${senderName} via WeAreImpact.nl.
Je kunt jezelf op elk moment afmelden: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text: fullText, unsubscribeUrl };
}

/**
 * Process HTML content: append UTM params to all external links, then
 * (optionally) route them through a click-tracking redirect.
 */
function processLinks(
  html: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string,
  wrapClick?: (url: string) => string,
): string {
  return html.replace(
    /<a\s+(?:[^>]*?\s+)?href=(["'])((?!\1|mailto:|tel:|#).+?)\1([^>]*)>/gi,
    (match, quote, url, rest) => {
      let trackedUrl = url;
      if (!url.includes('utm_')) {
        const separator = url.includes('?') ? '&' : '?';
        trackedUrl = `${url}${separator}utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;
      }
      if (wrapClick) {
        trackedUrl = wrapClick(trackedUrl);
      }
      return `<a href="${trackedUrl}"${rest}>`;
    }
  );
}
