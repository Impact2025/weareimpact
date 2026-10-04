import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { anonymizeExpired } from '@/lib/download-leads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RETENTION_MONTHS = 24;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

/** Maandelijks: anonimiseer download-aanvragen ouder dan 24 maanden (tenzij CRM-contact of opt-in). */
export async function GET(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const anonymized = await anonymizeExpired(RETENTION_MONTHS);
    return NextResponse.json({ success: true, retentionMonths: RETENTION_MONTHS, anonymized });
  } catch (error) {
    console.error('Download-retention error:', error);
    return NextResponse.json({ error: 'Opschonen mislukt' }, { status: 500 });
  }
}
