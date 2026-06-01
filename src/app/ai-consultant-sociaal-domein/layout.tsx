import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Consultant Sociaal Domein | Vincent van Munster | WeAreImpact',
  description:
    'AI consultant voor het sociaal domein. ✓ 15+ jaar sectorervaring ✓ Concrete implementatie ✓ AVG-proof ✓ LEGO® Serious Play draagvlak. Voor welzijnsorganisaties, gemeenten en sociaal ondernemers.',
  keywords: [
    'AI consultant sociaal domein',
    'AI welzijnsorganisaties',
    'AI implementatie sociaal domein',
    'AI gemeente sociaal domein',
    'kunstmatige intelligentie sociaal werk',
    'AI voor sociaal werkers',
    'AI verslaglegging welzijn',
    'AI consultant welzijn',
    'AI zorg en welzijn',
    'AI administratie welzijn',
    'AI sociaal werk Nederland',
    'AI automatisering sociaal domein',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://www.weareimpact.nl/ai-consultant-sociaal-domein',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.weareimpact.nl/ai-consultant-sociaal-domein',
    siteName: 'WeAreImpact',
    title: 'AI Consultant Sociaal Domein | WeAreImpact',
    description:
      'AI consultant met 15+ jaar sectorervaring. Van AI-scan tot werkende implementatie. AVG-proof en met aandacht voor de menselijke maat. Voor welzijnsorganisaties, gemeenten en sociaal ondernemers.',
    images: [
      {
        url: '/og-ai-consultant-sociaal-domein.png',
        width: 1200,
        height: 630,
        alt: 'AI Consultant Sociaal Domein — Vincent van Munster | WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Consultant Sociaal Domein | WeAreImpact',
    description:
      'AI consultant met 15+ jaar sectorervaring. Van AI-scan tot werkende implementatie. AVG-proof, menselijk, resultaatgericht.',
    images: ['/og-ai-consultant-sociaal-domein.png'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Consulting voor het Sociaal Domein',
  description:
    'AI-implementatie en advies voor welzijnsorganisaties, gemeenten en sociaal ondernemers. Van AI-scan tot werkende oplossing, AVG-proof en met aandacht voor de menselijke maat.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://www.weareimpact.nl',
    jobTitle: 'AI Consultant Sociaal Domein',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'AI Consulting',
  audience: {
    '@type': 'Audience',
    audienceType: 'Welzijnsorganisaties, gemeenten en sociaal ondernemers',
  },
  offers: {
    '@type': 'Offer',
    description: 'Gratis AI-scan en vrijblijvend kennismakingsgesprek',
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
      name: 'Wat is een AI consultant voor het sociaal domein precies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een AI consultant voor het sociaal domein helpt welzijnsorganisaties, gemeenten en sociaal ondernemers bij het zinvol inzetten van kunstmatige intelligentie. Dat gaat verder dan adviseren: een goede AI consultant implementeert ook, borgt AVG-compliance, traint medewerkers en zorgt dat de technologie daadwerkelijk wordt gebruikt. Sectorkennis is daarbij onmisbaar — AI in het sociaal domein raakt altijd aan gevoelige cliëntdata en mensenwerk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AI veilig voor gevoelige cliëntdata in het sociaal domein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, mits het van meet af aan goed wordt ingericht. AI en AVG-compliance gaan samen, maar je moet bewuste keuzes maken in toolselectie, dataopslag en verwerkingsafspraken. Bij elke implementatie lever ik een privacyimpactanalyse op, werk ik uitsluitend met EU-gehoste diensten en zorg ik voor sluitende verwerkersovereenkomsten. Veiligheid is geen optie achteraf, maar het vertrekpunt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe lang duurt een AI-implementatietraject in het sociaal domein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een AI-scan met concrete aanbevelingen levert ik binnen een week op. Een eerste werkende AI-toepassing staat er gemiddeld binnen vier tot zes weken. Meetbaar resultaat — aantoonbaar minder administratietijd voor je medewerkers — zie je doorgaans binnen de eerste maand na implementatie. Een volledig traject voor een middelgrote organisatie loopt over drie tot zes maanden.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost het inhuren van een AI consultant voor het sociaal domein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dat hangt af van de scope. Een AI-scan is een eenmalige investering. Een implementatietraject loopt over meerdere weken en wordt afgestemd op de grootte van je organisatie. We beginnen altijd met een vrijblijvend gesprek — dan weet je snel of en hoe ik je kan helpen, en wat het realistisch kost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe zorg je dat medewerkers in het sociaal domein AI omarmen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Door hen er van meet af aan bij te betrekken. Ik begin nooit met de tool — ik begin met de mensen. Via LEGO® Serious Play-sessies laat ik teams zelf bepalen hoe AI een plek krijgt in hun werk. Niet top-down opgelegd, maar van binnenuit gedragen. Medewerkers die zelf mogen bouwen aan de oplossing, omarmen die ook. In het sociaal domein werkt dat extra krachtig: mensen die iedere dag voor anderen zorgen, verdienen het om zelf regie te houden over hun werk.',
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
      name: 'AI Consultant Sociaal Domein',
      item: 'https://www.weareimpact.nl/ai-consultant-sociaal-domein',
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
