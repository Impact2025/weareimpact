import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience, type Audience } from '@/lib/crm/portal-session';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';
import { buildChatSystemPrompt, crmChatTools, executeCrmChatTool, type DossierQuestion } from '@/lib/crm/chat';
import {
  DOCUMENT_INLINE_THRESHOLD,
  documentReferenceLabel,
  getDocument,
  saveDocument,
} from '@/lib/crm/documents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TOOL_ROUNDS = 6;

async function requireProjectSession(projectSlug: string, audience: Audience): Promise<boolean> {
  const store = await cookies();
  const token = store.get(portalCookieName(projectSlug, audience))?.value;
  return isValidPortalSessionToken(token, projectSlug, audience);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string }> },
) {
  const { project: projectSlug, audience } = await params;
  if (!isAudience(audience) || !(await requireProjectSession(projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await sql`
    SELECT role, content, created_at
    FROM crm_chat_messages
    WHERE project_slug = ${projectSlug} AND audience = ${audience}
    ORDER BY created_at ASC
  `;
  const summary = await sql`
    SELECT id FROM crm_chat_summaries WHERE project_slug = ${projectSlug} AND audience = ${audience} LIMIT 1
  `;

  return NextResponse.json({ messages, finished: summary.length > 0 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string; audience: string }> },
) {
  const { project: projectSlug, audience } = await params;
  if (!isAudience(audience) || !(await requireProjectSession(projectSlug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, documentId } = await request.json();
  const userText = typeof message === 'string' ? message.trim() : '';

  const projectRows = await sql`SELECT name, intake_notes FROM crm_projects WHERE slug = ${projectSlug}`;
  const project = projectRows[0];
  if (!project) {
    return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  }

  const questionRows = await sql`
    SELECT id, question, status, client_answer
    FROM crm_questions
    WHERE project_slug = ${projectSlug} AND audience = ${audience}
    ORDER BY sort_order ASC, created_at ASC
  `;
  const questions = questionRows as unknown as DossierQuestion[];

  const historyRows = await sql`
    SELECT role, content
    FROM crm_chat_messages
    WHERE project_slug = ${projectSlug} AND audience = ${audience}
    ORDER BY created_at ASC
  `;

  // Een expliciete upload (documentId, via /documents) of een groot stuk
  // geplakte tekst wordt niet als gewoon berichtje bewaard: de volledige
  // inhoud gaat naar crm_documents en wordt hier eenmalig aan het model
  // gevoerd; de blijvende chatgeschiedenis krijgt alleen een korte
  // verwijzing, anders groeit elk vervolgbericht ongecontroleerd.
  let fullTextForThisTurn: string | null = null;
  let storedUserContent: string | null = null;

  if (typeof documentId === 'string' && documentId) {
    const doc = await getDocument(documentId, projectSlug, audience);
    if (!doc) {
      return NextResponse.json({ error: 'Document niet gevonden.' }, { status: 404 });
    }
    const label = documentReferenceLabel(doc.filename, doc.extracted_text.length);
    storedUserContent = userText ? `${label}\n${userText}` : label;
    fullTextForThisTurn = `${label}\n\n${doc.extracted_text}${userText ? `\n\n${userText}` : ''}`;
  } else if (userText.length > DOCUMENT_INLINE_THRESHOLD) {
    const filename = `Geplakte tekst - ${new Date().toISOString().slice(0, 10)}`;
    const doc = await saveDocument({
      projectSlug,
      audience,
      filename,
      contentType: 'text/plain',
      sizeBytes: userText.length,
      blobUrl: null,
      extractedText: userText,
      source: 'pasted',
    });
    const label = documentReferenceLabel(doc.filename, doc.extracted_text.length);
    storedUserContent = label;
    fullTextForThisTurn = `${label}\n\n${userText}`;
  } else if (userText) {
    storedUserContent = userText;
  }

  if (storedUserContent) {
    await sql`
      INSERT INTO crm_chat_messages (project_slug, audience, role, content)
      VALUES (${projectSlug}, ${audience}, 'user', ${storedUserContent})
    `;
  }

  try {
    const client = getOpenRouter();
    const convo: ChatCompletionMessageParam[] = [
      { role: 'system', content: buildChatSystemPrompt(project.name, questions, project.intake_notes, audience) },
      ...historyRows.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ...(fullTextForThisTurn
        ? [{ role: 'user' as const, content: fullTextForThisTurn }]
        : storedUserContent
          ? [{ role: 'user' as const, content: storedUserContent }]
          : []),
    ];

    let finalContent = '';
    let finishCalled = false;
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
        if (tc.function.name === 'finish_conversation') finishCalled = true;
        const result = await executeCrmChatTool(projectSlug, audience, tc.function.name, args);
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

    // Vangnet: als na dit antwoord alle vragen zijn beantwoord maar Iris zelf
    // finish_conversation niet heeft aangeroepen (zoals bij Stéphanie
    // gebeurde — het gesprek liep door zonder ooit af te ronden), dwingen we
    // één extra modelaanroep af die die tool wél moet gebruiken. Zo hangt een
    // samenvatting nooit alleen af van of het model daar zelf aan denkt.
    if (!finishCalled) {
      const stillOpen = await sql`
        SELECT COUNT(*)::int AS n FROM crm_questions
        WHERE project_slug = ${projectSlug} AND audience = ${audience} AND status = 'open'
      `;
      const existingSummary = await sql`
        SELECT id FROM crm_chat_summaries WHERE project_slug = ${projectSlug} AND audience = ${audience} LIMIT 1
      `;
      if (stillOpen[0]?.n === 0 && existingSummary.length === 0) {
        convo.push({ role: 'assistant', content: finalContent });
        convo.push({
          role: 'system',
          content:
            'Alle vragen uit de vragenlijst zijn nu beantwoord. Rond het gesprek nu af: roep de ' +
            'tool finish_conversation aan met een feitelijke samenvatting en concrete ' +
            'vervolgstappen voor Vincent.',
        });
        const wrapResp = await client.chat.completions.create({
          model: DEFAULT_MODELS.chat,
          messages: convo,
          tools: crmChatTools,
          tool_choice: { type: 'function', function: { name: 'finish_conversation' } },
          temperature: 0.3,
          max_tokens: 500,
        });
        const wrapMsg = wrapResp.choices[0]?.message;
        const wrapCalls = wrapMsg?.tool_calls ?? [];
        for (const tc of wrapCalls) {
          if (tc.type !== 'function') continue;
          let args: Record<string, unknown> = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch {
            args = {};
          }
          await executeCrmChatTool(projectSlug, audience, tc.function.name, args);
        }
      }
    }

    await sql`
      INSERT INTO crm_chat_messages (project_slug, audience, role, content)
      VALUES (${projectSlug}, ${audience}, 'assistant', ${finalContent})
    `;

    const summary = await sql`
      SELECT id FROM crm_chat_summaries WHERE project_slug = ${projectSlug} AND audience = ${audience} LIMIT 1
    `;

    return NextResponse.json({ reply: finalContent, finished: summary.length > 0 });
  } catch (error) {
    console.error('CRM chat error:', error);
    return NextResponse.json({ error: 'Chat mislukt' }, { status: 500 });
  }
}
