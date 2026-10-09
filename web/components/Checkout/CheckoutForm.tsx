'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/Cart/CartContext';
import { trackEvent } from '@/lib/events/client';
import { formatMoney } from '@/components/Pricing/PriceTag';
import { COUNTRIES } from '@/data/countries';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { CONTACT } from '@/lib/config';
import { UPI_ID, UPI_PAYEE_LABEL } from '@/lib/payment/upiConfig';
import type { Order } from '@/lib/order/types';
import type { PaymentProviderId, PaymentSessionResult } from '@/lib/payment/types';
import styles from './CheckoutForm.module.css';

const LAST_ORDER_KEY = 'khatore_last_order';

/**
 * 'manual_upi' is NOT a real gateway (no PaymentProvider/webhook exists
 * for it, lib/payment/types.ts) -- it's a client-side-only option: the
 * order is created with no paymentMethod sent to the server at all, and
 * payment itself happens outside this site entirely (customer scans the
 * QR, then confirms via WhatsApp). Kept as a separate union member
 * rather than folded into PaymentProviderId so the server-side gateway
 * abstraction never has to know this option exists.
 */
type CheckoutMethodId = PaymentProviderId | 'manual_upi';

interface PaymentOption {
  id: CheckoutMethodId;
  label: string;
  /** Shown only for the India-aside PayU option offered to export countries -- this merchant's PayU account is INR-only (no international/multi-currency acquiring enabled), so an export customer choosing PayU is charged in INR, converted from the order's own currency server-side (Vrinda, 9 Oct decision). PayPal has no such caveat. */
  note?: string;
}

/**
 * Which gateway(s) to offer, from the shipping COUNTRY actually
 * selected in this form -- not the cart's `subtotal.currency`, which
 * is resolved once at add-to-cart time (geo-guess or whatever country
 * was selected on an earlier visit) and can silently go stale by the
 * time this form is submitted with a different country. The server
 * (app/api/checkout/route.ts) resolves the order's real currency from
 * this exact same field, so matching it here is what keeps the
 * displayed/submitted method from ever being one the server would
 * reject.
 *
 * India: PayU, as before (this merchant's PayU account natively
 * charges INR, exactly India's own currency -- no conversion, no
 * caveat, nothing to choose between), plus the manual UPI QR option
 * below.
 *
 * Every other country (Vrinda, 9 Oct: "show both PayPal/Card and PayU
 * as selectable payment options" for export): both PayPal (charges in
 * the order's own resolved currency) and PayU (charges in INR
 * regardless of the buyer's country -- see the PaymentOption.note
 * above) are offered, customer picks.
 *
 * manual_upi (Vrinda, 9 Oct: offered everywhere, not India-only) is a
 * last, separate choice on every country -- it's a direct UPI QR scan,
 * not a gateway session, so it's appended rather than replacing
 * anything above. Flagged in the delivery report: UPI is an India-
 * domestic payment rail: a non-Indian bank's UPI app generally can't
 * complete it, so it's only really usable by an India-based payer even
 * though it's shown on every country's checkout.
 */
