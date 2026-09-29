import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  BOOKING_TYPES,
  BookingTypeSlug,
  getAvailableSlots,
  getVincentBusyNow,
  isSlotStillFree,
} from '@/lib/google-calendar';
import { vapiWebhookSecret } from '@/lib/voice/vapi-assistant';
import { spokenDate, spokenTime } from '@/lib/voice/spoken';
import { findCallerByPhone, logCallInCrm, pushUrgent } from '@/lib/voice/crm';
import { amsterdamParts } from '@/lib/time/amsterdam';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const OWNER_EMAIL = 'v.munster@weareimpact.nl';
const WEB_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://weareimpact.nl';
const AGENDA_DOWN =
  'De agenda is nu niet bereikbaar. Zeg dat eerlijk en bied aan om een bericht voor Vincent achter te laten met leave_message.';

interface VapiToolCall {
  id: string;
  function: { name: string; arguments: Record<string, unknown> | string };
}
interface VapiPayload {
  message?: {
    type?: string;
    call?: { id?: string; customer?: { number?: string } };
    toolCalls?: VapiToolCall[];
    toolCallList?: { id: string; name: string; arguments: Record<string, unknown> }[];
    artifact?: { transcript?: string };
    durationSeconds?: number;
    endedReason?: string;
    summary?: string;
    analysis?: {
      summary?: string;
      structuredData?: { outcome?: string; urgency?: string; topic?: string; callerName?: string; callerOrganization?: string };
    };
  };
}

