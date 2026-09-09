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

  const questions = await sql`
    SELECT id, question, status, client_answer, answered_at, sort_order, created_at
    FROM crm_questions
    WHERE project_slug = ${projectSlug}
    ORDER BY sort_order ASC, created_at ASC
  `;

  return NextResponse.json({ questions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { question } = await request.json();

  if (!question || !question.trim()) {
    return NextResponse.json({ error: 'question is verplicht' }, { status: 400 });
  }

  const maxRows = await sql`
    SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM crm_questions WHERE project_slug = ${projectSlug}
  `;
  const nextSort = (maxRows[0]?.max_sort ?? -1) + 1;

  await sql`
    INSERT INTO crm_questions (project_slug, question, sort_order)
    VALUES (${projectSlug}, ${question.trim()}, ${nextSort})
  `;

  return NextResponse.json({ success: true });
}
