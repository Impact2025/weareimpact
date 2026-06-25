'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  articleId: string;
  endpoint?: string;
}

export function ViewTracker({ articleId, endpoint }: ViewTrackerProps) {
  const endpointUrl = endpoint || '/api/kennisbank/view';
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per component mount
    if (tracked.current) return;
    tracked.current = true;

    // Small delay to ensure page is actually being viewed
    const timer = setTimeout(() => {
      const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitorId') : null;

      fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, visitorId }),
      }).catch(() => {
        // Silently fail - view tracking shouldn't break the page
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [articleId]);

  // This component doesn't render anything
  return null;
}
