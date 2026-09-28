import { randomBytes } from 'crypto';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateFeedbackRequestEmail } from '@/lib/email/templates/feedback-request';

// Nazorg: wat er gebeurt na livegang (dossier) of na een afgeronde sprint.
// Zet deadlines, maakt vervolgtaken en beheert de tevredenheidsvraag.

const WEB_BASE = 'https://weareimpact.nl';
const DAY = 24 * 60 * 60 * 1000;

export const SPRINT_AFTERCARE_DAYS = 14;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// "Dag 30: evaluatie" → 30, "Week 1: …" → 7; anders standaard twee weken.
function offsetDaysFromTitle(title: string): number {
  const day = title.match(/\bdag\s+(\d+)/i);
  if (day) return Number(day[1]);
  const week = title.match(/\bweek\s+(\d+)/i);
  if (week) return Number(week[1]) * 7;
  return 14;
}

/** Bij go-live: geef Nazorg-milestones zonder datum een deadline vanaf de livedatum. */
export async function scheduleNazorgMilestones(slug: string): Promise<number> {
  const [project] = await sql`SELECT live_at FROM crm_projects WHERE slug = ${slug}`;
  if (!project?.live_at) return 0;
  const liveAt = new Date(project.live_at as string);

  const milestones = await sql`
    SELECT id, title FROM crm_milestones
    WHERE project_slug = ${slug} AND phase = 'Nazorg' AND due_date IS NULL AND status <> 'done'
  `;
  for (const m of milestones) {
    const due = new Date(liveAt.getTime() + offsetDaysFromTitle(m.title as string) * DAY);
    await sql`UPDATE crm_milestones SET due_date = ${isoDate(due)}, updated_at = NOW() WHERE id = ${m.id}`;
  }
  return milestones.length;
}

