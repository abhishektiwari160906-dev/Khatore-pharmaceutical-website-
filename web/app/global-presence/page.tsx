import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { Reveal } from '@/components/Reveal';
import { GLOBAL_STATS, GLOBAL_PRESENCE, GLOBAL_DATA_CAVEAT } from '@/data/global';
import { CONTACT } from '@/lib/config';
import styles from './page.module.css';

const description = "Khatore Pharmaceuticals' international reach.";

export const metadata: Metadata = {
  title: 'Global Presence',
  description,
  alternates: { canonical: '/global-presence' },
  openGraph: { title: 'Global Presence — Khatore Pharmaceuticals', description, url: '/global-presence' },
};

// Purely decorative — not a claim of precise geography. The factual
// region/country list is the approved data below, rendered verbatim.
const GLOBE_MARKERS = [
  { region: 'South Asia & Middle East', x: 63, y: 46 },
  { region: 'Africa', x: 50, y: 58 },
  { region: 'Europe & Americas', x: 30, y: 38 },
  { region: 'Asia-Pacific', x: 78, y: 62 },
];

export default function GlobalPresencePage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>Regions Served</span>
            <h1 className={styles.title}>
              30+ countries. <strong>One mission.</strong>
            </h1>
            <p className={styles.body}>
              Over four decades, Khatore&apos;s Ayurvedic formulations have reached patients across more than
              thirty countries — efficacious, safe and economic Ayurvedic care.
            </p>
            <div className={styles.stats}>
              {GLOBAL_STATS.map((s) => (
                <div key={s.l} className={styles.stat}>
                  <div className={styles.statN}>{s.n}</div>
                  <div className={styles.statL}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <Reveal as="div" className={styles.globe}>
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
          </Reveal>
        </section>

        <div className={styles.presence}>
          {GLOBAL_PRESENCE.map((group, i) => (
            <Reveal
              key={group.region}
              as="div"
              className={styles.col}
              delay={((i % 3) + 1) as 1 | 2 | 3}
            >
              <div data-accent={i % 2 === 0 ? 'blue' : 'green'} className={styles.colInner}>
                <span className={styles.regionHeading}>{group.region}</span>
                {group.countries.map((c) => (
                  <div key={c} className={styles.row}>
                    <span className={styles.dot} aria-hidden="true" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <p className={styles.footnote}>
          {GLOBAL_DATA_CAVEAT} ·{' '}
          <WhatsAppCta phone={CONTACT.whatsappUsUkEu} label="+91 9665110525 (US/UK/EU)" className={styles.footnoteLink} /> ·{' '}
          <WhatsAppCta phone={CONTACT.whatsappIndiaWorld} label="+91 8709206320 (India/World)" className={styles.footnoteLink} />
        </p>
      </main>
      <Footer />
    </>
  );
}
