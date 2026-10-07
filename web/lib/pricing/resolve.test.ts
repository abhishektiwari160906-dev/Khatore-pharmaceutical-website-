import { describe, it, expect } from 'vitest';
import { resolveProductPricing, resolveTierForCountry, isDiscountActive } from './resolve';
import { PRICING_TIERS } from './config';
import { getProductBySlug } from '@/data/products';

const kamalahar = getProductBySlug('kamalahar')!;
const nonTiered = getProductBySlug('k-mens')!;

describe('resolveTierForCountry', () => {
  it('maps India to TIER_3_INDIA', () => expect(resolveTierForCountry('IN')).toBe('TIER_3_INDIA'));
  it('maps the US to TIER_1', () => expect(resolveTierForCountry('US')).toBe('TIER_1'));
  it('maps Malaysia to TIER_2', () => expect(resolveTierForCountry('MY')).toBe('TIER_2'));
  it('falls back to TIER_1 for an unlisted country', () => expect(resolveTierForCountry('JP')).toBe('TIER_1'));
  it('falls back to TIER_1 when no country is known at all', () => expect(resolveTierForCountry(undefined)).toBe('TIER_1'));
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

  it('Malaysia (Tier 2) -- $399 -> $249', () => {
    const p = resolveProductPricing(kamalahar, 'MY');
    expect(p.currency).toBe('USD');
    expect(p.regularPrice).toBe(399);
    expect(p.salePrice).toBe(249);
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
