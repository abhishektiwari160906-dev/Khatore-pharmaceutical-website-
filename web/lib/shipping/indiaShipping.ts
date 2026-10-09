import type { CurrencyCode } from '@/data/currencies';

/**
 * PLACEHOLDER SCAFFOLDING -- every cost below is 0. This is NOT
 * Khatore's real shipping cost data; it exists purely so the
 * backend-only India shipping-by-location plumbing (order metadata,
 * never the charged amount or anything shown to the customer) is
 * already wired end-to-end. Requested from Vrinda and not yet
 * received: which logistics provider Khatore uses, and their real
 * zone-wise rate card.
 *
 * Structure deliberately mirrors how courier rate cards are actually
 * published -- a handful of ZONES, each with one flat rate, and every
 * state/UT assigned to a zone -- so the real rate card becomes a pure
 * data edit to ZONE_RATES (and, only if the real provider's own zones
 * differ, STATE_TO_ZONE) with no code changes anywhere else.
 */

export type IndiaShippingZone = 'ZONE_LOCAL' | 'ZONE_REGIONAL' | 'ZONE_NATIONAL' | 'ZONE_REMOTE' | 'ZONE_UNMAPPED';

/** Flat cost per zone, in INR. ALL ZERO until the real rate card replaces this. */
const ZONE_RATES: Record<IndiaShippingZone, number> = {
  ZONE_LOCAL: 0,
  ZONE_REGIONAL: 0,
  ZONE_NATIONAL: 0,
  ZONE_REMOTE: 0,
  ZONE_UNMAPPED: 0,
};

/**
 * Khatore ships from Barbil, Keonjhar district, Odisha (lib/config.ts /
 * site footer). This grouping -- Odisha as "local", its neighbours as
 * "regional", the North-East + island territories + J&K/Ladakh as
 * "remote" (most couriers price these separately), everything else
 * "national" -- is a reasonable-looking GUESS for scaffolding purposes
 * only. It has not been confirmed against the real logistics
 * provider's own zone map and must not be treated as correct until it
 * has been.
 */
const STATE_TO_ZONE: Record<string, IndiaShippingZone> = {
  // Local
  odisha: 'ZONE_LOCAL',
  orissa: 'ZONE_LOCAL',

  // Regional -- states bordering Odisha
  'west bengal': 'ZONE_REGIONAL',
  jharkhand: 'ZONE_REGIONAL',
  chhattisgarh: 'ZONE_REGIONAL',
  'andhra pradesh': 'ZONE_REGIONAL',
  telangana: 'ZONE_REGIONAL',

  // National -- rest of mainland India
  maharashtra: 'ZONE_NATIONAL',
  karnataka: 'ZONE_NATIONAL',
  'tamil nadu': 'ZONE_NATIONAL',
  kerala: 'ZONE_NATIONAL',
  goa: 'ZONE_NATIONAL',
  gujarat: 'ZONE_NATIONAL',
  rajasthan: 'ZONE_NATIONAL',
  'madhya pradesh': 'ZONE_NATIONAL',
  'uttar pradesh': 'ZONE_NATIONAL',
  bihar: 'ZONE_NATIONAL',
  punjab: 'ZONE_NATIONAL',
  haryana: 'ZONE_NATIONAL',
  'himachal pradesh': 'ZONE_NATIONAL',
  uttarakhand: 'ZONE_NATIONAL',
  delhi: 'ZONE_NATIONAL',
  'nct of delhi': 'ZONE_NATIONAL',
  chandigarh: 'ZONE_NATIONAL',
  puducherry: 'ZONE_NATIONAL',
  pondicherry: 'ZONE_NATIONAL',
  'dadra and nagar haveli and daman and diu': 'ZONE_NATIONAL',

  // Remote -- North-East, island territories, J&K/Ladakh
  'arunachal pradesh': 'ZONE_REMOTE',
  assam: 'ZONE_REMOTE',
  manipur: 'ZONE_REMOTE',
  meghalaya: 'ZONE_REMOTE',
  mizoram: 'ZONE_REMOTE',
  nagaland: 'ZONE_REMOTE',
  sikkim: 'ZONE_REMOTE',
  tripura: 'ZONE_REMOTE',
  'andaman and nicobar islands': 'ZONE_REMOTE',
  lakshadweep: 'ZONE_REMOTE',
  'jammu and kashmir': 'ZONE_REMOTE',
  ladakh: 'ZONE_REMOTE',
};

function normalizeState(state: string): string {
  return state.trim().toLowerCase();
}

export interface ComputedIndiaShipping {
  zone: IndiaShippingZone;
  cost: { amount: number; currency: CurrencyCode };
}

/**
 * Backend-only: the caller (app/api/checkout/route.ts) attaches the
 * result to the order record sent to getConfiguredOrderStore(), never
 * to the Order object returned in the API response -- so it never
 * reaches the customer's browser, sessionStorage, or any rendered
 * page. city/postalCode are accepted now (most real courier rate
 * cards key off pincode, not state) but unused until the real rate
 * card specifies how it's actually zoned.
 */
export function computeIndiaShippingCost(
  state: string,
  _city?: string,
  _postalCode?: string,
): ComputedIndiaShipping {
  const normalized = normalizeState(state);
  const zone: IndiaShippingZone = !normalized ? 'ZONE_UNMAPPED' : (STATE_TO_ZONE[normalized] ?? 'ZONE_NATIONAL');
  return {
    zone,
    cost: { amount: ZONE_RATES[zone], currency: 'INR' },
  };
}
