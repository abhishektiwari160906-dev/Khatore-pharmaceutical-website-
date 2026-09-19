import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Products',
  description: "Khatore Pharmaceuticals' Ayurvedic product catalogue.",
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return (
    <>
      <Nav />
      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Product <strong>Archive</strong>
          </h1>
        </header>
        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
