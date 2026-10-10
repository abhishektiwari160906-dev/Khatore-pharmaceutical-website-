'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { CONTACT } from '@/lib/config';
import { formatMoney } from '@/components/Pricing/PriceTag';
import type { CurrencyCode } from '@/data/currencies';
import { getCountryName } from '@/data/countries';
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
  const searchParams = useSearchParams();
  // Set only by app/api/payments/return -- never a raw gateway redirect
  // taken at face value (Section 15), because that route already
  // verified the payment server-side (PayU's reverse hash, or a real
  // PayPal capture call) before ever appending this param.
  const paymentStatus = searchParams.get('paymentStatus');
  const paymentProvider = searchParams.get('provider');
  const txnid = searchParams.get('txnid');

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

  // Base/Shipping/Tax breakdown (10 Oct: "every order record stored or
  // displayed must carry the breakdown"), aggregated across every line
  // -- per-unit breakdown.base/shipping/tax already come scaled to
  // line.quantity here since app/api/checkout/route.ts stores them per
  // unit, same as unitPrice. Undefined for a Tier 4 India order (flat,
  // no breakdown by design) or a non-tiered product -- falls back to
  // just the Total row, unchanged from before.
  const hasFullBreakdown = order.items.length > 0 && order.items.every((i) => i.breakdown);
  const breakdownTotals = hasFullBreakdown
    ? order.items.reduce(
        (acc, i) => ({
          base: acc.base + i.breakdown!.base * i.quantity,
          shipping: acc.shipping + i.breakdown!.shipping * i.quantity,
          tax: acc.tax + i.breakdown!.tax * i.quantity,
        }),
        { base: 0, shipping: 0, tax: 0 },
      )
    : null;
  const breakdownCurrency: CurrencyCode = order.items[0]?.baseCurrency ?? order.items[0]?.unitPrice.currency ?? order.total.currency;

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
              {item.discountPercent ? (
                <span className={styles.itemDiscount}> · {Math.round(item.discountPercent)}% off</span>
              ) : null}
            </span>
            <span className={styles.itemPriceCol}>
              {item.regularUnitPrice && item.regularUnitPrice.amount > item.unitPrice.amount ? (
                <span className={styles.itemPriceRegular}>
                  {formatMoney(item.regularUnitPrice.amount * item.quantity, item.regularUnitPrice.currency)}
                </span>
              ) : null}
              {formatMoney(item.lineTotal.amount, item.lineTotal.currency)}
            </span>
          </li>
        ))}
      </ul>
      {breakdownTotals ? (
        <div className={styles.breakdownRows}>
          <div className={styles.breakdownRow}>
            <span>Base price</span>
            <span>{formatMoney(breakdownTotals.base, breakdownCurrency)}</span>
          </div>
          <div className={styles.breakdownRow}>
            <span>Shipping</span>
            <span>{formatMoney(breakdownTotals.shipping, breakdownCurrency)}</span>
          </div>
          <div className={styles.breakdownRow}>
            <span>Tax</span>
            <span>{formatMoney(breakdownTotals.tax, breakdownCurrency)}</span>
          </div>
        </div>
      ) : null}
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>{formatMoney(order.total.amount, order.total.currency)}</span>
      </div>
      <p className={styles.pricingNote}>
        Pricing confirmed for {getCountryName(order.country) ?? order.country}.
      </p>

      <div className={styles.statusBlock}>
        {paymentStatus === 'succeeded' ? (
          <>
            <span className={styles.statusLabel}>Payment status</span>
            <span className={styles.statusValue}>Paid ✓</span>
            <p className={styles.statusNote}>
              Your payment{paymentProvider ? ` via ${paymentProvider === 'payu' ? 'PayU' : 'PayPal'}` : ''} was
              received and verified{txnid ? ` (reference ${txnid})` : ''}. Khatore will begin preparing your
              order.
            </p>
          </>
        ) : paymentStatus === 'failed' ? (
          <>
            <span className={styles.statusLabel}>Payment status</span>
            <span className={styles.statusValue}>Payment not completed</span>
            <p className={styles.statusNote}>
              Your order was recorded, but the payment didn&apos;t go through. You can message us on WhatsApp
              with your order ID above to try again or arrange another way to pay.
            </p>
            <WhatsAppCta
              phone={CONTACT.whatsappIndiaWorld}
              label="Complete via WhatsApp"
              message={whatsappMessage}
              className={styles.waBtn}
            />
          </>
        ) : paymentStatus === 'unverified' ? (
          <>
            <span className={styles.statusLabel}>Payment status</span>
            <span className={styles.statusValue}>Couldn&apos;t confirm automatically</span>
            <p className={styles.statusNote}>
              Your order was recorded, but we couldn&apos;t automatically verify the payment result. If you
              completed payment, please message us your order ID and we&apos;ll confirm it directly — you
              will not be charged twice.
            </p>
            <WhatsAppCta
              phone={CONTACT.whatsappIndiaWorld}
              label="Confirm via WhatsApp"
              message={whatsappMessage}
              className={styles.waBtn}
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
