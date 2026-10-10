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
 * (Master Pricing pass, 7 Oct local-currency build; extended 10 Oct to
 * all 57 countries in Vrinda's real order-data tier sheet). Same
 * explicit allow-list philosophy as lib/pricing/config.ts's
 * COUNTRY_TIER_MAP -- only a country actually named (here, by that
 * sheet) gets a local currency; nothing is inferred for a country not
 * in this list. Unlike the tier assignment itself, this file is pure
 * ISO 4217 fact (which currency a country uses), not a business
 * decision -- filled in directly for every one of the 57 so the
 * local-currency display line (Vrinda, 9-10 Oct: "has to be shown...
 * for every IP address she tests") actually covers the full list.
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Tier 1
  US: 'USD',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  AE: 'AED',
  SG: 'SGD',
  DE: 'EUR',
  ES: 'EUR',
  SE: 'SEK',
  NL: 'EUR',
  NZ: 'NZD',
  KR: 'KRW',
  BE: 'EUR',
  JP: 'JPY',
  FI: 'EUR',
  IE: 'EUR',
  NO: 'NOK',
  KW: 'KWD',
  MT: 'EUR',
  HK: 'HKD',
  // Tier 2
  GH: 'GHS',
  NG: 'NGN',
  MY: 'MYR',
  RO: 'RON',
  NA: 'NAD',
  TR: 'TRY',
  EE: 'EUR',
  HU: 'HUF',
  AL: 'ALL',
  CN: 'CNY',
  TH: 'THB',
  ZA: 'ZAR',
  AR: 'ARS',
  RU: 'RUB',
  // Tier 3
  PH: 'PHP',
  KE: 'KES',
  TZ: 'TZS',
  LK: 'LKR',
  UG: 'UGX',
  JO: 'JOD',
  CM: 'XAF',
  PG: 'PGK',
  ZW: 'ZWL',
  LR: 'LRD',
  KH: 'KHR',
  ID: 'IDR',
  MW: 'MWK',
  SD: 'SDG',
  IR: 'IRR',
  CD: 'CDF',
  RW: 'RWF',
  SO: 'SOS',
  AO: 'AOA',
  ZM: 'ZMW',
  PK: 'PKR',
  LA: 'LAK',
  // Tier 4
  IN: 'INR',
};

/** Display symbol/prefix for each currency this app can show. Used instead of a generic currency-code prefix so prices read naturally (£299, not GBP299). Any currency not listed here falls back to printing its own code (getCurrencySymbol below) -- a safe default, not a missing feature. */
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
  NZD: 'NZ$',
  JPY: '¥',
  HKD: 'HK$',
  CNY: '¥',
  THB: '฿',
  ZAR: 'R',
  TRY: '₺',
  RUB: '₽',
  LKR: 'Rs ',
  IDR: 'Rp ',
  PKR: 'Rs ',
  KRW: '₩',
  SEK: 'kr ',
  NOK: 'kr ',
};

/**
 * Currencies with no path to actually being charged today -- checked
 * against PayPal's and Razorpay's own published currency-support lists
 * (8 Oct), documented in PRICING_DECISIONS_PENDING.md. INR is NOT in
 * this list: Razorpay (lib/payment/razorpay.ts) charges INR natively,
 * so India already has a working gateway and is unaffected.
 *
 * Client decision (8 Oct): for a visitor whose local currency is in
 * this list, show the tier's own base currency (USD) instead of
 * converting to a currency neither gateway can actually charge --
 * never show a price the visitor could not pay in.
 *
 * 10 Oct: every currency newly added for the 57-country real-data tier
 * sheet is included here too, DELIBERATELY, even ones likely actually
 * supported by PayPal (JPY, SEK, NOK, HKD, HUF, THB, NZD are probably
 * fine going by PayPal's public currency list from memory) -- "probably
 * fine from memory" is exactly the kind of unverified claim this build
 * has repeatedly refused to ship as a real charge. These show the live
 * local-currency ESTIMATE (safe, display-only) but charge in USD until
 * each is actually checked against a live PayPal/PayU call, the same
 * way GBP/CAD/AUD/EUR/SGD/MYR/PHP were individually verified on 8 Oct
 * before being trusted to charge for real.
 */
export const GATEWAY_UNSUPPORTED_CURRENCIES: readonly string[] = [
  'AED',
  'NGN',
  'GHS',
  'RON',
  'KES',
  'UGX',
  'TZS',
  'SEK',
  'NZD',
  'KRW',
  'JPY',
  'NOK',
  'KWD',
  'HKD',
  'NAD',
  'TRY',
  'HUF',
  'ALL',
  'CNY',
  'THB',
  'ZAR',
  'ARS',
  'RUB',
  'LKR',
  'JOD',
  'XAF',
  'PGK',
  'ZWL',
  'LRD',
  'KHR',
  'IDR',
  'MWK',
  'SDG',
  'IRR',
  'CDF',
  'RWF',
  'SOS',
  'AOA',
  'ZMW',
  'PKR',
  'LAK',
];

export function getCurrencyForCountry(countryCode: string): string | undefined {
  return COUNTRY_CURRENCY_MAP[countryCode.trim().toUpperCase()];
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? `${currency} `;
}
