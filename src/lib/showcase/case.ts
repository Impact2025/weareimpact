import { randomBytes } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { showcaseReviewEmail } from '@/lib/email/templates/showcase';
import { buildCaseDraft, ShowcaseError, type CaseDraft } from './flow';
import { ensureShowcaseSchema } from './schema';

const WEB_BASE = 'https://weareimpact.nl';
const OWNER_EMAIL = 'v.munster@weareimpact.nl';

export type CaseStatus = 'concept' | 'klant_review' | 'klant_akkoord' | 'gepubliceerd' | 'ingetrokken';

/** Exact wat de klant goedkeurt en wat later gepubliceerd wordt. Wijzigen na goedkeuring vraagt een nieuwe ronde. */
export interface CaseSnapshot {
  headline: string;
  intro: string;
  displayName: string;
  authorLine: string | null;
  quotes: { text: string; context: string }[];
  hoursBefore: number | null;
  hoursAfter: number | null;
  facts: string[];
  anonymous: boolean;
}

export interface CaseRecord {
  dealId: string;
  companyId: string | null;
  consent: 'onbekend' | 'naam' | 'anoniem' | 'nee';
  status: CaseStatus;
  slug: string | null;
  headline: string;
  intro: string;
  displayName: string;
  authorName: string;
  authorRole: string;
  quoteKeys: string[];
  snapshot: CaseSnapshot | null;
  reviewToken: string | null;
  reviewSentAt: string | null;
  clientComment: string | null;
  approvedAt: string | null;
  approvedName: string | null;
  publishedAt: string | null;
}

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);

function toCase(r: Row): CaseRecord {
  return {
    dealId: r.deal_id as string,
    companyId: (r.company_id as string) ?? null,
    consent: ((r.consent as string) ?? 'onbekend') as CaseRecord['consent'],
    status: ((r.status as string) ?? 'concept') as CaseStatus,
    slug: (r.slug as string) ?? null,
    headline: (r.headline as string) ?? '',
    intro: (r.intro as string) ?? '',
    displayName: (r.display_name as string) ?? '',
    authorName: (r.author_name as string) ?? '',
    authorRole: (r.author_role as string) ?? '',
    quoteKeys: (r.quote_keys as string[]) ?? [],
    snapshot: (r.snapshot as CaseSnapshot) ?? null,
    reviewToken: (r.review_token as string) ?? null,
    reviewSentAt: iso(r.review_sent_at),
    clientComment: (r.client_comment as string) ?? null,
    approvedAt: iso(r.approved_at),
    approvedName: (r.approved_name as string) ?? null,
    publishedAt: iso(r.published_at),
  };
}

const newToken = () => randomBytes(24).toString('base64url');

const slugify = (v: string) =>
  v
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

