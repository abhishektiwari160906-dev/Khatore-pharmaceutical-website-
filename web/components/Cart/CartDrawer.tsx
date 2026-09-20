'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartContext';
import { trackEvent } from '@/lib/events/client';
import styles from './CartDrawer.module.css';

const WHATSAPP_PHONE = '918709206320';

/**
 * Premium slide-over, not a generic cart template. Client-only state —
 * no order is created. The primary action is an honest WhatsApp
 * enquiry summarizing the cart, not a "Proceed to Checkout" that would
 * lead nowhere: there is no real multi-item checkout endpoint yet
 * (Section 14 — Magento per-product links remain the only real
 * purchase path). That action fires the already-active whatsapp_click;
 * this component never fires checkout_started, any payment_* event, or
 * order_placed — those stay schema-only until the functionality they
 * describe exists.
 */
export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, close, removeItem, setQuantity } = useCart();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  const whatsappHref = (() => {
    const lines = items.map((i) => `- ${i.name} x${i.quantity}`).join('\n');
    const text = `Hi, I'd like to order:\n${lines}\n\nCould you help me complete this?`;
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
  })();

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button ref={closeBtnRef} type="button" className={styles.closeBtn} onClick={close} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <Link href="/products" className={styles.emptyLink} onClick={close} tabIndex={isOpen ? 0 : -1}>
              Explore the Archive →
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.productId} className={styles.item}>
                  <Link href={`/products/${item.slug}`} onClick={close} className={styles.itemImg} tabIndex={isOpen ? 0 : -1}>
                    <Image src={item.image} alt={item.name} width={64} height={64} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.slug}`} onClick={close} className={styles.itemName} tabIndex={isOpen ? 0 : -1}>
                      {item.name}
                    </Link>
                    <span className={styles.itemFormat}>{item.format}</span>
                    {item.price ? (
                      <span className={styles.itemPrice}>
                        ${item.price.amount * item.quantity}
                      </span>
                    ) : (
                      <span className={styles.itemPriceNote}>Contact for pricing</span>
                    )}
                    <div className={styles.qtyRow}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        −
                      </button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.productId)}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span>Subtotal · {itemCount} item{itemCount === 1 ? '' : 's'}</span>
                <span className={styles.subtotalVal}>{subtotal === null ? 'Contact for pricing' : `$${subtotal}`}</span>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener"
                className={styles.enquireBtn}
                onClick={() => {
                  trackEvent('whatsapp_click', {
                    metadata: { source: 'cart_enquiry', item_count: itemCount },
                  });
                }}
                tabIndex={isOpen ? 0 : -1}
              >
                Enquire About This Order
              </a>
              <p className={styles.footnote}>
                Native checkout isn&apos;t live yet — this sends your cart to Khatore on WhatsApp to complete
                the order.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
