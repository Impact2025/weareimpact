'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = 'G-Q8Q67SKTJV';

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Initialize gtag
export const initGA = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: false, // We handle this manually
    });
  }
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Pre-defined events for WeAreImpact
export const trackEvents = {
  // Contact & Lead Generation
  contactFormSubmit: (source: string) => event({
    action: 'form_submit',
    category: 'Contact',
    label: source,
  }),

  contactFormStart: () => event({
    action: 'form_start',
    category: 'Contact',
  }),

  newsletterSubscribe: (source: string) => event({
    action: 'subscribe',
    category: 'Newsletter',
    label: source,
  }),

  // AI Tools Usage
  aiScanStart: () => event({
    action: 'scan_start',
    category: 'AI_Scan',
  }),

  aiScanComplete: (score: number) => event({
    action: 'scan_complete',
    category: 'AI_Scan',
    value: score,
  }),

  chatbotOpen: () => event({
    action: 'chatbot_open',
    category: 'Iris_Assistant',
  }),

  chatbotMessage: () => event({
    action: 'message_sent',
    category: 'Iris_Assistant',
  }),

  kennisbankChatOpen: (article: string) => event({
    action: 'chat_open',
    category: 'Kennisbank_Chat',
    label: article,
  }),

  // Content Engagement
  blogRead: (slug: string, readTime: number) => event({
    action: 'blog_read',
    category: 'Content',
    label: slug,
    value: readTime,
  }),

  kennisbankRead: (slug: string) => event({
    action: 'kennisbank_read',
    category: 'Content',
    label: slug,
  }),

  downloadResource: (resource: string) => event({
    action: 'download',
    category: 'Resources',
    label: resource,
  }),

  // Navigation & Engagement
  ctaClick: (ctaName: string, location: string) => event({
    action: 'cta_click',
    category: 'CTA',
    label: `${ctaName}_${location}`,
  }),

  externalLinkClick: (url: string) => event({
    action: 'external_link',
    category: 'Outbound',
    label: url,
  }),

  socialShare: (platform: string, content: string) => event({
    action: 'share',
    category: 'Social',
    label: `${platform}_${content}`,
  }),

  // Scroll Depth
  scrollDepth: (percentage: number) => event({
    action: 'scroll_depth',
    category: 'Engagement',
    value: percentage,
  }),

  // Video/Media
  videoPlay: (videoId: string) => event({
    action: 'video_play',
    category: 'Video',
    label: videoId,
  }),

  videoComplete: (videoId: string) => event({
    action: 'video_complete',
    category: 'Video',
    label: videoId,
  }),

  // Booking/Calendar
  bookingStart: (type: string) => event({
    action: 'booking_start',
    category: 'Booking',
    label: type,
  }),

  bookingComplete: (type: string) => event({
    action: 'booking_complete',
    category: 'Booking',
    label: type,
  }),

  // Search
  siteSearch: (query: string) => event({
    action: 'search',
    category: 'Site_Search',
    label: query,
  }),

  // Errors
  error: (errorType: string, errorMessage: string) => event({
    action: 'error',
    category: 'Error',
    label: `${errorType}: ${errorMessage}`,
  }),
};

// Track conversions (for Google Ads integration)
export const trackConversion = (conversionLabel: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/${conversionLabel}`,
      value: value,
      currency: 'EUR',
    });
  }
};

// Page view tracker component
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

// Main Google Analytics component
export function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />
      {/* Page View Tracker */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

export default GoogleAnalytics;
