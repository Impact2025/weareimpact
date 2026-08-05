import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beste AI-partner voor het sociaal domein kiezen',
  description:
    'Welke partner past bij jouw AI-vraagstuk in zorg, welzijn of gemeente? Vier types partners, de vragen die je moet stellen en wanneer ik zelf niet de juiste ben.',
  keywords: [
    'beste partners voor ai-oplossingen in het sociale domein',
    'AI partner sociaal domein',
    'AI leverancier welzijn',
    'AI bureau gemeente',
    'AI implementatiepartner zorg',
    'AI consultant kiezen',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/ai-partner-sociaal-domein',
  },
  openGraph: {
    type: 'article',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/ai-partner-sociaal-domein',
    siteName: 'WeAreImpact',
    title: 'Beste AI-partner voor het sociaal domein kiezen | WeAreImpact',
    description:
      'Vier types AI-partners, wat ze wel en niet oplossen, en de vragen die je stelt voordat je tekent. Inclusief wanneer ik zelf niet de juiste keuze ben.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beste AI-partner voor het sociaal domein kiezen',
    description:
      'Vier types AI-partners, wat ze wel en niet oplossen, en de vragen die je stelt voordat je tekent.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
