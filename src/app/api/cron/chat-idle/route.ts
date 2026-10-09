import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { findIdleConversations, summarizeAndNotify } from '@/lib/crm/idle-summary';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) return true;
  return isAdminAuthenticated();
}

/**
 * Elk uur: gesprekken met Iris die halverwege zijn gestopt (3 uur stil, nog geen samenvatting)
 * krijgen alsnog een samenvatting en een bericht aan Vincent. `?dry=1` meldt alleen wat er zou gebeuren.
 */
export async function GET(request: NextRequest) {
  if (!(await authorize(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dry = new URL(request.url).searchParams.get('dry') === '1';
  const idle = await findIdleConversations();
  const done: string[] = [];
  const failed: { slug: string; error: string }[] = [];
  for (const c of idle) {
    if (dry) {
      done.push(`${c.slug}/${c.audience} (dry-run)`);
      continue;
    }
    try {
      await summarizeAndNotify(c);
      done.push(`${c.slug}/${c.audience}`);
    } catch (e) {
      failed.push({ slug: c.slug, error: (e as Error).message.slice(0, 160) });
    }
  }
  return NextResponse.json({ done, failed, dry });
}
