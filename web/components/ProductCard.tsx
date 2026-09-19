'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '@/lib/events/client';
import { BuyButton } from './BuyButton';
import type { Product } from '@/data/products';
import styles from './ProductCard.module.css';

export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            trackEvent('product_viewed', {
              product_id: product.productId,
              product_name: product.name,
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.productId, product.name]);

  return (
    <article ref={ref} className={styles.card}>
      <span className={styles.num}>{product.bgNum}</span>
      <Link href={`/products/${product.slug}`} className={styles.imageLink}>
        <Image src={product.image} alt={product.name} width={295} height={295} />
      </Link>
      <h3 className={styles.name}>
        <Link href={`/products/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className={styles.format}>{product.format}</p>
      {product.status === 'approved' && product.description ? (
        <p className={styles.desc}>{product.description}</p>
      ) : (
        <p className={styles.descPending} aria-hidden="true">
          Description pending Khatore approval.
        </p>
      )}
      {product.price ? (
        <div className={styles.price}>
          ${product.price.amount}
          {product.priceNote ? <span className={styles.priceNote}> · {product.priceNote}</span> : null}
        </div>
      ) : null}
      <BuyButton product={product} className={styles.buy} />
    </article>
  );
}
