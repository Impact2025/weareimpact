# AI Booking Assistant - Technisch Plan

## Concept: "Plan met Vincent"

Een conversational AI die aanvoelt als chatten met Vincent's assistent. Geen saaie formulieren - een natuurlijk gesprek dat eindigt met een afspraak in je agenda.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👤 "Ik wil graag een gesprek plannen over AI implementatie"  │
│                                                                 │
│   🤖 "Leuk dat je interesse hebt! Om je goed te kunnen helpen, │
│      een paar korte vragen:                                     │
│                                                                 │
│      Wat voor type organisatie ben je?                         │
│      ○ Non-profit / Stichting                                  │
│      ○ Zorg / Welzijn                                          │
│      ○ MKB / Bedrijf                                           │
│      ○ Overheid"                                                │
│                                                                 │
│   👤 [Klikt: Non-profit / Stichting]                           │
│                                                                 │
│   🤖 "Top! En wat wil je graag bespreken?"                     │
│      ○ Kennismaken - ontdek wat we kunnen betekenen (30 min)   │
│      ○ AI Strategie - concrete implementatieplan (60 min)      │
│      ○ LEGO Serious Play - workshop voor je team (halve dag)   │
│                                                                 │
│   👤 [Klikt: Kennismaken]                                      │
│                                                                 │
│   🤖 "Perfect! Hier zijn Vincent's beschikbare momenten        │
│      voor een kennismaking van 30 minuten:                      │
│                                                                 │
│      📅 Deze week:                                              │
│      ○ Woensdag 15 jan, 10:00                                  │
│      ○ Donderdag 16 jan, 14:00                                 │
│      ○ Vrijdag 17 jan, 11:00                                   │
│                                                                 │
│      📅 Volgende week:                                          │
│      ○ Maandag 20 jan, 09:00                                   │
│      ○ Dinsdag 21 jan, 15:30                                   │
│      [Meer tijden tonen...]"                                    │
│                                                                 │
│   👤 [Klikt: Woensdag 15 jan, 10:00]                           │
│                                                                 │
│   🤖 "Goed gekozen! Nog even je gegevens:                      │
│                                                                 │
│      Naam: [_______________]                                    │
│      E-mail: [_______________]                                  │
│      Organisatie: [_______________]                             │
│      Telefoonnummer (optioneel): [_______________]"            │
│                                                                 │
│   👤 [Vult in en klikt Bevestig]                               │
│                                                                 │
│   🤖 "✅ Gelukt! Je afspraak met Vincent staat gepland:        │
│                                                                 │
│      📅 Woensdag 15 januari 2025                               │
│      🕐 10:00 - 10:30                                           │
│      📍 Videocall (link volgt per mail)                        │
│                                                                 │
│      Je ontvangt een bevestiging op jan@nonprofit.nl            │
│                                                                 │
│      Tot dan! 👋"                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Afspraak Types

| Type | Duur | Beschrijving | Prijs |
|------|------|--------------|-------|
| **Kennismakingsgesprek** | 30 min | Gratis eerste gesprek, ontdekken of er een match is | Gratis |
| **Strategiesessie AI** | 60 min | Concrete adviezen voor AI implementatie | €150 |
| **Strategiesessie Impact** | 60 min | Vrijwilligersbeleid, impact meten, sociaal ondernemen | €150 |
| **LEGO Serious Play Intro** | 90 min | Kennismaking met de methode, kleine groep | €250 |
| **LEGO Serious Play Workshop** | Halve dag | Volledige workshop voor team (max 12 personen) | Op aanvraag |

---

