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
import { getCurrencyForCountry, GATEWAY_UNSUPPORTED_CURRENCIES, type CurrencyCode } from '@/data/currencies';
import { getRates, convertAmount, roundToWhole } from './fx';

export type ResolvedTierId = PricingTierId | 'STANDARD';

export interface ResolvedPricing {
  productId: string;
  tier: ResolvedTierId;
  currency: CurrencyCode;
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
  /**
   * Live-currency-conversion audit trail (Master Pricing pass, 7 Oct):
   * when `currency` above has been converted from the tier's own base
   * currency to the visitor's local currency, these record exactly
   * what the conversion was, so it's always traceable back to the
   * real, workbook-confirmed base price. Undefined when no conversion
   * happened (the tier's base currency already matches, or no live
   * rate was available and the base currency was shown instead).
   */
  baseAmount?: number;
  baseCurrency?: CurrencyCode;
  fxRate?: number;
  /** Internal-only base/shipping/tax split, passed through from the tier config (Vrinda, 9 Oct) -- see PricingTierDefinition.breakdown. Undefined for TIER_4_INDIA and for non-tiered products. */
  breakdown?: { base: number; shipping: number; tax: number };
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
      breakdown: tier.breakdown,
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

/**
 * Applies live-currency conversion on top of resolveProductPricing()
 * (Master Pricing pass, 7 Oct: client-confirmed "live exchange-rate
 * conversion" over fixed client-supplied rates). ASYNC because it may
 * do a real network fetch (cached -- see lib/pricing/fx.ts) -- kept
 * entirely separate from the synchronous resolveProductPricing() above
 * so every existing synchronous call site (PriceTag's instant default
 * render, before its own effect re-fetches from the server) keeps
 * working unchanged. Only called server-side today: app/api/pricing
 * (display) and app/api/checkout (the actual charge).
 *
 * Rounding: nearest whole number in the target currency (client-
 * confirmed, 7 Oct) -- 199.88 becomes 200, in every currency.
 *
 * Never invents a rate: if no country is known, the country isn't in
 * COUNTRY_CURRENCY_MAP (Section 2's explicit-allow-list philosophy --
 * no guessing a currency for an unlisted country), the local currency
 * already equals the tier's base currency, the live rate source is
 * unreachable, or the local currency isn't one either payment gateway
 * can actually charge (client decision, 8 Oct -- see
 * GATEWAY_UNSUPPORTED_CURRENCIES), this returns the base
 * resolveProductPricing() result completely unchanged -- the tier's
 * own USD/INR price, never a guessed conversion and never a price the
 * visitor couldn't actually pay in.
 */
export async function resolveLocalCurrencyPricing(product: Product, countryCode?: string): Promise<ResolvedPricing> {
  const base = resolveProductPricing(product, countryCode);
  if (!countryCode) return base;

  const localCurrency = getCurrencyForCountry(countryCode);
  if (!localCurrency || localCurrency === base.currency) return base;
  if (GATEWAY_UNSUPPORTED_CURRENCIES.includes(localCurrency)) return base;

  const rates = await getRates();
  if (!rates) return base; // live source unreachable -- show the base tier currency, never guess a rate

  const fxRate = base.currency === 'USD' ? rates[localCurrency] : convertAmount(1, base.currency, localCurrency, rates);
  const convertedSale = convertAmount(base.salePrice, base.currency, localCurrency, rates);
  const convertedRegular = convertAmount(base.regularPrice, base.currency, localCurrency, rates);
  if (convertedSale === null || convertedRegular === null || fxRate === null || fxRate === undefined) return base;

  return {
    ...base,
    currency: localCurrency,
    salePrice: roundToWhole(convertedSale),
    regularPrice: roundToWhole(convertedRegular),
    baseAmount: base.salePrice,
    baseCurrency: base.currency,
    fxRate,
  };
}
