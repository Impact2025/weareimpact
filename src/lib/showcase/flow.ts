import { randomBytes } from 'crypto';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { showcaseRequestEmail } from '@/lib/email/templates/showcase';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { submitFeedback } from '@/lib/crm/aftercare';
import { blockTime } from '@/lib/google-calendar';
import { amsterdamParts } from '@/lib/time/amsterdam';
import { ensureShowcaseSchema } from './schema';
import {
  APPOINTMENT_KIND_LABEL,
  MOMENTS,
  WORDS,
  cleanFollowup,
  fillName,
  isConcerning,
  isSendWindow,
  momentForAppointment,
  pickQuote,
  type Answers,
  type AppointmentKind,
  type MomentDef,
  type MomentKey,
  type Question,
} from './moments';

const WEB_BASE = 'https://weareimpact.nl';
const DAY = 86_400_000;
const HOUR = 3_600_000;

/** Alleen afspraken en livegangs vanaf deze dag leveren automatisch vraagmomenten op; bestaande klanten blijven met rust. */
export const SHOWCASE_START = new Date('2026-10-08T00:00:00+02:00');

export class ShowcaseError extends Error {}

const newToken = () => randomBytes(24).toString('base64url');

// ---------- types ----------

export type RequestStatus = 'klaar' | 'verstuurd' | 'beantwoord' | 'overgeslagen';

export interface ShowcaseRequest {
  id: string;
  token: string;
  moment: MomentKey;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  appointmentId: string | null;
  projectSlug: string | null;
  email: string | null;
  status: RequestStatus;
  context: RequestContext;
  answers: Answers;
  followupQuestion: string | null;
  followupAnswer: string | null;
  feedbackToken: string | null;
  createdAt: string;
  sentAt: string | null;
  answeredAt: string | null;
  followupAnsweredAt: string | null;
}

export interface RequestContext {
  scopeItems?: string[];
  pain?: string | null;
  hoursBefore?: number | null;
  companyName?: string | null;
}

export interface Appointment {
  id: string;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  projectSlug: string | null;
  kind: AppointmentKind;
  title: string;
  startsAt: string;
  endsAt: string;
  status: 'gepland' | 'geweest' | 'niet_doorgegaan';
  calendarEventId: string | null;
  bookingRequestId: string | null;
}

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);

function toRequest(r: Row): ShowcaseRequest {
  return {
    id: r.id as string,
    token: r.token as string,
    moment: r.moment as MomentKey,
    dealId: (r.deal_id as string) ?? null,
    companyId: (r.company_id as string) ?? null,
    contactId: (r.contact_id as string) ?? null,
    appointmentId: (r.appointment_id as string) ?? null,
    projectSlug: (r.project_slug as string) ?? null,
    email: (r.email as string) ?? null,
    status: r.status as RequestStatus,
    context: (r.context as RequestContext) ?? {},
    answers: (r.answers as Answers) ?? {},
    followupQuestion: (r.followup_question as string) ?? null,
    followupAnswer: (r.followup_answer as string) ?? null,
    feedbackToken: (r.feedback_token as string) ?? null,
    createdAt: iso(r.created_at)!,
    sentAt: iso(r.sent_at),
    answeredAt: iso(r.answered_at),
    followupAnsweredAt: iso(r.followup_answered_at),
  };
}

function toAppointment(r: Row): Appointment {
  return {
    id: r.id as string,
    dealId: (r.deal_id as string) ?? null,
    companyId: (r.company_id as string) ?? null,
    contactId: (r.contact_id as string) ?? null,
    projectSlug: (r.project_slug as string) ?? null,
    kind: r.kind as AppointmentKind,
    title: r.title as string,
    startsAt: iso(r.starts_at)!,
    endsAt: iso(r.ends_at)!,
    status: r.status as Appointment['status'],
    calendarEventId: (r.calendar_event_id as string) ?? null,
    bookingRequestId: (r.booking_request_id as string) ?? null,
  };
}

// ---------- CRM-hulpjes ----------

