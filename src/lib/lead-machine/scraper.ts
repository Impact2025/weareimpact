const EMAIL_RE = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}\b/g;
const PHONE_RE = /(?:tel:|href=["']tel:)?(\+31|0031|0)[- .]?[1-9][0-9]{1,2}[- .]?[0-9]{6,8}/g;

const SKIP_EMAIL_PATTERNS = ['@sentry.', '@w3.org', '@example.', '@schema.', 'noreply@', 'no-reply@'];

function isValidEmail(email: string): boolean {
  if (email.length > 80) return false;
  if (/\.(png|jpg|gif|svg|css|js|woff)$/i.test(email)) return false;
  return !SKIP_EMAIL_PATTERNS.some((p) => email.includes(p));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('31')) return `+${digits}`;
  if (digits.startsWith('0')) return `+31${digits.slice(1)}`;
  return raw;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export async function scrapeContactInfo(websiteUrl: string): Promise<ContactInfo> {
  if (!websiteUrl) return {};

  const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WeAreImpactBot/1.0; +https://weareimpact.nl)' },
      redirect: 'follow',
    });

    if (!res.ok) return {};

    const html = await res.text();

    // Prefer mailto: links — most reliable
    const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6})/);
    let email: string | undefined;
    if (mailtoMatch && isValidEmail(mailtoMatch[1])) {
      email = mailtoMatch[1];
    } else {
      const candidates = [...(html.match(EMAIL_RE) ?? [])].filter(isValidEmail);
      // Prefer info@ / contact@ / administratie@ over random matches
      email =
        candidates.find((e) => /^(info|contact|administratie|secretariaat|welzijn)@/i.test(e)) ??
        candidates[0];
    }

    let phone: string | undefined;
    const phoneMatches = html.match(PHONE_RE);
    if (phoneMatches?.[0]) {
      phone = normalizePhone(phoneMatches[0].replace(/[^\d+]/g, ''));
    }

    return { email, phone };
  } catch {
    return {};
  }
}

// Scrape a batch with concurrency limit
export async function scrapeMany(
  items: Array<{ kvkNumber: string; website?: string }>,
  concurrency = 5,
): Promise<Map<string, ContactInfo>> {
  const result = new Map<string, ContactInfo>();
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!;
      result.set(item.kvkNumber, item.website ? await scrapeContactInfo(item.website) : {});
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return result;
}
