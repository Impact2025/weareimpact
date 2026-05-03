import { Hero } from '@/components/sections/Hero';
import { Vision } from '@/components/sections/Vision';
import { ScannerSection } from '@/components/sections/ScannerSection';
import { Pillars } from '@/components/sections/Pillars';
import { Ventures } from '@/components/sections/Ventures';
import { About } from '@/components/sections/About';
import { HomeFAQ } from '@/components/sections/HomeFAQ';
import { Contact } from '@/components/sections/Contact';

export const metadata = {
  title: 'AI Welzijn Expert | Vincent van Munster — WeAreImpact',
  description: 'Innovatie met een sociaal hart. Vincent van Munster helpt welzijnsorganisaties, gemeenten en stichtingen met AI-implementatie die de menselijke maat versterkt.',
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
