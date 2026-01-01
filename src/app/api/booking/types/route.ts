import { NextResponse } from 'next/server';

// Booking types configuration (will be from database later)
const BOOKING_TYPES = [
  {
    slug: 'kennismaking',
    name: 'Kennismakingsgesprek',
    description: 'Gratis eerste gesprek om te ontdekken of er een match is. We bespreken je situatie en ik geef eerste handvatten.',
    duration: 30,
    price: 0,
    icon: '👋',
  },
  {
    slug: 'strategie-ai',
    name: 'AI Strategiesessie',
    description: 'Concrete adviezen voor AI implementatie in jouw organisatie. Je krijgt een actieplan mee.',
    duration: 60,
    price: 150,
    icon: '🤖',
  },
  {
    slug: 'strategie-impact',
    name: 'Impact Strategiesessie',
    description: 'Advies over vrijwilligersbeleid, impact meten of sociaal ondernemen.',
    duration: 60,
    price: 150,
    icon: '📊',
  },
  {
    slug: 'lego-intro',
    name: 'LEGO Serious Play Introductie',
    description: 'Kennismaking met de LEGO Serious Play methode voor jou of een klein team.',
    duration: 90,
    price: 250,
    icon: '🧱',
  },
  {
    slug: 'lego-workshop',
    name: 'LEGO Serious Play Workshop',
    description: 'Volledige workshop voor je team (max 12 personen). Prijs op aanvraag.',
    duration: 240,
    price: null, // Op aanvraag
    icon: '🎯',
    requiresApproval: true,
  },
];

export async function GET() {
  return NextResponse.json({
    types: BOOKING_TYPES,
  });
}
