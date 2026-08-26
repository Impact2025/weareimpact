import { NextRequest, NextResponse } from 'next/server';
import { createBooking, BOOKING_TYPES, BookingTypeSlug } from '@/lib/google-calendar';
import { sql } from '@/lib/db/neon';
import { sendEmail } from '@/lib/email/send';
import { generateBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation';
import { generateBookingRequestDeclinedEmail } from '@/lib/email/templates/booking-request-declined';
import { pushBookingLead } from '@/lib/agentos-bridge';

export const dynamic = 'force-dynamic';

function page(title: string, message: string, tone: 'ok' | 'error' = 'ok'): NextResponse {
  const color = tone === 'ok' ? '#166534' : '#b91c1c';
  const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  background: #FDFBF7; color: #0f172a; display: flex; align-items: center; justify-content: center;
  min-height: 100vh; margin: 0; padding: 24px; }
.card { max-width: 480px; background: #fff; border-radius: 16px; padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08); text-align: center; }
h1 { font-size: 22px; margin: 0 0 12px; color: ${color}; }
p { font-size: 15px; line-height: 1.6; color: #334155; margin: 0; }
</style></head><body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// Wordt aangeklikt vanuit de notificatiemail (booking-request-notification).
// Bewust een GET-route (mailclients kunnen geen POST-knoppen versturen) —
// het token in de URL is de enige guard, dus hij is willekeurig lang en
// eenmalig bruikbaar (status gaat van 'pending' naar 'approved'/'rejected').
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!id || !token || (action !== 'approve' && action !== 'reject')) {
    return page('Ongeldige link', 'Deze link mist gegevens of is ongeldig.', 'error');
  }

  const rows = await sql`SELECT * FROM booking_requests WHERE id = ${id}`;
  const bookingRequest = rows[0];
  if (!bookingRequest) {
    return page('Niet gevonden', 'Deze boekingsaanvraag bestaat niet (meer).', 'error');
  }
  if (bookingRequest.token !== token) {
    return page('Ongeldige link', 'Deze link hoort niet bij deze aanvraag.', 'error');
  }
  if (bookingRequest.status !== 'pending') {
    const already = bookingRequest.status === 'approved' ? 'al goedgekeurd' : 'al afgewezen';
    return page('Al afgehandeld', `Deze aanvraag is ${already} — er is niets meer te doen.`);
  }

  const type = BOOKING_TYPES[bookingRequest.booking_type as BookingTypeSlug];
  const typeName = type?.name || bookingRequest.booking_type;

  if (action === 'reject') {
    await sql`
      UPDATE booking_requests SET status = 'rejected', decided_at = NOW() WHERE id = ${id}
    `;
    const declineTemplate = generateBookingRequestDeclinedEmail({
      customerName: bookingRequest.customer_name,
      bookingType: typeName,
    });
    const result = await sendEmail({
      to: bookingRequest.customer_email,
      subject: declineTemplate.subject,
      html: declineTemplate.html,
      text: declineTemplate.text,
    });
    if (!result.success) {
      console.error('Failed to send decline email:', result.error);
    }
    await pushBookingLead({
      bookingRequestId: id,
      bookingType: typeName,
      startTime: new Date(bookingRequest.start_time).toISOString(),
      durationMinutes: type?.duration || 0,
      customerName: bookingRequest.customer_name,
      customerEmail: bookingRequest.customer_email,
      customerPhone: bookingRequest.customer_phone || undefined,
      customerOrganization: bookingRequest.customer_organization || undefined,
      notes: bookingRequest.notes || undefined,
      bookingStatus: 'rejected',
    });
    return page('Afgewezen', `De aanvraag van ${bookingRequest.customer_name} is afgewezen. De klant is per mail geïnformeerd.`);
  }

  // action === 'approve'
  if (!type) {
    return page('Onbekend type', `Boekingstype '${bookingRequest.booking_type}' bestaat niet meer.`, 'error');
  }

  const result = await createBooking({
    bookingType: bookingRequest.booking_type as BookingTypeSlug,
    startTime: new Date(bookingRequest.start_time).toISOString(),
    customer: {
      name: bookingRequest.customer_name,
      email: bookingRequest.customer_email,
      phone: bookingRequest.customer_phone || undefined,
      organization: bookingRequest.customer_organization || undefined,
    },
  });

  if (!result.success || !result.booking) {
    console.error('createBooking failed on approve:', result.error);
    return page(
      'Boeken mislukt',
      `Het is niet gelukt om deze afspraak in Google Calendar te zetten (${result.error || 'onbekende fout'}). ` +
      'De aanvraag staat nog op openstaand — probeer de link nog eens, of boek de afspraak handmatig in.',
      'error',
    );
  }

  await sql`
    UPDATE booking_requests
    SET status = 'approved', decided_at = NOW(),
        calendar_event_id = ${result.booking.id}, meet_link = ${result.booking.meetLink || null}
    WHERE id = ${id}
  `;

  const confirmationTemplate = generateBookingConfirmationEmail({
    customerName: bookingRequest.customer_name,
    bookingType: typeName,
    startTime: result.booking.startTime,
    endTime: result.booking.endTime,
    duration: result.booking.duration,
    meetLink: result.booking.meetLink,
  });
  const emailResult = await sendEmail({
    to: bookingRequest.customer_email,
    subject: confirmationTemplate.subject,
    html: confirmationTemplate.html,
    text: confirmationTemplate.text,
  });
  if (!emailResult.success) {
    console.error('Failed to send booking confirmation email:', emailResult.error);
  }

  await pushBookingLead({
    bookingRequestId: id,
    bookingType: typeName,
    startTime: result.booking.startTime,
    durationMinutes: result.booking.duration,
    customerName: bookingRequest.customer_name,
    customerEmail: bookingRequest.customer_email,
    customerPhone: bookingRequest.customer_phone || undefined,
    customerOrganization: bookingRequest.customer_organization || undefined,
    notes: bookingRequest.notes || undefined,
    bookingStatus: 'approved',
  });

  return page(
    'Goedgekeurd',
    `De afspraak met ${bookingRequest.customer_name} staat in je agenda. De klant heeft een bevestiging ontvangen${result.booking.meetLink ? ' met Meet-link' : ''}.`,
  );
}
