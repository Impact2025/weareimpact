import { NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

// GET — de acquisitieformule in cijfers: voorraad → gemaild → reactie → gesprek → klant.
// 'Bereikt' telt op de eenmalige tijdstempels, niet op de huidige status: een lead
// die al klant is, telt ook mee als gemaild en als reactie.
export async function GET() {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [f] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status <> 'rejected') AS total,
        COUNT(*) FILTER (WHERE status = 'new') AS stock,
        COUNT(*) FILTER (WHERE status = 'new' AND email IS NOT NULL AND COALESCE(unsubscribed,FALSE) = FALSE) AS mailable,
        COUNT(*) FILTER (WHERE status = 'new' AND email IS NULL AND phone IS NOT NULL) AS phone_only,
        COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL) AS contacted,
        COUNT(*) FILTER (WHERE replied_at IS NOT NULL) AS replied,
        COUNT(*) FILTER (WHERE meeting_at IS NOT NULL) AS meeting,
        COUNT(*) FILTER (WHERE won_at IS NOT NULL) AS won,
        COUNT(*) FILTER (WHERE status = 'lost') AS lost,
        COUNT(*) FILTER (WHERE COALESCE(unsubscribed,FALSE)) AS unsubscribed,
        COUNT(*) FILTER (WHERE signal IS NOT NULL AND status <> 'rejected') AS with_signal,
        COUNT(*) FILTER (WHERE segment = 'A' AND status <> 'rejected') AS seg_a,
        COUNT(*) FILTER (WHERE segment = 'B' AND status <> 'rejected') AS seg_b,
        COUNT(*) FILTER (WHERE segment = 'C' AND status <> 'rejected') AS seg_c,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days' AND status <> 'rejected') AS new_7d
      FROM prospect_leads WHERE tenant_id = 'weareimpact'
    `;
    const [o] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'sent' AND sent_at > NOW() - INTERVAL '7 days') AS sent_7d
      FROM lead_outreach WHERE tenant_id = 'weareimpact'
    `;
    const [seen] = await sql`
      SELECT COUNT(*) AS n FROM lead_seen WHERE tenant_id = 'weareimpact' AND kind = 'domain'
    `.catch(() => [{ n: 0 }]);
    const lastRun = await sql`
      SELECT status, error, created_at, total_found, total_saved FROM lead_search_runs
      WHERE tenant_id = 'weareimpact' AND profiles_run > 0
      ORDER BY created_at DESC LIMIT 1
    `.catch(() => []);

    const n = (v: unknown) => Number(v ?? 0);
    const rate = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);
    const contacted = n(f.contacted), replied = n(f.replied), meeting = n(f.meeting), won = n(f.won);

    return NextResponse.json({
      funnel: {
        total: n(f.total), stock: n(f.stock), mailable: n(f.mailable), phoneOnly: n(f.phone_only),
        contacted, replied, meeting, won, lost: n(f.lost), unsubscribed: n(f.unsubscribed),
      },
      rates: {
        reply: rate(replied, contacted),
        meeting: rate(meeting, replied),
        win: rate(won, meeting),
        mailsPerMeeting: meeting > 0 ? Math.round(contacted / meeting) : null,
      },
      segments: { A: n(f.seg_a), B: n(f.seg_b), C: n(f.seg_c) },
      withSignal: n(f.with_signal),
      new7d: n(f.new_7d),
      outreach: { drafts: n(o.drafts), approved: n(o.approved), sent7d: n(o.sent_7d) },
      evaluatedAndRejected: n(seen?.n),
      lastRun: lastRun[0] ?? null,
    });
  } catch (error) {
    console.error('Lead Machine stats error:', error);
    return NextResponse.json({ error: 'Statistieken ophalen mislukt' }, { status: 500 });
  }
}