async function crmActivity(companyId: string | null, contactId: string | null, dealId: string | null, subject: string, description: string) {
  if (!companyId) return;
  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${companyId}, ${contactId}, ${dealId}, 'note', ${subject}, ${description})`;
}

async function crmTask(companyId: string | null, contactId: string | null, dealId: string | null, title: string, description: string, priority = 'normal') {
  if (!companyId) return;
  const dup = await sql`SELECT 1 FROM crm_tasks WHERE title = ${title} AND status <> 'completed' AND company_id = ${companyId} LIMIT 1`;
  if (dup.length > 0) return;
  await sql`
    INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, status, due_date)
    VALUES (${companyId}, ${contactId}, ${dealId}, ${title}, ${description}, ${priority}, 'pending', CURRENT_DATE)`;
}

/** De deal waar een afspraak of moment bij hoort: de meest recente niet-verloren deal van het bedrijf (liefst nog lopend). */
export async function resolveDealForCompany(companyId: string): Promise<string | null> {
  const rows = await sql`
    SELECT id FROM deals WHERE company_id = ${companyId} AND stage <> 'lost'
    ORDER BY (stage = 'won') ASC, updated_at DESC LIMIT 1`;
  return (rows[0]?.id as string) ?? null;
}

async function primaryContact(companyId: string, contactId?: string | null) {
  const rows = contactId
    ? await sql`SELECT id, first_name, email FROM contacts WHERE id = ${contactId}`
    : await sql`
        SELECT id, first_name, email FROM contacts
        WHERE company_id = ${companyId} AND email IS NOT NULL
        ORDER BY is_primary DESC, created_at ASC LIMIT 1`;
  const r = rows[0];
  if (!r) return null;
  return { id: r.id as string, firstName: ((r.first_name as string) || '').trim() || null, email: (r.email as string) || null };
}

// ---------- afspraken ----------

export async function createAppointment(input: {
  companyId: string;
  contactId?: string | null;
  dealId?: string | null;
  projectSlug?: string | null;
  kind: AppointmentKind;
  startsAt: Date;
  durationMin: number;
  title?: string;
  /** Zet de afspraak ook in de agenda (Google). Standaard aan. */
  calendar?: boolean;
  bookingRequestId?: string | null;
  calendarEventId?: string | null;
}): Promise<Appointment> {
  await ensureShowcaseSchema();
  if (Number.isNaN(input.startsAt.getTime())) throw new ShowcaseError('Ongeldige datum of tijd.');
  const endsAt = new Date(input.startsAt.getTime() + input.durationMin * 60_000);
  const dealId = input.dealId ?? (await resolveDealForCompany(input.companyId));
  const [company] = await sql`SELECT name FROM companies WHERE id = ${input.companyId}`;
  const title = input.title?.trim() || `${APPOINTMENT_KIND_LABEL[input.kind]} ${(company?.name as string) ?? ''}`.trim();

  let eventId = input.calendarEventId ?? null;
  if (!eventId && input.calendar !== false) {
    try {
      const res = await blockTime({
        title,
        startTime: input.startsAt.toISOString(),
        endTime: endsAt.toISOString(),
        description: `${APPOINTMENT_KIND_LABEL[input.kind]} met ${(company?.name as string) ?? 'klant'}.\nAdmin: ${WEB_BASE}/admin/crm/bedrijven/${input.companyId}`,
      });
      if (res.success) eventId = res.event?.id ?? null;
      else console.error('Agenda-afspraak mislukt:', res.error);
    } catch (err) {
      console.error('Agenda-afspraak mislukt:', err);
    }
  }

  const rows = await sql`
    INSERT INTO appointments (deal_id, company_id, contact_id, project_slug, kind, title, starts_at, ends_at, calendar_event_id, booking_request_id)
    VALUES (${dealId}, ${input.companyId}, ${input.contactId ?? null}, ${input.projectSlug ?? null}, ${input.kind}, ${title},
      ${input.startsAt.toISOString()}, ${endsAt.toISOString()}, ${eventId}, ${input.bookingRequestId ?? null})
    ON CONFLICT (booking_request_id) DO UPDATE SET title = EXCLUDED.title
    RETURNING *`;
  await crmActivity(
    input.companyId,
    input.contactId ?? null,
    dealId,
    `${APPOINTMENT_KIND_LABEL[input.kind]} gepland`,
    `${input.startsAt.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', dateStyle: 'long', timeStyle: 'short' })}.`,
  );
  return toAppointment(rows[0]);
}

