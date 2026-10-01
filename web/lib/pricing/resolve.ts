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
import { COUNTRY_TIER_MAP, DEFAULT_TIER_ID, getTier, type PricingTierId } from './config';

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
    return {
      productId: product.productId,
      tier: tierId,
      currency: tier.currency,
      regularPrice: tier.regularPrice,
      salePrice: tier.salePrice,
      discountPercent: tier.discountPercent,
      taxIncluded: tier.taxIncluded,
      shippingIncluded: tier.shippingIncluded,
      country: normalizedCountry,
      isTiered: true,
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
