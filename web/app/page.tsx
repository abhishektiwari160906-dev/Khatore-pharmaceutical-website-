import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { VideoBlock } from '@/components/VideoBlock';
import { Reveal } from '@/components/Reveal';
import { HERITAGE_FOUNDING_YEAR } from '@/lib/config';
import { HERITAGE_ENTRIES } from '@/data/heritage';
import { CLEARED_CLINICAL_TRIALS } from '@/data/science';
import { PRODUCTS } from '@/data/products';
import { GLOBAL_STATS, GLOBAL_PRESENCE } from '@/data/global';
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
const flagship = PRODUCTS.find((p) => p.productId === 'kamalahar')!;
const restProducts = PRODUCTS.filter((p) => p.productId !== 'kamalahar');

// Purely decorative placement for the abstract globe motif — not a claim
// of precise geography. The factual list stays the approved region/
// country data from data/global.ts, rendered verbatim below it.
const GLOBE_MARKERS = [
  { region: 'South Asia & Middle East', x: 63, y: 46 },
  { region: 'Africa', x: 50, y: 58 },
  { region: 'Europe & Americas', x: 30, y: 38 },
  { region: 'Asia-Pacific', x: 78, y: 62 },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* 01 — HERO */}
      <section className={styles.hero} aria-label="Khatore Pharmaceuticals">
        <div className={styles.heroInner}>
          <span className={styles.heroKicker}>Ayurvedic Knowledge</span>
          <h1 className={styles.heroWordmark}>Khatore</h1>
          <p className={styles.heroSince}>
            Since <strong>{HERITAGE_FOUNDING_YEAR}</strong>.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/products" className={styles.ctaPrimary}>
              Explore Products
            </Link>
            <WhatsAppCta phone="918709206320" label="Enquire" className={styles.ctaGhostLight} />
          </div>
        </div>
        <div className={styles.scrollCue} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* 02 — ORIGIN */}
      <section className={styles.origin} aria-label="Origin">
        <Reveal as="span" className={styles.originGhost} delay={1}>
          {HERITAGE_FOUNDING_YEAR}
        </Reveal>
        <Reveal className={styles.originText} delay={2}>
          <span className={styles.eyebrow}>Origin — {founding.title}</span>
          <p className={styles.originLine}>Barbil, Orissa. Where the mission began.</p>
          <Link href="/heritage" className={styles.textLink}>
            The full story →
          </Link>
        </Reveal>
      </section>

      {/* 03 — OUR STORY (Brand Film) */}
      <section className={styles.brandFilm} aria-label="Our story — brand film">
        <VideoBlock
          id="brand"
          eyebrow="Our Story"
          heading="Khatore Pharmaceuticals"
          label="Brand Film"
          dark
        />
      </section>

      {/* 04 — FROM PLANT TO PRODUCT */}
      <div className={styles.plantToProduct}>
        <BhuiAmlaExperience />

        <section className={styles.herbSection} aria-label="Herb to habit">
          <Reveal as="div" className={styles.herbVideo}>
            <VideoBlock id="reel4" caption="Herb to Habit" />
          </Reveal>
          <Reveal className={styles.herbText} delay={1}>
            <span className={styles.eyebrow}>The Product</span>
            <h2 className={styles.chapterHeading}>From herb to habit.</h2>
            <p className={styles.chapterSub}>
              The same process, every batch — GMP-certified, no heavy metals.
            </p>
            <Link href="/heritage" className={styles.textLink}>
              See how it&apos;s made →
            </Link>
          </Reveal>
        </section>
      </div>

      {/* 05 — SCIENCE */}
      <section className={styles.scienceChapter} aria-label="Science">
        <Reveal as="div" className={styles.scienceHead}>
          <span className={styles.eyebrowLight}>The Science</span>
          <h2 className={styles.chapterHeadingLight}>Evidence, documented.</h2>
        </Reveal>
        <div className={styles.evidenceGrid}>
          {CLEARED_CLINICAL_TRIALS.map((trial, i) => (
            <Reveal key={trial.id} as="div" className={styles.evidenceCard} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <span className={styles.evidenceN}>{String(trial.order).padStart(2, '0')}</span>
              <span className={styles.evidenceStat}>{trial.patientCount}</span>
              <span className={styles.evidenceLabel}>Patients</span>
              <span className={styles.evidenceDate}>{trial.dateRange}</span>
            </Reveal>
          ))}
        </div>
        <Link href="/science" className={styles.textLinkLight}>
          View the full clinical record →
        </Link>
      </section>

      {/* 06 — PRODUCTS */}
      <section className={styles.productsChapter} aria-label="Products">
        <Reveal as="div" className={styles.productsHead}>
          <span className={styles.eyebrow}>The Products</span>
        </Reveal>

        <Reveal as="div" className={styles.flagship}>
          <Link href={`/products/${flagship.slug}`} className={styles.flagshipLink}>
            <div className={styles.flagshipImg}>
              <Image src={flagship.image} alt={flagship.name} width={420} height={420} />
            </div>
            <div className={styles.flagshipInfo}>
              <span className={styles.flagshipTag}>Flagship</span>
              <h2 className={styles.flagshipName}>{flagship.name}</h2>
              <span className={styles.textLink}>View product →</span>
            </div>
          </Link>
        </Reveal>

        <div className={styles.productsGrid}>
          {restProducts.map((p, i) => (
            <Reveal
              key={p.productId}
              as="div"
              delay={((i % 3) + 1) as 1 | 2 | 3}
            >
              <Link href={`/products/${p.slug}`} className={styles.productTile}>
                <div className={styles.productTileImg}>
                  <Image src={p.image} alt={p.name} width={140} height={140} />
                </div>
                <span className={styles.productTileName}>{p.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Link href="/products" className={styles.textLink}>
          View full archive →
        </Link>
      </section>

      {/* 07 — THE WORLD */}
      <section className={styles.worldChapter} aria-label="Global presence">
        <Reveal as="div" className={styles.worldText}>
          <span className={styles.eyebrowLight}>The World</span>
          <h2 className={styles.chapterHeadingLight}>
            30+ countries. <em>One mission.</em>
          </h2>
          <div className={styles.worldStats}>
            {GLOBAL_STATS.map((s) => (
              <div key={s.l} className={styles.worldStat}>
                <span className={styles.worldStatN}>{s.n}</span>
                <span className={styles.worldStatL}>{s.l}</span>
              </div>
            ))}
          </div>
          <Link href="/global-presence" className={styles.textLinkLight}>
            See our global presence →
          </Link>
        </Reveal>

        <Reveal as="div" className={styles.globe} delay={1}>
          <svg viewBox="0 0 100 100" className={styles.globeSvg} aria-hidden="true">
            <circle cx="50" cy="50" r="38" className={styles.globeRing} />
            <ellipse cx="50" cy="50" rx="38" ry="14" className={styles.globeRing} />
            <ellipse cx="50" cy="50" rx="38" ry="26" className={styles.globeRing} />
            <line x1="12" y1="50" x2="88" y2="50" className={styles.globeRing} />
            <line x1="50" y1="12" x2="50" y2="88" className={styles.globeRing} />
          </svg>
          {GLOBE_MARKERS.map((m) => (
            <span key={m.region} className={styles.globeDot} style={{ left: `${m.x}%`, top: `${m.y}%` }}>
              <span className={styles.globeDotPing} />
            </span>
          ))}
          <ul className={styles.globeLegend}>
            {GLOBAL_PRESENCE.map((g) => (
              <li key={g.region}>{g.region}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 08 — CONNECT */}
      <section className={styles.connect} aria-label="Begin your enquiry">
        <Reveal as="div">
          <h2 className={styles.connectHeading}>
            Questions about a formulation? <strong>Talk to Khatore.</strong>
          </h2>
          <div className={styles.connectActions}>
            <Link href="/contact" className={styles.ctaPrimary}>
              Send an Enquiry
            </Link>
            <WhatsAppCta phone="918709206320" label="WhatsApp Khatore" className={styles.ctaGhost} />
          </div>
        </Reveal>
      </section>

      <Footer />
    </>
  );
}
