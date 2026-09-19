'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/events/client';

export function TrackProductView({ productId, productName }: { productId: string; productName: string }) {
  useEffect(() => {
    trackEvent('product_viewed', { product_id: productId, product_name: productName });
    // fire once per mount only — this is the product's own detail page, not a scroll-triggered card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
