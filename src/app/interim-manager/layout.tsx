import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim manager sociaal domein inhuren',
  description:
    'Interim directeur-bestuurder en interim manager voor welzijn, zorg en gemeenten. 25+ jaar directie-ervaring, snel inzetbaar bij vacature of transitie.',
  keywords: [
    'interim manager sociaal domein',
    'interim manager welzijn',
    'interim manager inhuren',
    'interim directeur',
    'interim directeur-bestuurder',
    'interim manager zorg',
    'interim manager gemeente',
    'overbruggingsmanagement welzijn',
    'interim manager vacature directie',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/interim-manager',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/interim-manager',
    siteName: 'WeAreImpact',
    title: 'Interim manager sociaal domein inhuren | WeAreImpact',
    description:
      'Geen adviesrapport, maar iemand die het roer overneemt. Interim directeur-bestuurder en manager voor welzijn, zorg en gemeenten — 25+ jaar directie-ervaring.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Interim Manager Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim manager sociaal domein inhuren | WeAreImpact',
    description:
      'Interim directeur-bestuurder en manager voor welzijn, zorg en gemeenten. 25+ jaar directie-ervaring, snel inzetbaar.',
    images: ['/og-homepage.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Interim Manager & Interim Directeur-Bestuurder Sociaal Domein',
  description:
    'Interim management voor welzijnsorganisaties, zorginstellingen en gemeenten: overbrugging bij vacature of vertrek, of stevige leiding tijdens een transitie. Vanuit 25+ jaar directie-ervaring in het sociaal domein.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
    jobTitle: 'Interim Directeur-Bestuurder',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Interim Management',
  audience: {
    '@type': 'Audience',
    audienceType: 'Raden van Toezicht, besturen en gemeenten in het sociaal domein',
  },
  offers: {
    '@type': 'Offer',
    description: 'Gratis en vrijblijvend kennismakingsgesprek',
    price: '0',
    priceCurrency: 'EUR',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wanneer huur je een interim manager in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bij een onverwachte vacature of vertrek in de directie, ziekte van een bestuurder, of wanneer een Raad van Toezicht tijdens een fusie, reorganisatie of andere transitie tijdelijk stevige, ervaren leiding nodig heeft die snel kan starten.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen een interim manager en een interim directeur-bestuurder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim manager stuurt doorgaans een team of afdeling aan binnen een bestaande organisatiestructuur. Een interim directeur-bestuurder draagt de volledige eindverantwoordelijkheid: financiën, personeel, de relatie met de Raad van Toezicht en de koers van de hele organisatie. Ik vervul beide rollen, afhankelijk van wat de situatie vraagt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe snel is een interim manager inzetbaar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doorgaans binnen 2 tot 4 weken na het eerste gesprek. Bij urgente situaties, zoals een acuut vertrek, is een sneller startmoment vaak bespreekbaar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een interim manager inhuren?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mijn tarief is €125-€140 per uur, voor maximaal 16-24 uur per week. Een eerste verkennend gesprek is altijd gratis en vrijblijvend, zodat snel duidelijk is of en hoe ik kan helpen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat maakt jou anders dan een interim manager uit een bureau?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ik werk zelfstandig, zonder bureau ertussen — geen extra laag, geen opslag op het tarief. Ik heb zelf 25+ jaar directie-ervaring in het sociaal domein, onder meer bij Stichting de Baan, en zet daarnaast moderne technologie in om sneller grip te krijgen op de organisatie die ik tijdelijk leid.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Interim Manager Sociaal Domein',
      item: 'https://weareimpact.nl/interim-manager',
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