/** Bij afronden van een sprint: start de 14 dagen nazorg met een taak om de scorekaart te toetsen. */
export async function onSprintCompleted(dealId: string): Promise<void> {
  await sql`
    UPDATE sprint_sessions SET completed_at = COALESCE(completed_at, NOW())
    WHERE deal_id = ${dealId}
  `;
  const [deal] = await sql`SELECT company_id, contact_id, title FROM deals WHERE id = ${dealId}`;
  if (!deal) return;

  const title = 'Scorekaart toetsen — einde 14 dagen nazorg';
  const existing = await sql`SELECT 1 FROM crm_tasks WHERE deal_id = ${dealId} AND title = ${title} LIMIT 1`;
  if (existing.length > 0) return;

  const due = new Date(Date.now() + SPRINT_AFTERCARE_DAYS * DAY);
  await sql`
    INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, status, due_date)
    VALUES (${deal.company_id}, ${deal.contact_id}, ${dealId}, ${title},
      'Succescriterium gehaald? Zo niet: max. 30 min asynchrone bijstelling binnen scope. Vraag daarna om feedback.',
      'normal', 'pending', ${isoDate(due)})
  `;
  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${deal.company_id}, ${deal.contact_id}, ${dealId}, 'note', 'Sprint afgerond — nazorg gestart',
      ${`14 dagen nazorg tot ${due.toLocaleDateString('nl-NL')}.`})
  `;
}

/**
 * Stuur de tevredenheidsvraag naar de primaire contactpersoon. Koppelt aan het
 * meest recente live dossier of anders de laatst afgeronde sprint-deal.
 */
export async function sendFeedbackRequest(companyId: string): Promise<{ email: string }> {
  const [contact] = await sql`
    SELECT id, first_name, email FROM contacts
    WHERE company_id = ${companyId} AND email IS NOT NULL
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1
  `;
  if (!contact) throw new Error('Geen contactpersoon met e-mailadres bij dit bedrijf');

  const [dossier] = await sql`
    SELECT slug, name, deal_id FROM crm_projects
    WHERE company_id = ${companyId} AND live_at IS NOT NULL
    ORDER BY live_at DESC LIMIT 1
  `;
  const [sprint] = dossier
    ? []
    : await sql`
        SELECT s.deal_id, s.sprint_slug FROM sprint_sessions s JOIN deals d ON d.id = s.deal_id
        WHERE d.company_id = ${companyId} AND s.status = 'afgerond'
        ORDER BY s.completed_at DESC NULLS LAST LIMIT 1
      `;

  const token = randomBytes(24).toString('base64url');
  const email = contact.email as string;
  await sql`
    INSERT INTO crm_feedback (token, company_id, contact_id, project_slug, deal_id, email)
    VALUES (${token}, ${companyId}, ${contact.id}, ${dossier?.slug ?? null},
      ${dossier?.deal_id ?? sprint?.deal_id ?? null}, ${email})
  `;

  const subjectName = dossier ? (dossier.name as string) : sprint ? `de ${sprint.sprint_slug}-sprint` : 'onze samenwerking';
  const mail = generateFeedbackRequestEmail({
    firstName: (contact.first_name as string) || '',
    subjectName,
    feedbackUrl: `${WEB_BASE}/feedback/${token}`,
  });
  const result = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
  if (!result.success) {
    await sql`DELETE FROM crm_feedback WHERE token = ${token}`;
    throw new Error(result.error || 'Mail versturen mislukt');
  }

  await sql`
    INSERT INTO crm_activities (company_id, contact_id, type, subject, description)
    VALUES (${companyId}, ${contact.id}, 'email', 'Tevredenheidsvraag verstuurd', ${`Over ${subjectName}, naar ${email}.`})
  `;
  return { email };
}

export interface FeedbackRequest {
  token: string;
  firstName: string | null;
  subjectName: string;
  answered: boolean;
}

export async function getFeedbackByToken(token: string): Promise<FeedbackRequest | null> {
  const [row] = await sql`
    SELECT f.token, f.answered_at, c.first_name, p.name AS project_name, co.name AS company_name
    FROM crm_feedback f
    LEFT JOIN contacts c ON c.id = f.contact_id
    LEFT JOIN crm_projects p ON p.slug = f.project_slug
    LEFT JOIN companies co ON co.id = f.company_id
    WHERE f.token = ${token}
  `;
  if (!row) return null;
  return {
    token: row.token as string,
    firstName: (row.first_name as string) || null,
    subjectName: (row.project_name as string) || 'onze samenwerking',
    answered: Boolean(row.answered_at),
  };
}

/** Verwerk het antwoord; lage score → belactie, hoge score → review/referentie vragen. */
export async function submitFeedback(token: string, score: number, comment: string | null): Promise<boolean> {
  const updated = await sql`
    UPDATE crm_feedback SET score = ${score}, comment = ${comment}, answered_at = NOW()
    WHERE token = ${token} AND answered_at IS NULL
    RETURNING company_id, contact_id, deal_id
  `;
  if (updated.length === 0) return false;
  const f = updated[0];

  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${f.company_id}, ${f.contact_id}, ${f.deal_id}, 'note', ${`Tevredenheid: ${score}/10`}, ${comment})
  `;

  const today = new Date();
  if (score <= 6) {
    await sql`
      INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, status, due_date)
      VALUES (${f.company_id}, ${f.contact_id}, ${f.deal_id}, ${`Bel klant: tevredenheid ${score}/10`},
        ${comment}, 'urgent', 'pending', ${isoDate(today)})
    `;
  } else if (score >= 9) {
    await sql`
      INSERT INTO crm_tasks (company_id, contact_id, deal_id, title, description, priority, status, due_date)
      VALUES (${f.company_id}, ${f.contact_id}, ${f.deal_id}, 'Vraag om review of referentie en bespreek vervolg',
        ${`Promotor (${score}/10).${comment ? ` "${comment}"` : ''}`}, 'normal', 'pending',
        ${isoDate(new Date(today.getTime() + 3 * DAY))})
    `;
  }
  return true;
}

export interface CompanyFeedback {
  latestScore: number | null;
  latestComment: string | null;
  answeredAt: string | null;
  pendingSince: string | null;
}

export async function getCompanyFeedback(companyId: string): Promise<CompanyFeedback> {
  const rows = await sql`
    SELECT score, comment, answered_at, sent_at FROM crm_feedback
    WHERE company_id = ${companyId}
    ORDER BY sent_at DESC
  `;
  const answered = rows.find((r) => r.answered_at);
  const pending = rows.find((r) => !r.answered_at);
  return {
    latestScore: answered ? Number(answered.score) : null,
    latestComment: (answered?.comment as string) || null,
    answeredAt: (answered?.answered_at as string) || null,
    // Alleen openstaand als er ná het laatste antwoord een nieuwe vraag uitging
    pendingSince:
      pending && (!answered || new Date(pending.sent_at as string) > new Date(answered.answered_at as string))
        ? (pending.sent_at as string)
        : null,
  };
}
