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

export type PricingTierId = 'TIER_1' | 'TIER_2' | 'TIER_3_INDIA';

export interface PricingTierDefinition {
  id: PricingTierId;
  label: string;
  currency: 'USD' | 'INR';
  regularPrice: number;
  salePrice: number;
  /** Authoritative, from the workbook -- NOT recalculated from the rounded display prices (Section 4: "do not calculate discount from rounded display values"). */
  discountPercent: number;
  taxIncluded: boolean;
  shippingIncluded: boolean;
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
    notes: 'Includes taxes and shipping, no hidden charges.',
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
    notes: 'Test-discount tier -- revisit once more order volume comes in.',
  },
  TIER_3_INDIA: {
    id: 'TIER_3_INDIA',
    label: 'India',
    currency: 'INR',
    regularPrice: 17400,
    salePrice: 12999,
    discountPercent: 25.2931034482759,
    taxIncluded: true,
    shippingIncluded: true,
    notes: 'Includes taxes and shipping, no hidden charges.',
  },
};

/**
 * Explicit allow-list only -- Section 2 is emphatic that Tier 2 (or
 * any tier) must never be auto-extended to a whole region ("do not
 * automatically assign every African or Southeast Asian country
 * unless the country is explicitly configured"). Every country below
 * is one the client actually named; nothing here is inferred.
 */
export const COUNTRY_TIER_MAP: Record<string, PricingTierId> = {
  // Tier 1 -- primary international markets
  US: 'TIER_1',
  GB: 'TIER_1',
  CA: 'TIER_1',
  AU: 'TIER_1',
  DE: 'TIER_1',
  SG: 'TIER_1',
  AE: 'TIER_1',
  NG: 'TIER_1',
  GH: 'TIER_1',
  RO: 'TIER_1',
  // Tier 2 -- test / secondary international markets
  MY: 'TIER_2',
  PH: 'TIER_2',
  KE: 'TIER_2',
  UG: 'TIER_2',
  TZ: 'TIER_2',
  // Tier 3 -- India
  IN: 'TIER_3_INDIA',
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
