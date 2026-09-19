import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { GLOBAL_STATS, GLOBAL_PRESENCE, GLOBAL_DATA_CAVEAT } from '@/data/global';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Global Presence',
  description: "Khatore Pharmaceuticals' international reach.",
  alternates: { canonical: '/global-presence' },
};

export default function GlobalPresencePage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            30+ countries. <strong>One mission.</strong>
          </h1>
          <p className={styles.body}>
            Over four decades, Khatore's Ayurvedic formulations have reached patients across more than
            thirty countries. The mission remains: efficacious, safe and economic Ayurvedic care for all.
          </p>
        </header>

        <div className={styles.stats}>
          {GLOBAL_STATS.map((s) => (
            <div key={s.l} className={styles.stat}>
              <div className={styles.statN}>{s.n}</div>
              <div className={styles.statL}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className={styles.presence}>
          {GLOBAL_PRESENCE.map((group) => (
            <div key={group.region} className={styles.col}>
              <span className={styles.regionHeading}>{group.region}</span>
              {group.countries.map((c) => (
                <div key={c} className={styles.row}>
                  <span>{c}</span>
                  <span className={styles.status}>Active</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className={styles.footnote}>
          {GLOBAL_DATA_CAVEAT} ·{' '}
          <WhatsAppCta phone="919665110525" label="+91 9665110525 (US/UK/EU)" className={styles.footnoteLink} /> ·{' '}
          <WhatsAppCta phone="918709206320" label="+91 8709206320 (India/World)" className={styles.footnoteLink} />
        </p>
      </main>
      <Footer />
    </>
  );
}
