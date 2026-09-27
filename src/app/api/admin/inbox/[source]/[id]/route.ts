import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  convertInboxItem,
  dismissInboxItem,
  getInboxItem,
  isInboxSource,
  reopenInboxItem,
} from '@/lib/crm/inbox';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST { action: 'convert' | 'dismiss' | 'reopen', createDeal?, dealTitle?, dealValue? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ source: string; id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { source, id } = await params;
  if (!isInboxSource(source)) {
    return NextResponse.json({ error: 'Onbekende bron' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    if (body.action === 'dismiss') {
      await dismissInboxItem(source, id);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'reopen') {
      await reopenInboxItem(source, id);
      return NextResponse.json({ success: true });
    }
    if (body.action !== 'convert') {
      return NextResponse.json({ error: 'Onbekende actie' }, { status: 400 });
    }

    const item = await getInboxItem(source, id);
    if (!item) return NextResponse.json({ error: 'Lead niet gevonden' }, { status: 404 });
    if (item.status === 'converted') {
      return NextResponse.json({ error: 'Deze lead is al omgezet' }, { status: 409 });
    }
    if (!item.email) {
      return NextResponse.json({ error: 'Deze lead heeft geen e-mailadres' }, { status: 400 });
    }

    const value = body.dealValue === '' || body.dealValue == null ? null : Number(body.dealValue);
    const result = await convertInboxItem(item, {
      createDeal: body.createDeal !== false,
      dealTitle: typeof body.dealTitle === 'string' ? body.dealTitle : undefined,
      dealValue: Number.isFinite(value) ? value : null,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Inbox action error:', error);
    return NextResponse.json({ error: 'Actie mislukt' }, { status: 500 });
  }
}
