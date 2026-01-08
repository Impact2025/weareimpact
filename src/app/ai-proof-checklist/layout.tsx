import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Proof Checklist | 15 Praktische Stappen voor Sociale Organisaties',
  description: 'Download de gratis AI-Proof Checklist met 15 praktische stappen om je organisatie klaar te maken voor de EU AI Act. Voor zorg, welzijn en non-profit.',
  keywords: [
    'AI-Proof',
    'AI checklist',
    'EU AI Act',
    'sociale organisaties',
    'zorg AI',
    'welzijn AI',
    'AI strategie',
    'AI compliance',
    'non-profit AI',
    'AI readiness',
  ],
  openGraph: {
    title: 'Is jouw organisatie AI-Proof in 2026?',
    description: 'Download de gratis checklist met 15 praktische stappen. 50% van organisaties heeft geen AI-strategie. Zorg dat jij voorbereid bent.',
    url: 'https://weareimpact.nl/ai-proof-checklist',
    type: 'website',
    images: [
      {
        url: '/og-ai-proof-checklist.png',
        width: 1200,
        height: 630,
        alt: 'AI-Proof Checklist - WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is jouw organisatie AI-Proof in 2026?',
    description: 'Download de gratis checklist met 15 praktische stappen om je organisatie klaar te maken voor de AI-toekomst.',
  },
  alternates: {
    canonical: 'https://weareimpact.nl/ai-proof-checklist',
  },
};

export default function AIProofChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
