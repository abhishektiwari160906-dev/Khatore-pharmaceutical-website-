'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/data/products';
import { resolveProductPricing, type ResolvedPricing, type LocalDisplayEstimate } from '@/lib/pricing/resolve';
import { getCurrencySymbol, type CurrencyCode } from '@/data/currencies';
import styles from './PriceTag.module.css';

/**
 * Off by default (client decision, 8 Oct -- reversing the 7 Oct
 * approval): there is no real 30-day price history behind this claim
 * yet (the site hasn't been live), so it must not show until that
 * history is genuinely there. Flip NEXT_PUBLIC_SHOW_LOWEST_PRICE_BADGE
 * to "1" only once real data backs it.
 */
const SHOW_LOWEST_PRICE_BADGE = process.env.NEXT_PUBLIC_SHOW_LOWEST_PRICE_BADGE === '1';

/**
 * Bug found 9 Oct while adding the live-FX display estimate: this
 * always grouped digits the Indian way (lakh/crore, "2,64,872") no
 * matter the currency -- invisible before now because every currency
 * actually rendered through here either stayed under 1,000 (USD/GBP/
 * etc. tier prices) or genuinely was INR. The new NGN/GHS/KES/UGX/TZS
 * estimates are the first amounts over 1,000 in a non-INR currency
 * this function has ever had to format, and they exposed it
 * immediately ("₦2,64,872" instead of "₦264,872"). INR keeps its real
 * lakh/crore grouping; every other currency gets standard
 * thousands-grouping.
 */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  // Whole-currency-unit formatting only -- client-confirmed rounding
  // rule (7 Oct) is nearest whole number, so there are never decimals
  // to show here regardless of currency.
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${getCurrencySymbol(currency)}${Math.round(amount).toLocaleString(locale)}`;
}

/**
 * Regular (struck through) / Final (prominent) / Discount% display,
 * resolved from the single pricing source (lib/pricing/resolve.ts),
 * never a flat `$amount` render (Master Pricing pass, Section 4).
 *
 * Renders the no-country default tier immediately -- identical on the
 * server and on first client render, so there is no hydration mismatch
 * -- then fetches /api/pricing in the background and swaps in a
 * country-aware price if geo-IP resolves one. A fetch failure leaves
 * the already-shown default-tier price standing (Section 13: never
 * guess, fall back to the defined default), so there is no loading
 * flicker and no broken state.
 */
export function PriceTag({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' }) {
  const [pricing, setPricing] = useState<ResolvedPricing>(() => resolveProductPricing(product));
  // "$199 USD (≈ ₦xxx)" (Vrinda, 9 Oct) -- null whenever there's
  // nothing to estimate: see resolveDisplayEstimate's own doc comment
  // for exactly which countries this does and doesn't apply to.
  const [displayEstimate, setDisplayEstimate] = useState<LocalDisplayEstimate | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pricing?productId=${encodeURIComponent(product.slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { pricing?: ResolvedPricing; displayEstimate?: LocalDisplayEstimate | null } | null) => {
        if (cancelled) return;
        if (data?.pricing) setPricing(data.pricing);
        setDisplayEstimate(data?.displayEstimate ?? null);
      })
      .catch(() => {
        // Network/geo failure -- the default-tier price already shown stands.
      });
    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  const hasDiscount = pricing.isTiered && pricing.salePrice < pricing.regularPrice;
  const includedNote =
    pricing.isTiered && (pricing.taxIncluded || pricing.shippingIncluded)
      ? pricing.taxIncluded && pricing.shippingIncluded
        ? 'Includes taxes & shipping'
        : pricing.taxIncluded
          ? 'Includes taxes'
          : 'Includes shipping'
      : null;

  return (
    <div className={`${styles.wrap} ${size === 'sm' ? styles.sm : ''}`}>
      <div className={styles.priceRow}>
        {hasDiscount ? (
          <span className={styles.regular}>{formatMoney(pricing.regularPrice, pricing.currency)}</span>
        ) : null}
        <span className={styles.final}>{formatMoney(pricing.salePrice, pricing.currency)}</span>
        {hasDiscount ? <span className={styles.badge}>{Math.round(pricing.discountPercent)}% OFF</span> : null}
      </div>
      {hasDiscount && SHOW_LOWEST_PRICE_BADGE ? (
        <span className={styles.lowestBadge}>
          Lowest price in 30 days — {formatMoney(pricing.salePrice, pricing.currency)}
        </span>
      ) : null}
      {includedNote ? <span className={styles.note}>{includedNote}</span> : null}
      {!pricing.isTiered && product.priceNote ? <span className={styles.note}>{product.priceNote}</span> : null}
      {displayEstimate ? (
        <span className={styles.note}>
          approx. {formatMoney(displayEstimate.amount, displayEstimate.currency)} — estimate only, charged in{' '}
          {pricing.currency}
        </span>
      ) : null}
    </div>
  );
}
