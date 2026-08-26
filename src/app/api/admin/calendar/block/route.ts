import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { blockTime } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// Block a single time slot in the owner's Google Calendar.
// Body: { title, startTime (ISO), endTime (ISO), description? }
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, startTime, endTime, description } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'title, startTime en endTime zijn verplicht' },
        { status: 400 },
      );
    }

    const result = await blockTime({
      title,
      startTime,
      endTime,
      description: description || 'Geblokkeerd via Agenda',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Blokkeren mislukt' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, event: result.event });
  } catch (error) {
    console.error('Calendar block error:', error);
    return NextResponse.json(
      { error: 'Kon tijd niet blokkeren', detail: String(error) },
      { status: 500 },
    );
  }
}
