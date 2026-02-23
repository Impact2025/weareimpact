import { Suspense } from 'react';
import { Hero } from '@/components/sections/Hero';
import { Vision } from '@/components/sections/Vision';
import { ScannerSection } from '@/components/sections/ScannerSection';
import { Pillars } from '@/components/sections/Pillars';
import { Ventures } from '@/components/sections/Ventures';
import { About } from '@/components/sections/About';
import { HomeFAQ } from '@/components/sections/HomeFAQ';
import { Contact } from '@/components/sections/Contact';
import { KennisbankPreview } from '@/components/sections/KennisbankPreview';
import { KennisbankSkeleton } from '@/components/sections/KennisbankSkeleton';
import { HomePageJsonLd } from '@/components/seo/JsonLd';

export default function Home() {
  return (
    <>
      <HomePageJsonLd />
      <Hero />
      <Vision />
      <ScannerSection />
      <Suspense fallback={<KennisbankSkeleton />}>
        <KennisbankPreview />
      </Suspense>
      <Pillars />
      <Ventures />
      <About />
      <HomeFAQ />
      <Contact />
    </>
  );
}
