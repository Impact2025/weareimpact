import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email/send';
import { createMagicLink } from '@/lib/crm/magic-link';
import { getClientEmail } from '@/lib/launch/client-contact';
import { createPulse, getLatestPulse } from '@/lib/crm/pulse';
import { generatePulseEmail } from '@/lib/email/templates/pulse-weekly';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MIN_DAYS_BETWEEN = 5;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

/**
 * Vrijdagmiddag: nodigt de klant uit voor de weekcheck-chat met Iris, voor elk project met pulse_enabled.
 * `?dry=1` verstuurt niets; `?slug=x` beperkt tot één project en slaat de weekgrens over (handmatig starten).
 */
export async function GET(request: NextRequest) {
  if (!(await authorize(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const dry = url.searchParams.get('dry') === '1';
  const onlySlug = url.searchParams.get('slug');

  const projects = onlySlug
    ? await sql`SELECT slug, name, last_pulse_at FROM crm_projects WHERE pulse_enabled = TRUE AND slug = ${onlySlug}`
    : await sql`SELECT slug, name, last_pulse_at FROM crm_projects WHERE pulse_enabled = TRUE`;
  const sent: string[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const p of projects) {
    const slug = p.slug as string;
    const ageDays = p.last_pulse_at ? (Date.now() - new Date(p.last_pulse_at as string).getTime()) / 86_400_000 : Infinity;
    if (!onlySlug && ageDays < MIN_DAYS_BETWEEN) {
      skipped.push({ slug, reason: 'al een pulse deze week' });
      continue;
    }
    const to = await getClientEmail(slug);
    if (!to) {
      skipped.push({ slug, reason: 'geen klant-e-mail bekend' });
      continue;
    }
    if (dry) {
      sent.push(`${slug} (dry-run → ${to})`);
      continue;
    }
    // Een nog open pulse hergebruiken we, zodat een tweede uitnodiging geen half gesprek wegmoffelt.
    const latest = await getLatestPulse(slug);
    if (!latest || latest.completed_at) await createPulse(slug);
    const { url: link } = await createMagicLink(slug, 'klant', to);
    const res = await sendEmail({
      to,
      ...generatePulseEmail({ projectName: p.name as string, chatUrl: `${link}&next=pulse` }),
    });
    if (res.success) {
      await sql`UPDATE crm_projects SET last_pulse_at = NOW() WHERE slug = ${slug}`;
      sent.push(slug);
    } else {
      skipped.push({ slug, reason: `mail mislukt: ${String(res.error).slice(0, 120)}` });
    }
  }
  return NextResponse.json({ sent, skipped, dry });
}
