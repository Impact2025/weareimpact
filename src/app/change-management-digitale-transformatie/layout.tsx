import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change Management Digitale Transformatie | Gemeenten & Welzijn',
  description:
    'Digitale transformatie mislukt op mensen, niet op technologie. ✓ Draagvlak van binnenuit ✓ LEGO® Serious Play ✓ 90-dagenplan cultuurverandering. Specialist sociaal domein.',
  keywords: [
    'change management digitale transformatie',
    'cultuurverandering AI implementatie',
    'digitale transformatie gemeente',
    'draagvlak medewerkers digitalisering',
    'change management welzijn',
    'organisatieverandering AI',
    'LEGO Serious Play facilitator',
    'weerstand digitale verandering',
    'adoptie AI medewerkers',
    'verandermanagement sociaal domein',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/change-management-digitale-transformatie',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/change-management-digitale-transformatie',
    siteName: 'WeAreImpact',
    title: 'Change Management Digitale Transformatie | WeAreImpact',
    description:
      '85% van digitale transformaties mislukt door mensen, niet technologie. Van weerstand naar eigenaarschap — in 90 dagen. Specialist in sociaal domein met LEGO® Serious Play.',
    images: [
      {
        url: '/og-change-management-digitale-transformatie.png',
        width: 1200,
        height: 630,
        alt: 'Change Management Digitale Transformatie — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Change Management Digitale Transformatie | Gemeenten & Welzijn',
    description:
      '85% van digitale transformaties mislukt door mensen, niet technologie. Van weerstand naar eigenaarschap in 90 dagen.',
    images: ['/og-change-management-digitale-transformatie.png'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Change Management Digitale Transformatie',
  description:
    'Begeleiding bij cultuurverandering en draagvlak bij digitale transformaties in gemeenten, welzijnsorganisaties en het sociaal domein.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
    jobTitle: 'Change Management Consultant',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Change Management Consulting',
  audience: {
    '@type': 'Audience',
    audienceType: 'Gemeenten, welzijnsorganisaties, sociaal domein',
  },
  offers: {
    '@type': 'Offer',
    description: 'Gratis kennismakingsgesprek van 30 minuten',
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
      name: 'Waarom mislukken zoveel digitale transformaties?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '85% van digitale transformaties strandt — niet door technologie maar door mensen. Weerstand, gebrek aan eigenaarschap, angst voor banenverlies, een kloof tussen directie en werkvloer. Technologie is het makkelijke deel. De cultuurverandering die erbij hoort is het echte werk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen change management en projectmanagement?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Projectmanagement gaat over wat er verandert en wanneer. Change management gaat over hoe mensen meegaan in die verandering. Een perfect uitgerold systeem zonder adoptie is een mislukt project. Goede change management zorgt dat de verandering ook echt landt in de organisatie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Onze medewerkers zijn bang voor AI. Hoe ga je daarmee om?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Die angst is begrijpelijk en terecht. Met LEGO® Serious Play sessies krijgen medewerkers de ruimte om hun zorgen te bouwen en bespreekbaar te maken. Vanuit die eerlijke basis bouwen we samen aan vertrouwen — in één dag meer draagvlak dan maanden vergaderen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een change management traject voor digitale transformatie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een compacte interventie (workshop + follow-up) kan in 4-6 weken. Een volledig 90-dagentraject voor cultuurverandering loopt — logischerwijs — 90 dagen. De omvang stemmen we af op jouw situatie in een gratis kennismakingsgesprek.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kunnen we change management voor digitale transformatie niet intern regelen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Soms wel. Maar interne veranderingsbegeleiding heeft twee blinde vlekken: je zit zelf in het systeem, en mensen zeggen andere dingen tegen een collega dan tegen een externe begeleider. Een buitenstaander met kennis van het sociaal domein brengt ruimte die intern moeilijk te creëren is.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Change Management Digitale Transformatie', item: 'https://weareimpact.nl/change-management-digitale-transformatie' },
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
