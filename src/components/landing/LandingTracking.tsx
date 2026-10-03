'use client';

import { useEffect, useRef } from 'react';
import { event } from '@/components/analytics';

/**
 * Meet hoe ver bezoekers op een AI-projectmanager-pagina scrollen en of ze
 * de pagina echt lezen (>= 30 s zichtbaar). Alles loopt via de bestaande
 * GA4-laag, dus alleen na cookie-akkoord.
 */
export function LandingTracking({ slug }: { slug: string }) {
  const seen = useRef<Set<number>>(new Set());

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      for (const t of [25, 50, 75, 100]) {
        if (pct >= t && !seen.current.has(t)) {
          seen.current.add(t);
          event({ action: 'ai_pm_scroll', category: 'Engagement', label: slug, value: t });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const engaged = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        event({ action: 'ai_pm_engaged_30s', category: 'Engagement', label: slug });
      }
    }, 30000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(engaged);
    };
  }, [slug]);

  return null;
}
