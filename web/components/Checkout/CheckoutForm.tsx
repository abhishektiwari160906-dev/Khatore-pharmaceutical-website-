'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/Cart/CartContext';
import { trackEvent } from '@/lib/events/client';
import { formatMoney } from '@/components/Pricing/PriceTag';
import { COUNTRIES } from '@/data/countries';
import { resolveTierForCountry } from '@/lib/pricing/resolve';
import { getTier } from '@/lib/pricing/config';
import type { Order } from '@/lib/order/types';
import type { PaymentProviderId, PaymentSessionResult } from '@/lib/payment/types';
import styles from './CheckoutForm.module.css';

const LAST_ORDER_KEY = 'khatore_last_order';

/**
 * Picks which gateway to attempt, from the shipping COUNTRY actually
 * selected in this form -- not the cart's `subtotal.currency`, which
 * is resolved once at add-to-cart time (geo-guess or whatever country
 * was selected on an earlier visit) and can silently go stale by the
 * time this form is submitted with a different country. The server
 * (app/api/checkout/route.ts) resolves the order's real currency from
 * this exact same field, so matching it here is what keeps the
 * displayed/submitted method from ever being one the server would
 * reject. Only India (lib/pricing/config.ts's COUNTRY_TIER_MAP) prices
 * in INR -- every other country's order, including the locally
 * converted ones (lib/pricing/resolve.ts), prices in whatever currency
 * PayPal's Orders v2 API itself accepts, which also covers
 * "International Cards" via its own guest card checkout.
 */
function paymentMethodForCountry(countryCode: string): { id: PaymentProviderId; label: string } {
  if (countryCode === 'IN') {
    return { id: 'payu', label: 'UPI, Card or Net Banking (via PayU)' };
  }
  return { id: 'paypal', label: 'PayPal or International Card' };
}

/**
 * Real checkout: collects real customer/shipping details, creates a
 * real Order (server-priced from data/products.ts, Section 9's pricing
 * safety rule), and -- once a gateway is actually configured -- takes
 * the customer straight to pay: PayU's hosted page (UPI/cards/net
 * banking) for INR orders, PayPal (incl. guest card checkout) for
 * everything else. Until real gateway credentials exist, createSession
 * reports `available: false` and this falls back to the original
 * "order recorded, Khatore follows up" path -- never a dead end
 * either way (Section: never fail the whole checkout over a gateway gap).
 */
