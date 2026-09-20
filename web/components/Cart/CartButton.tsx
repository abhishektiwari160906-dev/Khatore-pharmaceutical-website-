'use client';

import { useCart } from './CartContext';
import styles from './CartButton.module.css';

/** Minimal, monochrome — matches the Nav's existing restraint rather than a bright e-commerce badge. */
export function CartButton({ className }: { className?: string }) {
  const { itemCount, open } = useCart();
  return (
    <button
      type="button"
      className={`${styles.btn} ${className ?? ''}`}
      onClick={open}
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? '' : 's'}` : ''}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 6h2l2.4 12.2a1.5 1.5 0 0 0 1.47 1.3h9.26a1.5 1.5 0 0 0 1.47-1.2L21 8H6.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="21" r="1" fill="currentColor" />
        <circle cx="18" cy="21" r="1" fill="currentColor" />
      </svg>
      {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
    </button>
  );
}
