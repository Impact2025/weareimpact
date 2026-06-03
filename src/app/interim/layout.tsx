import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interim Profiel Vincent van Munster | Strategic Innovation Partner | WeAreImpact',
  description:
    'Interim Strategic Innovation Partner beschikbaar · 16–24 uur/week · Regio Amsterdam / Haarlem / Leiden. 25+ jaar directie & AI-expertise in het sociaal domein. €125–€140/u.',
  keywords: [
    'interim manager sociaal domein',
    'interim directeur welzijn',
    'interim strategic innovation partner',
    'interim verandermanager AI',
    'interim projectleider welzijn',
    'kwartiermaker innovatie',
    'interim manager Amsterdam',
    'interim AI consultant',
    'Vincent van Munster interim',
    'WeAreImpact interim',
  ],
  alternates: {
    canonical: 'https://www.weareimpact.nl/interim',
  },
  openGraph: {
    type: 'profile',
    locale: 'nl_NL',
    url: 'https://www.weareimpact.nl/interim',
    siteName: 'WeAreImpact',
    title: 'Interim Profiel Vincent van Munster | Strategic Innovation Partner',
    description:
      'Beschikbaar als Interim Projectleider Welzijn, Kwartiermaker Innovatie & AI of Verandermanager. 16–24 uur/week, regio Amsterdam / Haarlem / Leiden.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interim Profiel Vincent van Munster | Strategic Innovation Partner',
    description:
      'Beschikbaar als interim manager voor welzijn & sociaal domein. 16–24 uur/week, regio Amsterdam / Haarlem / Leiden.',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Vincent van Munster',
  jobTitle: 'Strategic Innovation Partner & Interim Manager',
  description:
    'Interim Strategic Innovation Partner met 25+ jaar directie- en managementervaring in het sociaal domein. Beschikbaar voor 16–24 uur per week in de regio Amsterdam / Haarlem / Leiden.',
  url: 'https://www.weareimpact.nl/interim',
  image: 'https://www.weareimpact.nl/vincent-van-munster.png',
  sameAs: [
    'https://www.linkedin.com/in/vincent-van-m%C3%BCnster/',
    'https://www.weareimpact.nl',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'WeAreImpact',
    url: 'https://www.weareimpact.nl',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Interim diensten',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Interim Projectleider Welzijn & Sociaal Domein' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kwartiermaker Innovatie & AI' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Verandermanager Digitale Transformatie' } },
    ],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Interim Profiel', item: 'https://www.weareimpact.nl/interim' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
