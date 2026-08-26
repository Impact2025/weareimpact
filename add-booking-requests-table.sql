-- Boekingsverzoeken van de weareimpact.nl-afspraaktool.
--
-- Vóór dit bestand ging elke afspraak via de chat-widget rechtstreeks Google
-- Calendar in (createBooking() met sendUpdates:'all', dus meteen een echte
-- uitnodiging naar de klant) — geen enkele reviewstap, in tegenstelling tot
-- AgentOS' regel elders dat niets automatisch naar buiten gaat. Nu wordt
-- elke aanvraag hier vastgelegd; pas na Vincents klik (via de link in de
-- notificatiemail) boekt api/booking/respond de afspraak echt in.
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_organization TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  token TEXT NOT NULL,
  calendar_event_id TEXT,
  meet_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decided_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created ON booking_requests(created_at DESC);