function authorized(req: Request): boolean {
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${vapiWebhookSecret()}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const OUTCOME_LABEL: Record<string, string> = {
  afspraak_aangevraagd: 'Afspraak aangevraagd',
  terugbelverzoek: 'Terugbelverzoek',
  vraag_beantwoord: 'Vraag beantwoord',
  doorverbonden: 'Doorverbonden',
  geen_actie: 'Geen actie nodig',
  onduidelijk: 'Onduidelijk',
};

async function identifyCaller(callerPhone: string): Promise<string> {
  const caller = await findCallerByPhone(callerPhone);
  if (!caller || !caller.firstName) {
    return 'Onbekende beller. Behandel hem als nieuw en vraag zijn naam.';
  }
  return `Bekende relatie, voornaam: ${caller.firstName}. Vraag alleen "Spreek ik met ${caller.firstName}?". Noem verder niets over hem uit dit systeem.${
    caller.email ? ' Zijn e-mailadres is bekend: bij een afspraak mag je vragen of het bekende adres nog klopt (zonder het voor te lezen) en dan useKnownEmail=true gebruiken.' : ''
  }`;
}

async function vincentStatus(): Promise<string> {
  const now = amsterdamParts(new Date());
  const weekend = now.weekday === 0 || now.weekday === 6;
  const officeHours = !weekend && now.hour >= 9 && now.hour < 17;
  try {
    const { busy, until } = await getVincentBusyNow();
    if (busy && until) {
      return `Vincent zit nu in een afspraak tot ${spokenTime(until)}. Noem niet waarmee. Hij belt daarna terug als de beller een bericht achterlaat.`;
    }
  } catch (e) {
    console.error('vapi vincent_status:', e);
    return 'Ik kan niet zien of Vincent bezet is. Zeg dat hij nu niet opneemt en bied een terugbelverzoek aan.';
  }
  if (!officeHours) {
    return 'Het is buiten kantooruren (werkdagen negen tot vijf). Vincent is nu niet bereikbaar; hij belt de eerstvolgende werkdag terug.';
  }
  return 'Vincent zit niet in een afspraak, maar neemt nu niet op. Hij belt zo snel mogelijk terug.';
}

async function checkAvailability(args: Record<string, unknown>): Promise<string> {
  const slug = str(args.bookingType) as BookingTypeSlug;
  if (!BOOKING_TYPES[slug]) return 'Onbekend afspraaktype.';
  const preferredDate = /^\d{4}-\d{2}-\d{2}$/.test(str(args.preferredDate)) ? str(args.preferredDate) : '';
  const part = str(args.partOfDay);

  let days;
  try {
    days = await getAvailableSlots(slug, 3, { strict: true });
  } catch (e) {
    console.error('vapi check_availability:', e);
    return AGENDA_DOWN;
  }

  const picks: string[] = [];
  for (const day of days) {
    if (picks.length >= 4) break;
    if (preferredDate && day.date < preferredDate) continue;
    let slots = day.slots;
    if (part === 'ochtend') slots = slots.filter((s) => amsterdamParts(new Date(s.start)).hour < 12);
    if (part === 'middag') slots = slots.filter((s) => amsterdamParts(new Date(s.start)).hour >= 12);
    if (slots.length === 0) continue;
    // Eén vroeg en één later moment per dag geeft de beller echte keuze.
    const chosen = [slots[0], slots[Math.floor(slots.length / 2)]].filter((s, i, a) => s && a.indexOf(s) === i);
    for (const s of chosen) {
      const start = new Date(s.start);
      picks.push(`${spokenDate(start)} om ${spokenTime(start)} (startTime: ${s.start})`);
    }
  }
  if (picks.length === 0) {
    return preferredDate || part
      ? 'Op die dag of dat dagdeel is niets vrij. Vraag of een andere dag past, of bied aan om een bericht voor Vincent achter te laten.'
      : 'Er zijn de komende drie weken geen vrije momenten. Bied aan om een bericht voor Vincent achter te laten.';
  }
  return `Vrije momenten voor ${BOOKING_TYPES[slug].name}, noem er hooguit twee: ${picks.slice(0, 4).join('; ')}.`;
}

async function requestBooking(args: Record<string, unknown>, callerPhone: string): Promise<string> {
  const slug = str(args.bookingType) as BookingTypeSlug;
  if (!BOOKING_TYPES[slug]) return 'Onbekend afspraaktype.';
  const startTime = str(args.startTime);

  let email = str(args.email, 200).toLowerCase();
  if (args.useKnownEmail === true && !email) {
    const known = await findCallerByPhone(callerPhone);
    email = known?.email.toLowerCase() ?? '';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Het e-mailadres ontbreekt of lijkt niet te kloppen. Vraag het opnieuw en laat het letter voor letter terug spellen. Lukt dat niet, gebruik dan leave_message.';
  }

  // Her-validatie: het moment kan sinds check_availability door een ander zijn ingenomen.
  try {
    if (!(await isSlotStillFree(slug, startTime))) {
      return 'Dat moment is helaas net niet meer beschikbaar. Zeg dat en roep check_availability opnieuw aan voor nieuwe momenten.';
    }
  } catch (e) {
    console.error('vapi request_booking slot check:', e);
    return AGENDA_DOWN;
  }

  // Een herhaalde tool-call (Vapi-retry, beller die het nog eens zegt) mag geen tweede aanvraag maken.
  try {
    const dup = await sql`
      SELECT 1 FROM booking_requests
      WHERE status = 'pending' AND lower(customer_email) = ${email} AND start_time = ${new Date(startTime).toISOString()} LIMIT 1
    `;
    if (dup.length > 0) return 'Deze aanvraag was al vastgelegd. Zeg dat Vincent de afspraak persoonlijk bevestigt per e-mail.';
  } catch {
    /* tabel bestaat nog niet: geen dubbele mogelijk */
  }

  // Hergebruik de bestaande aanvraagflow: opslag, mail naar de beller, en de
  // goedkeurlink voor Vincent. Er staat dus nooit iets automatisch vast.
  let res: Response;
  try {
    res = await fetch(`${WEB_BASE}/api/booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        bookingType: slug,
        startTime,
        notes: `[Telefonisch via AI-assistent] ${str(args.notes, 1800)}`.trim(),
        customer: {
          name: str(args.name, 120),
          email,
          phone: str(args.phone, 40) || callerPhone || undefined,
          organization: str(args.organization, 150) || undefined,
        },
      }),
    });
  } catch (e) {
    console.error('vapi request_booking create:', e);
    return 'De aanvraag kon niet worden vastgelegd. Bied aan om een bericht voor Vincent achter te laten.';
  }
  if (!res.ok) return 'De aanvraag kon niet worden vastgelegd. Bied aan om een bericht voor Vincent achter te laten.';
  return 'Aanvraag vastgelegd. Zeg dat Vincent de afspraak persoonlijk bevestigt per e-mail, dat het nog niet definitief vaststaat, en dat de beller een ontvangstbevestiging per mail krijgt.';
}

async function leaveMessage(args: Record<string, unknown>, callerPhone: string, callId: string): Promise<string> {
  const name = str(args.name, 120);
  const phone = str(args.phone, 40) || callerPhone;
  const email = str(args.email, 200);
  const organization = str(args.organization, 150);
  const message = str(args.message, 2000);
  const urgent = args.urgent === true;
  const caller = await findCallerByPhone(callerPhone);

  try {
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES ('lead', ${urgent ? 'DRINGEND terugbelverzoek via telefoon-AI' : 'Terugbelverzoek via telefoon-AI'},
        ${`${name}${organization ? ` (${organization})` : ''}: ${message}`},
        ${JSON.stringify({ via: 'vapi', kind: 'message', callId, name, phone, email, organization, message, urgent })}::jsonb)
    `;
  } catch (e) {
    console.error('vapi leave_message activity_log:', e);
  }

  await logCallInCrm({
    caller,
    subject: `${urgent ? 'DRINGEND terugbellen' : 'Terugbellen'}: ${name}${organization ? ` (${organization})` : ''}`,
    description: `${message}\n\nTelefoon: ${phone || 'onbekend'}${email ? `\nE-mail: ${email}` : ''}`,
    outcome: 'terugbelverzoek',
    followUpTask: {
      title: `${urgent ? 'DRINGEND: ' : ''}Bel ${name} terug${organization ? ` (${organization})` : ''}`,
      priority: urgent ? 'high' : 'normal',
    },
  });

  const [result] = await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `${urgent ? 'DRINGEND — ' : ''}Terugbelverzoek: ${name}${organization ? ` (${organization})` : ''}`,
      html: `<div style="font-family:sans-serif;max-width:600px">
      <h2>${urgent ? 'DRINGEND: ' : ''}Terugbelverzoek via de telefoon-AI</h2>
      <p><b>Naam:</b> ${esc(name)}<br>
      <b>Telefoon:</b> ${esc(phone) || 'onbekend'}<br>
      ${email ? `<b>E-mail:</b> ${esc(email)}<br>` : ''}
      ${organization ? `<b>Organisatie:</b> ${esc(organization)}<br>` : ''}</p>
      <p><b>Bericht:</b><br>${esc(message).replace(/\n/g, '<br>')}</p></div>`,
      text: `Terugbelverzoek van ${name}\nTelefoon: ${phone}\nE-mail: ${email}\nOrganisatie: ${organization}\n\n${message}`,
    }),
    urgent ? pushUrgent(`Dringend: ${name}`, `${phone || 'geen nummer'} — ${message}`) : Promise.resolve(),
  ]);
  if (!result.success) return 'Het bericht kon niet worden verstuurd. Geef de beller het e-mailadres v.munster@weareimpact.nl.';
  return urgent
    ? 'Bericht doorgegeven aan Vincent en hij is direct gewaarschuwd. Zeg dat hij zo snel mogelijk terugbelt.'
    : 'Bericht doorgegeven aan Vincent. Zeg dat hij zo snel mogelijk terugbelt.';
}

