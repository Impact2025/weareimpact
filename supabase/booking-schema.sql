-- WeAreImpact Booking System Schema
-- Run AFTER schema.sql

-- ============================================
-- BOOKING TYPES (Configuratie)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER DEFAULT 0,
  color TEXT DEFAULT '#f97316',
  icon TEXT DEFAULT '📅',
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 15,
  min_notice_hours INTEGER DEFAULT 24,
  max_future_days INTEGER DEFAULT 60,
  questions JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed booking types
INSERT INTO booking_types (slug, name, description, duration_minutes, price_cents, icon, sort_order) VALUES
  ('kennismaking', 'Kennismakingsgesprek', 'Gratis eerste gesprek om te ontdekken of er een match is. We bespreken je situatie en ik geef eerste handvatten.', 30, 0, '👋', 1),
  ('strategie-ai', 'AI Strategiesessie', 'Concrete adviezen voor AI implementatie in jouw organisatie. Je krijgt een actieplan mee.', 60, 15000, '🤖', 2),
  ('strategie-impact', 'Impact Strategiesessie', 'Advies over vrijwilligersbeleid, impact meten of sociaal ondernemen.', 60, 15000, '📊', 3),
  ('lego-intro', 'LEGO Serious Play Introductie', 'Kennismaking met de LEGO Serious Play methode voor jou of een klein team.', 90, 25000, '🧱', 4),
  ('lego-workshop', 'LEGO Serious Play Workshop', 'Volledige workshop voor je team (max 12 personen). Prijs op aanvraag.', 240, 0, '🎯', 5)
ON CONFLICT (slug) DO NOTHING;

-- Update LEGO workshop to require approval
UPDATE booking_types SET requires_approval = true WHERE slug = 'lego-workshop';

-- ============================================
-- AVAILABILITY RULES
-- ============================================
CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  booking_type_id UUID REFERENCES booking_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default availability: Ma-Vr 9:00-17:00
INSERT INTO availability_rules (day_of_week, start_time, end_time) VALUES
  (1, '09:00', '12:00'),  -- Maandag ochtend
  (1, '13:00', '17:00'),  -- Maandag middag
  (2, '09:00', '12:00'),  -- Dinsdag ochtend
  (2, '13:00', '17:00'),  -- Dinsdag middag
  (3, '09:00', '12:00'),  -- Woensdag ochtend
  (3, '13:00', '17:00'),  -- Woensdag middag
  (4, '09:00', '12:00'),  -- Donderdag ochtend
  (4, '13:00', '17:00'),  -- Donderdag middag
  (5, '09:00', '12:00'),  -- Vrijdag ochtend
  (5, '13:00', '16:00')   -- Vrijdag middag (korter)
ON CONFLICT DO NOTHING;

-- ============================================
-- BLOCKED PERIODS (vakantie, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  all_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_type_id UUID NOT NULL REFERENCES booking_types(id),

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Europe/Amsterdam',

  -- Klant info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_organization TEXT,
  customer_notes TEXT,

  -- Lead qualification
  organization_type TEXT CHECK (organization_type IN ('nonprofit', 'zorg', 'mkb', 'overheid', 'particulier', 'other')),
  topic TEXT,
  how_found_us TEXT,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled')),

  -- Calendar sync
  google_event_id TEXT,
  google_calendar_link TEXT,
  meet_link TEXT,

  -- Tracking
  source TEXT DEFAULT 'website',
  conversation_id UUID,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES bookings(id),
  reminder_sent_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BOOKING CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS booking_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  messages JSONB DEFAULT '[]',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  selected_type TEXT,
  selected_time TIMESTAMPTZ,
  customer_data JSONB DEFAULT '{}',
  step TEXT DEFAULT 'greeting',
  visitor_id TEXT,
  completed BOOLEAN DEFAULT false,
  abandoned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_conv_visitor ON booking_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_booking_conv_completed ON booking_conversations(completed);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_booking_conv_updated_at ON booking_conversations;
CREATE TRIGGER update_booking_conv_updated_at
  BEFORE UPDATE ON booking_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get available slots for a date range
CREATE OR REPLACE FUNCTION get_available_slots(
  p_booking_type_slug TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  slot_date DATE,
  slot_start TIME,
  slot_end TIME,
  is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_type booking_types%ROWTYPE;
  v_current_date DATE;
  v_slot_start TIME;
  v_slot_end TIME;
BEGIN
  -- Get booking type
  SELECT * INTO v_booking_type FROM booking_types WHERE slug = p_booking_type_slug AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking type not found: %', p_booking_type_slug;
  END IF;

  -- Loop through dates
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    -- Check if date is not blocked
    IF NOT EXISTS (
      SELECT 1 FROM blocked_periods
      WHERE v_current_date BETWEEN start_date AND end_date
    ) THEN
      -- Get availability rules for this day
      FOR v_slot_start, v_slot_end IN
        SELECT ar.start_time, ar.end_time
        FROM availability_rules ar
        WHERE ar.day_of_week = EXTRACT(DOW FROM v_current_date)
          AND ar.is_active = true
          AND (ar.booking_type_id IS NULL OR ar.booking_type_id = v_booking_type.id)
        ORDER BY ar.start_time
      LOOP
        -- Generate slots within this availability window
        WHILE v_slot_start + (v_booking_type.duration_minutes || ' minutes')::INTERVAL <= v_slot_end LOOP
          -- Check if slot is not already booked
          RETURN QUERY
          SELECT
            v_current_date,
            v_slot_start,
            (v_slot_start + (v_booking_type.duration_minutes || ' minutes')::INTERVAL)::TIME,
            NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.status IN ('confirmed', 'pending')
                AND b.start_time::DATE = v_current_date
                AND (
                  (v_slot_start, (v_slot_start + (v_booking_type.duration_minutes || ' minutes')::INTERVAL)::TIME)
                  OVERLAPS
                  (b.start_time::TIME, b.end_time::TIME)
                )
            );

          v_slot_start := v_slot_start + (v_booking_type.duration_minutes || ' minutes')::INTERVAL;
        END LOOP;
      END LOOP;
    END IF;

    v_current_date := v_current_date + 1;
  END LOOP;
END;
$$;

-- ============================================
-- VIEWS
-- ============================================

-- Upcoming bookings view
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT
  b.id,
  b.start_time,
  b.end_time,
  b.customer_name,
  b.customer_email,
  b.customer_organization,
  b.status,
  b.meet_link,
  bt.name as booking_type_name,
  bt.slug as booking_type_slug,
  bt.duration_minutes,
  bt.icon
FROM bookings b
JOIN booking_types bt ON b.booking_type_id = bt.id
WHERE b.start_time > NOW()
  AND b.status IN ('confirmed', 'pending')
ORDER BY b.start_time ASC;

-- Booking stats view
CREATE OR REPLACE VIEW booking_stats AS
SELECT
  (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND start_time > NOW()) as upcoming_confirmed,
  (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_approval,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND start_time > NOW() - INTERVAL '30 days') as completed_last_30_days,
  (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled' AND cancelled_at > NOW() - INTERVAL '30 days') as cancelled_last_30_days,
  (SELECT COUNT(*) FROM bookings WHERE status = 'no_show' AND start_time > NOW() - INTERVAL '30 days') as no_shows_last_30_days,
  (SELECT COUNT(DISTINCT customer_email) FROM bookings) as unique_customers;
