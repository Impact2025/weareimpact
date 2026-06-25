import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis AI Impact Calculator voor Welzijn & Zorg',
  description:
    'Bereken in 2 minuten hoeveel uur, geld en burn-out AI bespaart voor jouw team. ✓ Gratis ✓ Gebaseerd op Movisie-data ✓ Voor welzijn, zorg & gemeenten. Inclusief persoonlijk adviesgesprek.',
  keywords: [
    'AI impact calculator welzijn',
    'ROI digitale transformatie zorg',
    'tijdwinst AI welzijn',
    'AI besparing gemeente',
    'impact calculator non-profit',
    'AI tijdwinst calculator',
    'kosten AI implementatie welzijn',
    'AI ROI sociaal domein',
    'burn-out reductie AI',
    'AI voordelen welzijnsorganisatie',
    'WeAreImpact',
    'Vincent van Munster',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/impact-calculator',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/impact-calculator',
    siteName: 'WeAreImpact',
    title: 'Gratis AI Impact Calculator voor Welzijn & Zorg | WeAreImpact',
    description:
      'Hoeveel waarde laat jouw organisatie liggen? Bereken in 2 minuten hoeveel uur, budget en burn-out AI kan besparen voor jouw welzijns- of zorgteam.',
    images: [
      {
        url: '/og-impact-calculator.png',
        width: 1200,
        height: 630,
        alt: 'AI Impact Calculator Welzijn & Zorg — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratis AI Impact Calculator voor Welzijn & Zorg',
    description:
      'Hoeveel waarde laat jouw organisatie liggen? Bereken in 2 minuten hoeveel uur en budget AI kan besparen.',
    images: ['/og-impact-calculator.png'],
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Impact Calculator — WeAreImpact',
  description:
    'Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budget AI kan vrijmaken voor jouw welzijns- of zorgteam. Gebaseerd op Movisie-benchmarkdata.',
  url: 'https://weareimpact.nl/impact-calculator',
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
      name: 'Hoe betrouwbaar zijn de uitkomsten van de impact calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De calculator is gebaseerd op Movisie-benchmarkdata en ervaringscijfers uit praktijktrajecten in het sociaal domein. De uitkomsten zijn indicatief en bedoeld om een realistisch beeld te geven van de potentiële tijdwinst en kostenbesparing — niet als gegarandeerde resultaten.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is de impact calculator gratis te gebruiken?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, de basis impact calculator is volledig gratis. Het volledige dashboard met gedetailleerde analyse ontgrendel je door je e-mailadres achter te laten.',
      },
    },
    {
      '@type': 'Question',
      name: 'Voor welke organisaties is de impact calculator geschikt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De calculator is primair ontwikkeld voor welzijnsorganisaties, zorginstellingen en gemeenten met 5 tot 250+ medewerkers. De berekeningen zijn afgestemd op de werkprocessen en tijdsbesteding die typisch zijn in het sociaal domein.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Impact Calculator', item: 'https://weareimpact.nl/impact-calculator' },
  ],
};

export default function ImpactCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
