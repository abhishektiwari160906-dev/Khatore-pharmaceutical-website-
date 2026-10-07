/**
 * ISO 4217 currency code. Deliberately `string`, not an exhaustive
 * union of the 16 currencies below -- every consumer (formatMoney,
 * CartItem, Order, PaymentSessionRequest, ...) already degrades
 * gracefully for an unrecognised code (getCurrencySymbol falls back to
 * printing the code itself), so a union would only need updating in
 * lockstep here every time a new country/currency is added, for no
 * real added safety.
 */
export type CurrencyCode = string;

/**
 * ISO 4217 currency for each explicitly-configured pricing-tier country
 * (Master Pricing pass, 7 Oct local-currency build). Same explicit
 * allow-list philosophy as lib/pricing/config.ts's COUNTRY_TIER_MAP --
 * only the countries the client actually named get a local currency;
 * nothing is inferred for a country not in this list.
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  DE: 'EUR',
  SG: 'SGD',
  AE: 'AED',
  NG: 'NGN',
  GH: 'GHS',
  RO: 'RON',
  MY: 'MYR',
  PH: 'PHP',
  KE: 'KES',
  UG: 'UGX',
  TZ: 'TZS',
  IN: 'INR',
};

/** Display symbol/prefix for each currency this app can show. Used instead of a generic currency-code prefix so prices read naturally (£299, not GBP299). */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  EUR: '€',
  SGD: 'S$',
  AED: 'AED ',
  NGN: '₦',
  GHS: 'GH₵',
  RON: 'RON ',
  MYR: 'RM',
  PHP: '₱',
  KES: 'KSh ',
  UGX: 'USh ',
  TZS: 'TSh ',
  INR: '₹',
};

export function getCurrencyForCountry(countryCode: string): string | undefined {
  return COUNTRY_CURRENCY_MAP[countryCode.trim().toUpperCase()];
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? `${currency} `;
}
