// Publicatie-guard: vangt de fouten af die de AI-pipeline structureel maakt.
//
// Aanleiding (aug 2026): gepubliceerde artikelen bevatten verzonnen bronnen met
// niet-bestaande URL's, een verzonnen auteur ("Jeroen van der Meer, senior
// AI-adviseur bij WeAreImpact") en een titel die per ongeluk de eerste H2 van
// het artikel was. Dat soort fouten hoort niet live te komen.

export type GuardSeverity = 'blocking' | 'warning';

export interface GuardIssue {
  code: string;
  severity: GuardSeverity;
  message: string;
  detail?: string;
}

export interface GuardInput {
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  excerpt?: string;
}

export interface GuardResult {
  ok: boolean;
  blocking: GuardIssue[];
  warnings: GuardIssue[];
  checkedLinks: Array<{ url: string; status: number | 'onbereikbaar' }>;
}

/** Namen die als auteur onder een artikel mogen staan. */
const ALLOWED_AUTHORS = (process.env.CONTENT_GUARD_AUTHORS ?? 'Vincent van Munster,WeAreImpact')
  .split(',')
  .map((n) => n.trim().toLowerCase())
  .filter(Boolean);

/** Hosts die bots blokkeren; een 403 daar zegt niets over de link zelf. */
const BOT_BLOCKING_HOSTS = ['akamai.com', 'bcorporation.net', 'linkedin.com', 'mckinsey.com'];

const stripTags = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function externalLinks(content: string): string[] {
  const urls = new Set<string>();
  for (const m of content.matchAll(/href="(https?:\/\/[^"]+)"/gi)) {
    const url = m[1];
    if (/^https?:\/\/(www\.)?weareimpact\.nl/i.test(url)) continue;
    urls.add(url);
  }
  return [...urls];
}

