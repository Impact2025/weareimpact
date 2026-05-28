import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis AI-Proof Checklist 2026 | 15 Stappen voor Sociale Organisaties | WeAreImpact',
  description:
    'Download gratis: 15 praktische stappen om jouw organisatie AI-Proof te maken vóór de EU AI Act deadline. ✓ Voor zorg, welzijn & non-profit ✓ Direct toepasbaar ✓ Inclusief AI-readiness gesprek.',
  keywords: [
    'AI-Proof checklist',
    'AI checklist 2026',
    'EU AI Act deadline',
    'AI readiness checklist',
    'AI compliance sociale organisaties',
    'zorg AI checklist',
    'welzijn AI strategie',
    'non-profit AI implementatie',
    'AI governance checklist',
    'AI readiness assessment',
    'gratis AI checklist',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://www.weareimpact.nl/ai-proof-checklist',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://www.weareimpact.nl/ai-proof-checklist',
    siteName: 'WeAreImpact',
    title: 'Gratis AI-Proof Checklist 2026 | 15 Stappen voor Sociale Organisaties',
    description:
      'Is jouw organisatie AI-Proof in 2026? Download de gratis checklist met 15 praktische stappen. Voor zorg, welzijn en non-profit. Klaar vóór de EU AI Act deadline.',
    images: [
      {
        url: '/Vincent van Munster WeAreImpact.png',
        width: 1200,
        height: 630,
        alt: 'AI-Proof Checklist 2026 — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratis AI-Proof Checklist 2026 | Sociale Organisaties',
    description:
      'Is jouw organisatie AI-Proof in 2026? Download de gratis checklist met 15 praktische stappen voor zorg, welzijn en non-profit.',
    images: ['/Vincent van Munster WeAreImpact.png'],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI-Proof Checklist 2026',
  description:
    '15 praktische stappen om jouw organisatie klaar te maken voor de EU AI Act. Voor zorg, welzijn en non-profit organisaties.',
  url: 'https://www.weareimpact.nl/ai-proof-checklist',
  author: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://www.weareimpact.nl',
  },
  mainContentOfPage: {
    '@type': 'WebPageElement',
    cssSelector: 'main',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wat is de EU AI Act en wat betekent dat voor mijn organisatie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De EU AI Act is Europese wetgeving die per augustus 2026 van kracht is en regels stelt voor het gebruik van AI-systemen. Sociale organisaties die AI gebruiken voor beslissingen over mensen (uitkeringen, zorg, re-integratie) moeten voldoen aan transparantie- en verantwoordingseisen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is de AI-Proof Checklist echt gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, de checklist is volledig gratis te downloaden. Je ontvangt 15 concrete stappen per e-mail, zonder verplichtingen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Voor welke organisaties is de checklist bedoeld?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De checklist is specifiek ontwikkeld voor sociale organisaties: welzijnsorganisaties, zorginstellingen, gemeenten, stichtingen en non-profits. De stappen zijn direct toepasbaar zonder technische achtergrond.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'AI-Proof Checklist', item: 'https://www.weareimpact.nl/ai-proof-checklist' },
  ],
};

export default function AIProofChecklistLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
