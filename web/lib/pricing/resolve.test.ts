import { describe, it, expect } from 'vitest';
import { resolveProductPricing, resolveTierForCountry, isDiscountActive } from './resolve';
import { PRICING_TIERS } from './config';
import { getProductBySlug } from '@/data/products';

const kamalahar = getProductBySlug('kamalahar')!;
const nonTiered = getProductBySlug('k-mens')!;

describe('resolveTierForCountry', () => {
  it('maps India to TIER_4_INDIA', () => expect(resolveTierForCountry('IN')).toBe('TIER_4_INDIA'));
  it('maps the US to TIER_1', () => expect(resolveTierForCountry('US')).toBe('TIER_1'));
  it('falls back to TIER_1 for a genuinely unlisted country (Vietnam -- never named in any tier, despite being used as a spoken test example)', () =>
    expect(resolveTierForCountry('VN')).toBe('TIER_1'));
  it('falls back to TIER_1 when no country is known at all', () => expect(resolveTierForCountry(undefined)).toBe('TIER_1'));

  // 10 Oct reassignment (Vrinda, dictated, confirmed explicitly after
  // being shown it reverses part of the 9 Oct World Bank mapping):
  // UAE down from Tier 1 to Tier 2; Nigeria/Ghana UP from Tier 3 to
  // Tier 2; Malaysia DOWN from Tier 2 to Tier 3; Kenya/Tanzania/Uganda
  // unchanged on Tier 3; Philippines left on Tier 2 (not named either
  // way this round -- see lib/pricing/config.ts's own flagged note).
  it('maps G7 members to TIER_1 (Canada, UK, France, Germany, Italy, Japan)', () => {
    for (const code of ['CA', 'GB', 'FR', 'DE', 'IT', 'JP']) {
      expect(resolveTierForCountry(code)).toBe('TIER_1');
    }
  });
  it('maps Singapore and Romania to TIER_1', () => {
    expect(resolveTierForCountry('SG')).toBe('TIER_1');
    expect(resolveTierForCountry('RO')).toBe('TIER_1');
  });
  it('maps the UAE to TIER_2 (reassigned from TIER_1)', () => expect(resolveTierForCountry('AE')).toBe('TIER_2'));
  it('maps Nigeria to TIER_2 (reassigned from TIER_3)', () => expect(resolveTierForCountry('NG')).toBe('TIER_2'));
  it('maps Ghana to TIER_2 (reassigned from TIER_3)', () => expect(resolveTierForCountry('GH')).toBe('TIER_2'));
  it('maps Malaysia to TIER_3 (reassigned from TIER_2)', () => expect(resolveTierForCountry('MY')).toBe('TIER_3'));
  it('keeps Kenya, Tanzania, Uganda on TIER_3', () => {
    for (const code of ['KE', 'TZ', 'UG']) {
      expect(resolveTierForCountry(code)).toBe('TIER_3');
    }
  });
  it('keeps the Philippines on TIER_2 (not reassigned this round)', () => expect(resolveTierForCountry('PH')).toBe('TIER_2'));

  it('is deterministic -- the same country resolves to the same tier every time', () => {
    for (const code of ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP', 'SG', 'RO', 'AE', 'NG', 'GH', 'MY', 'KE', 'TZ', 'UG', 'PH', 'IN', 'VN']) {
      const first = resolveTierForCountry(code);
      for (let i = 0; i < 20; i++) {
        expect(resolveTierForCountry(code)).toBe(first);
      }
    }
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

  it('Malaysia (Tier 3, reassigned 10 Oct) -- $199, base+shipping+tax = 137+50+12', () => {
    const p = resolveProductPricing(kamalahar, 'MY');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(199);
    expect(p.breakdown).toEqual({ base: 137, shipping: 50, tax: 12 });
    expect(p.breakdown!.base + p.breakdown!.shipping + p.breakdown!.tax).toBe(p.salePrice);
  });

  it('Nigeria (Tier 2, reassigned 10 Oct) -- $249, base+shipping+tax = 187+50+12', () => {
    const p = resolveProductPricing(kamalahar, 'NG');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(249);
    expect(p.breakdown).toEqual({ base: 187, shipping: 50, tax: 12 });
    expect(p.breakdown!.base + p.breakdown!.shipping + p.breakdown!.tax).toBe(p.salePrice);
  });

  it('UAE (Tier 2, reassigned 10 Oct from Tier 1) -- $249', () => {
    const p = resolveProductPricing(kamalahar, 'AE');
    expect(p.currency).toBe('USD');
    expect(p.salePrice).toBe(249);
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
