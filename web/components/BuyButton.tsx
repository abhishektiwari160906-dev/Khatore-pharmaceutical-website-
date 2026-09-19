'use client';

import { trackEvent } from '@/lib/events/client';
import type { Product } from '@/data/products';

/**
 * Today: fires external_checkout_redirect, then sends the visitor to
 * the live Magento product page — the only real purchase path (Section
 * 14). When native checkout lands, only this component's internals
 * change; the event shape and every call site stay the same (Section
 * 13's "frontend should not need to be structurally rebuilt").
 */
export function BuyButton({ product, className }: { product: Product; className?: string }) {
  return (
    <a
      href={product.checkoutUrl}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => {
        trackEvent('external_checkout_redirect', {
          product_id: product.productId,
          product_name: product.name,
          metadata: { destination: 'magento', checkout_url: product.checkoutUrl },
        });
      }}
    >
      View &amp; Buy
    </a>
  );
}
