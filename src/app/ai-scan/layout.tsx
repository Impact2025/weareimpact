import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis AI Readiness Scan voor Zorg, Welzijn & Non-Profit',
  description:
    'Doe de gratis AI Readiness Scan en ontdek in 5 minuten wat AI jouw organisatie concreet oplevert. ✓ Sector-specifiek advies ✓ Direct resultaat ✓ Geen verplichtingen. Voor gemeenten, welzijn & zorg.',
  keywords: [
    'AI readiness scan',
    'AI scan organisatie',
    'AI readiness assessment',
    'gratis AI scan',
    'AI scan welzijn',
    'AI scan gemeente',
    'AI scan non-profit',
    'AI scan zorg',
    'AI volwassenheid organisatie',
    'AI kansen organisatie',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/ai-scan',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/ai-scan',
    siteName: 'WeAreImpact',
    title: 'Gratis AI Readiness Scan | WeAreImpact',
    description:
      'Doe de gratis AI Readiness Scan en ontdek in 5 minuten wat AI jouw organisatie concreet oplevert. Sector-specifiek advies voor zorg, welzijn en gemeenten.',
    images: [
      {
        url: '/og-ai-proof-checklist.webp',
        width: 1200,
        height: 630,
        alt: 'Gratis AI Readiness Scan — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratis AI Readiness Scan | WeAreImpact',
    description:
      'Ontdek in 5 minuten wat AI jouw organisatie concreet oplevert. Sector-specifiek advies voor zorg, welzijn en gemeenten.',
    images: ['/og-ai-proof-checklist.webp'],
  },
};

const toolSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Readiness Scan',
  description:
    'Gratis interactieve scan die in 5 minuten inzicht geeft in de AI-kansen voor jouw organisatie. Sector-specifiek advies voor zorg, welzijn, gemeenten en non-profit.',
  url: 'https://weareimpact.nl/ai-scan',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  author: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wat is een AI Readiness Scan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een AI Readiness Scan brengt in kaart hoe ver jouw organisatie is met AI en waar de concrete kansen liggen. De scan is afgestemd op jouw sector en geeft direct praktisch advies — geen buzzwords, maar acties die je morgen kunt oppakken.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt de scan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De scan duurt ongeveer 5 minuten. Je beantwoordt een paar gerichte vragen over jouw sector, uitdagingen en huidige AI-gebruik. Direct daarna ontvang je een gepersonaliseerd rapport.',
      },
    },
    {
      '@type': 'Question',
      name: 'Voor wie is de AI Readiness Scan bedoeld?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De scan is specifiek ontwikkeld voor sociale organisaties: welzijnsorganisaties, zorginstellingen, gemeenten, stichtingen en non-profits. Je hebt geen technische achtergrond nodig.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is de scan echt gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, de scan is volledig gratis en vrijblijvend. Er zijn geen verplichtingen aan verbonden.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'AI Readiness Scan', item: 'https://weareimpact.nl/ai-scan' },
  ],
};

export default function AIScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
