import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim Verandermanagement AI & Innovatie in het Sociaal Domein | WeAreImpact',
  description:
    'Waarom mislukken AI-projecten in de zorg? Omdat IT-consultants de werkvloer niet kennen. Vincent van Munster — 25 jaar directie & welzijnsachtergrond — zorgt wél dat het landt. Gratis strategische verkenning.',
  keywords: [
    'interim verandermanagement AI',
    'interim manager sociaal domein',
    'AI innovatie zorg',
    'verandermanagement welzijnsorganisatie',
    'AI adoptie sociaal domein',
    'digitale transformatie zorg',
    'interim manager AI',
    'AI implementatie welzijn',
    'weerstand AI zorg',
    'menselijke maat AI',
    'interim directeur welzijn',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://www.weareimpact.nl/interim-verandermanagement-ai-sociaal-domein',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.weareimpact.nl/interim-verandermanagement-ai-sociaal-domein',
    siteName: 'WeAreImpact',
    title: 'Interim Verandermanagement AI & Innovatie in het Sociaal Domein | WeAreImpact',
    description:
      'IT-consultants leveren systemen, maar de werkvloer weigert ze. Vincent van Munster — uit de welzijnshoek, 25 jaar ervaring — zorgt dat AI-innovatie ook echt landt in uw organisatie.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim Verandermanagement AI & Innovatie in het Sociaal Domein',
    description:
      'AI-projecten in de zorg mislukken op mensen, niet op technologie. Vincent van Munster begeleidt adoptie vanuit 25 jaar welzijnsachtergrond.',
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Interim Verandermanagement AI & Innovatie in het Sociaal Domein',
  description:
    'Interim begeleiding bij AI-adoptie en innovatietrajecten in welzijnsorganisaties, zorginstellingen en gemeenten. Vanuit 25 jaar directie- en managementervaring in het sociaal domein.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://www.weareimpact.nl',
    jobTitle: 'Strategic Innovation Partner & Interim Verandermanager',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'Interim Verandermanagement & AI Innovatie',
  audience: {
    '@type': 'Audience',
    audienceType: 'Welzijnsorganisaties, zorginstellingen, gemeenten, sociaal domein',
  },
  offers: {
    '@type': 'Offer',
    description: 'Gratis strategische verkenning van 30 minuten',
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
      name: 'Waarom mislukken AI-projecten in de zorg en het welzijn zo vaak?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De meeste AI-projecten stranden niet op technologie, maar op mensen. Zorgprofessionals al overbelast zijn en geen draagvlak voelen voor nieuwe systemen. IT-consultants die mooie tools leveren maar de werkvloer niet begrijpen. Het verschil zit in de menselijke adoptie — en dat vereist kennis van de sector, niet alleen van de software.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat maakt Vincent van Munster anders dan een reguliere IT-consultant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vincent komt niet uit de IT — hij komt uit de welzijnshoek. Met 25 jaar directie- en managementervaring in het sociaal domein, waaronder zorg voor mensen met een verstandelijke beperking, spreekt hij de taal van zowel de werkvloer als de boardroom. Hij is ook oprichter van meerdere AI-gestuurde platforms, dus hij begrijpt technologie én de menselijke kant van adoptie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe werkt een interim verandermanagement traject in de praktijk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een traject loopt typisch 3 tot 6 maanden, maximaal 24 uur (3 dagen) per week. We starten met een strategische verkenning, brengen de werkelijke weerstandspunten in kaart en bouwen van binnenuit draagvlak op. Via bewezen methoden zoals LEGO® Serious Play maken we teams AI-ready — niet door te overtuigen met presentaties, maar door ze eigenaar te maken van de verandering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost een interim verandermanagement traject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De investering hangt af van de duur, het aantal dagen per week en de complexiteit van de organisatie. We beginnen altijd met een gratis strategische verkenning van 30 minuten — dan is snel duidelijk of en hoe ik je kan helpen, en wat dat kost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bent u snel inzetbaar als interim manager?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Maximaal 24 uur per week — bewust beperkt, omdat de combinatie van ervaring en AI-tools mij in 16 uur laat doen waar een ander 32 uur voor nodig heeft. Start is doorgaans binnen 2 tot 4 weken mogelijk na het eerste gesprek.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.weareimpact.nl' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Interim Verandermanagement AI',
      item: 'https://www.weareimpact.nl/interim-verandermanagement-ai-sociaal-domein',
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
