'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/Cart/CartContext';
import { trackEvent } from '@/lib/events/client';
import { CONTACT } from '@/lib/config';
import { formatMoney, BreakdownLine } from '@/components/Pricing/PriceTag';
import styles from './CartPageClient.module.css';

/**
 * The full-page counterpart to CartDrawer -- same CartContext, same
 * data, just more room (Section 8: "if both are implemented, they must
 * share the same underlying cart state", not a second cart system).
 */
export function CartPageClient() {
  const { items, itemCount, subtotal, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your cart is empty.</p>
        <Link href="/products" className={styles.emptyLink}>
          Explore Products →
        </Link>
      </div>
    );
  }

  const whatsappHref = (() => {
    const lines = items.map((i) => `- ${i.name} x${i.quantity}`).join('\n');
    const text = `Hi, I'd like to order:\n${lines}\n\nCould you help me complete this?`;
    return `https://api.whatsapp.com/send?phone=${CONTACT.whatsappIndiaWorld}&text=${encodeURIComponent(text)}`;
  })();

  return (
    <div className={styles.layout}>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.productId} className={styles.item}>
            <Link href={`/products/${item.slug}`} className={styles.itemImg}>
              <Image src={item.image} alt={item.name} width={90} height={90} />
            </Link>
            <div className={styles.itemInfo}>
              <Link href={`/products/${item.slug}`} className={styles.itemName}>
                {item.name}
              </Link>
              <span className={styles.itemFormat}>{item.format}</span>
              {item.breakdown ? (
                <BreakdownLine
                  breakdown={{
                    base: item.breakdown.base * item.quantity,
                    shipping: item.breakdown.shipping * item.quantity,
                    tax: item.breakdown.tax * item.quantity,
                  }}
                  currency={item.breakdownCurrency ?? item.price?.currency ?? 'USD'}
                  className={styles.itemBreakdown}
                />
              ) : null}
              <div className={styles.qtyRow}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  −
                </button>
                <span className={styles.qtyVal}>{item.quantity}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
                <button type="button" className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
            <span className={styles.itemPrice}>
              {item.price ? (
                <>
                  {item.regularPrice && item.regularPrice > item.price.amount ? (
                    <span className={styles.itemPriceRegular}>
                      {formatMoney(item.regularPrice * item.quantity, item.price.currency)}
                    </span>
                  ) : null}
                  {formatMoney(item.price.amount * item.quantity, item.price.currency)}
                  {item.discountPercent ? (
                    <span className={styles.itemDiscount}>{Math.round(item.discountPercent)}% off</span>
                  ) : null}
                </>
              ) : (
                'Contact for pricing'
              )}
            </span>
          </li>
        ))}
      </ul>

      <aside className={styles.summary}>
        <h2 className={styles.summaryTitle}>
          Subtotal · {itemCount} item{itemCount === 1 ? '' : 's'}
        </h2>
        <p className={styles.summaryVal}>
          {subtotal === null ? 'Contact for pricing' : formatMoney(subtotal.amount, subtotal.currency)}
        </p>
        <Link href="/checkout" className={styles.checkoutBtn}>
          Proceed to Checkout
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener"
          className={styles.enquireBtn}
          onClick={() => {
            trackEvent('whatsapp_click', { metadata: { source: 'cart_page_enquiry', item_count: itemCount } });
          }}
        >
          Enquire on WhatsApp
        </a>
        <Link href="/products" className={styles.continueLink}>
          ← Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
