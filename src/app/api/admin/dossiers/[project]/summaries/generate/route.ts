import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { isAudience } from '@/lib/crm/portal-session';
import { getOpenRouter, DEFAULT_MODELS } from '@/lib/ai/openrouter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Vangnet voor als Iris zelf nooit finish_conversation heeft aangeroepen
// (zoals bij Stéphanie): Vincent kan hiermee alsnog, op elk moment, een
// samenvatting van het ruwe transcript laten genereren — onafhankelijk van
// of het model daar tijdens het gesprek zelf aan dacht.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { project: projectSlug } = await params;
  const { audience } = await request.json();
  if (!isAudience(audience)) {
    return NextResponse.json({ error: 'Ongeldige doelgroep' }, { status: 400 });
  }

  const messages = await sql`
    SELECT role, content, created_at
    FROM crm_chat_messages
    WHERE project_slug = ${projectSlug} AND audience = ${audience}
    ORDER BY created_at ASC
  `;
  if (messages.length === 0) {
    return NextResponse.json({ error: 'Geen gesprek gevonden voor deze doelgroep.' }, { status: 404 });
  }

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'KLANT' : 'IRIS'}: ${m.content}`)
    .join('\n\n');

  const client = getOpenRouter();
  const resp = await client.chat.completions.create({
    model: DEFAULT_MODELS.admin,
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      {
        role: 'system',
        content:
          'Je vat een klantgesprek samen voor Vincent van WeAreImpact. Wees feitelijk en bondig, ' +
          'geen aannames of eigen toezeggingen. Antwoord ALLEEN met geldige JSON in dit exacte ' +
          'formaat, zonder markdown-codeblok: {"summary": "...", "nextSteps": "..."}',
      },
      { role: 'user', content: `TRANSCRIPT:\n\n${transcript}` },
    ],
  });

  const raw = resp.choices[0]?.message?.content ?? '{}';
  let parsed: { summary?: string; nextSteps?: string } = {};
  try {
    parsed = JSON.parse(raw.trim().replace(/^```(json)?/i, '').replace(/```$/, ''));
  } catch {
    return NextResponse.json({ error: 'Kon geen geldige samenvatting genereren, probeer opnieuw.' }, { status: 502 });
  }
  if (!parsed.summary) {
    return NextResponse.json({ error: 'Kon geen geldige samenvatting genereren, probeer opnieuw.' }, { status: 502 });
  }

  const rows = await sql`
    INSERT INTO crm_chat_summaries (project_slug, audience, summary, next_steps, source)
    VALUES (${projectSlug}, ${audience}, ${parsed.summary}, ${parsed.nextSteps ?? null}, 'admin')
    RETURNING id, summary, next_steps, audience, source, created_at
  `;

  if (parsed.nextSteps) {
    await sql`
      INSERT INTO crm_actions (project_slug, title, owner, source)
      VALUES (${projectSlug}, ${`Vervolgstap uit gesprek met ${audience} (achteraf samengevat): ${parsed.nextSteps}`}, 'vincent', 'chat_summary')
    `;
  }

  return NextResponse.json({ summary: rows[0] });
}
