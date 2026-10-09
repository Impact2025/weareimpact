import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { sql } from '@/lib/db/neon';
import { isValidPortalSessionToken, portalCookieName, isAudience, type Audience } from '@/lib/crm/portal-session';
import { getClaude, DEFAULT_MODELS } from '@/lib/ai/claude';
import { buildPulseSystemPrompt, executePulseTool, getLatestPulse, pulseTools } from '@/lib/crm/pulse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TOOL_ROUNDS = 3;

async function authorized(projectSlug: string, audience: Audience): Promise<boolean> {
  const store = await cookies();
  return isValidPortalSessionToken(store.get(portalCookieName(projectSlug, audience))?.value, projectSlug, audience);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ project: string; audience: string }> }) {
  const { project: slug, audience } = await params;
  if (!isAudience(audience) || !(await authorized(slug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pulse = await getLatestPulse(slug);
  if (!pulse) return NextResponse.json({ pulse: null, messages: [], finished: false });
  const messages = await sql`
    SELECT role, content FROM crm_pulse_messages WHERE pulse_id = ${pulse.id} ORDER BY created_at ASC
  `;
  return NextResponse.json({ pulse: { id: pulse.id, weekStart: pulse.week_start }, messages, finished: !!pulse.completed_at });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ project: string; audience: string }> }) {
  const { project: slug, audience } = await params;
  if (!isAudience(audience) || !(await authorized(slug, audience))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pulse = await getLatestPulse(slug);
  if (!pulse) return NextResponse.json({ error: 'Geen weekcheck open' }, { status: 404 });

  const { message } = await request.json();
  const userText = typeof message === 'string' ? message.trim().slice(0, 4000) : '';

  if (pulse.completed_at) {
    return NextResponse.json({ reply: 'Je weekcheck is al binnen, bedankt! Tot volgende week.', finished: true });
  }

  if (userText) {
    await sql`INSERT INTO crm_pulse_messages (pulse_id, role, content) VALUES (${pulse.id}, 'user', ${userText})`;
  }
  const history = await sql`
    SELECT role, content FROM crm_pulse_messages WHERE pulse_id = ${pulse.id} ORDER BY created_at ASC
  `;

  try {
    const client = getClaude();
    const convo: ChatCompletionMessageParam[] = [
      { role: 'system', content: await buildPulseSystemPrompt(slug, pulse.id) },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content as string })),
    ];
    if (history.length === 0) convo.push({ role: 'user', content: '(De klant opent de weekcheck. Begin het gesprek.)' });

    let reply = '';
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await client.chat.completions.create({
        model: DEFAULT_MODELS.chat,
        messages: convo,
        tools: pulseTools,
        tool_choice: 'auto',
        temperature: 0.5,
        max_tokens: 400,
      });
      const msg = resp.choices[0]?.message;
      if (!msg) break;
      convo.push(msg as ChatCompletionMessageParam);
      const calls = msg.tool_calls ?? [];
      if (calls.length === 0) {
        reply = msg.content ?? '';
        break;
      }
      for (const tc of calls) {
        if (tc.type !== 'function') continue;
        let args: Record<string, unknown> = {};
        try {
          args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          args = {};
        }
        convo.push({ role: 'tool', tool_call_id: tc.id, content: await executePulseTool(pulse.id, tc.function.name, args) });
      }
    }
    reply = reply.replace(/\*\*/g, '').trim() || 'Bedankt voor je antwoord!';

    await sql`INSERT INTO crm_pulse_messages (pulse_id, role, content) VALUES (${pulse.id}, 'assistant', ${reply})`;
    const [done] = await sql`SELECT completed_at FROM crm_pulses WHERE id = ${pulse.id}`;
    return NextResponse.json({ reply, finished: !!done?.completed_at });
  } catch (error) {
    console.error('Pulse chat error:', error);
    return NextResponse.json({ error: 'Chat mislukt' }, { status: 500 });
  }
}