## Technische Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BookingAssistant Component                  │   │
│  │  - Chat interface met typing indicators                  │   │
│  │  - Quick reply buttons                                   │   │
│  │  - Calendar picker                                       │   │
│  │  - Form fields (inline)                                  │   │
│  │  - Confirmation view                                     │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API ROUTES                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ /api/booking/   │  │ /api/booking/   │  │ /api/booking/   │ │
│  │ availability    │  │ create          │  │ chat            │ │
│  │                 │  │                 │  │                 │ │
│  │ GET: fetch      │  │ POST: create    │  │ POST: AI        │ │
│  │ available slots │  │ booking + cal   │  │ conversation    │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INTEGRATIONS                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Google Calendar │  │    Supabase     │  │   OpenRouter    │ │
│  │      API        │  │    Database     │  │   (Claude AI)   │ │
│  │                 │  │                 │  │                 │ │
│  │ - Check busy    │  │ - Store booking │  │ - Natural lang  │ │
│  │ - Create event  │  │ - Lead capture  │  │ - Intent detect │ │
│  │ - Send invite   │  │ - Analytics     │  │ - Responses     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐                                           │
│  │   Resend Email  │                                           │
│  │                 │                                           │
│  │ - Confirmation  │                                           │
│  │ - Reminder      │                                           │
│  │ - Follow-up     │                                           │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Booking types configuratie
CREATE TABLE booking_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER DEFAULT 0, -- 0 = gratis
  color TEXT, -- voor calendar
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false, -- voor workshops
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 15,
  min_notice_hours INTEGER DEFAULT 24, -- minimaal X uur van tevoren
  max_future_days INTEGER DEFAULT 60, -- max X dagen vooruit
  questions JSONB DEFAULT '[]', -- extra vragen per type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beschikbaarheid configuratie
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0=zondag, 1=maandag, etc
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  booking_type_id UUID REFERENCES booking_types(id), -- NULL = alle types
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geblokkeerde periodes (vakantie, etc)
CREATE TABLE blocked_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  organization_type TEXT, -- nonprofit, zorg, mkb, overheid
  topic TEXT, -- wat willen ze bespreken
  how_found_us TEXT, -- hoe hebben ze ons gevonden

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- Calendar sync
  google_event_id TEXT,
  calendar_link TEXT, -- voor klant
  meet_link TEXT, -- video call link

  -- Tracking
  source TEXT DEFAULT 'website', -- website, chat, referral
  conversation_id UUID, -- link naar chat sessie
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  reminder_sent_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_start ON bookings(start_time);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Booking chat sessions (voor context)
CREATE TABLE booking_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB DEFAULT '[]',
  booking_id UUID REFERENCES bookings(id),
  visitor_id TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Google Calendar Setup

### 1. Google Cloud Console Setup

