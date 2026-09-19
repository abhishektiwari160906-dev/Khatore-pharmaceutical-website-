import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { VideoBlock } from '@/components/VideoBlock';
import { HERITAGE_FOUNDING_YEAR } from '@/lib/config';
import { HERITAGE_ENTRIES } from '@/data/heritage';
import { CLEARED_CLINICAL_TRIALS } from '@/data/science';
import { PRODUCTS } from '@/data/products';
import { GLOBAL_STATS } from '@/data/global';
import styles from './page.module.css';

const BhuiAmlaExperience = dynamic(
  () => import('@/components/BhuiAmla/BhuiAmlaExperience').then((m) => m.BhuiAmlaExperience),
  {
    ssr: false,
    loading: () => <div className={styles.bhuiAmlaLoading} aria-hidden="true" />,
  },
);

export const metadata: Metadata = {
  title: 'Khatore Pharmaceuticals — Ayurvedic Knowledge Since 1984',
};

const founding = HERITAGE_ENTRIES[0]!;
const featuredProducts = PRODUCTS.slice(0, 4);

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

      <section className={styles.heritageTeaser} aria-label="Founded 1984">
        <span className={styles.heritageTeaserYear}>{founding.date}</span>
        <div>
          <h2 className={styles.heritageTeaserHeading}>{founding.title} — Barbil, Orissa</h2>
          <p className={styles.heritageTeaserBody}>{founding.text}</p>
          <Link href="/heritage" className={styles.textLink}>
            Read the full heritage story →
          </Link>
        </div>
      </section>

      <section className={styles.brandFilm} aria-label="Brand film">
        <div className={styles.brandFilmInner}>
          <VideoBlock id="brand" label="Khatore Pharmaceuticals" maxWidth={960} />
        </div>
      </section>

      <section className={styles.storySection} aria-label="Where it's made">
        <div>
          <span className={styles.eyebrow}>Manufacturing Authenticity</span>
          <h2 className={styles.storyHeading}>The same process, every batch.</h2>
          <p className={styles.storyCopy}>
            From decoction to quality control, every formulation follows the discipline established in
            1984 — GMP-certified, designed by Ayurvedacharya, with no heavy metals.
          </p>
          <Link href="/heritage" className={styles.textLink}>
            See how it&apos;s made →
          </Link>
        </div>
      </section>

      <BhuiAmlaExperience />

      <section className={styles.herbSection} aria-label="From herb to habit">
        <div className={styles.herbVideo}>
          <VideoBlock id="reel4" caption="Herb to Habit" />
        </div>
        <div className={styles.herbText}>
          <h2 className={styles.herbHeading}>From herb to habit</h2>
          <p className={styles.herbCopy}>
            Every formulation starts with the plant — Ayurvedic knowledge carried through to a
            product you can trust.
          </p>
          <Link href="/science" className={styles.ctaGhost}>
            Explore the Science
          </Link>
        </div>
      </section>

      <section className={styles.scienceTeaser} aria-label="Evidence">
        <div className={styles.scienceHead}>
          <span className={styles.eyebrowLight}>Evidence, not assertion</span>
          <h2 className={styles.scienceHeading}>
            {CLEARED_CLINICAL_TRIALS.length} published clinical trials.
          </h2>
          <Link href="/science" className={styles.textLinkLight}>
            View the full clinical record →
          </Link>
        </div>
        <div className={styles.trialGrid}>
          {CLEARED_CLINICAL_TRIALS.map((trial) => (
            <div key={trial.id} className={styles.trialCard}>
              <span className={styles.trialCardN}>{String(trial.order).padStart(2, '0')}</span>
              <span className={styles.trialCardDate}>{trial.dateRange}</span>
              <span className={styles.trialCardPatients}>{trial.patientCount} patients</span>
              <span className={styles.trialCardCond}>{trial.conditions.join(' · ')}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.productsTeaser} aria-label="Product discovery">
        <div className={styles.productsHead}>
          <h2 className={styles.productsHeading}>
            Product <strong>Archive</strong>
          </h2>
          <Link href="/products" className={styles.textLink}>
            View full archive →
          </Link>
        </div>
        <div className={styles.productsGrid}>
          {featuredProducts.map((p) => (
            <Link key={p.productId} href={`/products/${p.slug}`} className={styles.productTile}>
              <span className={styles.productTileNum}>{p.bgNum}</span>
              <span className={styles.productTileName}>{p.name}</span>
              <span className={styles.productTileFormat}>{p.format}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.globalTeaser} aria-label="Global presence">
        <div>
          <h2 className={styles.globalHeading}>
            30+ countries. <strong>One mission.</strong>
          </h2>
          <p className={styles.globalCopy}>
            Over four decades, Khatore&apos;s Ayurvedic formulations have reached patients across South
            Asia, Africa, Europe, the Americas and Asia-Pacific.
          </p>
          <Link href="/global-presence" className={styles.textLink}>
            See our global presence →
          </Link>
        </div>
        <div className={styles.globalStats}>
          {GLOBAL_STATS.map((s) => (
            <div key={s.l} className={styles.globalStat}>
              <div className={styles.globalStatN}>{s.n}</div>
              <div className={styles.globalStatL}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-label="Begin your enquiry">
        <h2 className={styles.finalCtaHeading}>
          Questions about a formulation? <strong>Talk to Khatore.</strong>
        </h2>
        <div className={styles.finalCtaActions}>
          <Link href="/contact" className={styles.ctaPrimary}>
            Send an Enquiry
          </Link>
          <WhatsAppCta phone="918709206320" label="WhatsApp Khatore" className={styles.ctaGhost} />
        </div>
      </section>

      <Footer />
    </>
  );
}
