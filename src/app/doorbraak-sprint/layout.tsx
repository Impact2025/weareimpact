import type { Metadata } from 'next';

// Eigen canonical is verplicht: zonder deze layout erft /doorbraak-sprint de
// homepage-canonical uit de root-layout en indexeert Google de pagina niet.
export const metadata: Metadata = {
  title: 'Doorbraak Sprint: 5 tot 10 uur per week terug',
  description:
    'Eén terugkerend tijdlek, één dagdeel op locatie, structureel 5 tot 10 uur per week terug. Vaste prijs €1.750 excl. btw, inclusief 14 dagen nazorg.',
  alternates: {
    canonical: 'https://weareimpact.nl/doorbraak-sprint',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/doorbraak-sprint',
    siteName: 'WeAreImpact',
    title: 'Doorbraak Sprint: één werkproces live in één dagdeel | WeAreImpact',
    description:
      'Structureel 5 tot 10 uur per week terug. Vaste prijs €1.750 excl. btw, inclusief menselijke controle en 14 dagen nazorg.',
  },
};

export default function DoorbraakSprintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
