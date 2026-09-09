'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DigitalTwin } from '@/components/features/DigitalTwin';
import { CookieBanner } from '@/components/cookie-consent';

// Het klantportal draait buiten de marketingsite om: geen vaste navbar die de
// inhoud overlapt, geen footer, geen Iris-chatwidget en geen cookiebanner —
// dat hoort daar niet en overlapt content (zie screenshot-feedback: titel
// viel weg achter de navbar). /admin laten we bewust ongemoeid: dat gedrag
// stond hier al zo en is nu niet gemeld als kapot.
const BARE_PREFIXES = ['/portal'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <DigitalTwin />
      <CookieBanner />
    </>
  );
}
