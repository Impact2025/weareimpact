import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendFeedbackRequest } from '@/lib/crm/aftercare';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Stuur de tevredenheidsvraag naar de primaire contactpersoon
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const result = await sendFeedbackRequest(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Feedback request error:', error);
    const message = error instanceof Error ? error.message : 'Versturen mislukt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
