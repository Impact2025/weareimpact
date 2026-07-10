import { emailShell, emailButton, emailCard, emailSignature } from './emailLayout';

interface ScanReportData {
  email: string;
  naam?: string;
  organisatie?: string;
  sectorName: string;
  challengeLabel: string;
  /** Het door AI gegenereerde advies (markdown/plain). */
  advies: string;
}

/**
 * Zet het markdown-advies om naar simpele, e-mail-veilige HTML.
 * Ondersteunt: ## headers, genummerde lijst, **bold**.
 */
function adviceToHtml(advies: string): string {
  const lines = advies.split('\n');
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push('</table>');
      inList = false;
    }
  };

  const inline = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;">$1</strong>');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      out.push(
        `<p style="margin:24px 0 10px;font-size:13px;color:#0f172a;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">${inline(
          line.slice(3)
        )}</p>`
      );
      continue;
    }
    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      if (!inList) {
        out.push('<table width="100%" cellpadding="0" cellspacing="0">');
        inList = true;
      }
      out.push(
        `<tr><td style="padding:6px 0;font-size:15px;color:#1e293b;line-height:1.6;"><strong style="color:#f97316;">${numbered[1]}.</strong> ${inline(
          numbered[2]
        )}</td></tr>`
      );
      continue;
    }
    closeList();
    out.push(
      `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">${inline(
        line
      )}</p>`
    );
  }
  closeList();
  return out.join('\n');
}

export function generateScanReportEmail(data: ScanReportData): {
  subject: string;
  html: string;
  text: string;
} {
  const hi = data.naam ? `Hoi ${data.naam.split(' ')[0]}` : 'Hoi';
  const orgSuffix = data.organisatie ? ` (${data.organisatie})` : '';
  const subject = `Jouw AI-scan resultaat voor ${data.sectorName}`;

  const body = `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #334155;">
                ${hi}${orgSuffix},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Bedankt voor het doen van de AI-scan. Hieronder vind je jouw persoonlijke analyse — afgestemd op <strong style="color:#0f172a;">${data.sectorName}</strong> en jouw grootste energielek: <strong style="color:#0f172a;">${data.challengeLabel}</strong>.
              </p>

              ${emailCard(adviceToHtml(data.advies))}

              <p style="margin: 24px 0 8px; font-size: 16px; line-height: 1.6; color: #334155;">
                Wil je deze kansen samen doornemen en vertalen naar een concreet plan? Plan een gratis gesprek van 30 minuten — geen verkooppraatje, gewoon een eerlijk gesprek over wat AI voor ${data.organisatie || 'jouw organisatie'} kan betekenen.
              </p>

              ${emailButton('Plan een gratis gesprek (30 min)', 'https://weareimpact.nl/ai-scan#scan')}

              ${emailSignature()}
              <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; font-style: italic;">
                PS: Vragen over je resultaat? Reply gewoon op deze mail — dan kijk ik met je mee.
              </p>
  `.trim();

  const html = emailShell({
    preheader: `Jouw persoonlijke AI-scan resultaat voor ${data.sectorName} — 3 concrete kansen + quick win.`,
    title: 'Jouw AI-scan resultaat',
    subtitle: `${data.sectorName} · ${data.challengeLabel}`,
    body,
  });

  const text = `
JOUW AI-SCAN RESULTAAT
${data.sectorName} · ${data.challengeLabel}

${hi}${orgSuffix},

Bedankt voor het doen van de AI-scan. Hier is jouw persoonlijke analyse:

${data.advies}

------------------------------------
Wil je deze kansen samen doornemen? Plan een gratis gesprek van 30 minuten:
https://weareimpact.nl/ai-scan#scan

Vincent van Munster
WeAreImpact.nl

PS: Vragen over je resultaat? Reply gewoon op deze mail.
  `.trim();

  return { subject, html, text };
}