export async function listAppointments(companyId: string): Promise<Appointment[]> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM appointments WHERE company_id = ${companyId} ORDER BY starts_at DESC`;
  return rows.map(toAppointment);
}

export async function setAppointmentStatus(id: string, status: 'gepland' | 'geweest' | 'niet_doorgegaan'): Promise<void> {
  await ensureShowcaseSchema();
  await sql`UPDATE appointments SET status = ${status} WHERE id = ${id}`;
}

// ---------- vraagmomenten aanmaken en versturen ----------

async function buildContext(dealId: string | null, companyId: string | null, moment: MomentKey): Promise<RequestContext> {
  const ctx: RequestContext = {};
  if (companyId) {
    const [c] = await sql`SELECT name FROM companies WHERE id = ${companyId}`;
    ctx.companyName = (c?.name as string) ?? null;
  }
  if (!dealId) return ctx;
  const [intake] = await sql`
    SELECT answers FROM showcase_requests WHERE deal_id = ${dealId} AND moment = 'intake' AND answered_at IS NOT NULL`;
  const a = (intake?.answers ?? {}) as Answers;
  ctx.pain = typeof a.pijn === 'string' ? a.pijn : null;
  const hours = Number(a.uren_voor);
  ctx.hoursBefore = Number.isFinite(hours) && a.uren_voor != null && a.uren_voor !== '' ? hours : null;

  if (moment === 'dag14') {
    const [q] = await sql`SELECT sections, lines FROM quotes WHERE deal_id = ${dealId} AND status = 'akkoord' ORDER BY accepted_at DESC LIMIT 1`;
    if (q) {
      const items: string[] = [];
      for (const s of (q.sections as { kind: string; items?: { title?: string }[] }[]) ?? []) {
        if (s.kind === 'phases') for (const i of s.items ?? []) if (i.title) items.push(i.title);
      }
      if (items.length === 0) {
        for (const l of (q.lines as { optional?: boolean; description?: string }[]) ?? []) {
          if (!l.optional && l.description) items.push(l.description);
        }
      }
      ctx.scopeItems = items.slice(0, 8);
    }
  }
  return ctx;
}

/** Maakt het vraagmoment aan (eenmalig per deal en moment) en geeft het bestaande terug als het er al is. */
export async function createRequest(input: {
  moment: MomentKey;
  dealId: string | null;
  companyId: string;
  contactId?: string | null;
  appointmentId?: string | null;
  projectSlug?: string | null;
}): Promise<{ request: ShowcaseRequest; created: boolean }> {
  await ensureShowcaseSchema();
  if (input.dealId) {
    const existing = await sql`SELECT * FROM showcase_requests WHERE deal_id = ${input.dealId} AND moment = ${input.moment}`;
    if (existing.length > 0) return { request: toRequest(existing[0]), created: false };
  }
  const contact = await primaryContact(input.companyId, input.contactId);
  const context = await buildContext(input.dealId, input.companyId, input.moment);
  const rows = await sql`
    INSERT INTO showcase_requests (token, moment, deal_id, company_id, contact_id, appointment_id, project_slug, email, context)
    VALUES (${newToken()}, ${input.moment}, ${input.dealId}, ${input.companyId}, ${contact?.id ?? input.contactId ?? null},
      ${input.appointmentId ?? null}, ${input.projectSlug ?? null}, ${contact?.email ?? null}, ${JSON.stringify(context)}::jsonb)
    ON CONFLICT DO NOTHING
    RETURNING *`;
  if (rows.length === 0 && input.dealId) {
    const again = await sql`SELECT * FROM showcase_requests WHERE deal_id = ${input.dealId} AND moment = ${input.moment}`;
    return { request: toRequest(again[0]), created: false };
  }
  return { request: toRequest(rows[0]), created: true };
}

async function getRequestById(id: string): Promise<ShowcaseRequest | null> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_requests WHERE id = ${id}`;
  return rows[0] ? toRequest(rows[0]) : null;
}

export async function listRequests(companyId: string): Promise<ShowcaseRequest[]> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_requests WHERE company_id = ${companyId} ORDER BY created_at ASC`;
  return rows.map(toRequest);
}

export type SendOutcome = 'verstuurd' | 'uitgesteld' | 'gestopt';

/**
 * Verstuurt het moment per mail. Beschermt de klant tegen vermoeidheid: niet twee mails binnen een dag,
 * en na twee onbeantwoorde vragen stoppen we. `force` (Vincent klikt zelf) slaat die twee regels over.
 */
export async function sendRequest(id: string, opts: { force?: boolean } = {}): Promise<SendOutcome> {
  const r = await getRequestById(id);
  if (!r) throw new ShowcaseError('Vraagmoment niet gevonden.');
  if (r.status !== 'klaar') throw new ShowcaseError('Dit vraagmoment is al verstuurd of afgehandeld.');
  if (!r.email) throw new ShowcaseError('Geen e-mailadres bij de contactpersoon.');

  if (!opts.force && r.companyId) {
    const [recent] = await sql`
      SELECT 1 FROM showcase_requests WHERE company_id = ${r.companyId} AND sent_at > NOW() - INTERVAL '20 hours' LIMIT 1`;
    if (recent) return 'uitgesteld';
    const [unanswered] = await sql`
      SELECT COUNT(*)::int AS n FROM showcase_requests
      WHERE company_id = ${r.companyId} AND status = 'verstuurd' AND sent_at > NOW() - INTERVAL '90 days'`;
    if (Number(unanswered?.n) >= 2) {
      await sql`UPDATE showcase_requests SET status = 'overgeslagen' WHERE id = ${id}`;
      await crmActivity(r.companyId, r.contactId, r.dealId, 'Showcase-vraag overgeslagen', 'Twee eerdere vragen zijn onbeantwoord gebleven; we sturen er geen derde.');
      return 'gestopt';
    }
  }

  const contact = r.companyId ? await primaryContact(r.companyId, r.contactId) : null;
  const url = `${WEB_BASE}/vraag/${r.token}`;
  const mail = showcaseRequestEmail({ moment: r.moment, firstName: contact?.firstName ?? null, url });
  const result = await sendEmail({ to: r.email, subject: mail.subject, html: mail.html, text: mail.text });
  if (!result.success) throw new ShowcaseError(result.error || 'Mail versturen mislukt.');

  // Bij dag 14 loopt de NPS door het bestaande nazorgsysteem, zodat lage en hoge scores dezelfde taken opleveren.
  let feedbackToken: string | null = null;
  if (r.moment === 'dag14' && r.companyId) {
    feedbackToken = newToken();
    await sql`
      INSERT INTO crm_feedback (token, company_id, contact_id, project_slug, deal_id, email)
      VALUES (${feedbackToken}, ${r.companyId}, ${r.contactId}, ${r.projectSlug}, ${r.dealId}, ${r.email})`;
  }
  await sql`UPDATE showcase_requests SET status = 'verstuurd', sent_at = NOW(), feedback_token = ${feedbackToken} WHERE id = ${id}`;
  await crmActivity(r.companyId, r.contactId, r.dealId, `Vraag verstuurd: ${MOMENTS[r.moment].name}`, `Naar ${r.email}.`);
  return 'verstuurd';
}

export async function skipRequest(id: string): Promise<void> {
  await ensureShowcaseSchema();
  await sql`UPDATE showcase_requests SET status = 'overgeslagen' WHERE id = ${id} AND status IN ('klaar','verstuurd')`;
}

/** Bij akkoord: het moment staat meteen klaar op de bedankpagina, zonder aparte mail. Geeft het token terug. */
export async function openAcceptMoment(dealId: string | null, companyId: string | null, contactId: string | null): Promise<string | null> {
  if (!companyId) return null;
  const { request } = await createRequest({ moment: 'akkoord', dealId, companyId, contactId });
  if (request.status === 'klaar') {
    await sql`UPDATE showcase_requests SET status = 'verstuurd', sent_at = NOW() WHERE id = ${request.id}`;
  }
  return request.token;
}

// ---------- de pagina voor de klant ----------

export interface RequestView {
  token: string;
  moment: MomentKey;
  heading: string;
  intro: string;
  questions: Question[];
  scopeItems: string[];
  status: RequestStatus;
  answered: boolean;
  followupQuestion: string | null;
  followupDone: boolean;
  thanks: string | null;
}

export async function getRequestView(token: string): Promise<RequestView | null> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_requests WHERE token = ${token}`;
  if (rows.length === 0) return null;
  const r = toRequest(rows[0]);
  if (r.status === 'klaar') return null; // nog niet verstuurd: niet bereikbaar
  const def = MOMENTS[r.moment];
  const contact = r.companyId ? await primaryContact(r.companyId, r.contactId) : null;
  const answered = r.status === 'beantwoord';
  return {
    token,
    moment: r.moment,
    heading: fillName(def.heading, contact?.firstName ?? null),
    intro: def.intro,
    questions: def.questions.filter((q) => (q.type === 'scope' ? (r.context.scopeItems?.length ?? 0) > 0 : true)),
    scopeItems: r.context.scopeItems ?? [],
    status: r.status,
    answered,
    followupQuestion: r.followupQuestion,
    followupDone: Boolean(r.followupAnsweredAt),
    thanks: answered ? thanksText(def, r) : null,
  };
}

