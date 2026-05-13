import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impact Calculator — Hoeveel waarde laat jouw organisatie liggen? | WeAreImpact',
  description:
    'Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budget AI kan vrijmaken voor jouw welzijnsteam. Gratis impactanalyse met sectorvergelijking op basis van Movisie-data.',
  openGraph: {
    title: 'Impact Calculator — Hoeveel waarde laat jouw organisatie liggen?',
    description:
      'Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budget AI kan vrijmaken voor jouw welzijnsteam.',
    url: 'https://www.weareimpact.nl/impact-calculator',
    siteName: 'WeAreImpact',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impact Calculator — Hoeveel waarde laat jouw organisatie liggen?',
    description:
      'Bereken in 2 minuten hoeveel uren, cliëntgesprekken en budget AI kan vrijmaken voor jouw welzijnsteam.',
  },
};

export default function ImpactCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
