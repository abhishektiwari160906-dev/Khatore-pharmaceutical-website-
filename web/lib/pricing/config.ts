/**
 * Central pricing configuration (Master Pricing pass). This is the
 * ONLY place tiered prices are defined -- every surface (product card,
 * product detail, cart, checkout, order) resolves through
 * lib/pricing/resolve.ts, which reads only from here. Nothing here is
 * invented: every number is transcribed directly from
 * Kamalahar_Website_Pricing_Final.xlsx (finalised 30 Sep 2026),
 * verified cell-by-cell before writing this file.
 *
 * Only Kamalahar has client-confirmed tiered pricing. Every other
 * product keeps its existing flat data/products.ts price, completely
 * untouched -- see resolve.ts's resolveProductPricing(), which only
 * consults this file for productId === 'kamalahar'.
 */

import type { CurrencyCode } from '@/data/currencies';

export type PricingTierId = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4_INDIA';

export interface PricingTierDefinition {
  id: PricingTierId;
  label: string;
  /** The tier's own BASE currency (USD or INR, per the workbook) -- never changes. The DISPLAYED/CHARGED currency a specific visitor sees may be their own local currency instead, via live conversion -- see lib/pricing/fx.ts and resolve.ts's resolveLocalCurrencyPricing(). */
  currency: CurrencyCode;
  regularPrice: number;
  salePrice: number;
  /** Authoritative, from the workbook -- NOT recalculated from the rounded display prices (Section 4: "do not calculate discount from rounded display values"). */
  discountPercent: number;
  taxIncluded: boolean;
  shippingIncluded: boolean;
  /**
   * Internal-only base/shipping/tax split (Vrinda, 9 Oct) -- base +
   * shipping + tax always equals salePrice. Never shown to the
   * customer (checkout/order-confirmation still display only the
   * single flat total, same as India's own all-inclusive treatment);
   * recorded on the order as internalMeta for Khatore's own records
   * only, same pattern as the India backend-shipping scaffolding
   * (lib/shipping/indiaShipping.ts). Undefined for TIER_4_INDIA, which
   * has no itemized breakdown by design.
   */
  breakdown?: { base: number; shipping: number; tax: number };
  notes: string;
  /**
   * Both undefined today -- no real campaign expiry has been
   * configured (Section 8). The UI must only ever show an "offer
   * ends" message when BOTH of these are real, client-set
   * timestamps -- never a fabricated countdown.
   */
  discountStartsAt?: string; // ISO 8601
  discountEndsAt?: string; // ISO 8601
}

export const PRICING_TIERS: Record<PricingTierId, PricingTierDefinition> = {
  TIER_1: {
    id: 'TIER_1',
    label: 'International',
    currency: 'USD',
    regularPrice: 399,
    salePrice: 299,
    discountPercent: 25.062656641604,
    taxIncluded: true,
    shippingIncluded: true,
    notes: 'Includes taxes and shipping, no hidden charges. (Reverted 9 Oct: the itemized $50 shipping / $15 tax tried earlier the same day was rolled back to this single flat total, same treatment as India.)',
    breakdown: { base: 237, shipping: 50, tax: 12 },
  },
  TIER_2: {
    id: 'TIER_2',
    label: 'International (Test Markets)',
    currency: 'USD',
    regularPrice: 399,
    salePrice: 249,
    discountPercent: 37.593984962406,
    taxIncluded: true,
    shippingIncluded: true,
    notes: 'Test-discount tier -- revisit once more order volume comes in. Includes taxes and shipping, same reverted treatment as TIER_1.',
    breakdown: { base: 187, shipping: 50, tax: 12 },
  },
  TIER_3: {
    id: 'TIER_3',
    label: 'International (Lower/Lower-Middle Income)',
    currency: 'USD',
    // No regular/pre-discount price was given for this tier -- $199 is
    // the whole number Vrinda supplied, not a discounted-from figure,
    // so regularPrice == salePrice and there is no discount badge
    // (Section: never invent a discount percentage that wasn't given).
    regularPrice: 199,
    salePrice: 199,
    discountPercent: 0,
    taxIncluded: true,
    shippingIncluded: true,
    notes: 'Income-based tier (Vrinda, 9 Oct, World Bank Country and Lending Groups classification: Low/Lower-middle income) -- a reassignment of countries previously on Tier 1/2, not a new addition.',
    breakdown: { base: 137, shipping: 50, tax: 12 },
  },
  TIER_4_INDIA: {
    id: 'TIER_4_INDIA',
    label: 'India',
    currency: 'INR',
    regularPrice: 17400,
    salePrice: 12999,
    discountPercent: 25.2931034482759,
    taxIncluded: true,
    shippingIncluded: true,
    notes: 'Includes taxes and shipping, no hidden charges. (Renamed from TIER_3_INDIA 9 Oct when TIER_3 -- a genuinely different, income-based USD tier -- was introduced, to avoid two different things both being called "Tier 3" in code vs in conversation with Vrinda.)',
  },
};

