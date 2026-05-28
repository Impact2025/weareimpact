import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Strategie Consultant voor Gemeenten & Welzijn | WeAreImpact',
  description:
    'Concrete AI-strategie voor gemeenten, welzijnsorganisaties en non-profit. ✓ Roadmap op 1 A4 ✓ AI Governance Framework ✓ 15+ jaar sociaal domein. Gratis kennismakingsgesprek.',
  keywords: [
    'AI strategie consultant',
    'AI strategie gemeente',
    'AI governance sociaal domein',
    'AI strategie welzijn',
    'AI roadmap non-profit',
    'AI implementatie gemeente',
    'verantwoorde AI gemeente',
    'AI consultant sociaal domein',
    'AI governance framework',
    'AI readiness organisatie',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://www.weareimpact.nl/ai-strategie-consultant',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.weareimpact.nl/ai-strategie-consultant',
    siteName: 'WeAreImpact',
    title: 'AI Strategie Consultant voor Gemeenten & Welzijn | WeAreImpact',
    description:
      'Van losse AI-experimenten naar een strategie die beklijft. Roadmap op 1 A4, AI Governance Framework en begeleiding door specialist met 15+ jaar sociaal domein.',
    images: [
      {
        url: '/og-ai-strategie-consultant.png',
        width: 1200,
        height: 630,
        alt: 'AI Strategie Consultant Vincent van Munster — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Strategie Consultant voor Gemeenten & Welzijn',
    description:
      'Van losse AI-experimenten naar een strategie die beklijft. Roadmap op 1 A4, AI Governance Framework. Gratis kennismakingsgesprek.',
    images: ['/og-ai-strategie-consultant.png'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Strategie Consulting',
  description:
    'Concrete AI-strategie voor gemeenten, welzijnsorganisaties en non-profit organisaties. Van strategiediagnose tot roadmap en governance framework.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://www.weareimpact.nl',
    jobTitle: 'AI Strategie Consultant',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'AI Strategie Consulting',
  audience: {
    '@type': 'Audience',
    audienceType: 'Gemeenten, welzijnsorganisaties, non-profit, sociaal domein',
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
      name: 'Wat is een AI-strategie precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een AI-strategie geeft antwoord op drie vragen: wat willen we bereiken met AI, welke toepassingen passen bij onze organisatie, en hoe zorgen we dat het ook echt werkt — technisch, juridisch en menselijk. Zonder strategie is AI een reeks losse experimenten die niets opleveren.',
      },
    },
    {
      '@type': 'Question',
      name: 'We zijn een kleine organisatie. Is een AI-strategie dan niet overdreven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Juist niet. Een kleine organisatie heeft minder ruimte voor fouten. Een goede strategie voorkomt dat je budget en energie verspilt aan tools die niet passen. Een eenvoudige, heldere strategie is beter dan helemaal geen kaders hebben.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een AI-strategietraject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een compacte AI-strategiediagnose + roadmap kan in 2 tot 4 weken worden opgeleverd. Een uitgebreider traject inclusief governance-framework en implementatiebegeleiding loopt over 6 tot 12 weken.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een AI-strategietraject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dat hangt af van de diepgang en doorlooptijd. Een compacte diagnose + roadmap start vanaf een eenmalige investering. We bespreken je situatie eerst in een gratis kennismakingsgesprek van 30 minuten.',
      },
    },
    {
      '@type': 'Question',
      name: 'Onze gemeente heeft al een IT-afdeling. Waarom dan nog een externe AI-consultant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een IT-afdeling is sterk in technologie en beheer. Maar een AI-strategie raakt ook aan beleid, cultuur, ethiek en processen. Een externe consultant verbindt die werelden en zorgt dat de strategie breed gedragen is — ook buiten IT.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'AI Strategie Consultant', item: 'https://www.weareimpact.nl/ai-strategie-consultant' },
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
