import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DigitalTwin } from '@/components/features/DigitalTwin';
import { VoiceInterface } from '@/components/features/VoiceInterface';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@/components/analytics';

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
    default: 'Strategic Innovation Partner & AI Welzijn Expert | Vincent van Munster',
    template: '%s | WeAreImpact',
  },
  description:
    'Zoek je innovatie die écht werkt? Als strateeg en sociaal ondernemer maak ik organisaties in zorg & welzijn AI-ready. Van post-it tot prototype. Start hier de impact-motor.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'AI',
    'Welzijn',
    'Technologie',
    'Vincent van Munster',
    'WeAreImpact',
    'LEGO Serious Play',
    'Sociale innovatie',
    'Vrijwilligerswerk',
    'Digital transformation',
  ],
  authors: [{ name: 'Vincent van Munster' }],
  creator: 'WeAreImpact',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl',
    siteName: 'WeAreImpact',
    title: 'Strategic Innovation Partner & AI Welzijn Expert | Vincent van Munster',
    description:
      'Zoek je innovatie die écht werkt? Als strateeg en sociaal ondernemer maak ik organisaties in zorg & welzijn AI-ready. Van post-it tot prototype. Start hier de impact-motor.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strategic Innovation Partner & AI Welzijn Expert | Vincent van Munster',
    description:
      'Zoek je innovatie die écht werkt? Als strateeg en sociaal ondernemer maak ik organisaties in zorg & welzijn AI-ready. Van post-it tot prototype. Start hier de impact-motor.',
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
    jobTitle: 'Strategic Innovation Partner',
    description:
      'Als strateeg en sociaal ondernemer maak ik organisaties in zorg & welzijn AI-ready',
    url: 'https://weareimpact.nl',
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
      'Social Entrepreneurship',
      'Artificial Intelligence',
      'AI Welzijn',
      'LEGO Serious Play',
      'Strategic Innovation',
      'Digital Transformation',
      'Social Innovation',
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Saxion Hogeschool',
    },
  };

  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <DigitalTwin />
        <VoiceInterface />
        <Toaster />
      </body>
    </html>
  );
}
