'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useCookieConsent } from '@/components/cookie-consent/CookieConsentProvider';

const GA_MEASUREMENT_ID = 'G-Q8Q67SKTJV';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const initGA = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: false,
    });
  }
};

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
  }
};

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
      value,
    });
  }
};

export const trackEvents = {
  contactFormSubmit: (source: string) => event({ action: 'form_submit', category: 'Contact', label: source }),
  contactFormStart: () => event({ action: 'form_start', category: 'Contact' }),
  newsletterSubscribe: (source: string) => event({ action: 'subscribe', category: 'Newsletter', label: source }),
  aiScanStart: () => event({ action: 'scan_start', category: 'AI_Scan' }),
  aiScanComplete: (score: number) => event({ action: 'scan_complete', category: 'AI_Scan', value: score }),
  aiScanLeadCapture: (sector: string) => event({ action: 'scan_lead_capture', category: 'AI_Scan', label: sector }),
  chatbotOpen: () => event({ action: 'chatbot_open', category: 'Iris_Assistant' }),
  chatbotMessage: () => event({ action: 'message_sent', category: 'Iris_Assistant' }),
  kennisbankChatOpen: (article: string) => event({ action: 'chat_open', category: 'Kennisbank_Chat', label: article }),
  blogRead: (slug: string, readTime: number) => event({ action: 'blog_read', category: 'Content', label: slug, value: readTime }),
  kennisbankRead: (slug: string) => event({ action: 'kennisbank_read', category: 'Content', label: slug }),
  downloadResource: (resource: string) => event({ action: 'download', category: 'Resources', label: resource }),
  ctaClick: (ctaName: string, location: string) => event({ action: 'cta_click', category: 'CTA', label: `${ctaName}_${location}` }),
  externalLinkClick: (url: string) => event({ action: 'external_link', category: 'Outbound', label: url }),
  socialShare: (platform: string, content: string) => event({ action: 'share', category: 'Social', label: `${platform}_${content}` }),
  scrollDepth: (percentage: number) => event({ action: 'scroll_depth', category: 'Engagement', value: percentage }),
  videoPlay: (videoId: string) => event({ action: 'video_play', category: 'Video', label: videoId }),
  videoComplete: (videoId: string) => event({ action: 'video_complete', category: 'Video', label: videoId }),
  bookingStart: (type: string) => event({ action: 'booking_start', category: 'Booking', label: type }),
  bookingComplete: (type: string) => event({ action: 'booking_complete', category: 'Booking', label: type }),
  siteSearch: (query: string) => event({ action: 'search', category: 'Site_Search', label: query }),
  error: (errorType: string, errorMessage: string) => event({ action: 'error', category: 'Error', label: `${errorType}: ${errorMessage}` }),
};

export const trackConversion = (conversionLabel: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/${conversionLabel}`,
      value,
      currency: 'EUR',
    });
  }
};

function GAPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  const { consent } = useCookieConsent();

  if (consent !== 'accepted') return null;

  return (
    <>
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
              cookie_flags: 'SameSite=Lax',
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GAPageViewTracker />
      </Suspense>
    </>
  );
}

export default GoogleAnalytics;
