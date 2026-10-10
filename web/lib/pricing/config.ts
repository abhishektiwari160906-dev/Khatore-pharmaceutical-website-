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
 * REASSIGNED 10 Oct (Vrinda, dictated instruction, confirmed explicitly
 * after being shown it reverses part of the 9 Oct World Bank-based
 * mapping) -- this REPLACES the 9 Oct version:
 *   Tier 1: G7 + Europe + Singapore + Romania
 *   Tier 2: UAE, Nigeria, Ghana        (UAE down from Tier 1; Nigeria/
 *                                        Ghana UP from Tier 3)
 *   Tier 3: Malaysia, Kenya, Uganda, Tanzania  (Malaysia down from
 *                                        Tier 2; Kenya/Uganda/Tanzania
 *                                        unchanged)
 *   Tier 4: India, unchanged
 *
 * "G7 + Europe + Eastern Europe" was not given as an exhaustive country
 * list -- rather than invent one (guessing which of ~40 European
 * countries count is exactly the kind of guess Section 2 prohibits),
 * the G7 members plus the countries already explicitly live are named
 * below, and DEFAULT_TIER_ID (Tier 1, see below) already covers "the
 * rest of Europe" for any European country not named here -- so the
 * stated intent ("Europe defaults to Tier 1") is satisfied without
 * fabricating a country-by-country list nobody actually gave me.
 *
 * Two gaps flagged, not silently resolved: Philippines was in no list
 * this time (left on Tier 2, where it already was, rather than falling
 * to the Tier 1 default and getting a real price increase nobody
 * asked for) -- confirm if that's still correct. Vietnam was used as a
 * spoken example assuming it lands on Tier 2/3, but was never actually
 * named in any tier -- it is NOT in this map, so it resolves to the
 * Tier 1 default today; add it explicitly here if that's wrong.
 */
export const COUNTRY_TIER_MAP: Record<string, PricingTierId> = {
  // Tier 1 -- G7 + Singapore + Romania (explicitly named); every other
  // European country not listed here already falls to DEFAULT_TIER_ID
  // (Tier 1) below, so "the rest of Europe" needs no separate entry.
  US: 'TIER_1',
  CA: 'TIER_1',
  GB: 'TIER_1',
  FR: 'TIER_1',
  DE: 'TIER_1',
  IT: 'TIER_1',
  JP: 'TIER_1',
  SG: 'TIER_1',
  RO: 'TIER_1',
  AU: 'TIER_1', // unchanged from 9 Oct -- not reassigned by this instruction
  // Tier 2
  AE: 'TIER_2',
  NG: 'TIER_2',
  GH: 'TIER_2',
  // Tier 3
  MY: 'TIER_3',
  KE: 'TIER_3',
  UG: 'TIER_3',
  TZ: 'TIER_3',
  // Philippines: not named in this round's instruction either way --
  // left where it already was (Tier 2) rather than silently defaulting
  // to Tier 1. Flagged above; confirm or move explicitly.
  PH: 'TIER_2',
  // Tier 4 -- India
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
