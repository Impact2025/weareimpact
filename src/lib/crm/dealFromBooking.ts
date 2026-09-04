import { sql } from '@/lib/db/neon';
import { BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';

interface BookingCustomer {
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  website?: string | null;
}

// Wordt aangeroepen bij het goedkeuren van een sprint-boeking
// (api/booking/respond) — legt company/contact/deal vast zodat de
// Sprintbrief-antwoorden en de latere sprint-sessie meteen context hebben,
// in plaats van los te bungelen in booking_requests.
export async function ensureDealForBooking(params: {
  bookingType: BookingTypeSlug;
  customer: BookingCustomer;
}): Promise<string> {
  const { bookingType, customer } = params;
  const type = BOOKING_TYPES[bookingType];
  const orgName = customer.organization?.trim() || customer.name;

  let companyId: string;
  const existingCompany = customer.organization
    ? await sql`SELECT id FROM companies WHERE name ILIKE ${customer.organization.trim()} LIMIT 1`
    : [];

  if (existingCompany.length > 0) {
    companyId = existingCompany[0].id as string;
  } else {
    const inserted = await sql`
      INSERT INTO companies (name, website, email, phone)
      VALUES (${orgName}, ${customer.website || null}, ${customer.email}, ${customer.phone || null})
      RETURNING id
    `;
    companyId = inserted[0].id as string;
  }

  const existingContact = await sql`
    SELECT id FROM contacts WHERE email = ${customer.email} LIMIT 1
  `;
  let contactId: string;
  if (existingContact.length > 0) {
    contactId = existingContact[0].id as string;
  } else {
    const [firstName, ...rest] = customer.name.trim().split(' ');
    const inserted = await sql`
      INSERT INTO contacts (company_id, first_name, last_name, email, phone, source, is_primary)
      VALUES (${companyId}, ${firstName}, ${rest.join(' ') || null}, ${customer.email}, ${customer.phone || null}, 'sprint-booking', true)
      RETURNING id
    `;
    contactId = inserted[0].id as string;
  }

  const insertedDeal = await sql`
    INSERT INTO deals (company_id, contact_id, title, value, stage, probability, description, source)
    VALUES (
      ${companyId}, ${contactId},
      ${`${type?.name || bookingType} — ${orgName}`},
      1750, 'qualified', 40,
      ${`Aangemaakt bij goedkeuring van de Fit & Focus-intake voor ${bookingType}.`},
      ${`sprint:${bookingType}`}
    )
    RETURNING id
  `;
  const dealId = insertedDeal[0].id as string;

  await sql`
    INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
    VALUES (${companyId}, ${contactId}, ${dealId}, 'note', 'Sprint-intake goedgekeurd', ${`Fit & Focus-intake voor ${type?.name || bookingType} goedgekeurd, deal aangemaakt.`})
  `;

  return dealId;
}
