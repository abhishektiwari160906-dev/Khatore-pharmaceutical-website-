import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getProductBySlug } from '@/data/products';
import { getConfiguredOrderStore } from '@/lib/order/store';
import { getConfiguredPaymentProvider, getPaymentProviderById } from '@/lib/payment/providers';
import type { PaymentProviderId, PaymentSessionResult } from '@/lib/payment/types';
import { isValidCountryCode } from '@/data/countries';
import { resolveLocalCurrencyPricing, resolveTierForCountry } from '@/lib/pricing/resolve';
import { getTier } from '@/lib/pricing/config';
import { getRates, convertAmount, roundToWhole } from '@/lib/pricing/fx';
import type { CustomerInfo, Order, OrderLineItem, ShippingInfo } from '@/lib/order/types';

export const runtime = 'nodejs';

const PAYABLE_PROVIDER_IDS: readonly PaymentProviderId[] = ['payu', 'paypal', 'razorpay'];

interface CheckoutRequestBody {
  customer: CustomerInfo;
  shipping: ShippingInfo;
  /** Only slug + quantity -- price is never accepted from the client (Section 9: never trust a frontend-supplied price). */
  items: Array<{ slug: string; quantity: number }>;
  /** Which gateway the customer picked at checkout, if any -- optional so the order-creation path keeps working even with no payment method selected (e.g. no provider configured for the resolved currency yet). */
  paymentMethod?: PaymentProviderId;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateBody(body: unknown): { ok: true; value: CheckoutRequestBody } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'invalid body' };
  const b = body as Record<string, unknown>;

  const customer = b.customer as Record<string, unknown> | undefined;
  if (
    !customer ||
    !isNonEmptyString(customer.fullName) ||
    !isNonEmptyString(customer.email) ||
    !customer.email.includes('@') ||
    !isNonEmptyString(customer.phone)
  ) {
    return { ok: false, error: 'missing or invalid customer details' };
  }

  const shipping = b.shipping as Record<string, unknown> | undefined;
  if (
    !shipping ||
    !isNonEmptyString(shipping.address) ||
    !isNonEmptyString(shipping.city) ||
    !isNonEmptyString(shipping.region) ||
    !isNonEmptyString(shipping.postalCode) ||
    !isNonEmptyString(shipping.country)
  ) {
    return { ok: false, error: 'missing or invalid shipping details' };
  }
  // The submitted country drives server-side pricing-tier resolution
  // below (Master Pricing pass, Section 13: "the selected checkout
  // country must be validated server-side") -- an unrecognised code is
  // rejected outright rather than silently falling back to a tier, so a
  // client can't smuggle pricing data through a bogus country string.
  if (!isValidCountryCode(String(shipping.country).toUpperCase())) {
    return { ok: false, error: 'unrecognised shipping country' };
  }

  const items = b.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'cart is empty' };
  }
  for (const item of items) {
    if (typeof item !== 'object' || item === null) return { ok: false, error: 'invalid item' };
    const i = item as Record<string, unknown>;
    if (!isNonEmptyString(i.slug) || typeof i.quantity !== 'number' || !Number.isInteger(i.quantity) || i.quantity < 1) {
      return { ok: false, error: 'invalid item' };
    }
  }

  const paymentMethod = b.paymentMethod;
  if (paymentMethod !== undefined && !PAYABLE_PROVIDER_IDS.includes(paymentMethod as PaymentProviderId)) {
    return { ok: false, error: 'unrecognised payment method' };
  }

  return {
    ok: true,
    value: {
      customer: customer as unknown as CustomerInfo,
      shipping: { ...shipping, country: String(shipping.country).toUpperCase() } as unknown as ShippingInfo,
      items: items as CheckoutRequestBody['items'],
      paymentMethod: paymentMethod as PaymentProviderId | undefined,
    },
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const validated = validateBody(rawBody);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { customer, shipping, items, paymentMethod } = validated.value;

  // Price every line server-side from the single pricing source of
  // truth -- lib/pricing/resolve.ts, which resolves the VALIDATED
  // shipping country to a tier and only then to a price (Master Pricing
  // pass, Section 2/14). The request's own quantities are trusted, its
  // prices never are -- CheckoutRequestBody has no price field at all,
  // so there is nothing for a tampered request body to override here.
  // A line for a product with no approved price, or an unknown slug,
  // fails the whole order rather than silently omitting or inventing a
  // price for it.
  const lineItems: OrderLineItem[] = [];
  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) {
      return NextResponse.json({ error: `unknown product: ${item.slug}` }, { status: 400 });
    }
    if (!product.price) {
      return NextResponse.json(
        { error: `${product.name} has no approved price yet and cannot be checked out online` },
        { status: 422 },
      );
    }
    const pricing = await resolveLocalCurrencyPricing(product, shipping.country);
    const unitPrice = { amount: pricing.salePrice, currency: pricing.currency };
    lineItems.push({
      productId: product.productId,
      slug: product.slug,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: { amount: unitPrice.amount * item.quantity, currency: unitPrice.currency },
      ...(pricing.isTiered
        ? {
            regularUnitPrice: { amount: pricing.regularPrice, currency: pricing.currency },
            discountPercent: pricing.discountPercent,
          }
        : {}),
      // Audit trail for a live-currency-converted line -- see
      // lib/pricing/resolve.ts's resolveLocalCurrencyPricing(). Undefined
      // when no conversion happened (base currency already matched).
      ...(pricing.baseAmount !== undefined
        ? { baseAmount: pricing.baseAmount, baseCurrency: pricing.baseCurrency, fxRate: pricing.fxRate }
        : {}),
    });
  }

  // Every line must share one currency to produce a real total -- never
  // a summed-across-currencies number (same reasoning as the cart's own
  // subtotal, lib/cart/CartContext.tsx). With today's catalogue this can
  // only happen if a non-India cart pairs a non-Kamalahar USD product
  // with an India-tier (INR) Kamalahar line.
  const currencies = new Set(lineItems.map((l) => l.lineTotal.currency));
  if (currencies.size > 1) {
    return NextResponse.json(
      { error: 'This order mixes products priced in different currencies for your country — please place separate orders, or contact Khatore directly.' },
      { status: 422 },
    );
  }
  const orderCurrency = lineItems[0]!.lineTotal.currency;
  const subtotalAmount = lineItems.reduce((sum, l) => sum + l.lineTotal.amount, 0);
  const subtotal = { amount: subtotalAmount, currency: orderCurrency };
  const pricingTier = resolveTierForCountry(shipping.country);

  // Separate shipping/tax line items (client decision, 9 Oct: $50
  // shipping + $15 tax, added on top of the product price, for the two
  // international USD tiers only -- TIER_3_INDIA keeps its existing
  // all-inclusive pricing untouched). The tier's own fees are defined
  // in its base currency (USD); converted to orderCurrency the same
  // way resolveLocalCurrencyPricing() converts the product price
  // itself, so the two always end up in one consistent currency. If a
  // local conversion was needed for the product price, a live rate was
  // necessarily available then too (resolveLocalCurrencyPricing falls
  // back to the base currency entirely when no rate is available), so
  // this conversion can't land on a currency mismatch here.
  const tierDef = getTier(pricingTier);
  let shippingCost: { amount: number; currency: string } | undefined;
  let tax: { amount: number; currency: string } | undefined;
  if (tierDef.shippingCostBase !== undefined || tierDef.taxBase !== undefined) {
    const needsConversion = orderCurrency !== tierDef.currency;
    const rates = needsConversion ? await getRates() : null;
    const convert = (baseAmount: number) => {
      if (!needsConversion) return baseAmount;
      if (!rates) return null;
      const converted = convertAmount(baseAmount, tierDef.currency, orderCurrency, rates);
      return converted === null ? null : roundToWhole(converted);
    };
    if (tierDef.shippingCostBase !== undefined) {
      const amount = convert(tierDef.shippingCostBase);
      if (amount !== null) shippingCost = { amount, currency: orderCurrency };
    }
    if (tierDef.taxBase !== undefined) {
      const amount = convert(tierDef.taxBase);
      if (amount !== null) tax = { amount, currency: orderCurrency };
    }
  }
  const totalAmount = subtotalAmount + (shippingCost?.amount ?? 0) + (tax?.amount ?? 0);
  const total = { amount: totalAmount, currency: orderCurrency };

  // The provider used to STAMP the order (which gateway, if any, is
  // generally active) is separate from the one actually used to CREATE
  // the payment session below (the customer's chosen method) -- with
  // PayU + PayPal both potentially configured at once (client decision,
  // 8 Oct), "the" provider is no longer a single global answer.
  const paymentProvider = getConfiguredPaymentProvider();

  const order: Order = {
    orderId: `KH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    customer,
    shipping,
    items: lineItems,
    subtotal,
    ...(shippingCost ? { shippingCost } : {}),
    ...(tax ? { tax } : {}),
    total,
    country: shipping.country,
    pricingTier,
    status: 'created',
    paymentStatus: 'not_started',
    paymentProviderId: paymentProvider.isConfigured ? paymentProvider.id : undefined,
    createdAt: new Date().toISOString(),
  };

  try {
    await getConfiguredOrderStore().record(order);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('order store failure', err);
    return NextResponse.json({ error: 'failed to record order' }, { status: 502 });
  }

  // The order is already real and recorded at this point regardless of
  // what happens below -- a payment-session failure must never lose the
  // order itself (Section: never fail the whole checkout over a gateway
  // hiccup). If no method was chosen, or the chosen gateway isn't
  // configured, or session creation throws, the client falls back to
  // the existing "order placed, Khatore will follow up" path.
  let paymentSession: PaymentSessionResult | undefined;
  if (paymentMethod) {
    const provider = getPaymentProviderById(paymentMethod);
    if (!provider) {
      paymentSession = { available: false, reason: `${paymentMethod} is not configured yet.` };
    } else {
      const origin = new URL(request.url).origin;
      try {
        // PayU (Vrinda, 9 Oct decision): offered as a second option for
        // export countries too, but this merchant account is INR-only
        // (PayU's classic hosted-checkout hash has no currency field at
        // all -- international/multi-currency acquiring is a separate,
        // bank-approved add-on this account doesn't have). So a non-India
        // customer choosing PayU is charged in INR, converted from the
        // order's own currency via the same live-FX path already used
        // for local-currency pricing -- never silently charged in the
        // wrong currency, and never silently left as an un-payable USD
        // amount PayU's classic endpoint can't actually process.
        let paymentAmount = order.total;
        if (paymentMethod === 'payu' && order.total.currency !== 'INR') {
          const rates = await getRates();
          const converted = rates ? convertAmount(order.total.amount, order.total.currency, 'INR', rates) : null;
          if (converted === null) {
            paymentSession = {
              available: false,
              reason: 'Could not convert this order to INR for PayU right now -- please try again, or choose PayPal.',
            };
          } else {
            paymentAmount = { amount: roundToWhole(converted), currency: 'INR' };
          }
        }
        if (!paymentSession) {
          paymentSession = await provider.createSession({
            orderId: order.orderId,
            amount: paymentAmount,
            customerName: customer.fullName,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            successUrl: `${origin}/api/payments/return`,
            failureUrl: `${origin}/api/payments/return`,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('payment session creation failed', { orderId: order.orderId, paymentMethod, err });
        paymentSession = {
          available: false,
          reason: 'Could not start the payment session -- please try again, or contact Khatore to complete payment.',
        };
      }
    }
  }

  return NextResponse.json({ order, paymentSession }, { status: 201 });
}
