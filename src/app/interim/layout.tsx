import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim Projectleider Sociaal Domein | Vincent van Munster',
  description:
    'Interim projectleider voor het sociaal domein. ✓ 15+ jaar sectorervaring ✓ Direct inzetbaar ✓ AI & verandermanagement ✓ AVG-proof. Voor welzijnsorganisaties, gemeenten en sociaal ondernemers.',
  keywords: [
    'interim projectleider sociaal domein',
    'interim manager welzijn',
    'interim opdracht sociaal domein',
    'projectleider welzijnsorganisatie',
    'interim verandermanagement sociaal domein',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/interim',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/interim',
    siteName: 'WeAreImpact',
    title: 'Interim Projectleider Sociaal Domein | WeAreImpact',
    description:
      'Interim projectleider met 15+ jaar ervaring in het sociaal domein. Direct inzetbaar voor AI-implementatie, verandermanagement, subsidietrajecten en programma-leiderschap.',
    images: [
      {
        url: '/og-interim.webp',
        width: 1200,
        height: 630,
        alt: 'Interim Projectleider Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim Projectleider Sociaal Domein | WeAreImpact',
    description:
      'Interim projectleider met 15+ jaar ervaring in het sociaal domein. Direct inzetbaar, resultaatgericht, menselijk.',
    images: ['/og-interim.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Interim Projectleider Sociaal Domein',
  description:
    'Interim projectleider en verandermanager voor welzijnsorganisaties, gemeenten en sociaal ondernemers. Van AI-implementatie tot organisatieverandering. Direct inzetbaar, mensgericht en resultaatgericht.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl/interim',
    jobTitle: 'Interim Projectleider Sociaal Domein',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Interim Management',
  audience: {
    '@type': 'Audience',
    audienceType: 'Welzijnsorganisaties, gemeenten en sociaal ondernemers',
  },
  offers: {
    '@type': 'Offer',
    description: 'Vrijblijvend kennismakingsgesprek',
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
      name: 'Wat doet een interim projectleider in het sociaal domein precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim projectleider in het sociaal domein neemt tijdelijk de regie over een veranderingstraject, implementatie of programma. Denk aan de invoering van AI in de dagelijkse werkprocessen, een reorganisatie van de vrijwilligersorganisatie, het opzetten van een impact-meet systeem, of het begeleiden van een fusie of subsidie-transitie. Geen lange rapporten — gewoon doen, met de mensen die het werk doen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe verschilt een interim projectleider van een vaste medewerker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim projectleider brengt ervaring van meerdere organisaties mee, is direct inzetbaar zonder inwerktijd, en blijft gefocust op resultaat zonder vast te lopen in de waan van de dag. Doordat ik van buiten kom, zie ik vaak patronen en kansen die interne medewerkers over het hoofd zien. En ik vertrek weer als het werk gedaan is — geen overhead op de lange termijn.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe snel kun je starten met een interim opdracht?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na een vrijblijvend kennismakingsgesprek kan ik binnen enkele dagen starten. Omdat ik al 15+ jaar in de sector werk, is er geen uitgebreide inwerktijd nodig. Ik ken de wetten, de spelers, en de valkuilen. Dat scheelt weken op de doorlooptijd van jouw project.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Interim Projectleider', item: 'https://weareimpact.nl/interim' },
  ],
};

export default function InterimLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
