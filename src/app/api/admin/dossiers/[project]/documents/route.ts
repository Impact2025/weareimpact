import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;

  const documents = await sql`
    SELECT id, filename, content_type, size_bytes, blob_url, source, audience, created_at,
           LEFT(extracted_text, 400) AS preview
    FROM crm_documents
    WHERE project_slug = ${projectSlug}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ documents });
}
