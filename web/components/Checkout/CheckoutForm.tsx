'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/Cart/CartContext';
import { trackEvent } from '@/lib/events/client';
import type { Order } from '@/lib/order/types';
import styles from './CheckoutForm.module.css';

const LAST_ORDER_KEY = 'khatore_last_order';

/**
 * Real checkout: collects real customer/shipping details and creates a
 * real Order (server-priced from data/products.ts, Section 9's pricing
 * safety rule). What it does NOT do is process payment -- there is no
 * gateway configured (Section 12/15), so a created order's
 * paymentStatus is always 'not_started', and the confirmation step
 * that follows is explicit about that rather than implying a payment
 * that didn't happen.
 */
export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 || startedRef.current) return;
    startedRef.current = true;
    trackEvent('checkout_started', { metadata: { item_count: items.reduce((n, i) => n + i.quantity, 0) } });
  }, [items]);

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
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { order?: Order; error?: string };
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
      router.push('/order-confirmation');
    } catch {
      setError('Something went wrong creating your order — please try again.');
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
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
              <input className={styles.input} type="text" name="country" required autoComplete="country-name" />
            </label>
          </div>
        </section>

        <p className={styles.paymentNote}>
          Placing this order creates your order with Khatore — online payment isn&apos;t active yet. Once
          submitted, Khatore will contact you directly (via WhatsApp or email) to confirm final pricing and
          complete payment.
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Placing Order…' : 'Place Order'}
        </button>
      </form>

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
              </div>
              <span className={styles.summaryPrice}>
                {item.price ? `$${item.price.amount * item.quantity}` : 'Contact for pricing'}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{subtotal === null ? 'Contact for pricing' : `$${subtotal}`}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span className={styles.summaryMuted}>Calculated separately</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Tax</span>
          <span className={styles.summaryMuted}>Calculated separately</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>Total</span>
          <span>{subtotal === null ? 'Contact for pricing' : `$${subtotal}`}</span>
        </div>
      </aside>
    </div>
  );
}
