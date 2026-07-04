import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { renderOutreachHtml, renderOutreachText } from '@/lib/lead-machine/outreach';

export const dynamic = 'force-dynamic';

// POST { id } — send a single draft to the owner's own inbox as a preview.
// Does NOT change the outreach/lead status, and uses a throwaway unsubscribe token
// so clicking "afmelden" in the test doesn't archive the real lead.
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const rows = await sql`
      SELECT subject, body_text FROM lead_outreach
      WHERE id = ${id} AND tenant_id = 'weareimpact'
      LIMIT 1
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

    const owner = process.env.ADMIN_EMAIL || 'v.munster@weareimpact.nl';
    const dummyToken = 'test-preview-niet-geldig';
    const subject = `[TEST] ${rows[0].subject}`;
    const bodyText = rows[0].body_text as string;

    const result = await sendEmail({
      to: owner,
      subject,
      html: renderOutreachHtml(bodyText, dummyToken),
      text: renderOutreachText(bodyText, dummyToken),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Versturen mislukt' }, { status: 500 });
    }
    return NextResponse.json({ success: true, to: owner });
  } catch (error) {
    console.error('Outreach test error:', error);
    return NextResponse.json({ error: 'Testmail mislukt' }, { status: 500 });
  }
}
