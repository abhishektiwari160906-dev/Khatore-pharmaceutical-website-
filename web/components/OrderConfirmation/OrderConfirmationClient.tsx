'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { CONTACT } from '@/lib/config';
import type { Order } from '@/lib/order/types';
import styles from './OrderConfirmationClient.module.css';

const LAST_ORDER_KEY = 'khatore_last_order';

/**
 * Reads the just-created order from sessionStorage (set by
 * CheckoutForm right after a successful /api/checkout call) and clears
 * it once shown, so refreshing or revisiting this page later doesn't
 * keep re-showing a stale order. No PII travels through the URL to get
 * here (Section 17) -- sessionStorage is same-origin, client-only, and
 * never sent over the network beyond the original checkout submission.
 */
export function OrderConfirmationClient() {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      sessionStorage.removeItem(LAST_ORDER_KEY);
      setOrder(raw ? (JSON.parse(raw) as Order) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) return null;

  if (order === null) {
    return (
      <div className={styles.fallback}>
        <p>We couldn&apos;t find a recent order to show here.</p>
        <Link href="/products" className={styles.link}>
          Explore Products →
        </Link>
      </div>
    );
  }

  const whatsappMessage = `Hi, I've just placed order ${order.orderId} on the Khatore website and would like to arrange payment.`;

  return (
    <div className={styles.wrap}>
      <span className={styles.check} aria-hidden="true">
        ✓
      </span>
      <h1 className={styles.title}>Thank you, {order.customer.fullName.split(' ')[0]}.</h1>
      <p className={styles.orderId}>
        Order <strong>{order.orderId}</strong>
      </p>

      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={item.productId} className={styles.item}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>${item.lineTotal.amount}</span>
          </li>
        ))}
      </ul>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>${order.total.amount}</span>
      </div>

      <div className={styles.statusBlock}>
        <span className={styles.statusLabel}>Payment status</span>
        <span className={styles.statusValue}>Pending — not yet paid</span>
        <p className={styles.statusNote}>
          Online payment isn&apos;t active yet. Your order has been recorded with Khatore — message us on
          WhatsApp with your order ID above and we&apos;ll confirm final pricing and payment directly.
        </p>
        <WhatsAppCta
          phone={CONTACT.whatsappIndiaWorld}
          label="Complete via WhatsApp"
          message={whatsappMessage}
          className={styles.waBtn}
        />
      </div>

      <p className={styles.shipTo}>
        Shipping to: {order.shipping.city}, {order.shipping.region}, {order.shipping.country}
      </p>

      <Link href="/products" className={styles.link}>
        Continue Browsing →
      </Link>
    </div>
  );
}
