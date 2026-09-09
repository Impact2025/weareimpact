import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await sql`
    SELECT p.slug, p.name, p.client_name, p.created_at,
      COUNT(q.id) FILTER (WHERE q.status = 'open') AS open_count,
      COUNT(q.id) FILTER (WHERE q.status = 'answered') AS answered_count
    FROM crm_projects p
    LEFT JOIN crm_questions q ON q.project_slug = p.slug
    GROUP BY p.slug, p.name, p.client_name, p.created_at
    ORDER BY p.created_at DESC
  `;

  return NextResponse.json({ projects });
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug, name, clientName } = await request.json();
  if (!slug || !name || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'slug (lowercase, alleen letters/cijfers/koppeltekens) en name zijn verplicht' },
      { status: 400 },
    );
  }

  try {
    await sql`
      INSERT INTO crm_projects (slug, name, client_name)
      VALUES (${slug}, ${name}, ${clientName ?? null})
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Slug bestaat mogelijk al' }, { status: 409 });
  }
}
