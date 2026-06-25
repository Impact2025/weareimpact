import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vincent van Munster | Interim Manager & AI Consultant Sociaal Domein',
  description:
    'Vincent van Munster — Strategic Innovation Partner en interim manager met 25+ jaar directie-ervaring in het sociaal domein. Beschikbaar als interim projectleider, kwartiermaker innovatie & AI of verandermanager. 16–24 uur/week · Regio Amsterdam / Haarlem / Leiden · €125–€140/u.',
  keywords: [
    'Vincent van Munster',
    'Vincent van Münster',
    'WeAreImpact Vincent',
    'interim manager sociaal domein',
    'Strategic Innovation Partner',
    'interim directeur welzijn',
    'AI consultant sociaal domein',
    'kwartiermaker innovatie AI',
    'verandermanager digitale transformatie',
    'interim manager Amsterdam',
    'LEGO Serious Play facilitator',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/vincent-van-munster',
  },
  openGraph: {
    type: 'profile',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/vincent-van-munster',
    siteName: 'WeAreImpact',
    title: 'Vincent van Munster | Interim Manager & AI Consultant',
    description:
      'Strategic Innovation Partner met 25+ jaar ervaring in het sociaal domein. Beschikbaar als interim manager, kwartiermaker innovatie & AI of verandermanager. 16–24 uur/week · Amsterdam / Haarlem / Leiden.',
    firstName: 'Vincent',
    lastName: 'van Munster',
    username: 'vincentvanmunster',
    gender: 'male',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vincent van Munster | Interim Manager & AI Consultant',
    description:
      'Strategic Innovation Partner met 25+ jaar ervaring in het sociaal domein. 16–24 uur/week · Regio Amsterdam / Haarlem / Leiden.',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://weareimpact.nl/vincent-van-munster#person',
  name: 'Vincent van Munster',
  alternateName: 'Vincent van Münster',
  givenName: 'Vincent',
  familyName: 'van Munster',
  jobTitle: [
    'Strategic Innovation Partner',
    'Interim Manager',
    'AI Consultant',
    'Kwartiermaker Innovatie & AI',
  ],
  description:
    'Vincent van Munster is een Strategic Innovation Partner en interim manager met 25+ jaar directie- en managementervaring in het sociaal domein. Oprichter van WeAreImpact. Gecertificeerd LEGO® Serious Play facilitator. Beschikbaar als interim projectleider welzijn & sociaal domein, kwartiermaker innovatie & AI of verandermanager digitale transformatie.',
  url: 'https://weareimpact.nl/vincent-van-munster',
  image: {
    '@type': 'ImageObject',
    url: 'https://weareimpact.nl/vincent-van-munster.webp',
    width: 400,
    height: 400,
  },
  birthDate: '1977-03-25',
  birthPlace: {
    '@type': 'Place',
    name: 'Nieuw-Vennep',
    addressCountry: 'NL',
  },
  nationality: {
    '@type': 'Country',
    name: 'Nederland',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hoofddorp',
    addressRegion: 'Noord-Holland',
    addressCountry: 'NL',
  },
  telephone: '+31614470977',
  email: 'v.munster@weareimpact.nl',
  sameAs: [
    'https://www.linkedin.com/in/vincent-van-m%C3%BCnster/',
    'https://weareimpact.nl',
    'https://bijeen.app',
    'https://brickme.nl',
  ],
  worksFor: {
    '@type': 'Organization',
    '@id': 'https://weareimpact.nl/#organization',
    name: 'WeAreImpact',
    url: 'https://weareimpact.nl',
  },
  knowsAbout: [
    'Sociaal domein',
    'AI-strategie',
    'Verandermanagement',
    'Interim management',
    'Welzijnsorganisaties',
    'Gemeenten',
    'LEGO Serious Play',
    'Digitale transformatie',
    'Subsidiemanagement',
    'Fondsenwerving',
    'Kunstmatige intelligentie',
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Facilitator / Coach LEGO® Serious Play',
      credentialCategory: 'Certificaat',
      recognizedBy: { '@type': 'Organization', name: 'LEGO® Serious Play' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Sociaal Ondernemen',
      educationalLevel: 'Postdoctoraal',
      recognizedBy: { '@type': 'Organization', name: 'Nyenrode Business Universiteit' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'International Management',
      recognizedBy: { '@type': 'Organization', name: 'HES Amsterdam' },
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Interim diensten Vincent van Munster',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Interim Projectleider Welzijn & Sociaal Domein',
          provider: { '@id': 'https://weareimpact.nl/vincent-van-munster#person' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Kwartiermaker Innovatie & AI',
          provider: { '@id': 'https://weareimpact.nl/vincent-van-munster#person' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Verandermanager Digitale Transformatie',
          provider: { '@id': 'https://weareimpact.nl/vincent-van-munster#person' },
        },
      },
    ],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Vincent van Munster', item: 'https://weareimpact.nl/vincent-van-munster' },
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
