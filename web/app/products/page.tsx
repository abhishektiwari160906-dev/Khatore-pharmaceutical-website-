import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
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
          <span className={styles.eyebrow}>{PRODUCTS.length} Formulations</span>
          <h1 className={styles.title}>
            Product <strong>Archive</strong>
          </h1>
        </header>
        <ProductGrid products={PRODUCTS} />

        <section className={styles.processSection} aria-label="Process and promise">
          <div className={styles.processStage}>
            <VideoBlock id="reel2" eyebrow="The Process" heading="The Kamalahar Process" dark />
          </div>
          <div className={styles.processStage}>
            <VideoBlock id="reel3" eyebrow="The Promise" heading="The Kamalahar Promise" dark />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
