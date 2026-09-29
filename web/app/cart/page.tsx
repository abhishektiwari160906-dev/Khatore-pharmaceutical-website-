import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CartPageClient } from '@/components/CartPage/CartPageClient';
import styles from './page.module.css';

// Section 24: a personal, per-visitor cart is not indexable content.
export const metadata: Metadata = {
  title: 'Your Cart',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <Nav />
      <main>
        <div className={styles.masthead}>
          <span className={styles.eyebrow}>Khatore Pharmaceuticals</span>
          <h1 className={styles.title}>Your Cart</h1>
        </div>
        <CartPageClient />
      </main>
      <Footer />
    </>
  );
}
