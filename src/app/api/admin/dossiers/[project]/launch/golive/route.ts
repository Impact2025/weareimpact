import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { loadMilestones, summarize } from '@/lib/launch/summary';
import { scheduleNazorgMilestones } from '@/lib/crm/aftercare';
import { onDelivered } from '@/lib/finance/flow';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Go-live-gate: alleen door als geen enkele blokkerende taak (buiten Nazorg) openstaat. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: slug } = await params;

  const summary = summarize(await loadMilestones(slug));
  if (!summary.ready) {
    return NextResponse.json(
      { error: 'Go-live geblokkeerd', blockers: summary.blockers },
      { status: 409 },
    );
  }

  await sql`UPDATE crm_projects SET live_at = COALESCE(live_at, NOW()) WHERE slug = ${slug}`;
  // Nazorg start: deadlines voor de Nazorg-milestones vanaf de livedatum
  const scheduled = await scheduleNazorgMilestones(slug);
  // Oplevering: zet de factuurtermijn "bij oplevering" klaar. Mag de go-live nooit blokkeren.
  try {
    const [project] = await sql`SELECT deal_id FROM crm_projects WHERE slug = ${slug}`;
    if (project?.deal_id) await onDelivered(project.deal_id as string);
  } catch (err) {
    console.error('Facturatie na go-live mislukt:', err);
  }
  return NextResponse.json({ success: true, nazorgScheduled: scheduled });
}
