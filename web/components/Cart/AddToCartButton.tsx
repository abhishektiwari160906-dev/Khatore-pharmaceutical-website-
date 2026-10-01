'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import { resolveProductPricing } from '@/lib/pricing/resolve';
import type { Product } from '@/data/products';
import styles from './AddToCartButton.module.css';

/**
 * Resolves pricing before snapshotting it into the cart line (Master
 * Pricing pass, Section 5). Tries /api/pricing first for a country-aware
 * price (best-effort geo-IP); a slow or failed fetch falls back to the
 * default-tier price computed locally by the same resolver that
 * PriceTag already shows on-screen, so the cart line always matches
 * what the customer saw before clicking -- never a different, re-rolled
 * number.
 */
export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const { addItem, open } = useCart();
  const [added, setAdded] = useState(false);

  async function handleClick() {
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
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    open();
  }

  return (
    <button type="button" className={`${styles.btn} ${className ?? ''}`} onClick={handleClick}>
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
