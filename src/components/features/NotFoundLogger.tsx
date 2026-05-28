'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function NotFoundLogger() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/log-404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
