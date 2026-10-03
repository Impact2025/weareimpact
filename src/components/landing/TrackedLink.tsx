'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackEvents } from '@/components/analytics';

type Props = ComponentProps<typeof Link> & {
  ctaName: string;
  location: string;
};

/** Link die een GA4 cta_click-event verstuurt (alleen na cookie-akkoord, via de bestaande GA-laag). */
export function TrackedLink({ ctaName, location, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvents.ctaClick(ctaName, location);
        onClick?.(e);
      }}
    />
  );
}
