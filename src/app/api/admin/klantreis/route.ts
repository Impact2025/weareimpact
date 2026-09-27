import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getKlantreisOverview } from '@/lib/crm/overview';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json(await getKlantreisOverview());
  } catch (error) {
    console.error('Klantreis overview error:', error);
    return NextResponse.json({ error: 'Kon klantreis niet laden' }, { status: 500 });
  }
}