function thanksText(def: MomentDef, r: ShowcaseRequest): string {
  const quote = pickQuote(r.answers);
  if (def.thanks.includes('{citaat}')) {
    return quote ? def.thanks.replace('{citaat}', quote) : 'Dank je wel. Ik neem je antwoord mee.';
  }
  return def.thanks;
}

// ---------- antwoorden verwerken ----------

const clip = (s: string, n: number) => s.replace(/\s+\n/g, '\n').trim().slice(0, n);

function sanitizeAnswers(def: MomentDef, raw: Record<string, unknown>, scopeItems: string[]): Answers {
  const out: Answers = {};
  for (const q of def.questions) {
    const v = raw[q.key];
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
    if (q.type === 'scope') {
      if (scopeItems.length === 0) continue;
      const map: Record<string, string> = {};
      const src = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
      for (const item of scopeItems) {
        const val = src[item];
        if (val === 'ja' || val === 'deels' || val === 'nee') map[item] = val;
      }
      if (Object.keys(map).length === 0) {
        if (!q.optional) throw new ShowcaseError('Beantwoord de vraag over wat past bij je wensen.');
        continue;
      }
      out[q.key] = map;
      continue;
    }
    if (empty) {
      if (!q.optional) throw new ShowcaseError('Vul alle vragen in zonder "optioneel".');
      continue;
    }
    switch (q.type) {
      case 'score5': {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 1 || n > 5) throw new ShowcaseError('Kies een score van 1 tot 5.');
        out[q.key] = n;
        break;
      }
      case 'nps': {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 0 || n > 10) throw new ShowcaseError('Kies een score van 0 tot 10.');
        out[q.key] = n;
        break;
      }
      case 'number': {
        const n = Number(String(v).replace(',', '.'));
        if (!Number.isFinite(n) || n < 0 || n > 400) throw new ShowcaseError('Vul een aantal uren in tussen 0 en 400.');
        out[q.key] = Math.round(n * 10) / 10;
        break;
      }
      case 'choice': {
        if (!q.options?.some((o) => o.value === v)) throw new ShowcaseError('Kies een van de opties.');
        out[q.key] = v as string;
        break;
      }
      case 'words': {
        const allowed = new Set<string>(WORDS.map((w) => w.value));
        const list = (Array.isArray(v) ? v : []).filter((w): w is string => typeof w === 'string' && allowed.has(w));
        if (list.length === 0 && !q.optional) throw new ShowcaseError('Kies minstens één woord.');
        if (list.length > 0) out[q.key] = Array.from(new Set(list)).slice(0, 4);
        break;
      }
      case 'text':
        out[q.key] = clip(String(v), 1200);
        break;
    }
  }
  return out;
}

