import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAndSendMagicLink } from '@/lib/crm/magic-link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Alleen Vincent (admin) mag een magic link laten versturen — dit is het
// enige punt waarop een klant toegang krijgt tot een dossier, dus geen
// self-service hier.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectSlug, email } = await request.json();
  if (!projectSlug || !email) {
    return NextResponse.json({ error: 'projectSlug en email zijn verplicht' }, { status: 400 });
  }

  try {
    const result = await createAndSendMagicLink(projectSlug, email);
    return NextResponse.json({ success: true, expiresAt: result.expiresAt });
  } catch (error) {
    console.error('Failed to create magic link:', error);
    return NextResponse.json({ error: 'Kon magic link niet aanmaken' }, { status: 500 });
  }
}
