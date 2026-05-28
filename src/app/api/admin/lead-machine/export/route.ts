import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

async function isAuthenticated() {
  const store = await cookies();
  return !!store.get('admin_session')?.value;
}

function escape(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const rows = status && status !== 'all'
      ? await sql`SELECT * FROM prospect_leads WHERE tenant_id = 'weareimpact' AND status = ${status} ORDER BY ai_score DESC NULLS LAST, created_at DESC`
      : await sql`SELECT * FROM prospect_leads WHERE tenant_id = 'weareimpact' ORDER BY ai_score DESC NULLS LAST, created_at DESC`;

    const headers = ['Naam', 'Stad', 'SBI-code', 'SBI-omschrijving', 'E-mail', 'Telefoon', 'Website', 'AI-score', 'AI-toelichting', 'Status', 'KVK-nummer', 'Aangemaakt'];
    const lines = [
      headers.join(','),
      ...rows.map((r: Record<string, unknown>) =>
        [r.name, r.city, r.sbi_code, r.sbi_description, r.email, r.phone, r.website, r.ai_score, r.ai_rationale, r.status, r.kvk_number, r.created_at]
          .map(escape)
          .join(','),
      ),
    ];

    const csv = lines.join('\r\n');
    const filename = `lead-machine-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Lead Machine export error:', error);
    return NextResponse.json({ error: 'Export mislukt' }, { status: 500 });
  }
}
