'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import styles from './SearchOverlay.module.css';

/**
 * Lightweight product search — matches only the real product
 * name/format text already on the site. No symptom search, no
 * suggested/inferred results: an empty result set says so plainly
 * rather than guessing at what the visitor meant.
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const results = q ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.format.toLowerCase().includes(q)) : [];

  return (
    <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Search products">
        <div className={styles.inputRow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            tabIndex={open ? 0 : -1}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close search" tabIndex={open ? 0 : -1}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        {q ? (
          results.length > 0 ? (
            <ul className={styles.results}>
              {results.map((p) => (
                <li key={p.productId}>
                  <Link href={`/products/${p.slug}`} onClick={onClose} className={styles.resultLink} tabIndex={open ? 0 : -1}>
                    <span className={styles.resultImg}>
                      <Image src={p.image} alt={p.name} width={48} height={48} />
                    </span>
                    <span>
                      <span className={styles.resultName}>{p.name}</span>
                      <span className={styles.resultFormat}>{p.format}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noResults}>No products found for &quot;{query}&quot;.</p>
          )
        ) : (
          <p className={styles.hint}>Search the {PRODUCTS.length}-product archive by name.</p>
        )}
      </div>
    </div>
  );
}
