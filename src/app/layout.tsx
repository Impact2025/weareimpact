import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DigitalTwin } from '@/components/features/DigitalTwin';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics, PageViewTracker } from '@/components/analytics';
import { CookieConsentProvider, CookieBanner } from '@/components/cookie-consent';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://weareimpact.nl'),
  title: {
    default: 'AI Consultant Sociaal Domein | Vincent van Munster — WeAreImpact',
    template: '%s | WeAreImpact',
  },
  description:
    'AI consultant voor welzijnsorganisaties, gemeenten en sociaal ondernemers. ✓ Geen rapport en wegwezen ✓ 15+ jaar sociaal domein ✓ LEGO® Serious Play facilitator. Gratis kennismakingsgesprek.',
  alternates: {
    canonical: 'https://weareimpact.nl',
  },
  keywords: [
    'AI consultant sociaal domein',
    'AI consulent sociaal domein',
    'AI consultant welzijn',
    'AI consulent welzijn',
    'AI consultant gemeente',
    'AI consulent gemeente',
    'digitale transformatie sociaal domein',
    'AI implementatie welzijn',
    'AI strategie gemeente',
    'LEGO Serious Play facilitator',
    'Vincent van Munster',
    'WeAreImpact',
    'AI non-profit',
    'AI zorg implementatie',
    'sociaal ondernemer AI',
  ],
  authors: [{ name: 'Vincent van Munster', url: 'https://weareimpact.nl' }],
  creator: 'Vincent van Munster',
  publisher: 'WeAreImpact',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl',
    siteName: 'WeAreImpact',
    title: 'AI Consultant Sociaal Domein | Vincent van Munster — WeAreImpact',
    description:
      'AI consultant voor welzijnsorganisaties, gemeenten en sociaal ondernemers. 15+ jaar in het sociaal domein. Geen rapport en wegwezen — iemand die naast je staat totdat het werkt.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Vincent van Munster — AI Consultant WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Consultant Sociaal Domein | Vincent van Munster — WeAreImpact',
    description:
      'AI consultant voor welzijnsorganisaties, gemeenten en sociaal ondernemers. 15+ jaar in het sociaal domein. Gratis kennismakingsgesprek.',
    images: ['/og-homepage.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Vincent van Munster',
    jobTitle: 'AI Consultant & Digitale Transformatie Specialist',
    description:
      'AI consultant voor welzijnsorganisaties, gemeenten en sociaal ondernemers. 15+ jaar ervaring in het sociaal domein. Gecertificeerd LEGO® Serious Play facilitator.',
    url: 'https://weareimpact.nl',
    image: 'https://weareimpact.nl/vincent-van-munster.webp',
    sameAs: [
      'https://www.linkedin.com/in/vincent-van-m%C3%BCnster/',
      'https://weareimpact.nl',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'WeAreImpact',
      url: 'https://weareimpact.nl',
    },
    foundingDate: '2014',
    knowsAbout: [
      'AI Strategie',
      'Digitale Transformatie',
      'Change Management',
      'AI Welzijn',
      'AI Gemeente',
      'LEGO Serious Play',
      'Sociaal Domein',
      'Non-profit Digitalisering',
      'AI Governance',
      'EU AI Act',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Diensten WeAreImpact',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Strategie Consulting' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Change Management Digitale Transformatie' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LEGO® Serious Play Facilitatie' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Readiness Assessment' } },
      ],
    },
  };

  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="WeAreImpact — AI in het Sociaal Domein" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsentProvider>
          <GoogleAnalytics />
          <PageViewTracker />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <DigitalTwin />
          <Toaster />
          <CookieBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
