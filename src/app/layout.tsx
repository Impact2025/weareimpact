import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics, PageViewTracker } from '@/components/analytics';
import { CookieConsentProvider } from '@/components/cookie-consent';
import { portfolioSameAs } from '@/lib/seo-kit';

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
    default: 'Procesversneller: AI aan het werk in één dagdeel | Vincent van Munster',
    template: '%s | WeAreImpact',
  },
  description:
    'Vincent van Munster zet AI binnen een dagdeel aan het werk in jouw organisatie. Vaste prijs, een mens controleert alles. Voor sociale en duurzame ondernemers. Ook beschikbaar als interim-kwartiermaker.',
  // LET OP: dit is de canonical van de homepage. Next.js erft `alternates` naar
  // elke route die er zelf geen definieert — die pagina verklaart dan de
  // homepage als origineel en wordt door Google niet geïndexeerd.
  // Elke nieuwe pagina MOET dus een eigen `alternates.canonical` zetten.
  // `npm run seo:check` controleert dit tegen de live site.
  alternates: {
    canonical: 'https://weareimpact.nl',
  },
  keywords: [
    'interim directeur sociaal domein',
    'interim-directeur welzijn',
    'interim directeur-bestuurder',
    'kwartiermaker sociaal domein',
    'interim manager sociaal domein',
    'transitiemanager welzijn',
    'programmamanager digitale transformatie',
    'AI in het sociaal domein',
    'LEGO Serious Play facilitator',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  authors: [{ name: 'Vincent van Munster', url: 'https://weareimpact.nl' }],
  creator: 'Vincent van Munster',
  publisher: 'WeAreImpact',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl',
    siteName: 'WeAreImpact',
    title: 'Procesversneller: AI aan het werk in één dagdeel | Vincent van Munster',
    description:
      'Geen adviesrapport, maar een werkend proces: AI binnen een dagdeel aan het werk in jouw organisatie. 25+ jaar ondernemerservaring. Vaste prijs, gratis intake.',
    images: [
      {
        url: '/og-homepage.webp',
        width: 1200,
        height: 630,
        alt: 'Vincent van Munster — Procesversneller en interim-kwartiermaker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Procesversneller: AI aan het werk in één dagdeel | Vincent van Munster',
    description:
      'AI binnen een dagdeel aan het werk in jouw organisatie. Vaste prijs, gratis intake.',
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
    jobTitle: 'Procesversneller & interim-kwartiermaker',
    description:
      'Procesversneller en interim-kwartiermaker voor sociale en duurzame ondernemers en organisaties in het sociaal domein. 25+ jaar ondernemerservaring, oprichter van WeAreImpact, ex-directeur Stichting De Baan. Gecertificeerd LEGO® Serious Play facilitator.',
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
    foundingDate: '2016',
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
        <link rel="alternate" type="application/rss+xml" title="WeAreImpact Podcast — AI in het sociaal domein" href="/podcast.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WeAreImpact',
              url: 'https://weareimpact.nl',
              founder: { '@type': 'Person', name: 'Vincent van Munster', url: 'https://weareimpact.nl' },
              sameAs: [...portfolioSameAs],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsentProvider>
          <GoogleAnalytics />
          <PageViewTracker />
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
