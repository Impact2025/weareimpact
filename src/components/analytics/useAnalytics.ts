'use client';

import { useCallback, useEffect, useRef } from 'react';
import { trackEvents, event } from './GoogleAnalytics';

// Hook for tracking scroll depth
export function useScrollDepth(thresholds = [25, 50, 75, 90, 100]) {
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercentage >= threshold && !trackedRef.current.has(threshold)) {
          trackedRef.current.add(threshold);
          trackEvents.scrollDepth(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds]);
}

// Hook for tracking time on page
export function useTimeOnPage(slug: string) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 10) { // Only track if more than 10 seconds
        trackEvents.blogRead(slug, timeSpent);
      }
    };
  }, [slug]);
}

// Hook for tracking external link clicks
export function useExternalLinkTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && link.hostname !== window.location.hostname) {
        trackEvents.externalLinkClick(link.href);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}

// Hook for tracking CTA clicks
export function useCTATracking(ctaName: string, location: string) {
  return useCallback(() => {
    trackEvents.ctaClick(ctaName, location);
  }, [ctaName, location]);
}

// Hook for form tracking
export function useFormTracking(formName: string) {
  const hasStarted = useRef(false);

  const trackFormStart = useCallback(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      event({
        action: 'form_start',
        category: 'Form',
        label: formName,
      });
    }
  }, [formName]);

  const trackFormSubmit = useCallback((success: boolean) => {
    event({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'Form',
      label: formName,
    });
  }, [formName]);

  const trackFormField = useCallback((fieldName: string) => {
    event({
      action: 'form_field_interaction',
      category: 'Form',
      label: `${formName}_${fieldName}`,
    });
  }, [formName]);

  return { trackFormStart, trackFormSubmit, trackFormField };
}

// Hook for video tracking
export function useVideoTracking(videoId: string) {
  const hasPlayed = useRef(false);
  const hasCompleted = useRef(false);

  const trackPlay = useCallback(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true;
      trackEvents.videoPlay(videoId);
    }
  }, [videoId]);

  const trackComplete = useCallback(() => {
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      trackEvents.videoComplete(videoId);
    }
  }, [videoId]);

  const trackProgress = useCallback((percentage: number) => {
    event({
      action: 'video_progress',
      category: 'Video',
      label: videoId,
      value: percentage,
    });
  }, [videoId]);

  return { trackPlay, trackComplete, trackProgress };
}

// Export all tracking functions for direct use
export { trackEvents, event, trackConversion } from './GoogleAnalytics';