/**
 * Explicit allow-list only -- Section 2 is emphatic that Tier 2 (or
 * any tier) must never be auto-extended to a whole region ("do not
 * automatically assign every African or Southeast Asian country
 * unless the country is explicitly configured"). Every country below
 * is one the client actually named; nothing here is inferred.
 *
 * REPLACED 10 Oct with Vrinda's own real-order-data tier sheet
 * (Kamalahar_Pricing_Tiers_Simple.xlsx, "Country Tiers" tab) --
 * supersedes every prior round today (the 9 Oct World Bank-income
 * version and the same-day-earlier G7/dictated version). 57 countries
 * total: every country with at least one real website order
 * (1,558 orders analyzed), placed by Vrinda based on order volume,
 * average amount paid, and income level. Her sheet's own note: "a
 * working proposal (10 Oct 2026)... It is a test, not final" -- real
 * and authoritative for now, but flagged here in case that changes.
 *
 * Her sheet also flags Russia, Sudan, Iran and Somalia with "check
 * payment and shipping restrictions" -- that's an operational/legal
 * question for Khatore to resolve, not something this code can
 * determine, so it's priced here exactly as given and flagged back in
 * the delivery report rather than silently included or excluded.
 *
 * Any country NOT in this list (e.g. Vietnam, raised earlier as a
 * hypothetical) has no real order history behind it and falls to
 * DEFAULT_TIER_ID (Tier 1) below -- consistent with the sheet itself
 * only covering countries with actual orders.
 */
export const COUNTRY_TIER_MAP: Record<string, PricingTierId> = {
  // Tier 1 -- $299 (20 countries, High purchasing power)
  US: 'TIER_1',
  GB: 'TIER_1',
  AU: 'TIER_1',
  CA: 'TIER_1',
  AE: 'TIER_1',
  SG: 'TIER_1',
  DE: 'TIER_1',
  ES: 'TIER_1',
  SE: 'TIER_1',
  NL: 'TIER_1',
  NZ: 'TIER_1',
  KR: 'TIER_1',
  BE: 'TIER_1',
  JP: 'TIER_1',
  FI: 'TIER_1',
  IE: 'TIER_1',
  NO: 'TIER_1',
  KW: 'TIER_1',
  MT: 'TIER_1',
  HK: 'TIER_1',
  // Tier 2 -- $249 (14 countries, strong demand / mid purchasing power)
  GH: 'TIER_2',
  NG: 'TIER_2',
  MY: 'TIER_2',
  RO: 'TIER_2',
  NA: 'TIER_2',
  TR: 'TIER_2',
  EE: 'TIER_2',
  HU: 'TIER_2',
  AL: 'TIER_2',
  CN: 'TIER_2',
  TH: 'TIER_2',
  ZA: 'TIER_2',
  AR: 'TIER_2',
  RU: 'TIER_2', // flagged in source sheet: check payment and shipping restrictions
  // Tier 3 -- $199 (22 countries, lower purchasing power)
  PH: 'TIER_3',
  KE: 'TIER_3',
  TZ: 'TIER_3',
  LK: 'TIER_3',
  UG: 'TIER_3',
  JO: 'TIER_3',
  CM: 'TIER_3',
  PG: 'TIER_3',
  ZW: 'TIER_3',
  LR: 'TIER_3',
  KH: 'TIER_3',
  ID: 'TIER_3',
  MW: 'TIER_3',
  SD: 'TIER_3', // flagged in source sheet: check payment and shipping restrictions
  IR: 'TIER_3', // flagged in source sheet: check payment and shipping restrictions
  CD: 'TIER_3',
  RW: 'TIER_3',
  SO: 'TIER_3', // flagged in source sheet: check payment and shipping restrictions
  AO: 'TIER_3',
  ZM: 'TIER_3',
  PK: 'TIER_3',
  LA: 'TIER_3',
  // Tier 4 -- India (home market), ₹12,999
  IN: 'TIER_4_INDIA',
};

