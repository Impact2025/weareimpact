import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ensureDossierForDeal } from '@/lib/crm/dossierFromDeal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Start (of open) het klantdossier bij deze deal
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const result = await ensureDossierForDeal(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Deal dossier error:', error);
    const message = error instanceof Error ? error.message : 'Kon dossier niet starten';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
