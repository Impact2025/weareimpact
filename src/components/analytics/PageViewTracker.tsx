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
  const lastPathRef = useRef<string>('');
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    if (lastPathRef.current && lastPathRef.current !== pathname) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        fetch('/api/analytics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId, pagePath: lastPathRef.current, durationSeconds: duration }),
        }).catch(() => {});
      }
    }

    startTimeRef.current = Date.now();
    lastPathRef.current = pathname;

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        pagePath: pathname,
        pageTitle: document.title,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        device: getDevice(),
      }),
    }).catch(() => {});

    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({ visitorId, pagePath: pathname, durationSeconds: duration, _method: 'PUT' }),
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname, consent]);

  return null;
}
