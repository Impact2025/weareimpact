import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName } from '@/lib/crm/portal-session';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { buildChatSystemPrompt, crmChatTools, executeCrmChatTool, type DossierQuestion } from '@/lib/crm/chat';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TOOL_ROUNDS = 6;

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

  const messages = await sql`
    SELECT role, content, created_at
    FROM crm_chat_messages
    WHERE project_slug = ${projectSlug}
    ORDER BY created_at ASC
  `;
  const summary = await sql`
    SELECT id FROM crm_chat_summaries WHERE project_slug = ${projectSlug} LIMIT 1
  `;

  return NextResponse.json({ messages, finished: summary.length > 0 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  const { project: projectSlug } = await params;
  if (!(await requireProjectSession(projectSlug))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();

  const projectRows = await sql`SELECT name FROM crm_projects WHERE slug = ${projectSlug}`;
  const project = projectRows[0];
  if (!project) {
    return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  }

  const questionRows = await sql`
    SELECT id, question, status, client_answer
    FROM crm_questions
    WHERE project_slug = ${projectSlug}
    ORDER BY sort_order ASC, created_at ASC
  `;
  const questions = questionRows as unknown as DossierQuestion[];

  const historyRows = await sql`
    SELECT role, content
    FROM crm_chat_messages
    WHERE project_slug = ${projectSlug}
    ORDER BY created_at ASC
  `;

  if (message && typeof message === 'string' && message.trim()) {
    await sql`
      INSERT INTO crm_chat_messages (project_slug, role, content)
      VALUES (${projectSlug}, 'user', ${message.trim()})
    `;
  }

  try {
    const client = getOpenRouter();
    const convo: ChatCompletionMessageParam[] = [
      { role: 'system', content: buildChatSystemPrompt(project.name, questions) },
      ...historyRows.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ...(message && typeof message === 'string' && message.trim()
        ? [{ role: 'user' as const, content: message.trim() }]
        : []),
    ];

    let finalContent = '';
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await client.chat.completions.create({
        model: DEFAULT_MODELS.chat,
        messages: convo,
        tools: crmChatTools,
        tool_choice: 'auto',
        temperature: 0.5,
        max_tokens: 500,
      });

      const msg = resp.choices[0]?.message;
      if (!msg) break;
      convo.push(msg as ChatCompletionMessageParam);

      const toolCalls = msg.tool_calls ?? [];
      if (toolCalls.length === 0) {
        finalContent = msg.content ?? '';
        break;
      }

      for (const tc of toolCalls) {
        if (tc.type !== 'function') continue;
        let args: Record<string, unknown> = {};
        try {
          args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          args = {};
        }
        const result = await executeCrmChatTool(projectSlug, tc.function.name, args);
        convo.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
    }

    if (!finalContent) {
      const finalResp = await client.chat.completions.create({
        model: DEFAULT_MODELS.chat,
        messages: convo,
        temperature: 0.5,
        max_tokens: 500,
      });
      finalContent = finalResp.choices[0]?.message?.content ?? 'Bedankt voor je antwoord!';
    }

    await sql`
      INSERT INTO crm_chat_messages (project_slug, role, content)
      VALUES (${projectSlug}, 'assistant', ${finalContent})
    `;

    const summary = await sql`
      SELECT id FROM crm_chat_summaries WHERE project_slug = ${projectSlug} LIMIT 1
    `;

    return NextResponse.json({ reply: finalContent, finished: summary.length > 0 });
  } catch (error) {
    console.error('CRM chat error:', error);
    return NextResponse.json({ error: 'Chat mislukt' }, { status: 500 });
  }
}
