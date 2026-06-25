import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Vincent van Munster — WeAreImpact',
  description:
    'Neem contact op met Vincent van Munster voor AI-consultancy in het sociaal domein. ✓ Bel 06 14 47 09 77 ✓ Mail vincent@weareimpact.nl ✓ Plan een gratis koffiemoment.',
  alternates: {
    canonical: 'https://weareimpact.nl/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/contact',
    siteName: 'WeAreImpact',
    title: 'Contact | Vincent van Munster',
    description:
      'Bel, mail of plan direct een gratis koffiemoment. Vincent van Munster — Strategic Innovation Partner voor het sociaal domein.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Contact — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | WeAreImpact',
    description:
      'Bel, mail of plan een gratis koffiemoment met Vincent van Munster — AI-consultant sociaal domein.',
    images: ['/og-homepage.webp'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
