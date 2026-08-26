import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Leadership Lab — Materialen & Prompt-templates | WeAreImpact',
  description:
    'De prompt-templates en cases van het AI Leadership Lab (WeAreImpact × Grantmaster, CIC Rotterdam). Van LEGO-bouwwerk naar je eigen AI-agent.',
  alternates: {
    canonical: 'https://weareimpact.nl/lab',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/lab',
    siteName: 'WeAreImpact',
    title: 'AI Leadership Lab — Materialen & Prompt-templates',
    description:
      'De prompt-templates en cases van het AI Leadership Lab. Van LEGO-bouwwerk naar je eigen AI-agent.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'AI Leadership Lab — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Leadership Lab — Materialen & Prompt-templates',
    description: 'De prompt-templates en cases van het AI Leadership Lab.',
    images: ['/og-homepage.webp'],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'AI Leadership Lab — Materialen',
  description:
    'Prompt-templates en cases uit het AI Leadership Lab van WeAreImpact en Grantmaster.',
  url: 'https://weareimpact.nl/lab',
  author: {
    '@type': 'Person',
    name: 'Vincent van Munster',
    url: 'https://weareimpact.nl',
  },
  mainContentOfPage: {
    '@type': 'WebPageElement',
    cssSelector: 'main',
  },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      {children}
    </>
  );
}
