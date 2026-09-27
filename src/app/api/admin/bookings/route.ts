import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sql } from '@/lib/db/neon';
import { BOOKING_TYPES, type BookingTypeSlug } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Openstaande boekingsaanvragen, met dezelfde goedkeur/afwijs-links als in de
// notificatiemail — zo blijft api/booking/respond de enige plek met die logica
// (agenda, bevestigingsmail, deal, sprintbrief).
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await sql`
    SELECT id, booking_type, start_time, customer_name, customer_email, customer_organization, notes, token, created_at
    FROM booking_requests
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;

  const bookings = rows.map((b) => {
    const base = `/api/booking/respond?id=${b.id}&token=${encodeURIComponent(b.token as string)}`;
    return {
      id: b.id,
      type: BOOKING_TYPES[b.booking_type as BookingTypeSlug]?.name ?? b.booking_type,
      startTime: b.start_time,
      slotPassed: new Date(b.start_time as string) < new Date(),
      name: b.customer_name,
      email: b.customer_email,
      organization: b.customer_organization,
      notes: b.notes,
      createdAt: b.created_at,
      approveUrl: `${base}&action=approve`,
      rejectUrl: `${base}&action=reject`,
    };
  });

  return NextResponse.json({ bookings });
}
