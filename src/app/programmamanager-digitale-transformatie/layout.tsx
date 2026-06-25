import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programmamanager Digitale Transformatie | Sociaal Domein',
  description:
    'Digitale transformatie die écht landt. ✓ Strategie naar werkende roadmap ✓ AI als versneller ✓ LEGO® Serious Play draagvlak. Voor programmamanagers in gemeenten, zorg en welzijn.',
  keywords: [
    'programmamanager digitale transformatie',
    'digitale transformatie gemeente',
    'digitale transformatie welzijn',
    'digitale transformatie zorg',
    'programmamanager AI',
    'verandermanagement AI implementatie',
    'roadmap digitale transformatie',
    'AI implementatie sociaal domein',
    'LEGO Serious Play draagvlak',
    'transformatieprogramma gemeente',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/programmamanager-digitale-transformatie',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/programmamanager-digitale-transformatie',
    siteName: 'WeAreImpact',
    title: 'Programmamanager Digitale Transformatie | Sociaal Domein | WeAreImpact',
    description:
      'Digitale transformatie die écht landt. Van strategie naar werkende AI-toepassingen en duurzaam draagvlak. Voor programmamanagers in gemeenten, zorg en welzijn.',
    images: [
      {
        url: '/og-programmamanager-digitale-transformatie.png',
        width: 1200,
        height: 630,
        alt: 'Programmamanager Digitale Transformatie — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programmamanager Digitale Transformatie | Sociaal Domein',
    description:
      'Digitale transformatie die écht landt. Van strategie naar werkende AI-toepassingen en duurzaam draagvlak.',
    images: ['/og-programmamanager-digitale-transformatie.png'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Programmamanagement Digitale Transformatie',
  description:
    'Begeleiding van digitale transformatieprogramma\'s voor gemeenten, zorginstellingen en welzijnsorganisaties. Van strategie naar werkende roadmap, AI-implementatie en draagvlak via LEGO® Serious Play.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
    jobTitle: 'Programmamanager Digitale Transformatie',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Programmamanagement & Digitale Transformatie',
  audience: {
    '@type': 'Audience',
    audienceType: 'Programmamanagers in gemeenten, zorg en welzijn',
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
      name: 'Wat maakt een programmamanager digitale transformatie succesvol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een succesvolle programmamanager digitale transformatie combineert strategisch inzicht met uitvoeringskennis. Hij of zij bouwt draagvlak bij medewerkers, vertaalt visie naar concrete stappen en weet AI en technologie te verbinden met de menselijke kant van organisatieverandering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een digitaal transformatietraject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een gefaseerd 90-dagentraject levert zichtbaar resultaat en een team dat zelfstandig verder kan. Grotere organisatiebrede transformaties lopen over 6 tot 18 maanden. We bepalen de scope samen in een vrijblijvend gesprek.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is LEGO® Serious Play en waarom werkt het?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LEGO® Serious Play is een gecertificeerde faciliteringsmethode waarbij teams letterlijk bouwen aan hun strategische vraagstukken. In één dag creëren teams draagvlak en concrete afspraken die maanden vergaderen niet opleveren. Bewezen effectief voor digitale transformaties in het sociaal domein.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan Vincent als interim programmamanager digitale transformatie werken?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Vincent kan zowel als extern adviseur als interim programmamanager worden ingezet, afhankelijk van de behoefte van de organisatie. Met 15+ jaar ervaring in het sociaal domein en hands-on AI-kennis is hij direct inzetbaar.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Programmamanager Digitale Transformatie', item: 'https://weareimpact.nl/programmamanager-digitale-transformatie' },
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
