import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAndSendMagicLink } from '@/lib/crm/magic-link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'email is verplicht' }, { status: 400 });
  }

  try {
    const result = await createAndSendMagicLink(projectSlug, email);
    return NextResponse.json({ success: true, url: result.url, expiresAt: result.expiresAt });
  } catch (error) {
    console.error('Failed to create magic link:', error);
    return NextResponse.json({ error: 'Kon magic link niet aanmaken' }, { status: 500 });
  }
}
