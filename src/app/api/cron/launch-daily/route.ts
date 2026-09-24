import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email/send';
import { createMagicLink } from '@/lib/crm/magic-link';
import { getLaunchOverviews } from '@/lib/launch/briefing';
import { runAndStoreChecks } from '@/lib/launch/run-checks';
import { generateLaunchClientReminderEmail, generateLaunchDigestEmail } from '@/lib/email/templates/launch-mails';
import { generateLaunchWeeklyEmail } from '@/lib/email/templates/launch-weekly';
import { buildWeeklyReport } from '@/lib/launch/weekly';
import { getClientEmail } from '@/lib/launch/client-contact';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const REMINDER_INTERVAL_DAYS = 3;
const WEEKLY_INTERVAL_DAYS = 6; // met de maandag-trigger erbij: maximaal 1 bericht per week
const VINCENT = 'v.munster@weareimpact.nl';

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}

/**
 * Dagelijkse LaunchAssist-ronde:
 *  1. checks opnieuw draaien voor alle actieve launches met een site-URL
 *  2. wekelijks voortgangsbericht naar de klant (opt-in, op maandag of als er nog nooit een ging)
 *  3. herinnering naar de klant (alleen als reminders_enabled, max 1× per 3 dagen)
 *  4. digest naar Vincent, alleen als er iets aandacht vraagt
 * `?dry=1` doet alles behalve mails versturen en geeft terug wat er zou gebeuren.
 */
async function run(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const dry = new URL(request.url).searchParams.get('dry') === '1';

  try {
    const checked: string[] = [];
    const checkErrors: { slug: string; error: string }[] = [];
    const withSite = await sql`
      SELECT slug, site_url, probe_url FROM crm_projects
      WHERE template IS NOT NULL AND live_at IS NULL AND site_url IS NOT NULL
    `;
    for (const p of withSite) {
      try {
        await runAndStoreChecks(p.slug as string, p.site_url as string, (p.probe_url as string) ?? null);
        checked.push(p.slug as string);
      } catch (e) {
        checkErrors.push({ slug: p.slug as string, error: (e as Error).message });
      }
    }

    // Na de checks: overzicht opnieuw bepalen zodat falende checks meetellen.
    const overviews = await getLaunchOverviews();

    const settings = await sql`
      SELECT slug, name, reminders_enabled, last_reminder_at, weekly_enabled, last_weekly_at
      FROM crm_projects WHERE template IS NOT NULL AND live_at IS NULL
    `;

    // Wekelijks voortgangsbericht. Gaat vóór de herinnering: het bericht bevat de klantacties al,
    // dus in dezelfde run krijgt de klant niet ook nog een losse herinnering.
    const weeklySent: string[] = [];
    const weeklySkipped: { slug: string; reason: string }[] = [];
    const isMonday = new Date().getUTCDay() === 1;
    for (const s of settings) {
      if (!s.weekly_enabled) continue;
      const slug = s.slug as string;
      const ageDays = s.last_weekly_at ? (Date.now() - new Date(s.last_weekly_at).getTime()) / 86_400_000 : Infinity;
      if (ageDays < WEEKLY_INTERVAL_DAYS || (!isMonday && s.last_weekly_at)) continue;
      const to = await getClientEmail(slug);
      if (!to) {
        weeklySkipped.push({ slug, reason: 'geen klant-e-mail bekend' });
        continue;
      }
      const report = await buildWeeklyReport(slug);
      if (!report) {
        weeklySkipped.push({ slug, reason: 'niets te melden' });
        continue;
      }
      if (dry) {
        weeklySent.push(`${report.projectName} (dry-run → ${to})`);
        continue;
      }
      const { url } = await createMagicLink(slug, 'klant', to);
      const res = await sendEmail({ to, ...generateLaunchWeeklyEmail({ report, portalUrl: url }) });
      if (res.success) {
        await sql`UPDATE crm_projects SET last_weekly_at = NOW(), last_reminder_at = NOW() WHERE slug = ${slug}`;
        weeklySent.push(report.projectName);
      } else {
        weeklySkipped.push({ slug, reason: `mail mislukt: ${String(res.error).slice(0, 120)}` });
      }
    }

    const remindersSent: string[] = [];
    const remindersSkipped: { slug: string; reason: string }[] = [];
    for (const o of overviews) {
      if (o.clientTasksOpen.length === 0) continue;
      const s = settings.find((x) => x.slug === o.slug);
      if (!s?.reminders_enabled) {
        remindersSkipped.push({ slug: o.slug, reason: 'herinneringen staan uit' });
        continue;
      }
      if (s.last_reminder_at && Date.now() - new Date(s.last_reminder_at).getTime() < REMINDER_INTERVAL_DAYS * 86_400_000) {
        remindersSkipped.push({ slug: o.slug, reason: `laatste herinnering < ${REMINDER_INTERVAL_DAYS} dagen geleden` });
        continue;
      }
      const contactEmail = await getClientEmail(o.slug);
      if (!contactEmail) {
        remindersSkipped.push({ slug: o.slug, reason: 'geen klant-e-mail bekend (nog nooit een inloglink gestuurd)' });
        continue;
      }
      if (dry) {
        remindersSent.push(`${o.name} (dry-run → ${contactEmail})`);
        continue;
      }
      const { url } = await createMagicLink(o.slug, 'klant', contactEmail);
      const mail = generateLaunchClientReminderEmail({ projectName: o.name, portalUrl: url, tasks: o.clientTasksOpen });
      const res = await sendEmail({ to: contactEmail, ...mail });
      if (res.success) {
        await sql`UPDATE crm_projects SET last_reminder_at = NOW() WHERE slug = ${o.slug}`;
        remindersSent.push(o.name);
      } else {
        remindersSkipped.push({ slug: o.slug, reason: `mail mislukt: ${String(res.error).slice(0, 120)}` });
      }
    }

    const atRisk = overviews.filter((o) => o.risks.length > 0);
    let digestSent = false;
    if (atRisk.length > 0 && !dry) {
      const mail = generateLaunchDigestEmail({
        atRisk,
        onTrack: overviews.filter((o) => o.risks.length === 0),
        remindersSent: [...weeklySent, ...remindersSent],
      });
      digestSent = (await sendEmail({ to: VINCENT, ...mail })).success;
    }

    return NextResponse.json({
      ok: true,
      dry,
      launches: overviews.length,
      checked,
      checkErrors,
      weeklySent,
      weeklySkipped,
      remindersSent,
      remindersSkipped,
      atRisk: atRisk.map((o) => ({ slug: o.slug, risks: o.risks })),
      digestSent,
    });
  } catch (error) {
    console.error('Cron launch-daily error:', error);
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