export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState('');
  const startedRef = useRef(false);
  const payUFormRef = useRef<HTMLFormElement>(null);
  const [payUSubmit, setPayUSubmit] = useState<{ action: string; fields: Record<string, string> } | null>(null);

  useEffect(() => {
    if (items.length === 0 || startedRef.current) return;
    startedRef.current = true;
    trackEvent('checkout_started', { metadata: { item_count: items.reduce((n, i) => n + i.quantity, 0) } });
  }, [items]);

  const paymentMethod = country ? paymentMethodForCountry(country) : null;

  // Preview-only (app/api/checkout/route.ts computes and converts the
  // authoritative figures server-side, same source data) -- shown in
  // the tier's own base currency (USD) rather than the visitor's
  // locally-converted display currency, since that conversion needs a
  // live rate fetch this preview doesn't do. Close enough for the vast
  // majority of orders (US itself is already USD), and the note below
  // already says final pricing is confirmed server-side.
  const feesPreview = country ? getTier(resolveTierForCountry(country)) : null;

  useEffect(() => {
    // Fires once payUSubmit is set and the hidden form below has
    // actually rendered with those field values -- a real browser form
    // POST (full navigation to PayU), never a fetch/XHR, because that's
    // what PayU's flow requires.
    if (payUSubmit && payUFormRef.current) {
      payUFormRef.current.submit();
    }
  }, [payUSubmit]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const body = {
      customer: {
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
      },
      shipping: {
        address: String(form.get('address') ?? ''),
        city: String(form.get('city') ?? ''),
        region: String(form.get('region') ?? ''),
        postalCode: String(form.get('postalCode') ?? ''),
        country: String(form.get('country') ?? ''),
      },
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      paymentMethod: paymentMethod?.id,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { order?: Order; paymentSession?: PaymentSessionResult; error?: string };
      if (!res.ok || !data.order) {
        setError(data.error ?? 'Something went wrong creating your order — please try again.');
        setSubmitting(false);
        return;
      }

      trackEvent('order_placed', {
        metadata: { order_id: data.order.orderId, item_count: items.reduce((n, i) => n + i.quantity, 0) },
      });

      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data.order));
      } catch {
        // sessionStorage can be unavailable (private browsing) -- the
        // order was still created and recorded server-side either way.
      }
      clearCart();

      const session = data.paymentSession;
      if (session?.available && session.formAction && session.formFields) {
        // PayU: render the hidden form (below) with these exact fields,
        // then the effect above submits it -- leaves the site entirely
        // for PayU's hosted page. The order is already saved in
        // sessionStorage above, so order-confirmation can still show it
        // once PayU redirects back.
        setPayUSubmit({ action: session.formAction, fields: session.formFields });
        return;
      }
      if (session?.available && session.redirectUrl) {
        // PayPal: full navigation to their approval page.
        window.location.href = session.redirectUrl;
        return;
      }

      // No gateway available for this order (not configured yet, or the
      // session call failed) -- never a dead end, fall back to the
      // original "order recorded, Khatore follows up" path.
      router.push('/order-confirmation');
    } catch {
      setError('Something went wrong creating your order — please try again.');
      setSubmitting(false);
    }
  }

  // clearCart() above fires as soon as the order is created -- before
  // the PayU branch's own render even happens, since that branch needs
  // a SUBSEQUENT render (the hidden form below, then the effect that
  // submits it) rather than an immediate `window.location` navigation
  // like the PayPal branch. Without the `payUSubmit` escape hatch here,
  // the empty cart would hit this early return on that very next
  // render and the hidden form/effect would never run at all -- found
  // live on the Vercel deployment (checkout API succeeded, PayU
  // formAction/hash were correct, but the browser never navigated).
  if (items.length === 0 && !payUSubmit) {
    return (
      <div className={styles.empty}>
        <p>Your cart is empty — add a product before checking out.</p>
        <Link href="/products" className={styles.emptyLink}>
          Explore Products →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span>Full name</span>
              <input className={styles.input} type="text" name="fullName" required autoComplete="name" />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input className={styles.input} type="email" name="email" required autoComplete="email" />
            </label>
          </div>
          <label className={styles.field}>
            <span>Phone</span>
            <input className={styles.input} type="tel" name="phone" required autoComplete="tel" />
          </label>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping Address</h2>
          <label className={styles.field}>
            <span>Address</span>
            <input className={styles.input} type="text" name="address" required autoComplete="street-address" />
          </label>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span>City</span>
              <input className={styles.input} type="text" name="city" required autoComplete="address-level2" />
            </label>
            <label className={styles.field}>
              <span>State / Province</span>
              <input className={styles.input} type="text" name="region" required autoComplete="address-level1" />
            </label>
          </div>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span>Postal code</span>
              <input className={styles.input} type="text" name="postalCode" required autoComplete="postal-code" />
            </label>
            <label className={styles.field}>
              <span>Country</span>
              <select
                className={styles.input}
                name="country"
                required
                autoComplete="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="" disabled>
                  Select your country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <p className={styles.paymentNote}>
          {paymentMethod
            ? `You'll pay by ${paymentMethod.label} on the next step. If that's not available right now, Khatore will contact you directly (via WhatsApp or email) to complete payment.`
            : "Placing this order creates your order with Khatore. Khatore will contact you directly (via WhatsApp or email) to confirm final pricing and complete payment."}
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Processing…' : paymentMethod ? `Pay with ${paymentMethod.label}` : 'Place Order'}
        </button>
      </form>

      {/* Never submitted via fetch/XHR -- PayU's hosted checkout requires
          a real browser form POST. Rendered hidden and auto-submitted
          (see the effect above) only once a PayU session is created. */}
      {payUSubmit ? (
        <form ref={payUFormRef} action={payUSubmit.action} method="POST" hidden aria-hidden="true">
          {Object.entries(payUSubmit.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      ) : null}

      <aside className={styles.summary}>
        <h2 className={styles.summaryTitle}>Order Summary</h2>
        <ul className={styles.summaryItems}>
          {items.map((item) => (
            <li key={item.productId} className={styles.summaryItem}>
              <div className={styles.summaryImg}>
                <Image src={item.image} alt={item.name} width={56} height={56} />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryName}>{item.name}</span>
                <span className={styles.summaryQty}>Qty {item.quantity}</span>
                {item.discountPercent ? (
                  <span className={styles.summaryDiscount}>{Math.round(item.discountPercent)}% off</span>
                ) : null}
              </div>
              <span className={styles.summaryPrice}>
                {item.price ? (
                  <>
                    {item.regularPrice && item.regularPrice > item.price.amount ? (
                      <span className={styles.summaryPriceRegular}>
                        {formatMoney(item.regularPrice * item.quantity, item.price.currency)}
                      </span>
                    ) : null}
                    {formatMoney(item.price.amount * item.quantity, item.price.currency)}
                  </>
                ) : (
                  'Contact for pricing'
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{subtotal === null ? 'Contact for pricing' : formatMoney(subtotal.amount, subtotal.currency)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          {feesPreview?.shippingCostBase !== undefined ? (
            <span>{formatMoney(feesPreview.shippingCostBase, feesPreview.currency)}</span>
          ) : (
            <span className={styles.summaryMuted}>
              {/* Once a country is selected, its own resolved tier is the source of truth
                  (feesPreview.shippingIncluded) -- not the cart items' flags, which were set
                  at add-to-cart time under whatever tier applied then and can be stale by now
                  (the same staleness this file's payment-method fix already addresses). Only
                  falls back to the items' own flags before any country is chosen. */}
              {feesPreview ? (feesPreview.shippingIncluded ? 'Included in price' : 'Calculated separately')
                : items.every((i) => i.shippingIncluded) ? 'Included in price' : 'Calculated separately'}
            </span>
          )}
        </div>
        <div className={styles.summaryRow}>
          <span>Tax</span>
          {feesPreview?.taxBase !== undefined ? (
            <span>{formatMoney(feesPreview.taxBase, feesPreview.currency)}</span>
          ) : (
            <span className={styles.summaryMuted}>
              {feesPreview ? (feesPreview.taxIncluded ? 'Included in price' : 'Calculated separately')
                : items.every((i) => i.taxIncluded) ? 'Included in price' : 'Calculated separately'}
            </span>
          )}
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>Total</span>
          <span>
            {subtotal === null
              ? 'Contact for pricing'
              : formatMoney(
                  subtotal.amount + (feesPreview?.shippingCostBase ?? 0) + (feesPreview?.taxBase ?? 0),
                  feesPreview?.shippingCostBase !== undefined ? feesPreview.currency : subtotal.currency,
                )}
          </span>
        </div>
        <p className={styles.countryNote}>
          Final pricing is confirmed server-side for the country you select above.
        </p>
        <p className={styles.refundNote}>
          *Refunds are available only before your order is dispatched. Once dispatched, the order cannot be refunded.
        </p>
      </aside>
    </div>
  );
}
