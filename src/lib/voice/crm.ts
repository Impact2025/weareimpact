import { sql } from '@/lib/db/neon';

// CRM-koppeling voor de telefoonassistent: bellers herkennen, gesprekken en
// terugbelverzoeken in het CRM vastleggen. Alles best effort: een CRM-hapering
// mag een gesprek nooit blokkeren, en ontbrekende tabellen zijn geen fout.

export interface KnownCaller {
  contactId: string | null;
  companyId: string | null;
  firstName: string;
  fullName: string;
  organization: string;
  email: string;
}

/** Laatste 9 cijfers: 06-12345678, 0612345678 en +31 6 12345678 geven dezelfde sleutel. */
export function phoneKey(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : '';
}

export async function findCallerByPhone(phone: string): Promise<KnownCaller | null> {
  const key = phoneKey(phone);
  if (!key) return null;
  try {
    const rows = await sql`
      SELECT c.id, c.company_id, c.first_name, c.last_name, c.email, co.name AS company
      FROM contacts c LEFT JOIN companies co ON co.id = c.company_id
      WHERE right(regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g'), 9) = ${key}
      ORDER BY c.updated_at DESC LIMIT 1
    `;
    if (rows[0]) {
      const r = rows[0];
      return {
        contactId: r.id as string,
        companyId: (r.company_id as string) ?? null,
        firstName: String(r.first_name ?? ''),
        fullName: [r.first_name, r.last_name].filter(Boolean).join(' '),
        organization: String(r.company ?? ''),
        email: String(r.email ?? ''),
      };
    }
  } catch (e) {
    console.error('vapi crm contacts lookup:', e);
  }
  try {
    // Wie eerder een afspraak aanvroeg staat niet altijd in de contacts.
    const rows = await sql`
      SELECT customer_name, customer_email, customer_organization FROM booking_requests
      WHERE right(regexp_replace(coalesce(customer_phone, ''), '[^0-9]', '', 'g'), 9) = ${key}
      ORDER BY created_at DESC LIMIT 1
    `;
    if (rows[0]) {
      const name = String(rows[0].customer_name ?? '');
      return {
        contactId: null,
        companyId: null,
        firstName: name.split(' ')[0] ?? '',
        fullName: name,
        organization: String(rows[0].customer_organization ?? ''),
        email: String(rows[0].customer_email ?? ''),
      };
    }
  } catch {
    /* tabel bestaat nog niet */
  }
  return null;
}

/** Legt een gesprek of terugbelverzoek vast in het CRM (activiteit, en bij een verzoek een taak). */
export async function logCallInCrm(opts: {
  caller: KnownCaller | null;
  subject: string;
  description: string;
  outcome?: string;
  followUpTask?: { title: string; priority: 'normal' | 'high' };
}): Promise<void> {
  const contactId = opts.caller?.contactId ?? null;
  const companyId = opts.caller?.companyId ?? null;
  try {
    await sql`
      INSERT INTO crm_activities (company_id, contact_id, type, subject, description, outcome, completed_at)
      VALUES (${companyId}, ${contactId}, 'call', ${opts.subject.slice(0, 250)}, ${opts.description.slice(0, 4000)},
        ${opts.outcome?.slice(0, 100) ?? null}, NOW())
    `;
  } catch (e) {
    console.error('vapi crm_activities:', e);
  }
  if (!opts.followUpTask) return;
  try {
    await sql`
      INSERT INTO crm_tasks (company_id, contact_id, title, description, priority, due_date)
      VALUES (${companyId}, ${contactId}, ${opts.followUpTask.title.slice(0, 250)}, ${opts.description.slice(0, 4000)},
        ${opts.followUpTask.priority}, CURRENT_DATE)
    `;
  } catch (e) {
    console.error('vapi crm_tasks:', e);
  }
}

/**
 * Directe push naar Vincents telefoon voor dringende gesprekken, via ntfy.sh.
 * Alleen actief als VINCENT_NTFY_TOPIC gezet is (een lastig te raden topicnaam).
 */
export async function pushUrgent(title: string, body: string): Promise<void> {
  const topic = process.env.VINCENT_NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: { Title: title.replace(/[^\x20-\x7E]/g, ''), Priority: 'high', Tags: 'telephone_receiver' },
      body: body.slice(0, 500),
      signal: AbortSignal.timeout(4000),
    });
  } catch (e) {
    console.error('vapi ntfy push:', e);
  }
}
