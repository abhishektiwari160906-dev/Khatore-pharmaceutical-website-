'use client';

import { trackEvent } from '@/lib/events/client';
import { getPurchaseState, type Product } from '@/data/products';

const WHATSAPP_PHONE = '918709206320';

/**
 * Purchase-state aware (Commerce Foundation pass): BUY_NOW redirects to
 * the live Magento page (today's only real purchase path, Section 14)
 * and fires external_checkout_redirect, same as before this pass.
 * ENQUIRE routes to WhatsApp instead and fires the already-active
 * whatsapp_click — no new event needed for an enquiry. UNAVAILABLE
 * renders a disabled label, no link, no event.
 *
 * All 8 products in the current catalogue resolve to BUY_NOW (each has
 * a real checkoutUrl) — ENQUIRE/UNAVAILABLE exist so a future product
 * without one doesn't need this component rebuilt, not because any
 * product today needs them.
 */
export function BuyButton({ product, className }: { product: Product; className?: string }) {
  const state = getPurchaseState(product);

  if (state === 'UNAVAILABLE') {
    return (
      <span className={className} aria-disabled="true">
        Not Currently Available
      </span>
    );
  }

  if (state === 'ENQUIRE') {
    const href = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
      `Hi, I'd like to enquire about ${product.name}.`,
    )}`;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={className}
        onClick={() => {
          trackEvent('whatsapp_click', {
            product_id: product.productId,
            product_name: product.name,
            metadata: { phone: WHATSAPP_PHONE, source: 'buy_button_enquire' },
          });
        }}
      >
        Enquire
      </a>
    );
  }

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
