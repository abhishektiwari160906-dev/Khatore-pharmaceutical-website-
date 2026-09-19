import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { HERITAGE_FOUNDING_YEAR } from '@/lib/config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Khatore Pharmaceuticals — Ayurvedic Knowledge Since 1984',
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <section className={styles.hero}>
        <span className={styles.heroYear} aria-hidden="true">
          {HERITAGE_FOUNDING_YEAR}
        </span>
        <h1 className={styles.headline}>
          Ayurvedic knowledge, <strong>carried forward</strong> since {HERITAGE_FOUNDING_YEAR}.
        </h1>
        <p className={styles.sub}>
          Khatore Pharmaceuticals — evidence-led Ayurvedic formulations, trusted across generations and
          more than thirty countries.
        </p>
        <div className={styles.ctas}>
          <Link href="/products" className={styles.ctaPrimary}>
            Explore Products
          </Link>
          <Link href="/science" className={styles.ctaGhost}>
            Explore the Science
          </Link>
          <WhatsAppCta phone="918709206320" label="Enquire / Connect" className={styles.ctaGhost} />
        </div>
      </section>
      <Footer />
    </>
  );
}
