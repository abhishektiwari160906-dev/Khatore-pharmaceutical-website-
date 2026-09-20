import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { VideoBlock } from '@/components/VideoBlock';
import { Reveal } from '@/components/Reveal';
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
        <div className={styles.grid}>
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.productId} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

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
