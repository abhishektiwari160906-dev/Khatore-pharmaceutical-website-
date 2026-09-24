/**
 * Country-specific pricing scaffold (post-review rebuild).
 *
 * NOT currency conversion — real, distinct price points per country,
 * per the client's explicit instruction. Every price below except the
 * India default is `null` because Mr. Vijay has not supplied
 * country-specific pricing yet; nothing here is invented.
 *
 * Resolution order the future pricing component should follow:
 *   1. PRICING_BY_COUNTRY[countryCode]?.[productId] if set
 *   2. DEFAULT_COUNTRY's price (India) as the fallback
 *   3. The existing USD price already in data/products.ts as the
 *      final fallback (today's real, live price — never blocked on
 *      this table being incomplete)
 *
 * Country detection: prefer a platform-supplied edge/header country
 * code (e.g. Netlify's `x-country` or a CDN geo header) over any
 * client-side IP lookup, and always degrade to DEFAULT_COUNTRY on
 * failure — this table's shape doesn't change either way.
 */

export const DEFAULT_COUNTRY = 'IN';

export interface CountryPrice {
  amount: number;
  currency: string;
}

/**
 * productId -> country code -> price. Every value is `null` until
 * Mr. Vijay confirms it — do not fill a gap with a converted USD
 * estimate, that would be inventing a price point, not using one.
 */
export const PRICING_BY_COUNTRY: Record<string, Record<string, CountryPrice | null>> = {
  kamalahar: { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-mens': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-matic': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-cuff-syrup': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-matic-oil': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  kaptone: { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-morex-brain-tonic': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
  'k-matic-combo': { IN: null, US: null, GB: null, AE: null, NG: null, ZA: null },
};

export function getCountryPrice(productId: string, countryCode: string): CountryPrice | null {
  return PRICING_BY_COUNTRY[productId]?.[countryCode] ?? PRICING_BY_COUNTRY[productId]?.[DEFAULT_COUNTRY] ?? null;
}
