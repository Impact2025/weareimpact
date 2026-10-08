import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { amsterdamDateTime } from '@/lib/time/amsterdam';
import {
  ShowcaseError,
  buildCaseDraft,
  createAppointment,
  createRequest,
  listAppointments,
  listRequests,
  resolveDealForCompany,
  runShowcaseRound,
  sendRequest,
  setAppointmentStatus,
  setCaseField,
  skipRequest,
} from '@/lib/showcase/flow';
import {
  checkReadyForReview,
  getCase,
  publishCase,
  saveCase,
  sendForReview,
  suggestIntro,
  unpublishCase,
} from '@/lib/showcase/case';
import { MOMENTS, type AppointmentKind, type MomentKey } from '@/lib/showcase/moments';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// De middleware beschermt /api/admin al met sessie of service-key.

export async function GET(request: NextRequest) {
  const companyId = new URL(request.url).searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId ontbreekt' }, { status: 400 });
  try {
    const [appointments, requests, deals] = await Promise.all([
      listAppointments(companyId),
      listRequests(companyId),
      sql`SELECT id, title, stage FROM deals WHERE company_id = ${companyId} ORDER BY created_at DESC`,
    ]);
    const drafts = await Promise.all(
      deals
        .filter((d) => requests.some((r) => r.dealId === d.id) || appointments.some((a) => a.dealId === d.id))
        .map(async (d) => ({
          dealId: d.id as string,
          title: d.title as string,
          stage: d.stage as string,
          draft: await buildCaseDraft(d.id as string),
          case: await getCase(d.id as string),
          problems: await checkReadyForReview(d.id as string),
        })),
    );
    return NextResponse.json({
      appointments,
      requests: requests.map((r) => ({ ...r, momentName: MOMENTS[r.moment].name })),
      deals: deals.map((d) => ({ id: d.id as string, title: d.title as string })),
      drafts,
      autosend: process.env.SHOWCASE_AUTOSEND === 'on',
    });
  } catch (error) {
    console.error('Showcase GET error:', error);
    return NextResponse.json({ error: 'Laden mislukt' }, { status: 500 });
  }
}

// "2026-10-12T14:00" (kloktijd in Amsterdam) naar een echt moment.
function parseLocal(value: unknown): Date | null {
  const m = typeof value === 'string' ? value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/) : null;
  if (!m) return null;
  return amsterdamDateTime(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  try {
    switch (body.action) {
      case 'send': {
        const outcome = await sendRequest(String(body.id), { force: true });
        return NextResponse.json({ success: true, outcome });
      }
      case 'round':
        // Dezelfde ronde als de uurlijkse cron, handmatig te starten (met dry:true alleen kijken).
        return NextResponse.json({ success: true, result: await runShowcaseRound({ dry: body.dry === true }) });
      case 'skip':
        await skipRequest(String(body.id));
        return NextResponse.json({ success: true });
      case 'create': {
        const moment = String(body.moment) as MomentKey;
        if (!MOMENTS[moment]) throw new ShowcaseError('Onbekend moment.');
        const companyId = String(body.companyId);
        const dealId = body.dealId ? String(body.dealId) : await resolveDealForCompany(companyId);
        const { request: r, created } = await createRequest({ moment, dealId, companyId });
        return NextResponse.json({ success: true, id: r.id, created });
      }
      case 'appointment': {
        const startsAt = parseLocal(body.startsAt);
        if (!startsAt) throw new ShowcaseError('Kies een geldige datum en tijd.');
        const kind = String(body.kind) as AppointmentKind;
        const appt = await createAppointment({
          companyId: String(body.companyId),
          dealId: body.dealId ? String(body.dealId) : null,
          kind,
          startsAt,
          durationMin: Math.min(Math.max(Number(body.durationMin) || 60, 15), 480),
          title: typeof body.title === 'string' ? body.title : undefined,
          calendar: body.calendar !== false,
        });
        return NextResponse.json({ success: true, appointment: appt });
      }
      case 'appointment-status':
        if (!['gepland', 'geweest', 'niet_doorgegaan'].includes(String(body.status))) throw new ShowcaseError('Onbekende status.');
        await setAppointmentStatus(String(body.id), body.status);
        return NextResponse.json({ success: true });
      case 'case-save': {
        const saved = await saveCase(String(body.dealId), {
          headline: body.headline,
          intro: body.intro,
          displayName: body.displayName,
          authorName: body.authorName,
          authorRole: body.authorRole,
          quoteKeys: Array.isArray(body.quoteKeys) ? body.quoteKeys : undefined,
        });
        return NextResponse.json({ success: true, case: saved });
      }
      case 'case-suggest':
        return NextResponse.json({ success: true, intro: await suggestIntro(String(body.dealId)) });
      case 'case-send': {
        const { email } = await sendForReview(String(body.dealId));
        return NextResponse.json({ success: true, email });
      }
      case 'case-publish':
        return NextResponse.json({ success: true, ...(await publishCase(String(body.dealId))) });
      case 'case-unpublish':
        await unpublishCase(String(body.dealId));
        return NextResponse.json({ success: true });
      case 'consent':
        await setCaseField(String(body.dealId), 'consent', String(body.value));
        return NextResponse.json({ success: true });
      case 'hours-confirmed':
        await setCaseField(String(body.dealId), 'hours_confirmed', Boolean(body.value));
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof ShowcaseError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error('Showcase POST error:', error);
    return NextResponse.json({ error: 'Actie mislukt' }, { status: 500 });
  }
}
