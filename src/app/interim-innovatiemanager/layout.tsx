import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim innovatiemanager sociaal domein inhuren',
  description:
    'Interim innovatiemanager voor welzijn, zorg en gemeenten. Ik bouw en stuur een innovatie- en AI-portfolio aan, met 25+ jaar directie-ervaring.',
  keywords: [
    'interim innovatiemanager',
    'innovatiemanager sociaal domein',
    'innovatiemanager welzijn',
    'innovatiemanager AI',
    'interim manager innovatie',
    'innovatiemanager gemeente',
    'innovatiemanager inhuren',
    'AI-portfolio sociaal domein',
    'innovatiefunctie opzetten',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/interim-innovatiemanager',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/interim-innovatiemanager',
    siteName: 'WeAreImpact',
    title: 'Interim innovatiemanager sociaal domein inhuren | WeAreImpact',
    description:
      'Ik bouw en stuur een innovatie- en AI-portfolio aan voor welzijnsorganisaties, zorg en gemeenten. Niet één project, maar een doorlopende innovatiefunctie.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Interim Innovatiemanager Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim innovatiemanager sociaal domein inhuren | WeAreImpact',
    description:
      'Interim innovatiemanager voor welzijn, zorg en gemeenten. Bouw en aansturing van een doorlopende innovatie- en AI-portfolio.',
    images: ['/og-homepage.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Interim Innovatiemanager Sociaal Domein',
  description:
    'Interim aansturing van de innovatie- en AI-portfolio bij welzijnsorganisaties, zorginstellingen en gemeenten. Van losse pilots naar een doorlopende, beheerste innovatiefunctie.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
    jobTitle: 'Interim Innovatiemanager',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Interim Innovatiemanagement',
  audience: {
    '@type': 'Audience',
    audienceType: 'Directies en besturen van welzijnsorganisaties, zorginstellingen en gemeenten',
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
      name: 'Wat doet een interim innovatiemanager?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een interim innovatiemanager bouwt en beheert de innovatie- en AI-portfolio van een organisatie: welke initiatieven lopen er, wat leveren ze op, wat stopt en wat schaalt door. Dat is een doorlopende managementfunctie, geen eenmalig project.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen een interim innovatiemanager en een kwartiermaker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een kwartiermaker zet één nieuwe werkwijze of functie neer en draagt over zodra die bewezen is — een eindig traject. Een interim innovatiemanager beheert een lopende portfolio van meerdere initiatieven tegelijk, met budget- en prioriteringsbeslissingen, voor de duur van de opdracht.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer heb ik een interim innovatiemanager nodig?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wanneer er meerdere innovatie- of AI-initiatieven naast elkaar lopen zonder duidelijke regie, wanneer pilots blijven hangen zonder dat ze opschalen, of wanneer een organisatie structureel behoefte heeft aan iemand die de innovatieagenda bewaakt naast de dagelijkse bedrijfsvoering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een opdracht als interim innovatiemanager?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doorgaans 6 tot 12 maanden, met een tussentijdse evaluatie na het eerste kwartaal. Lang genoeg om een portfolio echt te laten renderen, kort genoeg om gericht te blijven op overdracht aan een vaste rol.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een interim innovatiemanager?',
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
      name: 'Interim Innovatiemanager Sociaal Domein',
      item: 'https://weareimpact.nl/interim-innovatiemanager',
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
