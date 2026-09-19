import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CLEARED_CLINICAL_TRIALS, SCIENCE_COMPLIANCE_NOTE } from '@/data/science';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Science & Evidence',
  description: "Khatore's published clinical trial record.",
  alternates: { canonical: '/science' },
};

export default function SciencePage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.masthead}>
          <h1 className={styles.title}>
            Evidence, <strong>not assertion.</strong>
          </h1>
          <p className={styles.meta}>{CLEARED_CLINICAL_TRIALS.length} Published Clinical Trials · 1987–1993</p>
        </section>

        <section aria-label="Clinical trial index">
          {CLEARED_CLINICAL_TRIALS.map((trial) => (
            <article key={trial.id} className={styles.trial}>
              <span className={styles.trialN}>{String(trial.order).padStart(2, '0')}</span>
              <div className={styles.trialBody}>
                <h2 className={styles.trialLoc}>{trial.location}</h2>
                <div className={styles.trialMetaRow}>
                  <span>{trial.dateRange}</span>
                  <span>{trial.patientCount} Patients</span>
                  <span>{trial.conditions.join(' · ')}</span>
                </div>
                <p className={styles.trialSummary}>{trial.summary}</p>
              </div>
              <div className={styles.pubCol}>
                <span className={styles.pubJournal}>{trial.publication.journal}</span>
                <span className={styles.pubRef}>{trial.publication.reference}</span>
              </div>
            </article>
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
