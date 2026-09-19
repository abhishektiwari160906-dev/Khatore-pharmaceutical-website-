import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { VideoBlock } from '@/components/VideoBlock';
import { PRODUCTS } from '@/data/products';
import styles from './page.module.css';

const description = "Khatore Pharmaceuticals' Ayurvedic product catalogue.";

export const metadata: Metadata = {
  title: 'Products',
  description,
  alternates: { canonical: '/products' },
  openGraph: { title: 'Product Archive — Khatore Pharmaceuticals', description, url: '/products' },
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

        <section className={styles.processSection} aria-label="Process and promise">
          <div className={styles.processCol}>
            <VideoBlock id="reel2" caption="The Kamalahar Process" />
            <p className={styles.processCaption}>The Kamalahar Process</p>
          </div>
          <div className={styles.processCol}>
            <VideoBlock id="reel3" caption="The Kamalahar Promise" />
            <p className={styles.processCaption}>The Kamalahar Promise</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
