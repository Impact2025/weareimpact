import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kwartiermaker AI sociaal domein',
  description:
    'Ik zet nieuwe AI-werkwijzen neer waar nog geen blauwdruk voor bestaat. Kwartiermaker innovatie & AI voor gemeenten en welzijnsorganisaties, 25+ jaar sectorervaring.',
  keywords: [
    'kwartiermaker AI',
    'kwartiermaker sociaal domein',
    'kwartiermaker innovatie',
    'kwartiermaker gemeente',
    'kwartiermaker welzijn',
    'interim kwartiermaker inhuren',
    'kwartiermaker digitale transformatie',
    'kwartiermaker versus projectleider',
    'AI-functie opzetten gemeente',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/kwartiermaker-ai-sociaal-domein',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/kwartiermaker-ai-sociaal-domein',
    siteName: 'WeAreImpact',
    title: 'Kwartiermaker AI sociaal domein | WeAreImpact',
    description:
      'Van visie naar bewezen concept, in 3 tot 6 maanden — met overdracht. Kwartiermaker innovatie & AI voor gemeenten en welzijnsorganisaties.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Kwartiermaker AI Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kwartiermaker AI sociaal domein | WeAreImpact',
    description:
      'Van visie naar bewezen concept, in 3 tot 6 maanden — met overdracht. 25+ jaar sectorervaring.',
    images: ['/og-homepage.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Kwartiermaker Innovatie & AI Sociaal Domein',
  description:
    'Kwartiermaker voor gemeenten en welzijnsorganisaties: van visie naar bewezen AI-werkwijze, in 3 tot 6 maanden, met overdracht aan het eigen team.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
    jobTitle: 'Kwartiermaker Innovatie & AI',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Kwartiermaken',
  audience: {
    '@type': 'Audience',
    audienceType: 'Gemeenten en welzijnsorganisaties in het sociaal domein',
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
      name: 'Wat doet een kwartiermaker precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een kwartiermaker gaat een organisatie vooruit om een nieuwe werkwijze, afdeling of functie voor te bereiden waarvoor nog geen blauwdruk bestaat. Dat betekent: doelen scherp krijgen, draagvlak organiseren, een eerste werkende aanpak bouwen en die overdragen aan een team dat het zelf voortzet.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen een kwartiermaker en een projectleider?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bij een projectleider liggen doel, scope en kaders al vast — de opdracht is uitvoeren. Bij een kwartiermaker ligt dat nog open: eerst wordt de richting en de aanpak bepaald en bewezen, pas daarna volgt overdracht aan uitvoering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer heb ik een kwartiermaker AI nodig?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bij een fusie of reorganisatie waarbij innovatie een nieuwe plek krijgt, een AI-strategie die van papier naar uitvoering moet, of een nieuwe dienst die nog bewezen moet worden voordat je er structureel in investeert.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een traject als kwartiermaker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doorgaans 3 tot 6 maanden: de tijd die nodig is om van een open opdracht naar een bewezen, overdraagbare aanpak te komen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een interim kwartiermaker AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mijn tarief is €125-€140 per uur, voor maximaal 16-24 uur per week. Een eerste verkennend gesprek is altijd gratis en vrijblijvend.',
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
      name: 'Kwartiermaker AI Sociaal Domein',
      item: 'https://weareimpact.nl/kwartiermaker-ai-sociaal-domein',
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
