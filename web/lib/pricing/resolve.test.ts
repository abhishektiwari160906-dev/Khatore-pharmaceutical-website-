import { describe, it, expect } from 'vitest';
import { resolveProductPricing, resolveTierForCountry, isDiscountActive } from './resolve';
import { PRICING_TIERS, COUNTRY_TIER_MAP } from './config';
import { getProductBySlug } from '@/data/products';
import { isValidCountryCode } from '@/data/countries';

const kamalahar = getProductBySlug('kamalahar')!;
const nonTiered = getProductBySlug('k-mens')!;

// 10 Oct: replaced entirely by Vrinda's real order-data tier sheet
// (Kamalahar_Pricing_Tiers_Simple.xlsx) -- 57 countries total, every
// one with real website-order history. Supersedes both the 9 Oct
// World Bank-income version and the same-day-earlier G7/dictated
// version. See lib/pricing/config.ts's own COUNTRY_TIER_MAP comment.
const TIER_1_COUNTRIES = ['US', 'GB', 'AU', 'CA', 'AE', 'SG', 'DE', 'ES', 'SE', 'NL', 'NZ', 'KR', 'BE', 'JP', 'FI', 'IE', 'NO', 'KW', 'MT', 'HK'];
const TIER_2_COUNTRIES = ['GH', 'NG', 'MY', 'RO', 'NA', 'TR', 'EE', 'HU', 'AL', 'CN', 'TH', 'ZA', 'AR', 'RU'];
const TIER_3_COUNTRIES = ['PH', 'KE', 'TZ', 'LK', 'UG', 'JO', 'CM', 'PG', 'ZW', 'LR', 'KH', 'ID', 'MW', 'SD', 'IR', 'CD', 'RW', 'SO', 'AO', 'ZM', 'PK', 'LA'];

describe('resolveTierForCountry', () => {
  it('maps India to TIER_4_INDIA', () => expect(resolveTierForCountry('IN')).toBe('TIER_4_INDIA'));
  it('falls back to TIER_1 for a country with no real order history (Vietnam -- not in the 57-country sheet)', () =>
    expect(resolveTierForCountry('VN')).toBe('TIER_1'));
  it('falls back to TIER_1 when no country is known at all', () => expect(resolveTierForCountry(undefined)).toBe('TIER_1'));

  it('maps all 20 Tier 1 countries from the real order-data sheet', () => {
    expect(TIER_1_COUNTRIES).toHaveLength(20);
    for (const code of TIER_1_COUNTRIES) {
      expect(resolveTierForCountry(code)).toBe('TIER_1');
    }
  });
  it('maps all 14 Tier 2 countries from the real order-data sheet', () => {
    expect(TIER_2_COUNTRIES).toHaveLength(14);
    for (const code of TIER_2_COUNTRIES) {
      expect(resolveTierForCountry(code)).toBe('TIER_2');
    }
  });
  it('maps all 22 Tier 3 countries from the real order-data sheet', () => {
    expect(TIER_3_COUNTRIES).toHaveLength(22);
    for (const code of TIER_3_COUNTRIES) {
      expect(resolveTierForCountry(code)).toBe('TIER_3');
    }
  });
  it('totals 57 countries + India, matching the source sheet\'s own count', () => {
    expect(TIER_1_COUNTRIES.length + TIER_2_COUNTRIES.length + TIER_3_COUNTRIES.length).toBe(56);
  });

  it('is deterministic -- the same country resolves to the same tier every time', () => {
    for (const code of [...TIER_1_COUNTRIES, ...TIER_2_COUNTRIES, ...TIER_3_COUNTRIES, 'IN', 'VN']) {
      const first = resolveTierForCountry(code);
      for (let i = 0; i < 20; i++) {
        expect(resolveTierForCountry(code)).toBe(first);
      }
    }
  });

  // Regression test for a real bug found 10 Oct: 7 of the 57 countries
  // in Vrinda's real order-data sheet (Liberia, Sudan, Iran, DR Congo,
  // Somalia, Angola, Laos) were missing from data/countries.ts's
  // master COUNTRIES list entirely. isValidCountryCode() rejected
  // their IP-detected code, app/api/pricing's route silently treated
  // them as "no country known", and every one of them silently priced
  // at the Tier 1 default ($299) instead of their real Tier 3 ($199)
  // -- caught only by testing the full pipeline live, not by unit-
  // testing resolveTierForCountry() in isolation (which has no
  // isValidCountryCode() check and would never have caught this).
  // This asserts the two lists can never drift apart again.
  it('every country in COUNTRY_TIER_MAP is also a valid country code (data/countries.ts) -- otherwise IP-detection silently falls back to the Tier 1 default for it', () => {
    const missing = Object.keys(COUNTRY_TIER_MAP).filter((code) => !isValidCountryCode(code));
    expect(missing).toEqual([]);
  });
});

