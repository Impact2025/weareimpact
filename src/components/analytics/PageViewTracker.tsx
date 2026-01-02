'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate or retrieve a visitor ID
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('wai_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('wai_visitor_id', visitorId);
  }
  return visitorId;
}

// Detect device type
function getDevice(): string {
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

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    // Track duration of previous page
    if (lastPathRef.current && lastPathRef.current !== pathname) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        // Max 1 hour
        fetch('/api/analytics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            pagePath: lastPathRef.current,
            durationSeconds: duration,
          }),
        }).catch(() => {}); // Ignore errors
      }
    }

    // Reset timer for new page
    startTimeRef.current = Date.now();
    lastPathRef.current = pathname;

    // Track new page view
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
    }).catch(() => {}); // Ignore errors silently

    // Track duration on page unload
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        // Use sendBeacon for reliability on page unload
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({
            visitorId,
            pagePath: pathname,
            durationSeconds: duration,
            _method: 'PUT',
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return null;
}

// Export visitor ID getter for other components (like chat)
export { getVisitorId, getDevice };
