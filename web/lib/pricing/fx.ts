/**
 * Live exchange-rate conversion (Master Pricing pass, 7 Oct build,
 * client-confirmed approach: "live exchange-rate conversion" over
 * client-supplied fixed rates). Converts the real, workbook-confirmed
 * tier price into a visitor's local currency using a real, public rate
 * source -- never an invented or guessed conversion factor.
 *
 * Source: open.er-api.com (exchangerate-api.com's free tier, no API
 * key required, updates once daily). Rates are cached in-process for
 * REFRESH_INTERVAL_MS so a page load never waits on a live fetch, and
 * a fetch failure (or the source being unreachable) falls back to the
 * tier's own base currency (USD/INR) rather than guessing a rate or
 * blocking the price from showing at all -- the same "never invent,
 * never silently break" posture as the rest of this pricing system.
 */

const FX_API_URL = 'https://open.er-api.com/v6/latest/USD';
const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12h -- the source itself only updates once a day

interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

let cache: RateCache | null = null;

async function fetchLiveRates(): Promise<Record<string, number>> {
  const res = await fetch(FX_API_URL);
  if (!res.ok) throw new Error(`FX rate source responded ${res.status}`);
  const data = (await res.json()) as { result: string; rates: Record<string, number> };
  if (data.result !== 'success' || !data.rates?.USD) {
    throw new Error('FX rate source returned an unexpected shape');
  }
  return data.rates;
}

/**
 * Returns USD-based rates (1 USD = rates[CUR] units of CUR), cached.
 * Returns null (never throws) when no live rate is available -- the
 * caller must fall back to the base currency rather than guess.
 */
export async function getRates(): Promise<Record<string, number> | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < REFRESH_INTERVAL_MS) {
    return cache.rates;
  }
  try {
    const rates = await fetchLiveRates();
    cache = { rates, fetchedAt: now };
    return rates;
  } catch {
    // A stale cache is still a real, previously-live rate -- better
    // than falling back to the base currency unnecessarily.
    if (cache) return cache.rates;
    return null;
  }
}

/**
 * Pure conversion -- no I/O, fully unit-testable. `rates` is USD-based
 * (1 USD = rates[CUR] units of CUR), matching what getRates() returns.
 */
export function convertAmount(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number | null {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = fromCurrency === 'USD' ? 1 : rates[fromCurrency];
  const toRate = toCurrency === 'USD' ? 1 : rates[toCurrency];
  if (fromRate === undefined || toRate === undefined) return null;
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

/** Client-confirmed rounding rule (7 Oct): nearest whole number -- 199.88 -> 200, in every currency. */
export function roundToWhole(amount: number): number {
  return Math.round(amount);
}
