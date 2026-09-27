import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { countOpenInbox, listInbox, type InboxStatus } from '@/lib/crm/inbox';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: (InboxStatus | 'all')[] = ['open', 'converted', 'dismissed', 'all'];

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.get('count') === '1') {
      return NextResponse.json({ open: await countOpenInbox() });
    }
    const requested = searchParams.get('status') as InboxStatus | 'all' | null;
    const status = requested && STATUSES.includes(requested) ? requested : 'open';
    const [items, open] = await Promise.all([listInbox(status), countOpenInbox()]);
    return NextResponse.json({ items, open });
  } catch (error) {
    console.error('Inbox GET error:', error);
    return NextResponse.json({ error: 'Kon inbox niet laden' }, { status: 500 });
  }
}
