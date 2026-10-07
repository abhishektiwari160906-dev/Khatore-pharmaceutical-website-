/**
 * The single resolver every surface calls (Master Pricing pass, Section
 * 2: "the server must always resolve: country -> pricing tier ->
 * product price -> order total"). Pure and isomorphic -- no Node-only
 * APIs -- so it runs identically in app/api/pricing/route.ts,
 * app/api/checkout/route.ts, and client components like PriceTag.
 *
 * Only Kamalahar has a workbook entry today, so it is the only product
 * resolved through lib/pricing/config.ts's tiers. Every other product
 * resolves to its existing flat data/products.ts price with no
 * discount -- not invented, just not yet part of this pricing pass.
 */

import { getProductBySlug, type Product } from '@/data/products';
import { COUNTRY_TIER_MAP, DEFAULT_TIER_ID, getTier, getDiscountWindow, type PricingTierId } from './config';

export type ResolvedTierId = PricingTierId | 'STANDARD';

export interface ResolvedPricing {
  productId: string;
  tier: ResolvedTierId;
  currency: 'USD' | 'INR';
  regularPrice: number;
  salePrice: number;
  /** Authoritative figure from the tier config -- never recomputed from rounded display prices (Section 4). */
  discountPercent: number;
  taxIncluded: boolean;
  shippingIncluded: boolean;
  /** The ISO country code actually used to pick the tier, when one was known. */
  country?: string;
  /** False means this is the flat, non-discounted data/products.ts price -- no workbook entry exists for this product yet. */
  isTiered: boolean;
  /** True when a configured discount window is currently in effect (or no window is configured -- "always on"). False means the window has ended and salePrice has already reverted to regularPrice. Always true for a non-tiered product (no discount to be active). */
  discountActive?: boolean;
  /** The configured end of the discount window, when one exists -- undefined when the discount has no expiry configured. */
  discountEndsAt?: string;
}

/**
 * Pure, server-authoritative discount-window check (Area 3, 7 Oct
 * build): the charged amount must match the displayed amount, and the
 * discount must revert automatically once endsAt passes -- with no
 * redeploy, since this is evaluated fresh on every call against the
 * real clock, not baked into a cached value. No window configured
 * (both undefined) means "always on", which is today's real, confirmed
 * behaviour -- NOT the same as "expired". `now` is injected (not read
 * internally) so this is fully unit-testable with synthetic clocks.
 */
export function isDiscountActive(window: { startsAt?: string; endsAt?: string }, now: Date): boolean {
  if (!window.startsAt && !window.endsAt) return true; // no window configured -- always on
  if (window.startsAt && now < new Date(window.startsAt)) return false;
  if (window.endsAt && now > new Date(window.endsAt)) return false;
  return true;
}

/**
 * Explicit allow-list lookup, falling back to DEFAULT_TIER_ID for any
 * country not named in COUNTRY_TIER_MAP and whenever no country is
 * known at all (Section 13: "do not guess... use a defined default
 * pricing tier").
 */
export function resolveTierForCountry(countryCode?: string): PricingTierId {
  if (!countryCode) return DEFAULT_TIER_ID;
  const normalized = countryCode.trim().toUpperCase();
  return COUNTRY_TIER_MAP[normalized] ?? DEFAULT_TIER_ID;
}

export function resolveProductPricing(product: Product, countryCode?: string): ResolvedPricing {
  const normalizedCountry = countryCode?.trim().toUpperCase() || undefined;

  if (product.productId === 'kamalahar') {
    const tierId = resolveTierForCountry(normalizedCountry);
    const tier = getTier(tierId);
    const window = getDiscountWindow(tierId);
    const active = isDiscountActive(window, new Date());

    return {
      productId: product.productId,
      tier: tierId,
      currency: tier.currency,
      // Reverted automatically once the configured window ends -- the
      // charged amount (checkout calls this same function) always
      // matches what was just displayed, with no redeploy needed.
      regularPrice: tier.regularPrice,
      salePrice: active ? tier.salePrice : tier.regularPrice,
      discountPercent: active ? tier.discountPercent : 0,
      taxIncluded: tier.taxIncluded,
      shippingIncluded: tier.shippingIncluded,
      country: normalizedCountry,
      isTiered: true,
      discountActive: active,
      discountEndsAt: window.endsAt,
    };
  }

  const amount = product.price?.amount ?? 0;
  const currency = product.price?.currency ?? 'USD';
  return {
    productId: product.productId,
    tier: 'STANDARD',
    currency,
    regularPrice: amount,
    salePrice: amount,
    discountPercent: 0,
    taxIncluded: false,
    shippingIncluded: false,
    country: normalizedCountry,
    isTiered: false,
  };
}

export function resolveProductPricingBySlug(slug: string, countryCode?: string): ResolvedPricing | undefined {
  const product = getProductBySlug(slug);
  if (!product) return undefined;
  return resolveProductPricing(product, countryCode);
}
