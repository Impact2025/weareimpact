import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated as isAuthenticated } from '@/lib/admin-auth';
import { pushLeadToCrm, type PushResult } from '@/lib/lead-machine/crmPush';

export const dynamic = 'force-dynamic';

// POST — zet één of meer leads in het CRM. Body: { leadId } of { leadIds: [] }
export async function POST(request: NextRequest) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids: string[] = body.leadIds ?? (body.leadId ? [body.leadId] : []);
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Geen lead-IDs opgegeven' }, { status: 400 });
    }

    const results: PushResult[] = [];
    for (const id of ids) {
      const r = await pushLeadToCrm(id);
      if (r) results.push(r);
    }

    return NextResponse.json({
      results,
      pushed: results.filter((r) => !r.alreadyExisted).length,
      enriched: results.filter((r) => r.alreadyExisted).length,
    });
  } catch (error) {
    console.error('push-to-crm error:', error);
    return NextResponse.json({ error: 'Push mislukt', detail: String(error) }, { status: 500 });
  }
}
