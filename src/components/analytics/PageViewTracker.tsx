'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/components/cookie-consent/CookieConsentProvider';

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  // Use sessionStorage when no consent — cleared when browser closes
  const consent = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)?.[1];

  if (consent === 'accepted') {
    let id = localStorage.getItem('wai_visitor_id');
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('wai_visitor_id', id);
    }
    return id;
  }

  // Session-only ID — not persisted across visits
  let id = sessionStorage.getItem('wai_session_id');
  if (!id) {
    id = 's_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('wai_session_id', id);
  }
  return id;
}

export function getDevice(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function PageViewTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const sentRef = useRef<boolean>(false);
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    startTimeRef.current = Date.now();
    sentRef.current = false;

    // Eén gebundelde write per paginabezoek (pageview + duration samen),
    // pas verstuurd bij vertrek. Voorkomt de directe DB-call bij elke page
    // load die eerder de Neon-compute continu wakker hield (nooit scale-to-zero).
    const send = () => {
      if (sentRef.current) return;
      sentRef.current = true;
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      navigator.sendBeacon(
        '/api/analytics',
        JSON.stringify({
          visitorId,
          pagePath: pathname,
          pageTitle: document.title,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          device: getDevice(),
          durationSeconds: duration > 0 && duration < 3600 ? duration : null,
        }),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') send();
    };

    window.addEventListener('pagehide', send);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      send();
      window.removeEventListener('pagehide', send);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, consent]);

  return null;
}
