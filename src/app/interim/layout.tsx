import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim Directeur-Bestuurder Sociaal Domein | Vincent van Munster',
  description:
    'Interim directeur-bestuurder en kwartiermaker voor het sociaal domein. 25+ jaar directie-ervaring, direct inzetbaar, AVG-proof. Voor welzijn, zorg en gemeenten.',
  keywords: [
    'interim directeur sociaal domein',
    'interim directeur-bestuurder',
    'interim manager welzijn',
    'interim opdracht sociaal domein',
    'transitiemanager welzijnsorganisatie',
    'kwartiermaker publieke sector',
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
    title: 'Interim Directeur-Bestuurder Sociaal Domein | WeAreImpact',
    description:
      'Interim directeur-bestuurder met 25+ jaar directie-ervaring in het sociaal domein. Direct inzetbaar voor transitieopdrachten, kwartiermaken en digitale transformatie.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Interim Directeur-Bestuurder Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim Directeur-Bestuurder Sociaal Domein | WeAreImpact',
    description:
      'Interim directeur-bestuurder met 25+ jaar directie-ervaring in het sociaal domein. Direct inzetbaar, resultaatgericht, menselijk.',
    images: ['/og-homepage.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Interim Directeur-Bestuurder Sociaal Domein',
  description:
    'Interim directeur-bestuurder, kwartiermaker en transitiemanager voor welzijnsorganisaties, gemeenten en sociaal ondernemers. Van bestuurlijke overbrugging tot digitale transformatie. Direct inzetbaar, mensgericht en resultaatgericht.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl/interim',
    jobTitle: 'Interim Directeur-Bestuurder',
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
      name: 'Wat doet een interim directeur-bestuurder in het sociaal domein precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim directeur-bestuurder in het sociaal domein neemt tijdelijk de volledige bestuurlijke verantwoordelijkheid over: financiën, personeel, de relatie met de Raad van Toezicht en de koers van de organisatie. Denk aan overbrugging bij een vacature of vertrek, leiding tijdens een fusie of reorganisatie, of het invoeren van AI in de dagelijkse werkprocessen. Geen lange rapporten — gewoon leiding nemen, met de mensen die het werk doen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe verschilt een interim directeur-bestuurder van een vaste directeur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim directeur-bestuurder brengt ervaring van meerdere organisaties mee, is direct inzetbaar zonder inwerktijd, en blijft gefocust op resultaat zonder vast te lopen in de waan van de dag. Doordat ik van buiten kom, zie ik vaak patronen en kansen die interne medewerkers over het hoofd zien. En ik vertrek weer als het werk gedaan is — geen overhead op de lange termijn.',
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
    { '@type': 'ListItem', position: 2, name: 'Interim Directeur-Bestuurder', item: 'https://weareimpact.nl/interim' },
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
