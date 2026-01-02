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
    default: 'WeAreImpact | Vincent van Munster - AI Welzijn Expert',
    template: '%s | WeAreImpact',
  },
  description:
    'Vincent van Munster is AI Welzijn Expert en sociaal architect. Hij ontwerpt digitale ecosystemen voor menselijk geluk met slimme technologie, privacy en empathie.',
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
    title: 'WeAreImpact | Vincent van Munster - AI Welzijn Expert',
    description:
      'Digitale motoren voor menselijk geluk. AI met een sociaal hart.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WeAreImpact - Innovatie met een sociaal hart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeAreImpact | Vincent van Munster - AI Welzijn Expert',
    description:
      'Digitale motoren voor menselijk geluk. AI met een sociaal hart.',
    images: ['/og-image.jpg'],
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
  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
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
