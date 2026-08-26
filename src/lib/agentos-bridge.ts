// Duwt gebeurtenissen naar AgentOS' bridge (remote/api/bridge.js), zodat ze
// als lead in de Leads-tab verschijnen en Iris ze verrijkt. Zelfde vorm als
// de pushToIris-helpers in /api/workshop-lead en /api/impact-calculator,
// hier gedeeld tussen booking/create en booking/respond (create pusht
// bookingStatus 'pending', respond pusht 'approved'/'rejected' — zie
// backend/domains/bridge/booking_leads.py voor de verwerking per status).
//
// Bewust best-effort: elke aanroeper heeft zijn eigen primaire flow (de
// bezoeker/Vincent krijgt sowieso een mail) die nooit mag wachten op of
// falen door deze push. Korte timeout, nooit een throw naar de aanroeper.
export interface BookingLeadPush {
  bookingRequestId: string;
  bookingType: string;
  startTime: string;
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerOrganization?: string;
  customerWebsite?: string;
  notes?: string;
  bookingStatus: 'pending' | 'approved' | 'rejected';
}

export async function pushBookingLead(payload: BookingLeadPush): Promise<boolean> {
  const url = process.env.AGENTOS_BRIDGE_URL;
  const token = process.env.AGENTOS_BRIDGE_TOKEN;
  if (!url || !token) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url.replace(/\/$/, '')}/api/bridge?op=booking-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (error) {
    console.error('pushBookingLead mislukt:', error);
    return false;
  }
}
