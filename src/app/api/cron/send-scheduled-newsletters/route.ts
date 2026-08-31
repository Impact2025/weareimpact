import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendNewsletterCampaign } from '@/lib/email/sendNewsletterCampaign';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Dispatches any newsletter campaign whose scheduled_at has passed.
 * Without this cron, "Gepland verzenden" only ever set a status in the
 * database — nothing ever actually sent the email.
 */
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

async function run(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const due = await sql`
      SELECT id FROM newsletter_campaigns
      WHERE status = 'scheduled' AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `;

    const results: { campaignId: string; ok: boolean; sentCount?: number; error?: string }[] = [];

    for (const row of due as { id: string }[]) {
      try {
        const result = await sendNewsletterCampaign(row.id);
        results.push({ campaignId: row.id, ok: result.ok, sentCount: result.sentCount, error: result.error });
      } catch (error) {
        results.push({ campaignId: row.id, ok: false, error: error instanceof Error ? error.message : String(error) });
        await sql`UPDATE newsletter_campaigns SET status = 'failed' WHERE id = ${row.id}`.catch(() => {});
      }
    }

    return NextResponse.json({ ok: true, checked: due.length, results });
  } catch (error) {
    console.error('Cron send-scheduled-newsletters error:', error);
    return NextResponse.json({ error: 'Cron mislukt', detail: String(error) }, { status: 500 });
  }
}
