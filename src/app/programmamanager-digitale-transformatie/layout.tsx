import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programmamanager Digitale Transformatie | Vincent van Munster — WeAreImpact',
  description:
    'Digitale transformatie die écht landt. Vincent van Munster begeleidt programmamanagers van strategie tot werkende AI-toepassingen en duurzaam draagvlak in gemeenten, zorg en welzijn.',
  alternates: {
    canonical: '/programmamanager-digitale-transformatie',
  },
  keywords: [
    'programmamanager digitale transformatie',
    'digitale transformatie gemeente',
    'digitale transformatie welzijn',
    'verandermanagement AI',
    'AI implementatie sociaal domein',
    'roadmap digitale transformatie',
    'LEGO Serious Play draagvlak',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/programmamanager-digitale-transformatie',
    siteName: 'WeAreImpact',
    title: 'Programmamanager Digitale Transformatie | Vincent van Munster — WeAreImpact',
    description:
      'Digitale transformatie die écht landt. Van strategie tot werkende AI-toepassingen en duurzaam draagvlak. Voor programmamanagers in gemeenten, zorg en welzijn.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programmamanager Digitale Transformatie | Vincent van Munster',
    description:
      'Digitale transformatie die écht landt. Van strategie tot werkende AI-toepassingen en duurzaam draagvlak.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
