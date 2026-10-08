import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience } from '@/lib/crm/portal-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Documenten die WeAreImpact bewust met de klant deelt (bv. een addendum om te tekenen).
// Los van wat de klant zelf in de chat uploadt: alleen rijen met client_visible én een bestand.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string }> },
) {
  const { project: projectSlug, audience } = await params;
  if (!isAudience(audience)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  if (!(await isValidPortalSessionToken(token, projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const documents = await sql`
    SELECT id, filename, description, content_type, size_bytes, created_at
    FROM crm_documents
    WHERE project_slug = ${projectSlug} AND audience = ${audience}
      AND client_visible = TRUE AND file_data IS NOT NULL
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ documents });
}
