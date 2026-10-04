import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { anonymizeLead, getDownloadStats, listDownloadLeads } from '@/lib/download-leads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const days = Number(new URL(request.url).searchParams.get('days') ?? 30);
  try {
    const [stats, leads] = await Promise.all([
      getDownloadStats(Number.isFinite(days) ? days : 30),
      listDownloadLeads(150),
    ]);
    return NextResponse.json({ stats, leads });
  } catch (error) {
    console.error('Downloads GET error:', error);
    return NextResponse.json({ error: 'Kon downloads niet laden' }, { status: 500 });
  }
}

/** AVG-verzoek: wis de persoonsgegevens van één e-mailadres (de anonieme statistiek blijft). */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'erase' || typeof body.email !== 'string' || !body.email.includes('@')) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }
  try {
    const n = await anonymizeLead(body.email.trim());
    return NextResponse.json({ success: true, erased: n });
  } catch (error) {
    console.error('Downloads erase error:', error);
    return NextResponse.json({ error: 'Wissen mislukt' }, { status: 500 });
  }
}
