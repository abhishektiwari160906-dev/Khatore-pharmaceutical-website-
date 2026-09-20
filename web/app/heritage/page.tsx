import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { VideoBlock } from '@/components/VideoBlock';
import { Reveal } from '@/components/Reveal';
import { HERITAGE_ENTRIES } from '@/data/heritage';
import { HERITAGE_FOUNDING_YEAR } from '@/lib/config';
import styles from './page.module.css';

const description = `The Khatore Pharmaceuticals story — Ayurvedic knowledge since ${HERITAGE_FOUNDING_YEAR}.`;

export const metadata: Metadata = {
  title: 'Heritage',
  description,
  alternates: { canonical: '/heritage' },
  openGraph: { title: 'Heritage — Khatore Pharmaceuticals', description, url: '/heritage' },
};

export default function HeritagePage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.yearBanner}>
          <span className={styles.yearBig} aria-hidden="true">
            {HERITAGE_FOUNDING_YEAR}
          </span>
          <span className={styles.yearLabel}>Year of founding · Barbil, Orissa</span>
        </section>

        <Reveal as="section" className={styles.pull}>
          <p className={styles.pullQuote}>
            &quot;The mission of Late Shri Sitaram Khatore was to relieve the suffering patients from serious
            liver ailments and jaundice. Our mission is to continue to help patients globally to manage and
            recover from liver ailments by providing unique <strong>Kamalahar</strong> as per top quality
            standards.&quot;
          </p>
          <span className={styles.pullAttr}>Khatore Pharmaceuticals — Company Mission</span>
        </Reveal>

        <Reveal as="section" className={styles.bts} aria-label="Behind the scenes at the facility">
          <div className={styles.btsVideo}>
            <VideoBlock id="reel1" caption="Behind the Scenes" />
          </div>
          <div className={styles.btsText}>
            <h2 className={styles.btsHeading}>Where it&apos;s made</h2>
            <p className={styles.btsCopy}>
              A look inside the facility — the same decoction and quality-control process behind
              every batch of Kamalahar.
            </p>
          </div>
        </Reveal>

        <section className={styles.register} aria-label="Heritage timeline">
          {HERITAGE_ENTRIES.map((entry, i) => (
            <Reveal key={entry.title} as="div" className={styles.entry} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <div className={styles.entryDate}>{entry.date}</div>
              <div>
                <h2 className={styles.entryTitle}>{entry.title}</h2>
                <p className={styles.entryText}>{entry.text}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <section className={styles.badges} aria-label="Certifications and recognition">
          <span className={styles.badge}>GMP Certified</span>
          <span className={styles.badge}>Best Entrepreneur — Ayurvedic Medicine in Asia, 2000</span>
          <span className={styles.badge}>Designed by Ayurvedacharya</span>
          <span className={styles.badge}>No Heavy Metals</span>
        </section>

        <section className={styles.nextChapter}>
          <Link href="/science" className={styles.nextLink}>
            <span className={styles.nextLabel}>Next</span>
            <span className={styles.nextTitle}>The Science →</span>
          </Link>
          <Link href="/products" className={styles.nextLink}>
            <span className={styles.nextLabel}>Also</span>
            <span className={styles.nextTitle}>The Products →</span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
