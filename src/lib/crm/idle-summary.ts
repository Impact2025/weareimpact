import { sql } from '@/lib/db/neon';
import { getClaude, MODELS } from '@/lib/ai/claude';
import { sendEmail } from '@/lib/email/send';
import { emailShell, emailCard, emailButton, EMAIL_COLORS } from '@/lib/email/templates/emailLayout';
import { isConversationalProject } from '@/lib/crm/chat';
import type { Audience } from '@/lib/crm/portal-session';

/** Zo lang moet het stil zijn voordat een gesprek als "gestopt" geldt. */
export const IDLE_HOURS = 3;
const VINCENT = 'v.munster@weareimpact.nl';

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface IdleCandidate {
  slug: string;
  name: string;
  audience: Audience;
}

/**
 * Gesprekken (alleen in projecten met een echt Iris-gesprek) waarin de klant iets heeft gezegd,
 * die al IDLE_HOURS stil zijn en waarna nog geen samenvatting is gemaakt. Een samenvatting die
 * vlak vóór het laatste bericht staat (finish_conversation schrijft Iris' afscheid erna) telt mee.
 */
export async function findIdleConversations(): Promise<IdleCandidate[]> {
  const projects = await sql`SELECT slug, name FROM crm_projects`;
  const out: IdleCandidate[] = [];
  for (const p of projects) {
    const slug = p.slug as string;
    if (!isConversationalProject(slug)) continue;
    for (const audience of ['klant', 'opdrachtgever'] as const) {
      const rows = await sql`
        SELECT
          (SELECT MAX(created_at) FROM crm_chat_messages WHERE project_slug = ${slug} AND audience = ${audience}) AS last_msg,
          (SELECT COUNT(*)::int FROM crm_chat_messages WHERE project_slug = ${slug} AND audience = ${audience} AND role = 'user') AS user_msgs,
          (SELECT MAX(created_at) FROM crm_chat_summaries WHERE project_slug = ${slug} AND audience = ${audience}) AS last_sum
      `;
      const r = rows[0];
      if (!r?.last_msg || r.user_msgs === 0) continue;
      const lastMsg = new Date(r.last_msg as string).getTime();
      if (Date.now() - lastMsg < IDLE_HOURS * 3_600_000) continue;
      const lastSum = r.last_sum ? new Date(r.last_sum as string).getTime() : null;
      if (lastSum !== null && lastSum >= lastMsg - 10 * 60_000) continue;
      out.push({ slug, name: p.name as string, audience });
    }
  }
  return out;
}

/** Maakt de samenvatting van een gestopt gesprek, slaat die op en mailt Vincent. */
export async function summarizeAndNotify(c: IdleCandidate): Promise<void> {
  const messages = await sql`
    SELECT role, content FROM crm_chat_messages
    WHERE project_slug = ${c.slug} AND audience = ${c.audience} ORDER BY created_at ASC
  `;
  const transcript = messages.map((m) => `${m.role === 'user' ? 'KLANT' : 'IRIS'}: ${m.content}`).join('\n\n');

  const resp = await getClaude().chat.completions.create({
    model: MODELS.SONNET,
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      {
        role: 'system',
        content:
          'Je vat een klantgesprek samen voor Vincent van WeAreImpact. Het gesprek is halverwege gestopt. ' +
          'Wees feitelijk en bondig, noem wat al besproken is en wat nog niet, geen aannames of eigen toezeggingen. ' +
          'Antwoord ALLEEN met geldige JSON in dit exacte formaat, zonder markdown-codeblok: ' +
          '{"summary": "...", "nextSteps": "..."}',
      },
      { role: 'user', content: `TRANSCRIPT:\n\n${transcript}` },
    ],
  });
  const raw = resp.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '')) as {
    summary?: string;
    nextSteps?: string;
  };
  if (!parsed.summary) throw new Error('Geen samenvatting gegenereerd');

  const answers = await sql`
    SELECT question, client_answer, status FROM crm_questions
    WHERE project_slug = ${c.slug} AND audience = ${c.audience} ORDER BY sort_order ASC, created_at ASC
  `;
  const done = answers.filter((a) => a.status === 'answered').length;
  const answered = answers
    .filter((a) => a.status === 'answered')
    .map(
      (a) => `<tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <p style="margin: 0 0 4px; font-size: 14px; color: #1e293b; font-weight: 600;">${esc(String(a.question))}</p>
        <p style="margin: 0; font-size: 14px; color: #475569; white-space: pre-wrap;">${esc(String(a.client_answer ?? ''))}</p></td></tr>`,
    )
    .join('');
  const next = parsed.nextSteps ? `<p style="margin: 12px 0 0; font-size: 14px; color: #334155;"><strong>Voorgestelde vervolgstappen:</strong> ${esc(parsed.nextSteps)}</p>` : '';

  const body = `
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">
      Het gesprek met Iris over <strong>${esc(c.name)}</strong> staat al ${IDLE_HOURS} uur stil. Het is niet afgerond: ${done} van ${answers.length} onderwerpen zijn besproken. Dit is wat er tot nu toe is opgehaald.
    </p>
    ${emailCard(`<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1e293b;">${esc(parsed.summary)}</p>${next}`)}
    ${answered ? `<p style="margin: 20px 0 6px; font-size: 13px; color: ${EMAIL_COLORS.muted}; text-transform: uppercase; font-weight: 700;">Opgeslagen antwoorden</p><table width="100%" cellpadding="0" cellspacing="0">${answered}</table>` : ''}
    ${emailButton('Open het dossier', `https://weareimpact.nl/admin/dossiers/${c.slug}`)}
  `.trim();

  const html = emailShell({
    preheader: `${done} van ${answers.length} onderwerpen besproken`,
    title: 'Gesprek gestopt',
    subtitle: c.name,
    body,
    footerNote: 'Automatisch verstuurd omdat het gesprek niet is afgerond.',
  });
  const text = `Het gesprek met Iris over ${c.name} staat al ${IDLE_HOURS} uur stil (${done} van ${answers.length} onderwerpen besproken).\n\n${parsed.summary}\n\n${parsed.nextSteps ? `Voorgestelde vervolgstappen: ${parsed.nextSteps}\n\n` : ''}Dossier: https://weareimpact.nl/admin/dossiers/${c.slug}`;

  const res = await sendEmail({ to: VINCENT, subject: `Gesprek gestopt: ${c.name} (${done}/${answers.length})`, html, text });
  if (!res.success) throw new Error(`Mail mislukt: ${res.error}`);

  // Pas na een geslaagde mail vastleggen, zodat een mislukte mail het volgende uur opnieuw wordt geprobeerd.
  await sql`
    INSERT INTO crm_chat_summaries (project_slug, audience, summary, next_steps, source)
    VALUES (${c.slug}, ${c.audience}, ${parsed.summary}, ${parsed.nextSteps ?? null}, 'admin')
  `;
  if (parsed.nextSteps) {
    await sql`
      INSERT INTO crm_actions (project_slug, title, owner, source)
      VALUES (${c.slug}, ${`Vervolgstap uit gestopt gesprek met ${c.audience}: ${parsed.nextSteps}`}, 'vincent', 'chat_summary')
    `;
  }
}