/** Eerste stap: de antwoorden opslaan. Geeft, indien passend, meteen één vervolgvraag terug. */
export async function submitAnswers(token: string, raw: Record<string, unknown>): Promise<{ followup: string | null; thanks: string }> {
  await ensureShowcaseSchema();
  const rows = await sql`SELECT * FROM showcase_requests WHERE token = ${token}`;
  if (rows.length === 0) throw new ShowcaseError('Deze link is niet (meer) geldig.');
  const r = toRequest(rows[0]);
  if (r.status === 'klaar') throw new ShowcaseError('Deze link is niet (meer) geldig.');
  if (r.status === 'beantwoord') throw new ShowcaseError('Je antwoord is al binnen. Dank je wel!');
  const def = MOMENTS[r.moment];

  const answers = sanitizeAnswers(def, raw, r.context.scopeItems ?? []);
  // Opslaan; een gelijktijdige tweede verzending verliest.
  const saved = await sql`
    UPDATE showcase_requests SET answers = ${JSON.stringify(answers)}::jsonb, status = 'beantwoord', answered_at = NOW()
    WHERE token = ${token} AND status = 'verstuurd' RETURNING id`;
  if (saved.length === 0) throw new ShowcaseError('Je antwoord is al binnen. Dank je wel!');

  const concerning = isConcerning(r.moment, answers);
  try {
    await afterAnswered(r, answers, concerning);
  } catch (err) {
    console.error('Afhandeling van showcase-antwoord deels mislukt:', err);
  }

  let followup: string | null = null;
  if (!concerning && def.followupFocus) {
    followup = await makeFollowup(r, def, answers);
    await sql`UPDATE showcase_requests SET followup_question = ${followup} WHERE token = ${token}`;
  }
  return { followup, thanks: thanksText(def, { ...r, answers }) };
}

