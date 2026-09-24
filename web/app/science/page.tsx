import type { Metadata } from 'next';
import Image from 'next/image';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { CLEARED_CLINICAL_TRIALS, SCIENCE_COMPLIANCE_NOTE, INSTITUTION_IMAGES } from '@/data/science';
import { HERITAGE_ENTRIES } from '@/data/heritage';
import styles from './page.module.css';

// The program-level methodology line already approved in the Heritage
// record (data/heritage.ts, "Clinical Trials" entry) — read from there
// rather than duplicated as a separate literal, so the two can never
// drift out of sync.
const CLINICAL_TRIALS_HERITAGE_ENTRY = HERITAGE_ENTRIES.find((e) => e.title === 'Clinical Trials');

const description = "Khatore's published clinical trial record.";

export const metadata: Metadata = {
  title: 'Science & Evidence',
  description,
  alternates: { canonical: '/science' },
  openGraph: { title: 'Science & Evidence — Khatore Pharmaceuticals', description, url: '/science' },
};

export default function SciencePage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.masthead}>
          <span className={styles.eyebrow}>{CLEARED_CLINICAL_TRIALS.length} Published Clinical Trials · 1987–1993</span>
          <h1 className={styles.title}>
            Evidence, <em>not assertion.</em>
          </h1>
          {CLINICAL_TRIALS_HERITAGE_ENTRY ? (
            <div className={styles.programBanner}>
              <span className={styles.programBannerLabel}>Clinical Research</span>
              <p className={styles.programBannerText}>{CLINICAL_TRIALS_HERITAGE_ENTRY.text}</p>
            </div>
          ) : null}
        </section>

        <section className={styles.dashboard} aria-label="Clinical trial evidence">
          {CLEARED_CLINICAL_TRIALS.map((trial, i) => (
            <Reveal key={trial.id} as="details" className={styles.trialCard} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <summary className={styles.trialSummaryRow}>
                {trial.institutionImageKeys.length === 1 ? (
                  <span className={styles.institutionImageWrap}>
                    <Image
                      src={INSTITUTION_IMAGES[trial.institutionImageKeys[0]!]!.src}
                      alt={INSTITUTION_IMAGES[trial.institutionImageKeys[0]!]!.alt}
                      width={1200}
                      height={675}
                      className={styles.institutionImage}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </span>
                ) : (
                  <span className={styles.institutionImageGrid}>
                    {trial.institutionImageKeys.map((key) => (
                      <Image
                        key={key}
                        src={INSTITUTION_IMAGES[key]!.src}
                        alt={INSTITUTION_IMAGES[key]!.alt}
                        width={300}
                        height={225}
                        className={styles.institutionImageSmall}
                        loading="lazy"
                      />
                    ))}
                  </span>
                )}
                <span className={styles.trialN}>{String(trial.order).padStart(2, '0')}</span>
                <span className={styles.trialHighlight}>{trial.evidenceHighlight}</span>
                <span className={styles.trialLoc}>{trial.location.split(',')[0]}</span>
                <span className={styles.trialStatRow}>
                  <span className={styles.trialStat}>{trial.patientCount}</span>
                  <span className={styles.trialStatLabel}>Patients</span>
                </span>
                <span className={styles.trialExpand} aria-hidden="true">
                  + Details
                </span>
              </summary>
              <div className={styles.trialBody}>
                <h2 className={styles.trialFullLoc}>{trial.location}</h2>
                <div className={styles.trialMetaRow}>
                  <span>{trial.dateRange}</span>
                  <span>{trial.conditions.join(' · ')}</span>
                </div>
                <p className={styles.trialSummaryText}>{trial.summary}</p>
                <div className={styles.pubCol}>
                  <span className={styles.pubJournal}>{trial.publication.journal}</span>
                  <span className={styles.pubRef}>{trial.publication.reference}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        <p className={styles.compliance}>
          {SCIENCE_COMPLIANCE_NOTE} Full documents:{' '}
          <a href="https://www.khatorepharma.com/about-us" target="_blank" rel="noopener">
            khatorepharma.com/about-us
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
