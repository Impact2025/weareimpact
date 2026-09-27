import { sql } from '@/lib/db/neon';
import { BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';
import { ensureCompanyAndContact, type LeadPerson } from './ensureContact';

type BookingCustomer = LeadPerson & { name: string };

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
  const { companyId, contactId } = await ensureCompanyAndContact(customer, 'sprint-booking');

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
