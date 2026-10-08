/**
 * WeAreImpact email house-style — single source of truth.
 *
 * Outlook-safe: PNG logo (no .webp), no linear-gradient dependency
 * (gradient allowed only as progressive enhancement AFTER a solid
 * background-color fallback), bulletproof button (nested <table>).
 *
 * Tokens mirror src/app/globals.css:
 *   cream bg   #FDFBF7
 *   ink        #0f172a (slate-900)
 *   body text  #334155 (slate-700)
 *   muted      #64748b (slate-500)
 *   orange      #f97316 (500) / #ea580c (600)
 *   orange-50   #fff7ed   orange-100 #ffedd5   orange-200 #fed7aa
 */

const WEB_BASE = 'https://weareimpact.nl';

export const EMAIL_COLORS = {
  cream: '#FDFBF7',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  orange: '#f97316',
  orangeDark: '#ea580c',
  orange50: '#fff7ed',
  orange100: '#ffedd5',
  orange200: '#fed7aa',
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface EmailLayoutOptions {
  /** Preheader / preview text (optional). */
  preheader?: string;
  /** Main heading shown in the cream header band. */
  title: string;
  /** Optional sub-line under the title. */
  subtitle?: string;
  /** Inner HTML of the white content area (between header and footer). */
  body: string;
  /** Footer note line(s); defaults to the standard WeAreImpact line. */
  footerNote?: string;
}

/** Cream header band with heart logo + wordmark + title. */
function renderHeader(title: string, subtitle?: string): string {
  return `
          <tr>
            <td style="background-color: #FDFBF7; padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #fed7aa;">
              <img src="${WEB_BASE}/WeAreImpact_hart.png" alt="WeAreImpact" width="52" height="52" style="display: block; margin: 0 auto 12px; width: 52px; height: 52px;" />
              <p style="margin: 0 0 14px; font-size: 17px; font-weight: 700; letter-spacing: -0.3px; color: #0f172a;">
                WeAreImpact
              </p>
              <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                ${title}
              </h1>
              ${subtitle ? `<p style="margin: 10px 0 0; color: #334155; font-size: 16px;">${subtitle}</p>` : ''}
            </td>
          </tr>`;
}

/** Standard footer. */
function renderFooter(note?: string): string {
  const noteHtml = note
    ? `<p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-align: center; line-height: 1.6;">${note}</p>`
    : '';
  return `
          <tr>
            <td style="background-color: #FDFBF7; padding: 24px 40px; border-top: 1px solid #fed7aa;">
              ${noteHtml}
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                <a href="${WEB_BASE}" style="color: #ea580c; text-decoration: none; font-weight: 600;">weareimpact.nl</a>
                &nbsp;·&nbsp;
                <a href="mailto:v.munster@weareimpact.nl" style="color: #ea580c; text-decoration: none; font-weight: 600;">v.munster@weareimpact.nl</a>
              </p>
            </td>
          </tr>`;
}

/** Bulletproof orange CTA button (Outlook-safe). */
export function emailButton(label: string, href: string): string {
  return `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 8px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="border-radius: 8px; background-color: #ea580c;">
                      <tr>
                        <td align="center" style="padding: 16px 44px;">
                          <a href="${href}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; white-space: nowrap;">${label}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>`;
}

/** Quote-style card: orange-50 background + orange left border (site blockquote). */
export function emailCard(innerHtml: string, tone: 'orange' | 'amber' = 'orange'): string {
  const bg = tone === 'amber' ? '#ffedd5' : '#fff7ed';
  const border = tone === 'amber' ? '#ea580c' : '#f97316';
  return `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bg}; border-left: 4px solid ${border}; border-radius: 0 12px 12px 0; margin: 0 0 28px;">
                <tr>
                  <td style="padding: 22px 24px;">${innerHtml}</td>
                </tr>
              </table>`;
}

export function emailShell(opts: EmailLayoutOptions): string {
  const preheader = opts.preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #FDFBF7; opacity: 0;">${opts.preheader}</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: ${FONT_STACK}; background-color: #FDFBF7; color: #334155;">
${preheader}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFBF7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #fed7aa; border-radius: 16px; overflow: hidden;">
${renderHeader(opts.title, opts.subtitle)}
          <tr>
            <td style="padding: 40px;">
${opts.body}
            </td>
          </tr>
${renderFooter(opts.footerNote)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/** Shared signature block. */
/**
 * Vaste handtekening van Vincent, gelijk aan de handtekening in Outlook: groet, logo met
 * woordmerk en slogan, oranje lijn, naam en contactregels. Outlook-safe (tabellen, inline stijlen).
 * Geef `false` mee als de mail zelf al een afsluitende groet heeft ("Tot snel,").
 */
export function emailSignature(greeting: string | false = 'Hartelijke groet,'): string {
  const rows: [string, string][] = [
    ['T', '06 - 144 709 77'],
    ['E', `<a href="mailto:v.munster@weareimpact.nl" style="color: #0f172a; text-decoration: none;">v.munster@weareimpact.nl</a>`],
    ['W', `<a href="${WEB_BASE}" style="color: #0f172a; text-decoration: none;">weareimpact.nl</a>`],
    ['L', '<a href="https://www.linkedin.com/in/vincent-van-m%C3%BCnster" style="color: #0f172a; text-decoration: none;">in/vincent-van-münster</a>'],
  ];
  const contact = rows
    .map(
      ([k, v]) => `
                  <tr>
                    <td style="padding: 1px 14px 1px 0; font-size: 13px; line-height: 1.5; color: #0f172a; width: 16px;">${k}</td>
                    <td style="padding: 1px 0; font-size: 13px; line-height: 1.5; color: #0f172a;">${v}</td>
                  </tr>`,
    )
    .join('');
  return `
              ${greeting ? `<p style="margin: 28px 0 14px; font-size: 16px; line-height: 1.6; color: #0f172a;">${greeting}</p>` : '<div style="height: 14px; line-height: 14px;">&nbsp;</div>'}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: ${FONT_STACK};">
                <tr>
                  <td style="padding: 0 14px 0 0; vertical-align: middle;">
                    <img src="${WEB_BASE}/WeAreImpact_hart.png" alt="WeAreImpact" width="52" height="47" style="display: block; width: 52px; height: 47px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 26px; line-height: 1.1; font-weight: 700; color: #0f172a;">WeAre<span style="color: #ea580c;">Impact</span></div>
                    <div style="margin-top: 4px; font-size: 13px; line-height: 1.3; font-style: italic; color: #0f172a;">Procesversneller voor sociale en duurzame ondernemers.</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="420" style="border-collapse: collapse; margin: 14px 0 16px; max-width: 100%;">
                <tr>
                  <td width="88" height="2" style="width: 88px; height: 2px; line-height: 2px; font-size: 2px; background-color: #ea580c;">&nbsp;</td>
                  <td height="2" style="height: 2px; line-height: 2px; font-size: 2px; background-color: #e2e8f0;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; font-family: ${FONT_STACK}; font-size: 17px; line-height: 1.3; font-weight: 700; color: #0f172a;">Vincent van Munster</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: ${FONT_STACK};">${contact}
              </table>`;
}
