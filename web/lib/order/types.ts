/**
 * Checkout order model (Master Website Upgrade, Section 14).
 *
 * This is the real, buildable part of the payment architecture: an
 * order can genuinely be created today (a customer fills in real
 * shipping/contact details and gets a real order record), while
 * PAYMENT stays an explicit later step — see lib/payment/types.ts and
 * PaymentStatus below. Every price here is looked up server-side from
 * data/products.ts (the single pricing source of truth) at order-
 * creation time; nothing here invents, discounts, or accepts a
 * client-submitted price.
 *
 * Deliberately separate from lib/account/types.ts's `Order`/`Account`
 * shapes: those describe a future signed-in customer-account system
 * (tied to a `customerId`) and remain untouched, unimplemented
 * scaffolding. This is the guest-checkout order created by the flow
 * built in this pass.
 */

import type { CurrencyCode } from '@/data/currencies';

export interface OrderLineItem {
  productId: string;
  slug: string;
  productName: string;
  quantity: number;
  /** Looked up server-side from data/products.ts / lib/pricing/resolve.ts at order-creation time -- never client-supplied. */
  unitPrice: { amount: number; currency: CurrencyCode };
  lineTotal: { amount: number; currency: CurrencyCode };
  /** Present only for a tiered product (today: Kamalahar) -- the pre-discount price and the authoritative discount percent used, from lib/pricing/config.ts (Master Pricing pass, Section 4). */
  regularUnitPrice?: { amount: number; currency: CurrencyCode };
  discountPercent?: number;
  /**
   * Audit trail for a live-currency-converted line (Master Pricing
   * pass, 7 Oct): the tier's own base currency/amount (USD or INR,
   * never converted) and the live USD-based rate applied to produce
   * `unitPrice` above, so a converted order can always be reconciled
   * back to the real tier price it came from. Undefined when the
   * visitor's local currency equals the tier's base currency already
   * (no conversion happened).
   */
  baseAmount?: number;
  baseCurrency?: CurrencyCode;
  fxRate?: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingInfo {
  address: string;
  city: string;
  region: string; // state/province
  postalCode: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
}

/**
 * Order-fulfilment lifecycle -- independent of PaymentStatus (Section
 * 15). An order can be 'created' with payment still 'pending'; the two
 * only move together once a real gateway's webhook confirms payment.
 */
export type OrderStatus = 'created' | 'awaiting_payment' | 'confirmed' | 'fulfilled' | 'cancelled';

/**
 * Payment state (Section 15). 'succeeded' must only ever be set from a
 * server-side gateway verification/webhook (see lib/payment/types.ts,
 * PaymentProvider.verifyWebhook) -- never from a frontend redirect.
 */
export type PaymentStatus = 'not_started' | 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface Order {
  orderId: string;
  customer: CustomerInfo;
  shipping: ShippingInfo;
  items: OrderLineItem[];
  /** Sum of item lineTotals. Server-computed, never client-supplied. */
  subtotal: { amount: number; currency: CurrencyCode };
  /**
   * Undefined until Khatore's real shipping-cost rules exist (Section
   * 10 -- "do not invent shipping costs"). The UI shows "Calculated at
   * a later step" rather than a fabricated $0 or flat fee.
   */
  shippingCost?: { amount: number; currency: CurrencyCode };
  /** Undefined until real tax rules exist -- same reasoning as shippingCost. */
  tax?: { amount: number; currency: CurrencyCode };
  /** subtotal + shippingCost + tax where those are known; otherwise equals subtotal. */
  total: { amount: number; currency: CurrencyCode };
  /**
   * The country that actually determined pricing, and the tier
   * resolved from it, at order-creation time (Master Pricing pass,
   * Section 2: "store the country and pricing tier used when the order
   * was created"). Always set -- every order resolves to a tier, even
   * the default one. Since 9 Oct this is the server's own IP-detected
   * country (app/api/checkout/route.ts), NOT necessarily the same as
   * shipping.country below, which is the customer's typed delivery
   * address and is no longer used for pricing at all.
   */
  country: string;
  pricingTier: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Set once a payment attempt exists against a real configured provider. */
  paymentProviderId?: string;
  /** The gateway's own transaction/order id, once a payment attempt exists. */
  gatewayTransactionId?: string;
  /** The gateway's own reference/receipt id, once available. */
  gatewayReference?: string;
  createdAt: string; // ISO 8601
  /**
   * Backend-only -- Khatore's own operational data, never the charged
   * amount and never returned to the customer's browser. The checkout
   * API route only attaches this to the order object it hands to
   * getConfiguredOrderStore().record() (console/Sheet), never to the
   * Order object in its own JSON response -- so it can't reach
   * sessionStorage or any rendered page. See lib/shipping/indiaShipping.ts.
   */
  internalMeta?: {
    indiaShippingZone?: string;
    indiaShippingCost?: { amount: number; currency: CurrencyCode };
    /** Per-unit base/shipping/tax split for the tier actually charged (Vrinda, 9 Oct) -- see lib/pricing/config.ts's PricingTierDefinition.breakdown. Absent for TIER_4_INDIA, which has no itemized breakdown. */
    tierBreakdown?: { tier: string; currency: CurrencyCode; base: number; shipping: number; tax: number };
  };
}