/**
 * Applied to any country NOT in COUNTRY_TIER_MAP above (i.e. every
 * country the client did not explicitly name) and whenever country
 * detection fails entirely (Section 13: "do not guess... use a
 * defined default pricing tier"). Tier 1 is the broad "primary
 * international" tier, not the deeper Tier 2 test-market discount --
 * this is a reasoned default, not a client instruction, and is called
 * out as such in the delivery report for confirmation.
 */
export const DEFAULT_TIER_ID: PricingTierId = 'TIER_1';

export function getTier(id: PricingTierId): PricingTierDefinition {
  return PRICING_TIERS[id];
}

/**
 * Demo mode (Area 3, 7 Oct build): the client's own meeting confirmed
 * the Kamalahar discount should run for a 6-day window, but no actual
 * start date has been given yet -- `PRICING_TIERS` above correctly
 * still has `discountStartsAt`/`discountEndsAt` undefined on every
 * tier, which resolve.ts treats as "always on" (today's real,
 * confirmed behaviour). Setting DEMO_PRICING=1 overlays an OBVIOUSLY
 * LABELLED fake 6-day window (centered on server start time) purely so
 * the revert mechanism itself can be demonstrated live -- it is never
 * read unless the env var is explicitly "1", so production is
 * unaffected by default. This does NOT touch regularPrice/salePrice/
 * discountPercent -- those are the real, workbook-confirmed numbers
 * either way.
 */
const DEMO_WINDOW_STARTED_AT = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days before server start
const DEMO_WINDOW_ENDS_AT = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(); // 4 days after server start (6-day window total)
const DEMO_WINDOW_ALREADY_EXPIRED_ENDS_AT = new Date(Date.now() - 60 * 1000).toISOString(); // ended 1 minute ago -- lets the meeting demo show the REVERTED state too

export function getDiscountWindow(tierId: PricingTierId): { startsAt?: string; endsAt?: string } {
  const tier = PRICING_TIERS[tierId];
  if (process.env.DEMO_PRICING === '1') {
    // TIER_1 demonstrates "discount currently active, reverts in ~4 days".
    // TIER_2 demonstrates "discount already expired, reverted to regular
    // price" -- so both states are visible in one live demo without
    // waiting for real time to pass.
    if (tierId === 'TIER_2') {
      return { startsAt: DEMO_WINDOW_STARTED_AT, endsAt: DEMO_WINDOW_ALREADY_EXPIRED_ENDS_AT };
    }
    return { startsAt: DEMO_WINDOW_STARTED_AT, endsAt: DEMO_WINDOW_ENDS_AT };
  }
  return { startsAt: tier.discountStartsAt, endsAt: tier.discountEndsAt };
}