async function handleToolCalls(payload: VapiPayload) {
  const msg = payload.message!;
  const callerPhone = msg.call?.customer?.number ?? '';
  const callId = msg.call?.id ?? '';
  const calls: { id: string; name: string; args: Record<string, unknown> }[] = [];

  for (const tc of msg.toolCalls ?? []) {
    let args = tc.function.arguments;
    if (typeof args === 'string') {
      try { args = JSON.parse(args); } catch { args = {}; }
    }
    calls.push({ id: tc.id, name: tc.function.name, args: args as Record<string, unknown> });
  }
  if (calls.length === 0) {
    for (const tc of msg.toolCallList ?? []) calls.push({ id: tc.id, name: tc.name, args: tc.arguments ?? {} });
  }

  const results = await Promise.all(
    calls.map(async (c) => {
      try {
        let result: string;
        if (c.name === 'identify_caller') result = await identifyCaller(callerPhone);
        else if (c.name === 'vincent_status') result = await vincentStatus();
        else if (c.name === 'check_availability') result = await checkAvailability(c.args);
        else if (c.name === 'request_booking') result = await requestBooking(c.args, callerPhone);
        else if (c.name === 'leave_message') result = await leaveMessage(c.args, callerPhone, callId);
        else result = 'Onbekende tool.';
        return { toolCallId: c.id, result };
      } catch (err) {
        console.error(`vapi tool ${c.name}:`, err);
        return { toolCallId: c.id, result: 'Er ging iets mis. Bied aan om een bericht voor Vincent achter te laten.' };
      }
    }),
  );
  return NextResponse.json({ results });
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: VapiPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = body.message?.type ?? '';
  if (type === 'tool-calls') return handleToolCalls(body);
  if (type !== 'end-of-call-report') return NextResponse.json({ ok: true, ignored: true });

  const msg = body.message!;
  const callId = msg.call?.id ?? '';
  const phone = msg.call?.customer?.number ?? '';
  const duration = Math.round(msg.durationSeconds ?? 0);
  const transcript = msg.artifact?.transcript ?? '';
  const summary = msg.summary ?? msg.analysis?.summary ?? '';
  const data = msg.analysis?.structuredData ?? {};
  const outcome = OUTCOME_LABEL[data.outcome ?? ''] ?? '';
  const urgent = data.urgency === 'hoog';

  // Idempotent: Vapi probeert een report opnieuw bij een time-out.
  try {
    const dup = await sql`SELECT 1 FROM activity_log WHERE type = 'lead' AND metadata->>'callId' = ${callId} AND metadata->>'kind' = 'call_report' LIMIT 1`;
    if (callId && dup.length > 0) return NextResponse.json({ ok: true, duplicate: true });
  } catch {
    /* geen blokkade */
  }

  try {
    await sql`
      INSERT INTO activity_log (type, title, description, metadata)
      VALUES ('lead', 'Telefoongesprek via AI-assistent', ${summary || `${duration} seconden${phone ? ` van ${phone}` : ''}`},
        ${JSON.stringify({ via: 'vapi', kind: 'call_report', callId, phone, duration, endedReason: msg.endedReason, outcome: data.outcome, urgency: data.urgency, topic: data.topic, transcript })}::jsonb)
    `;
  } catch (e) {
    console.error('vapi call_report activity_log:', e);
  }

  // Alleen loggen en mailen bij een echt gesprek; ophangers en stilte van <8s zijn ruis.
  if (transcript && duration >= 8) {
    const caller = await findCallerByPhone(phone);
    await logCallInCrm({
      caller,
      subject: `Telefoongesprek AI-assistent${data.topic ? `: ${data.topic}` : ''}`,
      description: `${summary}\n\nNummer: ${phone || 'onbekend'} · duur ${duration}s`,
      outcome: data.outcome,
    });
    if (urgent) await pushUrgent('Dringend telefoongesprek', `${phone || 'onbekend nummer'} — ${summary}`);

    const who = caller?.fullName || data.callerName || '';
    await sendEmail({
      to: OWNER_EMAIL,
      subject: `${urgent ? 'DRINGEND — ' : ''}Telefoongesprek AI-assistent${who ? ` — ${who}` : phone ? ` — ${phone}` : ''}${outcome ? ` (${outcome})` : ''}`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2>Telefoongesprek afgehandeld door de AI-assistent</h2>
        <p>${who ? `<b>Beller:</b> ${esc(who)}${caller?.organization || data.callerOrganization ? ` (${esc(caller?.organization || data.callerOrganization)})` : ''}<br>` : ''}
        <b>Nummer:</b> ${esc(phone) || 'onbekend'} · <b>Duur:</b> ${duration}s${outcome ? `<br><b>Uitkomst:</b> ${esc(outcome)}` : ''}${urgent ? '<br><b>Urgentie:</b> hoog' : ''}</p>
        ${summary ? `<p><b>Samenvatting:</b> ${esc(summary)}</p>` : ''}
        <p><b>Transcript:</b></p><pre style="white-space:pre-wrap;font-family:inherit">${esc(transcript)}</pre></div>`,
      text: `Beller: ${who}\nNummer: ${phone}\nDuur: ${duration}s\nUitkomst: ${outcome}\n\n${summary}\n\n${transcript}`,
    });
  }

  return NextResponse.json({ ok: true });
}
