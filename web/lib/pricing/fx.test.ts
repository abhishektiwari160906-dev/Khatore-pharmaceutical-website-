import { describe, it, expect } from 'vitest';
import { convertAmount, roundToWhole } from './fx';

const SAMPLE_RATES = { USD: 1, GBP: 0.75, INR: 96.5, NGN: 1328 };

describe('convertAmount (pure)', () => {
  it('returns the same amount when converting a currency to itself', () => {
    expect(convertAmount(299, 'USD', 'USD', SAMPLE_RATES)).toBe(299);
  });

  it('converts USD to GBP using the USD-based rate directly', () => {
    expect(convertAmount(100, 'USD', 'GBP', SAMPLE_RATES)).toBeCloseTo(75, 5);
  });

  it('converts a non-USD base currency (INR) to another currency via USD', () => {
    // 12999 INR -> USD -> NGN
    const result = convertAmount(12999, 'INR', 'NGN', SAMPLE_RATES);
    const expectedUsd = 12999 / 96.5;
    expect(result).toBeCloseTo(expectedUsd * 1328, 2);
  });

  it('returns null (never invents a rate) when the target currency is not in the rate table', () => {
    expect(convertAmount(100, 'USD', 'ZZZ', SAMPLE_RATES)).toBeNull();
  });

  it('returns null when the source currency is not in the rate table', () => {
    expect(convertAmount(100, 'ZZZ', 'USD', SAMPLE_RATES)).toBeNull();
  });
});

describe('roundToWhole (pure)', () => {
  it('rounds 199.88 to 200 -- the client-confirmed example (7 Oct)', () => {
    expect(roundToWhole(199.88)).toBe(200);
  });

  it('rounds down when below the midpoint', () => {
    expect(roundToWhole(199.49)).toBe(199);
  });

  it('rounds a large amount (e.g. Naira) the same way', () => {
    expect(roundToWhole(245678.4)).toBe(245678);
    expect(roundToWhole(245678.6)).toBe(245679);
  });
});
