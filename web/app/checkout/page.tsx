import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CheckoutForm } from '@/components/Checkout/CheckoutForm';
import styles from './page.module.css';

// Section 24: checkout is a transactional, per-visitor step -- not indexable content.
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <main>
        <div className={styles.masthead}>
          <span className={styles.eyebrow}>Khatore Pharmaceuticals</span>
          <h1 className={styles.title}>Checkout</h1>
        </div>
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}