async function afterAnswered(r: ShowcaseRequest, answers: Answers, concerning: boolean) {
  const def = MOMENTS[r.moment];
  const lines: string[] = [];
  for (const q of def.questions) {
    const v = answers[q.key];
    if (v == null) continue;
    lines.push(`${q.label} ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
  await crmActivity(r.companyId, r.contactId, r.dealId, `Antwoord: ${def.name}`, lines.join('\n'));

  if (r.moment === 'akkoord' && r.dealId && r.companyId && typeof answers.consent === 'string') {
    await sql`
      INSERT INTO showcase_cases (deal_id, company_id, consent, consent_at)
      VALUES (${r.dealId}, ${r.companyId}, ${answers.consent}, NOW())
      ON CONFLICT (deal_id) DO UPDATE SET consent = EXCLUDED.consent, consent_at = NOW(), updated_at = NOW()`;
  }
  if (r.moment === 'dag14' && r.feedbackToken && typeof answers.nps === 'number') {
    const comment = typeof answers.toelichting === 'string' ? answers.toelichting : null;
    await submitFeedback(r.feedbackToken, answers.nps, comment);
  }
  if (concerning) {
    await crmTask(
      r.companyId,
      r.contactId,
      r.dealId,
      `Bel klant: zorgwekkend antwoord (${def.name})`,
      `${lines.join('\n')}\n\nDe klant kreeg geen vervolgvraag van Iris; neem zelf contact op.`,
      'urgent',
    );
  }
}

// ---------- vervolgvraag ----------

async function makeFollowup(r: ShowcaseRequest, def: MomentDef, answers: Answers): Promise<string> {
  const fallback = def.fallbackFollowup;
  // Zonder bruikbaar tekstantwoord valt Iris terug op de algemene vraag.
  const quoteable = pickQuote(answers, ['pijn', 'demo_reactie', 'besluit', 'toelichting']);
  if (!quoteable && r.moment !== 'tussen' && r.moment !== 'dag1') return fallback;
  if (!process.env.OPENROUTER_API_KEY) return fallback;

  const facts: string[] = [];
  if (r.context.companyName) facts.push(`Bedrijf: ${r.context.companyName}`);
  if (r.context.pain && r.moment !== 'intake') facts.push(`Eerder genoemde pijn (letterlijk): "${r.context.pain}"`);
  if (r.context.hoursBefore != null && r.moment === 'dag14') facts.push(`Eerder genoemd: ${r.context.hoursBefore} uur per week`);
  const given = def.questions
    .map((q) => (answers[q.key] != null ? `- ${q.label} ${typeof answers[q.key] === 'object' ? JSON.stringify(answers[q.key]) : answers[q.key]}` : null))
    .filter(Boolean)
    .join('\n');

  const prompt = `Je bent Iris, de AI-assistent van Vincent van Munster (WeAreImpact). Je stelt één korte vervolgvraag aan een klant, in het Nederlands, informeel ("je"), zakelijk en concreet.

Doel: ${def.followupFocus}

Regels:
- Precies één vraag, maximaal 25 woorden, eindigend op een vraagteken.
- Pak één stukje uit hun eigen woorden letterlijk terug als dat past, tussen aanhalingstekens.
- Gebruik de woorden "raakte", "voelde", "ervaring" en "waarom" niet.
- Verzin geen feiten of cijfers; noem alleen wat hieronder staat.
- Noem geen concurrenten en geen andere bureaus.
- Geef alleen de vraag, zonder uitleg.

${facts.join('\n')}
Hun antwoorden:
${given}`;

  try {
    const call = getOpenRouter().chat.completions.create({
      model: DEFAULT_MODELS.chat,
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    });
    const res = await Promise.race([
      call,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000)),
    ]);
    const text = res ? res.choices[0]?.message?.content : null;
    return cleanFollowup(text, r.moment) ?? fallback;
  } catch (err) {
    console.error('Vervolgvraag maken mislukt:', err);
    return fallback;
  }
}

/** Tweede stap: het antwoord op de vervolgvraag. */
export async function submitFollowup(token: string, text: string): Promise<void> {
  await ensureShowcaseSchema();
  const answer = clip(text ?? '', 1200);
  if (answer.length < 2) throw new ShowcaseError('Typ een antwoord, of kies "Dit was het".');
  const rows = await sql`
    UPDATE showcase_requests SET followup_answer = ${answer}, followup_answered_at = NOW()
    WHERE token = ${token} AND status = 'beantwoord' AND followup_question IS NOT NULL AND followup_answered_at IS NULL
    RETURNING *`;
  if (rows.length === 0) throw new ShowcaseError('Er staat geen vervolgvraag open.');
  const r = toRequest(rows[0]);
  await crmActivity(r.companyId, r.contactId, r.dealId, `Vervolg: ${MOMENTS[r.moment].name}`, `${r.followupQuestion}\n${answer}`);
}

// ---------- tempo en resultaat ----------

export interface DealMetrics {
  /** Dagen tussen het eerste gesprek en het verzenden van de offerte. */
  daysIntakeToQuote: number | null;
  daysQuoteToAccept: number | null;
  daysAcceptToLive: number | null;
  /** Positief: eerder live dan gepland. */
  daysEarlyVsPlan: number | null;
  milestonesDone: number;
  milestonesTotal: number;
  liveAt: string | null;
}

const diffDays = (a: unknown, b: unknown): number | null =>
  a && b ? Math.round((new Date(b as string).getTime() - new Date(a as string).getTime()) / DAY) : null;

export async function getDealMetrics(dealId: string): Promise<DealMetrics> {
  await ensureShowcaseSchema();
  const [first] = await sql`SELECT MIN(starts_at) AS t FROM appointments WHERE deal_id = ${dealId} AND kind IN ('sparring','intake')`;
  const [deal] = await sql`SELECT created_at FROM deals WHERE id = ${dealId}`;
  const [quote] = await sql`
    SELECT sent_at, accepted_at FROM quotes WHERE deal_id = ${dealId} AND sent_at IS NOT NULL ORDER BY sent_at ASC LIMIT 1`;
  const [project] = await sql`
    SELECT slug, go_live_date, live_at FROM crm_projects WHERE deal_id = ${dealId} ORDER BY created_at ASC LIMIT 1`;
  let done = 0;
  let total = 0;
  if (project) {
    const [m] = await sql`
      SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'done')::int AS done
      FROM crm_milestones WHERE project_slug = ${project.slug}`;
    total = Number(m?.total ?? 0);
    done = Number(m?.done ?? 0);
  }
  const start = first?.t ?? deal?.created_at;
  return {
    daysIntakeToQuote: diffDays(start, quote?.sent_at),
    daysQuoteToAccept: diffDays(quote?.sent_at, quote?.accepted_at),
    daysAcceptToLive: diffDays(quote?.accepted_at, project?.live_at),
    daysEarlyVsPlan: project?.go_live_date && project?.live_at ? diffDays(project.live_at, `${String(project.go_live_date).slice(0, 10)}T12:00:00`) : null,
    milestonesDone: done,
    milestonesTotal: total,
    liveAt: iso(project?.live_at),
  };
}

// ---------- showcase-concept ----------

export interface CaseDraft {
  consent: 'onbekend' | 'naam' | 'anoniem' | 'nee';
  headline: string | null;
  hoursBefore: number | null;
  hoursAfter: number | null;
  hoursSaved: number | null;
  quotes: { moment: string; question: string; text: string }[];
  scope: { item: string; fit: string }[];
  nps: number | null;
  metrics: DealMetrics;
  open: string[];
  readyToPublish: boolean;
}

/**
 * Stelt het concept samen uit letterlijke antwoorden en gemeten cijfers. Er wordt niets herschreven of
 * samengevoegd: een citaat is precies wat de klant typte. Publiceren kan pas na toestemming en akkoord op de tekst.
 */
export async function buildCaseDraft(dealId: string): Promise<CaseDraft> {
  await ensureShowcaseSchema();
  const requests = (await sql`SELECT * FROM showcase_requests WHERE deal_id = ${dealId} ORDER BY created_at ASC`).map(toRequest);
  const [cs] = await sql`SELECT consent, hours_confirmed FROM showcase_cases WHERE deal_id = ${dealId}`;
  const metrics = await getDealMetrics(dealId);
  const consent = ((cs?.consent as string) ?? 'onbekend') as CaseDraft['consent'];

  const quotes: CaseDraft['quotes'] = [];
  let hoursBefore: number | null = null;
  let hoursAfter: number | null = null;
  let nps: number | null = null;
  let scope: CaseDraft['scope'] = [];

  for (const r of requests) {
    const def = MOMENTS[r.moment];
    if (r.status !== 'beantwoord') continue;
    for (const q of def.questions) {
      const v = r.answers[q.key];
      if (q.type === 'text' && typeof v === 'string' && v.trim().length > 3) {
        quotes.push({ moment: def.name, question: q.label, text: v.trim() });
      }
    }
    if (r.followupAnswer && r.followupQuestion) quotes.push({ moment: def.name, question: r.followupQuestion, text: r.followupAnswer });
    if (typeof r.answers.uren_voor === 'number') hoursBefore = r.answers.uren_voor;
    if (typeof r.answers.uren_na === 'number') hoursAfter = r.answers.uren_na;
    if (typeof r.answers.nps === 'number') nps = r.answers.nps;
    if (r.answers.scope && typeof r.answers.scope === 'object') {
      scope = Object.entries(r.answers.scope as Record<string, string>).map(([item, fit]) => ({ item, fit }));
    }
  }

  const hoursSaved = hoursBefore != null && hoursAfter != null ? Math.round((hoursBefore - hoursAfter) * 10) / 10 : null;
  const headline =
    hoursBefore != null && hoursAfter != null && hoursSaved != null && hoursSaved > 0
      ? `Van ${hoursBefore} naar ${hoursAfter} uur per week`
      : null;

  const answered = new Set(requests.filter((r) => r.status === 'beantwoord').map((r) => r.moment));
  const open: string[] = [];
  if (consent === 'onbekend') open.push('Toestemming van de klant ontbreekt.');
  if (consent === 'nee') open.push('De klant wil geen showcase: niet publiceren.');
  for (const m of ['intake', 'demo', 'akkoord', 'dag14'] as MomentKey[]) {
    if (!answered.has(m)) open.push(`Antwoord op "${MOMENTS[m].name}" ontbreekt.`);
  }
  if (hoursBefore == null) open.push('Het "Voor"-aantal uren is niet vastgelegd.');
  if (hoursAfter == null) open.push('Het "Na"-aantal uren ontbreekt.');
  if (headline && !cs?.hours_confirmed) open.push('De klant moet de urenwinst nog bevestigen.');

  return {
    consent,
    headline,
    hoursBefore,
    hoursAfter,
    hoursSaved,
    quotes,
    scope,
    nps,
    metrics,
    open,
    readyToPublish: open.length === 0 && consent !== 'nee',
  };
}

export async function setCaseField(dealId: string, field: 'consent' | 'hours_confirmed', value: string | boolean): Promise<void> {
  await ensureShowcaseSchema();
  const [deal] = await sql`SELECT company_id FROM deals WHERE id = ${dealId}`;
  if (!deal) throw new ShowcaseError('Deal niet gevonden.');
  if (field === 'consent') {
    if (!['onbekend', 'naam', 'anoniem', 'nee'].includes(String(value))) throw new ShowcaseError('Ongeldige toestemming.');
    await sql`
      INSERT INTO showcase_cases (deal_id, company_id, consent, consent_at)
      VALUES (${dealId}, ${deal.company_id}, ${String(value)}, NOW())
      ON CONFLICT (deal_id) DO UPDATE SET consent = EXCLUDED.consent, consent_at = NOW(), updated_at = NOW()`;
  } else {
    await sql`
      INSERT INTO showcase_cases (deal_id, company_id, hours_confirmed)
      VALUES (${dealId}, ${deal.company_id}, ${Boolean(value)})
      ON CONFLICT (deal_id) DO UPDATE SET hours_confirmed = EXCLUDED.hours_confirmed, updated_at = NOW()`;
  }
}

// ---------- dagelijkse ronde (cron, elk uur) ----------

export interface DailyResult {
  autosend: boolean;
  dry: boolean;
  appointmentsMarked: number;
  created: string[];
  sent: string[];
  deferred: string[];
  errors: string[];
}

const autosendOn = () => process.env.SHOWCASE_AUTOSEND === 'on';

/**
 * Elk uur: afspraken die voorbij zijn als 'geweest' markeren, en de vraagmomenten aanmaken die nu aan de beurt zijn
 * (na een afspraak, halverwege een project, dag na livegang, dag 14). Standaard worden ze alleen klaargezet voor Vincent;
 * met SHOWCASE_AUTOSEND=on gaan ze ook zelf de deur uit, binnen werkuren.
 */
export async function runShowcaseRound(opts: { dry?: boolean } = {}): Promise<DailyResult> {
  await ensureShowcaseSchema();
  const dry = Boolean(opts.dry);
  const result: DailyResult = { autosend: autosendOn(), dry, appointmentsMarked: 0, created: [], sent: [], deferred: [], errors: [] };
  const now = new Date();
  const startIso = SHOWCASE_START.toISOString();

  const registered: { moment: MomentKey; dealId: string | null; companyId: string; contactId?: string | null; appointmentId?: string | null; projectSlug?: string | null; label: string }[] = [];

  // 1. Afspraken die voorbij zijn (met een half uur marge voor correcties).
  if (!dry) {
    const marked = await sql`
      UPDATE appointments SET status = 'geweest'
      WHERE status = 'gepland' AND ends_at < NOW() - INTERVAL '30 minutes' RETURNING id`;
    result.appointmentsMarked = marked.length;
  }

  // 2. Na een afspraak: 1 uur later.
  const appts = await sql`
    SELECT * FROM appointments
    WHERE status = 'geweest' AND ends_at >= ${startIso} AND ends_at <= ${new Date(now.getTime() - HOUR).toISOString()}
      AND company_id IS NOT NULL AND deal_id IS NOT NULL`;
  for (const a of appts.map(toAppointment)) {
    const moment = momentForAppointment(a.kind);
    if (!moment || !a.dealId || !a.companyId) continue;
    registered.push({ moment, dealId: a.dealId, companyId: a.companyId, contactId: a.contactId, appointmentId: a.id, projectSlug: a.projectSlug, label: `${a.title} → ${MOMENTS[moment].name}` });
  }

  // 3. Projecten: halverwege, dag na livegang, dag 14.
  const projects = await sql`
    SELECT p.slug, p.name, p.company_id, p.deal_id, p.live_at, p.created_at,
      COUNT(m.id)::int AS total, COUNT(m.id) FILTER (WHERE m.status = 'done')::int AS done
    FROM crm_projects p LEFT JOIN crm_milestones m ON m.project_slug = p.slug
    WHERE p.company_id IS NOT NULL
    GROUP BY p.slug`;
  for (const p of projects) {
    const companyId = p.company_id as string;
    const dealId = (p.deal_id as string) ?? (await resolveDealForCompany(companyId));
    if (!dealId) continue;
    const slug = p.slug as string;
    const liveAt = p.live_at ? new Date(p.live_at as string) : null;
    if (!liveAt) {
      if (new Date(p.created_at as string) >= SHOWCASE_START && Number(p.total) >= 4 && Number(p.done) * 2 >= Number(p.total)) {
        registered.push({ moment: 'tussen', dealId, companyId, projectSlug: slug, label: `${p.name} → ${MOMENTS.tussen.name}` });
      }
      continue;
    }
    if (liveAt < SHOWCASE_START) continue;
    const age = now.getTime() - liveAt.getTime();
    if (age >= DAY && age < 10 * DAY) registered.push({ moment: 'dag1', dealId, companyId, projectSlug: slug, label: `${p.name} → ${MOMENTS.dag1.name}` });
    if (age >= 14 * DAY && age < 45 * DAY) registered.push({ moment: 'dag14', dealId, companyId, projectSlug: slug, label: `${p.name} → ${MOMENTS.dag14.name}` });
  }

  const nowParts = amsterdamParts(now);
  for (const item of registered) {
    try {
      const existing = item.dealId
        ? await sql`SELECT 1 FROM showcase_requests WHERE deal_id = ${item.dealId} AND moment = ${item.moment}`
        : [];
      if (existing.length > 0) continue;
      if (dry) {
        result.created.push(item.label);
        continue;
      }
      const { request, created } = await createRequest(item);
      if (created) result.created.push(item.label);
      if (request.status !== 'klaar') continue;
      if (!created) continue;
      if (result.autosend && isSendWindow(nowParts)) {
        const outcome = await sendRequest(request.id);
        if (outcome === 'verstuurd') result.sent.push(item.label);
        else result.deferred.push(`${item.label} (${outcome})`);
        // Uitgesteld: de volgende ronde probeert het opnieuw via de herhaalstap hieronder.
      } else {
        await crmTask(
          item.companyId,
          item.contactId ?? null,
          item.dealId,
          `Showcase-vraag klaar: ${MOMENTS[item.moment].name}`,
          'Staat klaar in het tabblad Showcase van het bedrijf. Verstuur hem, of sla hem over.',
        );
      }
    } catch (err) {
      result.errors.push(`${item.label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 4. Klaargezette momenten die automatisch mogen en nu binnen werkuren vallen (opnieuw proberen na uitstel).
  if (!dry && result.autosend && isSendWindow(nowParts)) {
    const waiting = await sql`
      SELECT id, moment FROM showcase_requests
      WHERE status = 'klaar' AND moment <> 'akkoord' AND created_at > NOW() - INTERVAL '10 days' ORDER BY created_at ASC LIMIT 20`;
    for (const w of waiting) {
      try {
        const outcome = await sendRequest(w.id as string);
        if (outcome === 'verstuurd') result.sent.push(`${w.moment as string} (${w.id as string})`);
        else if (outcome === 'uitgesteld') result.deferred.push(`${w.moment as string} (uitgesteld)`);
      } catch (err) {
        result.errors.push(`${w.id as string}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return result;
}

