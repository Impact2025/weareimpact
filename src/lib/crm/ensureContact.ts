import { sql } from '@/lib/db/neon';

export interface LeadPerson {
  name?: string | null;
  email: string;
  phone?: string | null;
  organization?: string | null;
  website?: string | null;
}

// Zoekt of maakt company + contact voor een binnenkomende lead, zodat iedere
// bron (boeking, inbox, …) op dezelfde manier in het CRM landt. Een bekend
// e-mailadres hergebruikt het bestaande contact en diens bedrijf.
export async function ensureCompanyAndContact(
  person: LeadPerson,
  source: string,
): Promise<{ companyId: string; contactId: string }> {
  const email = person.email.trim().toLowerCase();
  const name = person.name?.trim() || email.split('@')[0];
  const organization = person.organization?.trim() || null;

  const existingContact = await sql`
    SELECT id, company_id FROM contacts WHERE LOWER(email) = ${email} LIMIT 1
  `;
  if (existingContact.length > 0 && existingContact[0].company_id) {
    return {
      companyId: existingContact[0].company_id as string,
      contactId: existingContact[0].id as string,
    };
  }

  let companyId: string;
  const existingCompany = organization
    ? await sql`SELECT id FROM companies WHERE name ILIKE ${organization} LIMIT 1`
    : [];
  if (existingCompany.length > 0) {
    companyId = existingCompany[0].id as string;
  } else {
    const inserted = await sql`
      INSERT INTO companies (name, website, email, phone)
      VALUES (${organization || name}, ${person.website || null}, ${email}, ${person.phone || null})
      RETURNING id
    `;
    companyId = inserted[0].id as string;
  }

  if (existingContact.length > 0) {
    const contactId = existingContact[0].id as string;
    await sql`UPDATE contacts SET company_id = ${companyId}, updated_at = NOW() WHERE id = ${contactId}`;
    return { companyId, contactId };
  }

  const [firstName, ...rest] = name.split(' ');
  const inserted = await sql`
    INSERT INTO contacts (company_id, first_name, last_name, email, phone, source, is_primary)
    VALUES (${companyId}, ${firstName}, ${rest.join(' ') || null}, ${email}, ${person.phone || null}, ${source}, true)
    RETURNING id
  `;
  return { companyId, contactId: inserted[0].id as string };
}