export async function getCase(dealId: string): Promise<CaseRecord | null> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_cases WHERE deal_id = ${dealId}`;
  return rows[0] ? toCase(rows[0]) : null;
}

async function ensureCaseRow(dealId: string): Promise<CaseRecord> {
  await ensureShowcaseSchema();
  const [deal] = await sql`SELECT company_id FROM deals WHERE id = ${dealId}`;
  if (!deal) throw new ShowcaseError('Deal niet gevonden.');
  await sql`INSERT INTO showcase_cases (deal_id, company_id) VALUES (${dealId}, ${deal.company_id}) ON CONFLICT (deal_id) DO NOTHING`;
  return (await getCase(dealId))!;
}

// ---------- redactie ----------

export interface CaseEdit {
  headline?: string;
  intro?: string;
  displayName?: string;
  authorName?: string;
  authorRole?: string;
  quoteKeys?: string[];
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\s+\n/g, '\n').trim().slice(0, n) : '');

/** Slaat de redactie op. Een wijziging na het versturen of goedkeuren zet de showcase terug naar concept: de klant moet opnieuw kijken. */
export async function saveCase(dealId: string, edit: CaseEdit): Promise<CaseRecord> {
  const current = await ensureCaseRow(dealId);
  if (current.status === 'gepubliceerd') throw new ShowcaseError('Trek de showcase eerst in voordat je hem wijzigt.');
  const next = {
    headline: edit.headline !== undefined ? clip(edit.headline, 140) : current.headline,
    intro: edit.intro !== undefined ? clip(edit.intro, 1200) : current.intro,
    displayName: edit.displayName !== undefined ? clip(edit.displayName, 80) : current.displayName,
    authorName: edit.authorName !== undefined ? clip(edit.authorName, 80) : current.authorName,
    authorRole: edit.authorRole !== undefined ? clip(edit.authorRole, 80) : current.authorRole,
    quoteKeys: edit.quoteKeys !== undefined ? edit.quoteKeys.filter((k) => typeof k === 'string').slice(0, 8) : current.quoteKeys,
  };
  const changed = JSON.stringify(next) !== JSON.stringify({
    headline: current.headline,
    intro: current.intro,
    displayName: current.displayName,
    authorName: current.authorName,
    authorRole: current.authorRole,
    quoteKeys: current.quoteKeys,
  });
  const reset = changed && ['klant_review', 'klant_akkoord', 'ingetrokken'].includes(current.status);
  await sql`
    UPDATE showcase_cases SET headline = ${next.headline}, intro = ${next.intro}, display_name = ${next.displayName},
      author_name = ${next.authorName}, author_role = ${next.authorRole}, quote_keys = ${JSON.stringify(next.quoteKeys)}::jsonb,
      status = ${reset ? 'concept' : current.status},
      review_token = ${reset ? null : current.reviewToken},
      snapshot = ${reset ? null : current.snapshot ? JSON.stringify(current.snapshot) : null}::jsonb,
      approved_at = ${reset ? null : current.approvedAt}, approved_name = ${reset ? null : current.approvedName},
      updated_at = NOW()
    WHERE deal_id = ${dealId}`;
  return (await getCase(dealId))!;
}

function factsFromDraft(draft: CaseDraft): string[] {
  const m = draft.metrics;
  const out: string[] = [];
  if (m.daysAcceptToLive != null) out.push(`${m.daysAcceptToLive} dagen van akkoord naar livegang`);
  if (m.daysEarlyVsPlan != null && m.daysEarlyVsPlan > 0) out.push(`${m.daysEarlyVsPlan} dagen eerder live dan gepland`);
  if (m.daysIntakeToQuote != null) out.push(`${m.daysIntakeToQuote} dagen van eerste gesprek naar voorstel`);
  return out;
}

/** Voorstel voor de intro, alleen op basis van letterlijke antwoorden en gemeten cijfers. Valt terug op een vaste zin. */
export async function suggestIntro(dealId: string): Promise<string> {
  const draft = await buildCaseDraft(dealId);
  const [co] = await sql`SELECT c.name FROM deals d JOIN companies c ON c.id = d.company_id WHERE d.id = ${dealId}`;
  const pain = draft.quotes.find((q) => q.moment === 'Na de intake');
  const facts = factsFromDraft(draft);
  const hours = draft.hoursBefore != null && draft.hoursAfter != null ? `${draft.hoursBefore} naar ${draft.hoursAfter} uur per week` : null;

  const fallback = [
    pain ? `Het begon met een concreet knelpunt: "${pain.text}"` : null,
    hours ? `Na de oplevering ging het van ${hours}.` : null,
  ]
    .filter(Boolean)
    .join(' ');
  if (!process.env.ANTHROPIC_API_KEY || (!pain && !hours)) return fallback;

  const prompt = `Schrijf een korte introductie (2 tot 3 zinnen, Nederlands, zakelijk, geen opsmuk) voor een klantvoorbeeld van WeAreImpact. Gebruik uitsluitend de feiten hieronder. Verzin niets, noem geen bedrijfsnaam en geen persoonsnaam, en geef geen cijfers die hieronder niet staan.

Feiten:
${pain ? `- Het knelpunt, in de woorden van de klant: "${pain.text}"` : ''}
${hours ? `- Resultaat: van ${hours}` : ''}
${facts.map((f) => `- ${f}`).join('\n')}

