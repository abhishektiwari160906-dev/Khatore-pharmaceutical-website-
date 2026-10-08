'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/events/client';
import { getPurchaseState, type Product } from '@/data/products';
import { CONTACT } from '@/lib/config';
import { useCart } from '@/components/Cart/CartContext';
import { resolveProductPricing } from '@/lib/pricing/resolve';
import styles from './BuyButton.module.css';

const WHATSAPP_PHONE = CONTACT.whatsappIndiaWorld;

/**
 * Purchase-state aware (Commerce Foundation pass, revised 8 Oct):
 * BUY_NOW now goes straight through this site's own real checkout and
 * live payment gateways (PayU/PayPal) -- one click: add to cart, then
 * straight to /checkout, the same "Buy Now" pattern as Amazon/
 * Flipkart (distinct from "Add to Cart", which stays on the page).
 *
 * Previously this redirected to the old live Magento store
 * (`product.checkoutUrl`) -- correct when that was the only real
 * purchase path, but since Area 1's payment work this was silently
 * sending customers OFF the new site to the old one instead of
 * through the checkout that was actually built. `checkoutUrl` is kept
 * on the product data for now (not yet repurposed) but is no longer
 * read here.
 *
 * ENQUIRE routes to WhatsApp instead and fires the already-active
 * whatsapp_click. UNAVAILABLE renders a disabled label, no link, no event.
 */
export function BuyButton({ product, className }: { product: Product; className?: string }) {
  const state = getPurchaseState(product);
  const { addItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  async function handleBuyNow() {
    setLoading(true);
    let pricing = resolveProductPricing(product);
    try {
      const res = await fetch(`/api/pricing?productId=${encodeURIComponent(product.slug)}`);
      if (res.ok) {
        const data = (await res.json()) as { pricing?: typeof pricing };
        if (data.pricing) pricing = data.pricing;
      }
    } catch {
      // Network/geo failure -- the locally-resolved default-tier price stands.
    }
    addItem(product, 1, pricing);
    trackEvent('buy_now_click', {
      product_id: product.productId,
      product_name: product.name,
      metadata: { destination: 'checkout' },
    });
    router.push('/checkout');
  }

  return (
    <button type="button" className={`${styles.reset} ${className ?? ''}`} onClick={handleBuyNow} disabled={loading}>
      {loading ? 'Loading…' : 'Buy Now'}
    </button>
  );
}
