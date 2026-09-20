'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import type { Product } from '@/data/products';
import styles from './AddToCartButton.module.css';

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const { addItem, open } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={`${styles.btn} ${className ?? ''}`}
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
        open();
      }}
    >
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
