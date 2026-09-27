import type { Metadata } from 'next';

// Eigen canonical is verplicht: zonder deze layout erft /iris de homepage-canonical
// uit de root-layout en indexeert Google de pagina niet.
export const metadata: Metadata = {
  title: 'Iris, mijn AI-manager voor rust en overzicht',
  description:
    'Maak kennis met Iris: de AI-manager die mijn werk voorbereidt, controleert en leert van resultaten. Niets gaat de deur uit zonder menselijke goedkeuring.',
  alternates: {
    canonical: 'https://weareimpact.nl/iris',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/iris',
    siteName: 'WeAreImpact',
    title: 'Iris, mijn AI-manager voor rust en overzicht | WeAreImpact',
    description:
      'De AI-manager die mijn werk voorbereidt, controleert en leert van resultaten. Met vier-ogen-principe: niets gaat de deur uit zonder goedkeuring.',
  },
};

export default function IrisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
