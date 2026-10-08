import { sql } from '@/lib/db/neon';
import { BOOKING_TYPES, type BookingTypeSlug } from '@/lib/google-calendar';
import { ensureCompanyAndContact } from '@/lib/crm/ensureContact';
import { createAppointment, resolveDealForCompany } from './flow';
import type { AppointmentKind } from './moments';

/**
 * Een goedgekeurde boeking van de website hangt vanaf nu altijd aan een bedrijf, contact en deal, en staat als afspraak
 * in het systeem. Daarmee weet de klantreis dat het gesprek gepland is, en start de vraagronde zodra het geweest is.
 * De agenda-afspraak bestaat al (createBooking), dus die wordt niet nog eens aangemaakt.
 */
export async function registerApprovedBooking(params: {
  bookingRequestId: string;
  bookingType: BookingTypeSlug | string;
  customer: { name: string; email: string; phone?: string | null; organization?: string | null; website?: string | null };
  startTime: string;
  durationMinutes: number;
  calendarEventId: string | null;
  /** Deal die de sprint-flow al aanmaakte; anders zoeken of maken we er een. */
  dealId?: string | null;
}): Promise<{ appointmentId: string; dealId: string | null }> {
  const { companyId, contactId } = await ensureCompanyAndContact(
    { name: params.customer.name, email: params.customer.email, phone: params.customer.phone, organization: params.customer.organization, website: params.customer.website },
    'booking',
  );
  const type = BOOKING_TYPES[params.bookingType as BookingTypeSlug];

  let dealId = params.dealId ?? (await resolveDealForCompany(companyId));
  if (!dealId) {
    // Bewust geen 'sprint:'-bron: die markeert de oude sprintklanten, die geen klantdossier krijgen.
    const orgName = params.customer.organization?.trim() || params.customer.name;
    const rows = await sql`
      INSERT INTO deals (company_id, contact_id, title, value, stage, probability, description, source)
      VALUES (${companyId}, ${contactId}, ${`${type?.name ?? params.bookingType} — ${orgName}`}, 0, 'qualified', 20,
        ${`Aangemaakt bij goedkeuring van de afspraak (${params.bookingType}).`}, ${`booking:${params.bookingType}`})
      RETURNING id`;
    dealId = rows[0].id as string;
    await sql`
      INSERT INTO crm_activities (company_id, contact_id, deal_id, type, subject, description)
      VALUES (${companyId}, ${contactId}, ${dealId}, 'note', 'Afspraak goedgekeurd', ${`${type?.name ?? params.bookingType} goedgekeurd, deal aangemaakt.`})`;
  }

  const kind: AppointmentKind = String(params.bookingType).startsWith('sprint-') ? 'intake' : 'sparring';
  const appointment = await createAppointment({
    companyId,
    contactId,
    dealId,
    kind,
    startsAt: new Date(params.startTime),
    durationMin: params.durationMinutes || type?.duration || 30,
    title: `${type?.name ?? params.bookingType} - ${params.customer.name}`,
    calendar: false,
    calendarEventId: params.calendarEventId,
    bookingRequestId: params.bookingRequestId,
  });

  await sql`ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL`;
  await sql`UPDATE booking_requests SET deal_id = ${dealId} WHERE id = ${params.bookingRequestId}`;
  return { appointmentId: appointment.id, dealId };
}
