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
    // $249, not $299/$199 -- Nigeria has moved tiers twice now: Tier 1
    // -> Tier 3 (9 Oct, World Bank) -> Tier 2 (10 Oct, latest explicit
    // instruction). The USD-fallback behavior under test here is
    // unaffected by which tier it's falling back to.
    expect(pricing.salePrice).toBe(249);
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
    // $249, not $299 -- UAE reassigned Tier 1 -> Tier 2 on 10 Oct.
    expect(pricing.salePrice).toBe(249);
  });
});

describe('resolveDisplayEstimate (Vrinda, 9 Oct -- "$199 USD (≈ local)", display only)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('gives a NGN estimate for Nigeria (charge stays USD -- GATEWAY_UNSUPPORTED_CURRENCIES)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }));
    const { resolveDisplayEstimate } = await import('./resolve');

    // 249, not 199 -- Nigeria is Tier 2 as of the 10 Oct reassignment.
    const estimate = await resolveDisplayEstimate(249, 'NG');
    expect(estimate).not.toBeNull();
    expect(estimate!.currency).toBe('NGN');
    // 249 USD * 1328.1 -> 330,696.9 -> rounds to 330697
    expect(estimate!.amount).toBe(330697);
  });

  it('is null for the UK -- GBP is ALREADY the real charged currency there, not an estimate to show alongside it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => FAKE_RATES_RESPONSE }));
    const { resolveDisplayEstimate } = await import('./resolve');

    expect(await resolveDisplayEstimate(299, 'GB')).toBeNull();
  });

  it('is null for the US -- local currency already equals the base, nothing to estimate', async () => {
    const { resolveDisplayEstimate } = await import('./resolve');
    expect(await resolveDisplayEstimate(299, 'US')).toBeNull();
  });

  it('is null for India -- the ₹12,999 display needs no conversion', async () => {
    const { resolveDisplayEstimate } = await import('./resolve');
    expect(await resolveDisplayEstimate(12999, 'IN')).toBeNull();
  });

  it('is null for a country with no known local currency -- never guesses one (Vietnam: used as a spoken test example, but has no currency mapping at all, same as its tier)', async () => {
    const { resolveDisplayEstimate } = await import('./resolve');
    expect(await resolveDisplayEstimate(299, 'VN')).toBeNull();
  });

  it('is null (never invented) when the live rate source is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const { resolveDisplayEstimate } = await import('./resolve');

    expect(await resolveDisplayEstimate(249, 'NG')).toBeNull();
  });
});