function paymentOptionsForCountry(countryCode: string): PaymentOption[] {
  const base: PaymentOption[] =
    countryCode === 'IN'
      ? [{ id: 'payu', label: 'UPI, Card or Net Banking (via PayU)' }]
      : [
          { id: 'paypal', label: 'PayPal or International Card' },
          { id: 'payu', label: 'UPI, Card or Net Banking (via PayU)', note: 'Charged in ₹ INR, converted from your order total' },
        ];
  return [
    ...base,
    { id: 'manual_upi', label: 'Scan & Pay via UPI QR', note: 'Manual -- confirm with us on WhatsApp after paying' },
  ];
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
  const [selectedMethodId, setSelectedMethodId] = useState<CheckoutMethodId | null>(null);
  const startedRef = useRef(false);
  const payUFormRef = useRef<HTMLFormElement>(null);
  const [payUSubmit, setPayUSubmit] = useState<{ action: string; fields: Record<string, string> } | null>(null);
  const [manualUpiOrder, setManualUpiOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (items.length === 0 || startedRef.current) return;
    startedRef.current = true;
    trackEvent('checkout_started', { metadata: { item_count: items.reduce((n, i) => n + i.quantity, 0) } });
  }, [items]);

  const paymentOptions = country ? paymentOptionsForCountry(country) : [];
  // Defaults to the first option whenever the country changes the
  // available set (e.g. switching from India's PayU-only to an export
  // country's two options, or between two export countries) -- a
  // stale selectedMethodId from a previous country never silently
  // carries over to one the new country doesn't actually offer.
  const paymentMethod = paymentOptions.find((o) => o.id === selectedMethodId) ?? paymentOptions[0] ?? null;

  useEffect(() => {
    setSelectedMethodId(null);
  }, [country]);

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
      // manual_upi isn't a real gateway (no PaymentProvider for it) --
      // never sent to the server, which would otherwise reject it as
      // an unrecognised payment method (app/api/checkout/route.ts).
      paymentMethod: paymentMethod?.id === 'manual_upi' ? undefined : paymentMethod?.id,
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
        metadata: {
          order_id: data.order.orderId,
          item_count: items.reduce((n, i) => n + i.quantity, 0),
          // Which gateway the customer actually chose (Vrinda, 9 Oct:
          // export countries now pick between PayU and PayPal) -- null
          // when no gateway is configured/available for this order.
          payment_method: paymentMethod?.id ?? null,
        },
      });

      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data.order));
      } catch {
        // sessionStorage can be unavailable (private browsing) -- the
        // order was still created and recorded server-side either way.
      }
      clearCart();

      if (paymentMethod?.id === 'manual_upi') {
        // No gateway session to branch on -- the order is created and
        // recorded exactly as any other, just with no paymentMethod
        // sent (see body above). Show the QR inline instead of
        // redirecting; the render guard below checks manualUpiOrder
        // the same way it already checks payUSubmit.
        setManualUpiOrder(data.order);
        setSubmitting(false);
        return;
      }

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

  // manual_upi has no gateway redirect to navigate away to -- the QR
  // itself is the "next step", rendered right here in place of the
  // form. Checked before the empty-cart guard below (clearCart() above
  // already emptied the cart by the time this is set) so it always
  // wins once an order has been placed this way.
  if (manualUpiOrder) {
    const whatsappMessage = `Hi, I've just placed order ${manualUpiOrder.orderId} on the Khatore website and paid via UPI QR — here is my payment confirmation.`;
    return (
      <div className={styles.upiPay}>
        <h1 className={styles.upiPayTitle}>Scan to Pay</h1>
        <p className={styles.upiPayMeta}>
          Order <strong>{manualUpiOrder.orderId}</strong> ·{' '}
          {formatMoney(manualUpiOrder.total.amount, manualUpiOrder.total.currency)}
        </p>
        <div className={styles.upiQrWrap}>
          <Image
            src="/assets/payment/upi-qr.png"
            alt={`${UPI_PAYEE_LABEL} UPI QR code`}
            width={280}
            height={243}
          />
        </div>
        <p className={styles.upiPayLabel}>{UPI_PAYEE_LABEL}</p>
        <p className={styles.upiPayId}>
          UPI ID: <strong>{UPI_ID}</strong>
        </p>
        <p className={styles.upiPayNote}>
          Scan this code with any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.) and pay the amount above.
          Once paid, message us on WhatsApp with your order ID and a payment screenshot so we can confirm it.
        </p>
        <WhatsAppCta
          phone={CONTACT.whatsappIndiaWorld}
          label="I've paid — confirm via WhatsApp"
          message={whatsappMessage}
          className={styles.upiWaBtn}
        />
      </div>
    );
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

        {paymentOptions.length > 1 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div className={styles.methodChoice}>
              {paymentOptions.map((option) => (
                <label key={option.id} className={styles.methodOption}>
                  <input
                    type="radio"
                    name="paymentMethodChoice"
                    value={option.id}
                    checked={paymentMethod?.id === option.id}
                    onChange={() => setSelectedMethodId(option.id)}
                  />
                  <span className={styles.methodLabel}>{option.label}</span>
                  {option.note ? <span className={styles.methodOptionNote}>{option.note}</span> : null}
                </label>
              ))}
            </div>
          </section>
        ) : null}

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
          <span className={styles.summaryMuted}>
            {items.every((i) => i.shippingIncluded) && items.length > 0 ? 'Included in price' : 'Calculated separately'}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>Tax</span>
          <span className={styles.summaryMuted}>
            {items.every((i) => i.taxIncluded) && items.length > 0 ? 'Included in price' : 'Calculated separately'}
          </span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>Total</span>
          <span>{subtotal === null ? 'Contact for pricing' : formatMoney(subtotal.amount, subtotal.currency)}</span>
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
