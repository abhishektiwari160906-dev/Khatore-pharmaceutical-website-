import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProductBySlug } from '@/data/products';

const kamalahar = getProductBySlug('kamalahar')!;

const FAKE_RATES_RESPONSE = {
  result: 'success',
  rates: { USD: 1, GBP: 0.754, INR: 96.47, NGN: 1328.1 },
};

describe('resolveLocalCurrencyPricing', () => {
  beforeEach(() => {
    vi.resetModules(); // fresh fx.ts cache per test
    vi.unstubAllGlobals();
  });

  it('converts a Tier 1 (USD) price into the visitor local currency (GBP, UK)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }),
    );
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'GB');
    expect(pricing.currency).toBe('GBP');
    // 299 USD -> GBP at 0.754 -> 225.446 -> rounds to 225
    expect(pricing.salePrice).toBe(225);
    expect(pricing.baseCurrency).toBe('USD');
    expect(pricing.baseAmount).toBe(299);
    expect(pricing.fxRate).toBeCloseTo(0.754, 3);
  });

  it('falls back to the base currency when the live rate source is unreachable -- never invents a rate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'GB');
    expect(pricing.currency).toBe('USD'); // unchanged base tier currency
    expect(pricing.salePrice).toBe(299);
    expect(pricing.baseAmount).toBeUndefined(); // no conversion happened at all
  });

  it('does not convert when the country is not in the explicit currency allow-list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }),
    );
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'JP'); // Japan -- not configured
    expect(pricing.currency).toBe('USD'); // Tier 1 fallback, no JPY conversion invented
    expect(pricing.baseAmount).toBeUndefined();
  });

  it('does not convert (and does not fetch) when India already matches its own tier currency', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE });
    vi.stubGlobal('fetch', fetchMock);
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'IN');
    expect(pricing.currency).toBe('INR');
    expect(pricing.salePrice).toBe(12999); // unchanged -- already INR, no conversion needed
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the base currency (USD), not NGN, for Nigeria -- neither gateway can charge NGN (client decision, 8 Oct)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }),
    );
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'NG');
    expect(pricing.currency).toBe('USD');
    // $199, not $299 -- Nigeria was reassigned Tier 1 -> Tier 3 on 9 Oct
    // (World Bank income classification); the USD-fallback behavior
    // under test here is unaffected by which tier it's falling back to.
    expect(pricing.salePrice).toBe(199);
    expect(pricing.baseAmount).toBeUndefined(); // no conversion attempted at all
  });

  it('shows the base currency (USD), not AED, for the UAE -- same fallback as Nigeria', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }),
    );
    const { resolveLocalCurrencyPricing } = await import('./resolve');

    const pricing = await resolveLocalCurrencyPricing(kamalahar, 'AE');
    expect(pricing.currency).toBe('USD');
    expect(pricing.salePrice).toBe(299);
  });
});
