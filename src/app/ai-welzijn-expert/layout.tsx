import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Welzijn Expert | Vincent van Munster - WeAreImpact',
  description:
    'AI expert voor de welzijnssector. ✓ 15+ jaar ervaring in het sociaal domein ✓ Praktische AI-implementatie ✓ LEGO® Serious Play ✓ AVG-proof. Voor organisaties die AI willen laten werken voor mens en organisatie.',
  keywords: [
    'AI welzijn expert',
    'AI welzijnsorganisaties',
    'kunstmatige intelligentie welzijn',
    'AI sociaal werk',
    'AI zorg en welzijn',
    'AI implementatie welzijn',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: { canonical: 'https://weareimpact.nl/ai-welzijn-expert' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/ai-welzijn-expert',
    siteName: 'WeAreImpact',
    title: 'AI Welzijn Expert | WeAreImpact',
    description: 'AI expert met 15+ jaar ervaring in het sociaal domein. Van AI-scan tot werkende implementatie, altijd met oog voor de menselijke maat.',
    images: [{ url: '/og-ai-welzijn-expert.webp', width: 1200, height: 630, alt: 'AI Welzijn Expert — Vincent van Munster | WeAreImpact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Welzijn Expert | WeAreImpact',
    description: 'AI expert met 15+ jaar ervaring in het sociaal domein. Praktisch, AVG-proof, mensgericht.',
    images: ['/og-ai-welzijn-expert.webp'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Welzijn Expert',
  description: 'AI-implementatie en advies voor de welzijnssector. Praktisch, AVG-proof en met aandacht voor de menselijke maat.',
  provider: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl/ai-welzijn-expert',
    jobTitle: 'AI Welzijn Expert',
    sameAs: 'https://www.linkedin.com/in/vincentvanmunster',
  },
  areaServed: { '@type': 'Country', name: 'Netherlands' },
  serviceType: 'AI Consulting',
  audience: { '@type': 'Audience', audienceType: 'Welzijnsorganisaties en zorginstellingen' },
  offers: { '@type': 'Offer', description: 'Vrijblijvend kennismakingsgesprek', price: '0', priceCurrency: 'EUR' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'AI Welzijn Expert', item: 'https://weareimpact.nl/ai-welzijn-expert' },
  ],
};

export default function AiWelzijnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
