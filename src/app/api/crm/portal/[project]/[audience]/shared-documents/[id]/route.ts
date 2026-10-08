import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience } from '@/lib/crm/portal-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string; id: string }> },
) {
  const { project: projectSlug, audience, id } = await params;
  if (!isAudience(audience)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  if (!(await isValidPortalSessionToken(token, projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  }

  const rows = await sql`
    SELECT filename, content_type, file_data
    FROM crm_documents
    WHERE id = ${id} AND project_slug = ${projectSlug} AND audience = ${audience}
      AND client_visible = TRUE AND file_data IS NOT NULL
  `;
  const doc = rows[0];
  if (!doc) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  // Neon geeft BYTEA terug als Buffer of als hex-string, afhankelijk van de driver.
  const raw = doc.file_data as unknown;
  const bytes = Buffer.isBuffer(raw)
    ? raw
    : typeof raw === 'string' && raw.startsWith('\\x')
      ? Buffer.from(raw.slice(2), 'hex')
      : Buffer.from(raw as Uint8Array);

  const filename = String(doc.filename);
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '');
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': (doc.content_type as string) || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'private, no-store',
    },
  });
}
