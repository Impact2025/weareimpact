import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { createMagicLink } from '@/lib/crm/magic-link';
import { buildWeeklyReport } from '@/lib/launch/weekly';
import { getClientEmail } from '@/lib/launch/client-contact';
import { generateLaunchWeeklyEmail } from '@/lib/email/templates/launch-weekly';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Voorbeeld of directe verzending van het wekelijkse voortgangsbericht.
 * body: { send?: boolean } — zonder send krijg je alleen het voorbeeld terug (geen inloglink aangemaakt).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;
  const { send } = await request.json().catch(() => ({ send: false }));

  const report = await buildWeeklyReport(slug);
  if (!report) {
    return NextResponse.json({ error: 'Er valt niets te melden: geen voor de klant zichtbare taken in beweging' }, { status: 409 });
  }
  const to = await getClientEmail(slug);

  if (!send) {
    const mail = generateLaunchWeeklyEmail({ report, portalUrl: '#voorbeeld' });
    return NextResponse.json({ preview: mail, to });
  }
  if (!to) {
    return NextResponse.json({ error: 'Geen klant-e-mail bekend: stuur eerst een inloglink vanuit het dossier' }, { status: 409 });
  }

  const { url } = await createMagicLink(slug, 'klant', to);
  const mail = generateLaunchWeeklyEmail({ report, portalUrl: url });
  const res = await sendEmail({ to, ...mail });
  if (!res.success) {
    return NextResponse.json({ error: `Versturen mislukt: ${res.error}` }, { status: 502 });
  }
  await sql`UPDATE crm_projects SET last_weekly_at = NOW() WHERE slug = ${slug}`;
  return NextResponse.json({ success: true, to });
}