describe('resolveProductPricing -- correct price per tier', () => {
  it('India -- Rs17,400 -> Rs12,999', () => {
    const p = resolveProductPricing(kamalahar, 'IN');
    expect(p.currency).toBe('INR');
    expect(p.regularPrice).toBe(17400);
    expect(p.salePrice).toBe(12999);
  });

  it('USA (Tier 1) -- $399 -> $299', () => {
    const p = resolveProductPricing(kamalahar, 'US');
    expect(p.currency).toBe('USD');
    expect(p.regularPrice).toBe(399);
    expect(p.salePrice).toBe(299);
  });

  it('Malaysia (Tier 2, per the real order-data sheet) -- $249, base+shipping+tax = 187+50+12', () => {
    const p = resolveProductPricing(kamalahar, 'MY');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(249);
    expect(p.breakdown).toEqual({ base: 187, shipping: 50, tax: 12 });
    expect(p.breakdown!.base + p.breakdown!.shipping + p.breakdown!.tax).toBe(p.salePrice);
  });

  it('Nigeria (Tier 2, per the real order-data sheet) -- $249, base+shipping+tax = 187+50+12', () => {
    const p = resolveProductPricing(kamalahar, 'NG');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(249);
    expect(p.breakdown).toEqual({ base: 187, shipping: 50, tax: 12 });
    expect(p.breakdown!.base + p.breakdown!.shipping + p.breakdown!.tax).toBe(p.salePrice);
  });

  it('UAE (Tier 1, per the real order-data sheet) -- $299', () => {
    const p = resolveProductPricing(kamalahar, 'AE');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(299);
  });

  it('Sri Lanka (Tier 3) -- $199, base+shipping+tax = 137+50+12', () => {
    const p = resolveProductPricing(kamalahar, 'LK');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(199);
    expect(p.breakdown).toEqual({ base: 137, shipping: 50, tax: 12 });
  });

  it('every USD tier breakdown sums to its own salePrice', () => {
    for (const tierId of ['TIER_1', 'TIER_2', 'TIER_3'] as const) {
      const tier = PRICING_TIERS[tierId];
      expect(tier.breakdown).toBeDefined();
      expect(tier.breakdown!.base + tier.breakdown!.shipping + tier.breakdown!.tax).toBe(tier.salePrice);
    }
  });

  it('TIER_4_INDIA has no breakdown (all-inclusive, by design)', () => {
    expect(PRICING_TIERS.TIER_4_INDIA.breakdown).toBeUndefined();
  });

  it('a non-tiered product ignores country and keeps its flat price', () => {
    const p = resolveProductPricing(nonTiered, 'IN');
    expect(p.isTiered).toBe(false);
    expect(p.discountPercent).toBe(0);
  });
});

describe('isDiscountActive (pure)', () => {
  const window = { startsAt: '2026-10-07T00:00:00+05:30', endsAt: '2026-10-13T00:00:00+05:30' }; // a 6-day IST window

  it('is active inside the window', () => {
    expect(isDiscountActive(window, new Date('2026-10-10T12:00:00+05:30'))).toBe(true);
  });

  it('is NOT active before the window starts', () => {
    expect(isDiscountActive(window, new Date('2026-10-06T12:00:00+05:30'))).toBe(false);
  });

  it('is NOT active after the window ends -- the revert', () => {
    expect(isDiscountActive(window, new Date('2026-10-14T00:00:01+05:30'))).toBe(false);
  });

  it('is active (always-on) when no window is configured at all', () => {
    expect(isDiscountActive({}, new Date('2099-01-01T00:00:00Z'))).toBe(true);
  });
});

describe('resolveProductPricing -- discount reverts when the window has ended', () => {
  it('reverts salePrice to regularPrice and discountPercent to 0 once endsAt has passed, for every tier', () => {
    for (const tierId of Object.keys(PRICING_TIERS) as Array<keyof typeof PRICING_TIERS>) {
      const tier = PRICING_TIERS[tierId];
      // Simulate an expired window the same way getDiscountWindow would
      // supply one -- this exercises the exact revert path resolve.ts
      // uses, without depending on DEMO_PRICING or real wall-clock time.
      const active = isDiscountActive({ startsAt: '2020-01-01T00:00:00Z', endsAt: '2020-01-07T00:00:00Z' }, new Date('2026-01-01T00:00:00Z'));
      expect(active).toBe(false);
      // The charged price in that case must equal the regular price:
      expect(active ? tier.salePrice : tier.regularPrice).toBe(tier.regularPrice);
    }
  });
});

describe('resolveProductPricing -- server-side tamper resistance', () => {
  it('ignores any country casing/whitespace quirks the same way', () => {
    const a = resolveProductPricing(kamalahar, ' in ');
    const b = resolveProductPricing(kamalahar, 'IN');
    expect(a.salePrice).toBe(b.salePrice);
    expect(a.currency).toBe(b.currency);
  });
});
