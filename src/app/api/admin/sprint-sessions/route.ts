import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/neon';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET - alle deals die uit een sprint-boeking zijn ontstaan (source begint met 'sprint:'),
// met de status van hun sprint-sessie (indien al aangemaakt).
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT
        d.id as deal_id,
        d.title,
        d.stage,
        d.source,
        d.created_at,
        co.name as company_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) as contact_name,
        s.status as session_status,
        s.updated_at as session_updated_at
      FROM deals d
      LEFT JOIN companies co ON co.id = d.company_id
      LEFT JOIN contacts c ON c.id = d.contact_id
      LEFT JOIN sprint_sessions s ON s.deal_id = d.id
      WHERE d.source LIKE 'sprint:%'
      ORDER BY d.created_at DESC
    `;

    return NextResponse.json({
      sessions: rows.map((r) => ({
        dealId: r.deal_id,
        title: r.title,
        stage: r.stage,
        sprintSlug: (r.source as string).replace('sprint:', ''),
        companyName: r.company_name,
        contactName: r.contact_name,
        sessionStatus: r.session_status || 'gepland',
        createdAt: r.created_at,
        sessionUpdatedAt: r.session_updated_at,
      })),
    });
  } catch (error) {
    console.error('Sprint sessions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sprint sessions', sessions: [] }, { status: 500 });
  }
}