async function checkLink(url: string, timeoutMs = 8000): Promise<number | 'onbereikbaar'> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; WeAreImpact-linkcheck/1.0)' },
      });
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const head = await attempt('HEAD');
    // Sommige servers staan HEAD niet toe; probeer dan alsnog GET.
    if (head === 405 || head === 501) return await attempt('GET');
    return head;
  } catch {
    try {
      return await attempt('GET');
    } catch {
      return 'onbereikbaar';
    }
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function guardArticle(input: GuardInput): Promise<GuardResult> {
  const blocking: GuardIssue[] = [];
  const warnings: GuardIssue[] = [];
  const { title, content } = input;

  // --- 1. Externe bronlinks moeten bestaan -------------------------------
  const links = externalLinks(content);
  const statuses = await mapWithConcurrency(links, 5, checkLink);
  const checkedLinks = links.map((url, i) => ({ url, status: statuses[i] }));

  for (const { url, status } of checkedLinks) {
    const host = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch {
        return '';
      }
    })();
    const botBlocked = BOT_BLOCKING_HOSTS.some((h) => host.endsWith(h));

    if (status === 'onbereikbaar') {
      warnings.push({
        code: 'link-onbereikbaar',
        severity: 'warning',
        message: `Bronlink niet te bereiken: ${url}`,
        detail: 'Controleer handmatig of deze bron bestaat.',
      });
    } else if (status === 404 || status === 410) {
      blocking.push({
        code: 'link-dood',
        severity: 'blocking',
        message: `Bronlink geeft ${status}: ${url}`,
        detail:
          'Een dode bronlink betekent meestal dat ook de claim erboven verzonnen is. Controleer het cijfer voordat je publiceert.',
      });
    } else if (status === 403 && !botBlocked) {
      warnings.push({
        code: 'link-geweigerd',
        severity: 'warning',
        message: `Bronlink geeft 403: ${url}`,
      });
    }
  }

  // --- 2. Geen verzonnen auteurs ------------------------------------------
  const text = stripTags(content);
  // Bewust zonder /i-vlag: met die vlag matcht [A-Z] ook kleine letters, waardoor
  // de naam doorloopt in de rest van de zin ("Vincent van Munster en wordt ...").
  // Naamdelen bevatten geen punt, zodat een zinseinde de match afkapt.
  const authorPatterns = [
    /(?:[Dd]it (?:artikel|gastbericht) is )?[Gg]eschreven door\s+([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
    /[Aa]uteur:\s*([A-Z][\wÀ-ÿ'’-]*(?:\s+(?:(?:van|de|der|den|het|ter|te)\s+)*[A-Z][\wÀ-ÿ'’-]*){0,3})/,
  ];
  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const name = match[1].trim();
    // De naam kan doorlopen in de kop die erop volgt ("Vincent van Munster Hoe
    // maak je..."), omdat de HTML tot platte tekst is gestript. Een toegestane
    // auteur aan het begin van de match telt daarom als toegestaan.
    const lower = name.toLowerCase();
    const isAllowed = ALLOWED_AUTHORS.some((a) => lower === a || lower.startsWith(a + ' '));
    if (!isAllowed) {
      blocking.push({
        code: 'auteur-onbekend',
        severity: 'blocking',
        message: `Onbekende auteur in de tekst: "${name}"`,
        detail: `Toegestaan: ${ALLOWED_AUTHORS.join(', ')}. Voeg de naam toe aan CONTENT_GUARD_AUTHORS of haal de regel weg.`,
      });
    }
  }

  // --- 3. Titel mag geen tussenkop uit het artikel zijn -------------------
  // Een H1 die de titel herhaalt is redundant maar onschuldig (en wordt bij
  // publicatie weggehaald). Een H2 als titel betekent dat een tussenkop is
  // aangezien voor de titel van het artikel — dat is een echte fout.
  const firstHeading = content.match(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/i);
  if (firstHeading) {
    const level = firstHeading[1];
    const headingText = stripTags(firstHeading[2]);
    const isDuplicate = headingText && headingText.toLowerCase() === title.trim().toLowerCase();
    if (isDuplicate && level === '2') {
      blocking.push({
        code: 'titel-is-tussenkop',
        severity: 'blocking',
        message: 'De titel is identiek aan de eerste tussenkop (H2) van het artikel',
        detail:
          'Dit gebeurt als de titel automatisch uit de content is gehaald. Geef een echte artikeltitel mee.',
      });
    } else if (isDuplicate) {
      warnings.push({
        code: 'titel-herhaald-in-h1',
        severity: 'warning',
        message: 'De content begint met een H1 die de titel herhaalt; die wordt verwijderd',
      });
    }
  }
  if (/^\s*\d+\.\s/.test(title)) {
    blocking.push({
      code: 'titel-genummerd',
      severity: 'blocking',
      message: `De titel begint met een lijstnummer: "${title.slice(0, 50)}"`,
      detail: 'Vrijwel altijd een teken dat een tussenkop als titel is gebruikt.',
    });
  }

  // --- 4. Restanten van het generatieproces --------------------------------
  if (/<p>\s*<strong>\s*Interne links:/i.test(content)) {
    blocking.push({
      code: 'generatie-restant',
      severity: 'blocking',
      message: 'Het blok "Interne links:" staat nog als zichtbare tekst in het artikel',
    });
  }
  if (/Redactie WeAreImpact/i.test(text)) {
    warnings.push({
      code: 'redactie-byline',
      severity: 'warning',
      message: '"Redactie WeAreImpact" staat in de tekst; gebruik een echte auteursnaam',
    });
  }

  // --- 5. Koppen en metadata ----------------------------------------------
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count > 0) {
    warnings.push({
      code: 'dubbele-h1',
      severity: 'warning',
      message: `Content bevat ${h1Count} <h1>; de blogtemplate rendert de titel al als H1`,
    });
  }
  const faqSections = (content.match(/<h2[^>]*>\s*Veelgestelde vragen/gi) || []).length;
  if (faqSections > 1) {
    warnings.push({
      code: 'dubbele-faq',
      severity: 'warning',
      message: `${faqSections} FAQ-secties in één artikel`,
    });
  }

  const seoTitle = input.seoTitle?.trim();
  if (seoTitle && seoTitle.length > 60) {
    warnings.push({
      code: 'seo-title-lang',
      severity: 'warning',
      message: `seo_title is ${seoTitle.length} tekens (Google kapt af rond 60)`,
    });
  }
  const seoDescription = input.seoDescription?.trim();
  if (seoDescription && seoDescription.length > 160) {
    warnings.push({
      code: 'seo-description-lang',
      severity: 'warning',
      message: `seo_description is ${seoDescription.length} tekens (Google kapt af rond 160)`,
    });
  }
  for (const [label, value] of [
    ['excerpt', input.excerpt],
    ['seo_description', seoDescription],
  ] as const) {
    if (value && /[…]$|\.\.\.$|\s\S{1,3}$/.test(value.trim()) && !/[.!?]$/.test(value.trim())) {
      warnings.push({
        code: 'tekst-afgekapt',
        severity: 'warning',
        message: `${label} lijkt middenin af te breken: "...${value.trim().slice(-40)}"`,
      });
    }
  }

  // --- 6. Cijfers met een bron-bewering maar zonder link -------------------
  const citationClaim =
    /(?:volgens|uit)\s+(?:het\s+|de\s+|een\s+)?(?:onderzoek|rapport|cijfers|publicatie|monitor|studie)[^.]{0,120}?\d/gi;
  const claims = text.match(citationClaim) || [];
  if (claims.length > 0 && links.length === 0) {
    warnings.push({
      code: 'bron-zonder-link',
      severity: 'warning',
      message: `${claims.length} cijfer(s) worden aan een bron toegeschreven zonder dat er een bronlink in het artikel staat`,
      detail: claims.slice(0, 3).map((c) => c.trim()).join(' | '),
    });
  }

  return { ok: blocking.length === 0, blocking, warnings, checkedLinks };
}
