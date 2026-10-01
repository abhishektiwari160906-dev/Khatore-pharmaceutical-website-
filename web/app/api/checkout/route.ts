import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getProductBySlug } from '@/data/products';
import { getConfiguredOrderStore } from '@/lib/order/store';
import { getConfiguredPaymentProvider } from '@/lib/payment/providers';
import { isValidCountryCode } from '@/data/countries';
import { resolveProductPricing, resolveTierForCountry } from '@/lib/pricing/resolve';
import type { CustomerInfo, Order, OrderLineItem, ShippingInfo } from '@/lib/order/types';

export const runtime = 'nodejs';

interface CheckoutRequestBody {
  customer: CustomerInfo;
  shipping: ShippingInfo;
  /** Only slug + quantity -- price is never accepted from the client (Section 9: never trust a frontend-supplied price). */
  items: Array<{ slug: string; quantity: number }>;
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

  return {
    ok: true,
    value: {
      customer: customer as unknown as CustomerInfo,
      shipping: { ...shipping, country: String(shipping.country).toUpperCase() } as unknown as ShippingInfo,
      items: items as CheckoutRequestBody['items'],
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
  const { customer, shipping, items } = validated.value;

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
    const pricing = resolveProductPricing(product, shipping.country);
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

  const paymentProvider = getConfiguredPaymentProvider();

  const order: Order = {
    orderId: `KH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    customer,
    shipping,
    items: lineItems,
    subtotal,
    // shippingCost/tax intentionally omitted beyond what's already
    // folded into a tiered line's price (Section 10 -- "do not invent
    // shipping costs"); no separate rules exist for the untiered catalogue.
    total: subtotal,
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

  return NextResponse.json({ order }, { status: 201 });
}
