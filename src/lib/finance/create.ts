import { sql } from '@/lib/db/neon';
import { getFinanceSettings } from './settings';
import { applyClientName, getTemplate } from './templates';
import { EMPTY_PARTY, getClientParty, insertQuote, makeReference } from './store';
import type { Party, Quote } from './types';

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Nieuwe conceptofferte uit een sjabloon. Vanuit een deal of bedrijf worden de
 * klantgegevens (juridische naam, KvK, tekenbevoegde) alvast ingevuld.
 */
export async function createQuoteFromTemplate(opts: {
  templateKey: string;
  dealId?: string | null;
  companyId?: string | null;
  contactId?: string | null;
}): Promise<Quote> {
  const settings = await getFinanceSettings();
  let { companyId = null, contactId = null } = opts;
  const dealId = opts.dealId ?? null;
  let dealTitle: string | null = null;

  if (dealId) {
    const [deal] = await sql`SELECT company_id, contact_id, title FROM deals WHERE id = ${dealId}`;
    if (deal) {
      companyId = companyId ?? (deal.company_id as string | null);
      contactId = contactId ?? (deal.contact_id as string | null);
      dealTitle = deal.title as string;
    }
  }

  const client: Party = companyId ? await getClientParty(companyId, contactId) : { ...EMPTY_PARTY };
  const tpl = applyClientName(getTemplate(opts.templateKey), client.legalName || 'de opdrachtgever');
  const now = new Date();
  const valid = new Date(now.getTime() + settings.quoteValidDays * 86_400_000);
  void dealTitle;

  return insertQuote({
    reference: await makeReference(client.legalName || tpl.title, now),
    title: tpl.title,
    subtitle: tpl.subtitle,
    dealId,
    companyId,
    contactId,
    client,
    issuedOn: isoDay(now),
    validUntil: isoDay(valid),
    sections: tpl.sections,
    lines: tpl.lines,
    schedule: tpl.schedule,
    vatRate: settings.vatRate,
  });
}

/** Nieuwe versie van een bestaande offerte (bv. na aanpassing). De oude blijft ongewijzigd staan. */
export async function duplicateQuote(source: Quote): Promise<Quote> {
  const settings = await getFinanceSettings();
  const now = new Date();
  const base = source.reference.replace(/-v\d+$/, '');
  const rows = await sql`SELECT reference FROM quotes WHERE reference = ${base} OR reference LIKE ${base + '-v%'}`;
  const nextVersion = rows.length + 1;
  const valid = new Date(now.getTime() + settings.quoteValidDays * 86_400_000);
  const copy = await insertQuote({
    reference: `${base}-v${nextVersion}`,
    title: source.title,
    subtitle: source.subtitle,
    dealId: source.dealId,
    companyId: source.companyId,
    contactId: source.contactId,
    client: source.client,
    issuedOn: isoDay(now),
    validUntil: isoDay(valid),
    sections: source.sections,
    lines: source.lines,
    schedule: source.schedule,
    vatRate: source.vatRate,
  });
  await sql`UPDATE quotes SET version = ${nextVersion} WHERE id = ${copy.id}`;
  return { ...copy, version: nextVersion };
}