1. Ga naar [console.cloud.google.com](https://console.cloud.google.com)
2. Maak een nieuw project: "WeAreImpact Booking"
3. Enable de Google Calendar API
4. Maak een Service Account aan:
   - Naam: "booking-service"
   - Rol: geen (we delen de calendar)
5. Download de JSON key file
6. Deel je Google Calendar met het service account email

### 2. Environment Variables

```env
# Google Calendar
GOOGLE_CALENDAR_ID=vincent@weareimpact.nl
GOOGLE_SERVICE_ACCOUNT_EMAIL=booking-service@weareimpact-booking.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## AI Conversation Flow

### System Prompt

```
Je bent de booking assistent voor Vincent van Munster van WeAreImpact.

DOEL: Help bezoekers een afspraak in te plannen op een warme, efficiënte manier.

PERSOONLIJKHEID:
- Vriendelijk maar professioneel
- Kort en bondig (geen lange teksten)
- Hulpvaardig en proactief

FLOW:
1. Begroet en vraag wat voor gesprek ze willen
2. Stel 1-2 kwalificerende vragen (organisatietype, onderwerp)
3. Toon beschikbare tijden
4. Verzamel contactgegevens
5. Bevestig de afspraak

REGELS:
- Noem altijd specifieke opties (niet open vragen)
- Maximaal 3 opties per keer
- Als iemand iets vraagt dat niet over booking gaat: verwijs door naar de kennisbank of het contactformulier
- Wees eerlijk als iets niet past bij wat Vincent doet

BESCHIKBARE AFSPRAAKTYPES:
- Kennismakingsgesprek (30 min, gratis): Eerste gesprek om te ontdekken of er een match is
- Strategiesessie (60 min, €150): Concrete adviezen over AI, impact, of vrijwilligersbeleid
- LEGO Serious Play workshop (op aanvraag): Voor teams die met de methode willen werken

VINCENT'S EXPERTISE:
- AI implementatie in welzijn en non-profits
- Sociaal ondernemen
- Vrijwilligersmanagement
- Impact meten
- LEGO Serious Play facilitatie
```

---

## Email Templates

### Bevestiging

```
Onderwerp: Je afspraak met Vincent van Munster - {{date}}

Hoi {{name}},

Je afspraak is bevestigd! 🎉

📅 {{day}}, {{date}}
🕐 {{time}} ({{duration}} minuten)
📍 Videocall via Google Meet
🔗 {{meet_link}}

---

VOORBEREIDING
{{#if isKennismaking}}
Geen voorbereiding nodig - dit is een vrijblijvend gesprek om te ontdekken of er een match is.
{{/if}}
{{#if isStrategiesessie}}
Het helpt als je van tevoren nadenkt over:
- Wat is je grootste uitdaging momenteel?
- Wat heb je al geprobeerd?
- Wat zou succes er voor jou uitzien?
{{/if}}

---

AFSPRAAK WIJZIGEN?
Gebruik deze link om te verzetten of te annuleren:
{{reschedule_link}}

Tot dan!

Vincent van Munster
WeAreImpact
```

### Reminder (24 uur van tevoren)

```
Onderwerp: Reminder: Morgen je gesprek met Vincent

Hoi {{name}},

Een vriendelijke reminder dat je morgen een afspraak hebt:

📅 {{day}}, {{date}}
🕐 {{time}}
🔗 {{meet_link}}

Tot morgen!
```

---

## Component Structuur

```
src/components/features/BookingAssistant/
├── index.tsx                 # Main export
├── BookingChat.tsx           # Chat interface
├── BookingMessage.tsx        # Individual message
├── BookingOptions.tsx        # Quick reply buttons
├── BookingCalendar.tsx       # Time slot picker
├── BookingForm.tsx           # Contact details form
├── BookingConfirmation.tsx   # Success screen
├── useBookingChat.ts         # Chat state hook
└── types.ts                  # TypeScript types
```

---

## API Endpoints

### GET /api/booking/availability

```typescript
// Request
GET /api/booking/availability?type=kennismaking&start=2025-01-13&end=2025-01-27

// Response
{
  "slots": [
    {
      "date": "2025-01-15",
      "times": [
        { "start": "10:00", "end": "10:30", "available": true },
        { "start": "14:00", "end": "14:30", "available": true }
      ]
    },
    // ...
  ]
}
```

### POST /api/booking/create

```typescript
// Request
POST /api/booking/create
{
  "bookingType": "kennismaking",
  "startTime": "2025-01-15T10:00:00+01:00",
  "customer": {
    "name": "Jan de Vries",
    "email": "jan@nonprofit.nl",
    "phone": "0612345678",
    "organization": "Stichting Samen",
    "organizationType": "nonprofit",
    "topic": "AI implementatie",
    "notes": "Specifiek interesse in ChatGPT voor vrijwilligers"
  },
  "conversationId": "uuid"
}

// Response
{
  "success": true,
  "booking": {
    "id": "uuid",
    "meetLink": "https://meet.google.com/xxx-xxx-xxx",
    "calendarLink": "https://calendar.google.com/...",
    "confirmationSent": true
  }
}
```

### POST /api/booking/chat

```typescript
// Request
POST /api/booking/chat
{
  "messages": [
    { "role": "user", "content": "Ik wil een afspraak maken" }
  ],
  "conversationId": "uuid"
}

// Response (streaming)
{
  "message": "Leuk dat je een afspraak wilt maken! ...",
  "actions": [
    {
      "type": "options",
      "options": [
        { "id": "kennismaking", "label": "Kennismakingsgesprek (30 min, gratis)" },
        { "id": "strategie", "label": "Strategiesessie (60 min)" },
        { "id": "lego", "label": "LEGO Serious Play workshop" }
      ]
    }
  ]
}
```

---

## Implementatie Volgorde

### Fase 1: Basis (Dag 1)
- [ ] Database schema deployen
- [ ] Booking types configureren
- [ ] Availability rules instellen

### Fase 2: Google Calendar (Dag 1-2)
- [ ] Google Cloud project setup
- [ ] Service account aanmaken
- [ ] Calendar API integratie
- [ ] Availability endpoint

### Fase 3: Booking Flow (Dag 2-3)
- [ ] Create booking endpoint
- [ ] Google Calendar event aanmaken
- [ ] Meet link genereren
- [ ] Email bevestiging

### Fase 4: Chat Interface (Dag 3-4)
- [ ] BookingAssistant component
- [ ] Chat UI met messages
- [ ] Quick reply buttons
- [ ] Time slot picker
- [ ] Form integration

### Fase 5: AI Integration (Dag 4-5)
- [ ] Booking chat endpoint
- [ ] System prompt fine-tuning
- [ ] Intent detection
- [ ] Structured outputs

### Fase 6: Polish (Dag 5)
- [ ] Email templates
- [ ] Reminder cron job
- [ ] Admin overzicht
- [ ] Error handling

---

## Unieke Features

### 1. Conversation Memory
De AI onthoudt wat eerder is besproken en kan doorvragen.

### 2. Smart Suggestions
Op basis van wat de klant zegt, suggereert de AI het beste type gesprek.

### 3. Instant Booking
Geen heen-en-weer mailen - direct in de agenda.

### 4. Lead Qualification
Voordat de afspraak wordt gemaakt, weet Vincent al:
- Type organisatie
- Wat ze willen bespreken
- Hoe urgent het is

### 5. Vincent's Stem
De AI communiceert in Vincent's stijl: warm, praktisch, direct.

---

*Plan versie 1.0 | Januari 2025*
