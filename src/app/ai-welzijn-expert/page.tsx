import { Hero } from '@/components/sections/Hero';
import { Vision } from '@/components/sections/Vision';
import { ScannerSection } from '@/components/sections/ScannerSection';
import { Pillars } from '@/components/sections/Pillars';
import { Ventures } from '@/components/sections/Ventures';
import { About } from '@/components/sections/About';
import { HomeFAQ } from '@/components/sections/HomeFAQ';
import { Contact } from '@/components/sections/Contact';

export const metadata = {
  title: 'AI Welzijn Expert | AI-implementatie voor Welzijn & Gemeenten | WeAreImpact',
  description:
    'AI-implementatie met een sociaal hart. ✓ Welzijnsorganisaties ✓ Gemeenten ✓ Non-profit. Vincent van Munster: 15+ jaar sociaal domein, gecertificeerd LEGO® Serious Play facilitator.',
  keywords: [
    'AI welzijn expert',
    'AI implementatie welzijnsorganisatie',
    'AI gemeente sociaal domein',
    'AI non-profit organisatie',
    'digitalisering welzijn',
    'AI zorg implementatie',
    'mensgerichte AI',
    'AI sociaal werk',
    'AI consultant welzijn',
    'Vincent van Munster',
    'WeAreImpact',
  ],
  alternates: {
    canonical: 'https://weareimpact.nl/ai-welzijn-expert',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://weareimpact.nl/ai-welzijn-expert',
    siteName: 'WeAreImpact',
    title: 'AI Welzijn Expert | AI-implementatie voor Welzijn & Gemeenten',
    description:
      'AI-implementatie met een sociaal hart. Voor welzijnsorganisaties, gemeenten en non-profit die AI willen inzetten zonder de menselijke maat te verliezen.',
    images: [
      {
        url: '/og-ai-welzijn-expert.png',
        width: 1200,
        height: 630,
        alt: 'AI Welzijn Expert Vincent van Munster — WeAreImpact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Welzijn Expert | AI-implementatie voor Welzijn & Gemeenten',
    description:
      'AI-implementatie met een sociaal hart. Voor welzijnsorganisaties en gemeenten die AI willen inzetten zonder de menselijke maat te verliezen.',
    images: ['/og-ai-welzijn-expert.png'],
  },
};

export default function AIWelzijnExpert() {
  return (
    <>
      <Hero />
      <Vision />
      <ScannerSection />
      <Pillars />
      <Ventures />
      <About />
      <HomeFAQ />
      <Contact />
    </>
  );
}
