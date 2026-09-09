import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName } from '@/lib/crm/portal-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireProjectSession(projectSlug: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug))?.value;
  return isValidPortalSessionToken(token, projectSlug);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  const { project: projectSlug } = await params;
  if (!(await requireProjectSession(projectSlug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const questions = await sql`
    SELECT id, question, status, client_answer, answered_at
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
  const { project: projectSlug } = await params;
  if (!(await requireProjectSession(projectSlug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questionId, answer } = await request.json();
  if (!questionId || typeof answer !== 'string' || !answer.trim()) {
    return NextResponse.json({ error: 'questionId en answer zijn verplicht' }, { status: 400 });
  }

  // project_slug staat in de WHERE, niet alleen id — voorkomt dat een geldige
  // sessie voor project A een vraag van project B zou kunnen aanpassen.
  const result = await sql`
    UPDATE crm_questions
    SET client_answer = ${answer.trim()}, status = 'answered', answered_at = NOW(), updated_at = NOW()
    WHERE id = ${questionId} AND project_slug = ${projectSlug}
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: 'Vraag niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
