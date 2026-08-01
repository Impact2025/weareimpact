import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo aanvragen — 30 minuten AI in de praktijk',
  description:
    'Vraag een demo aan van 30 minuten. Geen verkooppraatje, wel concreet zien wat AI oplevert voor jouw welzijnsorganisatie, gemeente of zorgteam. Je krijgt binnen enkele uren een datum.',
  keywords: [
    'demo aanvragen AI welzijn',
    'AI demo sociaal domein',
    'AI demo gemeente',
    'kennismaking AI consultant',
    'AI in de praktijk zorg',
    'WeAreImpact',
    'Vincent van Munster',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/demo-aanvraag',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/demo-aanvraag',
    siteName: 'WeAreImpact',
    title: 'Demo aanvragen — 30 minuten AI in de praktijk | WeAreImpact',
    description:
      'Vertel waar je hulp bij nodig hebt. Ik stuur een datum voordat je klaar bent. 30 minuten, zonder poespas.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Demo aanvragen bij WeAreImpact — Vincent van Munster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo aanvragen — 30 minuten AI in de praktijk',
    description:
      'Vertel waar je hulp bij nodig hebt. Ik stuur een datum voordat je klaar bent.',
    images: ['/og-homepage.webp'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://weareimpact.nl' },
    { '@type': 'ListItem', position: 2, name: 'Demo aanvragen', item: 'https://weareimpact.nl/demo-aanvraag' },
  ],
};

export default function DemoAanvraagLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
