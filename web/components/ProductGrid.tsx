'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';
import type { Product } from '@/data/products';
import styles from './ProductGrid.module.css';

type Filter = 'all' | 'featured';

/**
 * "All Products" / "Featured" only — Featured means content-approved
 * (today, just Kamalahar). No invented taxonomy/categories: there's no
 * approved metadata (condition, form-factor, etc.) to filter by yet.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const featuredCount = products.filter((p) => p.status === 'approved').length;
  const visible = filter === 'featured' ? products.filter((p) => p.status === 'approved') : products;

  return (
    <>
      <div className={styles.filters} role="tablist" aria-label="Filter products">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Products
        </button>
        {featuredCount > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'featured'}
            className={`${styles.filterBtn} ${filter === 'featured' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('featured')}
          >
            Featured
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {visible.map((product, i) => (
          <Reveal key={product.productId} delay={((i % 3) + 1) as 1 | 2 | 3}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
