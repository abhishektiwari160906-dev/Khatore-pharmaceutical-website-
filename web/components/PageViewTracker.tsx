'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/events/client';

/**
 * Fires `page_view` once per route change (Area 2's "page view" event).
 * Mounted once in the root layout -- no page needs to remember to add
 * this itself.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    const params = new URLSearchParams(window.location.search);
    trackEvent('page_view', {
      source: params.get('utm_source') ?? undefined,
      metadata: {
        utm_medium: params.get('utm_medium') ?? '',
        utm_campaign: params.get('utm_campaign') ?? '',
      },
    });
  }, [pathname]);

  return null;
}