Geef alleen de tekst.`;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 15000, maxRetries: 1 });
    const res = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 400,
      // Dit model wil geen 'disabled'; 'between_tools' laat het zonder denkblok antwoorden.
      thinking: { type: 'between_tools' },
      messages: [{ role: 'user', content: prompt }],
    });
    const block = res.content.find((b) => b.type === 'text');
    const text = block && block.type === 'text' ? block.text.trim() : '';
    // Elk getal in de tekst moet uit de feiten komen.
    const allowed = new Set((`${pain?.text ?? ''} ${hours ?? ''} ${facts.join(' ')}`.match(/\d+/g) ?? []));
    const numbers = text.match(/\d+/g) ?? [];
    if (!text || numbers.some((n) => !allowed.has(n))) return fallback;
    if (co?.name && text.toLowerCase().includes(String(co.name).toLowerCase())) return fallback;
    return text;
  } catch (err) {
    console.error('Intro-voorstel mislukt:', err);
    return fallback;
  }
}

// ---------- naar de klant ----------

function buildSnapshot(c: CaseRecord, draft: CaseDraft): CaseSnapshot {
  const anonymous = c.consent === 'anoniem';
  const chosen = draft.quotes.filter((q) => c.quoteKeys.includes(q.key));
  const authorLine = anonymous
    ? c.authorRole || null
    : [c.authorName, c.authorRole && c.displayName ? `${c.authorRole}, ${c.displayName}` : c.authorRole || c.displayName].filter(Boolean).join(', ') || null;
  const hasHours = draft.hoursBefore != null && draft.hoursAfter != null && (draft.hoursSaved ?? 0) > 0;
  return {
    headline: c.headline,
    intro: c.intro,
    displayName: c.displayName,
    authorLine,
    quotes: chosen.map((q) => ({ text: q.text, context: q.moment })),
    hoursBefore: hasHours ? draft.hoursBefore : null,
    hoursAfter: hasHours ? draft.hoursAfter : null,
    facts: factsFromDraft(draft),
    anonymous,
  };
}

/** Controles voordat de tekst naar de klant gaat. */
export async function checkReadyForReview(dealId: string): Promise<string[]> {
  const c = await getCase(dealId);
  const problems: string[] = [];
  if (!c) return ['Er is nog geen concept.'];
  if (c.consent === 'onbekend') problems.push('De toestemming van de klant ontbreekt.');
  if (c.consent === 'nee') problems.push('De klant wil geen showcase.');
  if (!c.headline.trim()) problems.push('Voeg een kop toe.');
  if (!c.displayName.trim()) problems.push(c.consent === 'anoniem' ? 'Geef een anonieme omschrijving, bijvoorbeeld "een welzijnsorganisatie".' : 'Geef de naam zoals die op de site komt.');
  if (c.quoteKeys.length === 0) problems.push('Kies minstens één citaat.');
  if (c.consent === 'anoniem' && c.companyId) {
    const [co] = await sql`SELECT name FROM companies WHERE id = ${c.companyId}`;
    const name = String(co?.name ?? '').toLowerCase();
    const haystack = `${c.headline} ${c.intro} ${c.displayName} ${c.authorRole}`.toLowerCase();
    if (name && haystack.includes(name)) problems.push('Bij anoniem mag de bedrijfsnaam nergens in de tekst staan.');
    if (c.authorName.trim()) problems.push('Bij anoniem hoort geen persoonsnaam: laat het naamveld leeg.');
  }
  return problems;
}

export async function sendForReview(dealId: string): Promise<{ email: string }> {
  const problems = await checkReadyForReview(dealId);
  if (problems.length > 0) throw new ShowcaseError(problems.join(' '));
  const c = (await getCase(dealId))!;
  if (c.status === 'gepubliceerd') throw new ShowcaseError('Deze showcase is al gepubliceerd.');
  const draft = await buildCaseDraft(dealId);
  const snapshot = buildSnapshot(c, draft);

  const [contact] = await sql`
    SELECT co.first_name, co.email FROM deals d JOIN contacts co ON co.id = d.contact_id WHERE d.id = ${dealId}`;
  const fallback = c.companyId
    ? await sql`SELECT first_name, email FROM contacts WHERE company_id = ${c.companyId} AND email IS NOT NULL ORDER BY is_primary DESC, created_at ASC LIMIT 1`
    : [];
  const target = (contact?.email ? contact : fallback[0]) as Row | undefined;
  if (!target?.email) throw new ShowcaseError('Geen e-mailadres bij de contactpersoon.');

  const token = c.reviewToken ?? newToken();
  await sql`
    UPDATE showcase_cases SET status = 'klant_review', snapshot = ${JSON.stringify(snapshot)}::jsonb, review_token = ${token},
      review_sent_at = NOW(), client_comment = NULL, updated_at = NOW()
    WHERE deal_id = ${dealId}`;

  const mail = showcaseReviewEmail({ firstName: ((target.first_name as string) || '').trim() || null, url: `${WEB_BASE}/showcase-akkoord/${token}`, anonymous: snapshot.anonymous });
  const result = await sendEmail({ to: target.email as string, subject: mail.subject, html: mail.html, text: mail.text });
  if (!result.success) {
    await sql`UPDATE showcase_cases SET status = ${c.status === 'klant_review' ? 'klant_review' : 'concept'} WHERE deal_id = ${dealId}`;
    throw new ShowcaseError(result.error || 'Mail versturen mislukt.');
  }
  if (c.companyId) {
    await sql`
      INSERT INTO crm_activities (company_id, deal_id, type, subject, description)
      VALUES (${c.companyId}, ${dealId}, 'note', 'Showcase naar klant ter goedkeuring', ${`Naar ${target.email as string}.`})`;
  }
  return { email: target.email as string };
}

// ---------- de klant beslist ----------

export interface ReviewView {
  token: string;
  status: CaseStatus;
  snapshot: CaseSnapshot;
  firstName: string | null;
  decided: 'akkoord' | 'afgewezen' | null;
}

export async function getReviewView(token: string): Promise<ReviewView | null> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_cases WHERE review_token = ${token}`;
  if (rows.length === 0) return null;
  const c = toCase(rows[0]);
  if (!c.snapshot) return null;
  const [contact] = c.companyId
    ? await sql`SELECT first_name FROM contacts WHERE company_id = ${c.companyId} ORDER BY is_primary DESC, created_at ASC LIMIT 1`
    : [];
  return {
    token,
    status: c.status,
    snapshot: c.snapshot,
    firstName: ((contact?.first_name as string) || '').trim() || null,
    decided: c.status === 'klant_akkoord' || c.status === 'gepubliceerd' ? 'akkoord' : c.status === 'ingetrokken' ? 'afgewezen' : null,
  };
}

async function notifyOwner(dealId: string, companyId: string | null, subject: string, body: string, task?: { title: string; priority: string }) {
  try {
    await sendEmail({ to: OWNER_EMAIL, subject, html: `<p>${body.replace(/\n/g, '<br>')}</p><p><a href="${WEB_BASE}/admin/crm/bedrijven/${companyId ?? ''}">Open de showcase in admin</a></p>`, text: `${body}\n\n${WEB_BASE}/admin/crm/bedrijven/${companyId ?? ''}` });
  } catch (err) {
    console.error('Melding showcase mislukt:', err);
  }
  if (companyId) {
    await sql`INSERT INTO crm_activities (company_id, deal_id, type, subject, description) VALUES (${companyId}, ${dealId}, 'note', ${subject}, ${body})`;
    if (task) {
      await sql`
        INSERT INTO crm_tasks (company_id, deal_id, title, description, priority, status, due_date)
        VALUES (${companyId}, ${dealId}, ${task.title}, ${body}, ${task.priority}, 'pending', CURRENT_DATE)`;
    }
  }
}

export async function decideReview(
  token: string,
  decision: { action: 'akkoord'; name: string } | { action: 'opmerking'; text: string } | { action: 'afwijzen' },
): Promise<void> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_cases WHERE review_token = ${token}`;
  if (rows.length === 0) throw new ShowcaseError('Deze link is niet (meer) geldig.');
  const c = toCase(rows[0]);
  if (c.status !== 'klant_review') throw new ShowcaseError('Hier is al op gereageerd. Mail me gerust als je iets wilt wijzigen.');

  if (decision.action === 'akkoord') {
    const name = clip(decision.name, 120);
    if (name.length < 2) throw new ShowcaseError('Vul je naam in om akkoord te geven.');
    const hasHours = Boolean(c.snapshot?.hoursBefore != null && c.snapshot?.hoursAfter != null);
    await sql`
      UPDATE showcase_cases SET status = 'klant_akkoord', approved_at = NOW(), approved_name = ${name},
        hours_confirmed = ${hasHours ? true : false}, updated_at = NOW()
      WHERE deal_id = ${c.dealId} AND status = 'klant_review'`;
    await notifyOwner(c.dealId, c.companyId, 'Klant is akkoord met de showcase', `${name} heeft de showcase goedgekeurd. Je kunt hem nu publiceren.`, {
      title: 'Showcase gepubliceerd? Klant is akkoord',
      priority: 'high',
    });
  } else if (decision.action === 'opmerking') {
    const text = clip(decision.text, 1500);
    if (text.length < 3) throw new ShowcaseError('Typ eerst wat je anders wilt.');
    await sql`UPDATE showcase_cases SET status = 'concept', client_comment = ${text}, updated_at = NOW() WHERE deal_id = ${c.dealId} AND status = 'klant_review'`;
    await notifyOwner(c.dealId, c.companyId, 'Klant wil de showcase aanpassen', text, { title: 'Showcase aanpassen: opmerking van de klant', priority: 'high' });
  } else {
    await sql`
      UPDATE showcase_cases SET status = 'ingetrokken', consent = 'nee', consent_at = NOW(), updated_at = NOW()
      WHERE deal_id = ${c.dealId} AND status = 'klant_review'`;
    await notifyOwner(c.dealId, c.companyId, 'Klant wil geen showcase', 'De klant wil dit traject niet als voorbeeld laten zien. De toestemming staat nu op "nee".');
  }
}

// ---------- publiceren ----------

export async function publishCase(dealId: string): Promise<{ slug: string }> {
  const c = await getCase(dealId);
  if (!c) throw new ShowcaseError('Geen showcase gevonden.');
  if (c.status !== 'klant_akkoord') throw new ShowcaseError('De klant moet eerst akkoord geven op de tekst.');
  if (c.consent === 'nee' || c.consent === 'onbekend') throw new ShowcaseError('Zonder toestemming publiceren we niet.');
  if (!c.snapshot) throw new ShowcaseError('Er is geen goedgekeurde tekst.');

  let slug = c.slug;
  if (!slug) {
    const base = slugify(c.snapshot.headline) || slugify(c.snapshot.displayName) || 'showcase';
    slug = base;
    for (let i = 2; ; i++) {
      const taken = await sql`SELECT 1 FROM showcase_cases WHERE slug = ${slug} AND deal_id <> ${dealId}`;
      if (taken.length === 0) break;
      slug = `${base}-${i}`;
    }
  }
  await sql`UPDATE showcase_cases SET status = 'gepubliceerd', slug = ${slug}, published_at = NOW(), updated_at = NOW() WHERE deal_id = ${dealId}`;
  return { slug };
}

export async function unpublishCase(dealId: string): Promise<void> {
  await ensureShowcaseSchema();
  await sql`UPDATE showcase_cases SET status = 'ingetrokken', updated_at = NOW() WHERE deal_id = ${dealId} AND status = 'gepubliceerd'`;
}

export interface PublishedCase {
  slug: string;
  publishedAt: string;
  snapshot: CaseSnapshot;
}

export async function listPublished(): Promise<PublishedCase[]> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT slug, published_at, snapshot FROM showcase_cases WHERE status = 'gepubliceerd' AND slug IS NOT NULL AND snapshot IS NOT NULL ORDER BY published_at DESC`;
  return rows.map((r) => ({ slug: r.slug as string, publishedAt: iso(r.published_at)!, snapshot: r.snapshot as CaseSnapshot }));
}

export async function getPublished(slug: string): Promise<PublishedCase | null> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT slug, published_at, snapshot FROM showcase_cases WHERE status = 'gepubliceerd' AND slug = ${slug} AND snapshot IS NOT NULL`;
  const r = rows[0];
  return r ? { slug: r.slug as string, publishedAt: iso(r.published_at)!, snapshot: r.snapshot as CaseSnapshot } : null;
}
