import type { Metadata } from 'next';
import Image from 'next/image';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { VideoBlock } from '@/components/VideoBlock';
import { TESTIMONIALS } from '@/data/testimonials';
import styles from './page.module.css';

const description = "Real, attributed patient and doctor accounts of Kamalahar — Khatore Pharmaceuticals' own testimonial archive.";

export const metadata: Metadata = {
  title: 'Testimonials',
  description,
  alternates: { canonical: '/testimonials' },
  openGraph: { title: 'Testimonials — Khatore Pharmaceuticals', description, url: '/testimonials' },
};

/**
 * Self-hosted testimonial archive (10 Oct) -- replaces linking out to
 * khatorepharma.com/testimonials. Content (quotes/videos) is the same
 * real, attributed data already used on the homepage teaser
 * (data/testimonials.ts), just shown in full here; the page's own
 * visual design follows this site's design system (Navy/Green,
 * app/globals.css tokens), not the old Magento site's look.
 */
export default function TestimonialsPage() {
  return (
    <>
      <Nav />
      <main>
        <section className={styles.masthead}>
          <Reveal as="div" className={styles.mastheadInner}>
            <span className={styles.eyebrow}>Patient Archive</span>
            <h1 className={styles.title}>Real experiences, honestly shared.</h1>
            <p className={styles.sub}>
              Many people navigating liver health look for perspectives beyond routine care. These are real,
              attributed accounts — every card links back to its real source.
            </p>
          </Reveal>
        </section>

        {/* Header video (10 Oct spec: "Add a header video at the top of
            the Testimonials section") -- pending-asset until Vrinda's
            real file is transferred in (see data/videos.ts). */}
        <section className={styles.headerVideoSection} aria-label="Testimonials video">
          <VideoBlock id="testimonialsHeader" eyebrow="In Their Own Words" heading="Hear it from them directly" dark />
        </section>

        {/* Featured reel (10 Oct spec: Vrinda's "Reel 1" from her shared
            drive, once accessible) -- pending-asset, same reasoning. */}
        <section className={styles.featuredSection} aria-label="Featured testimonial reel">
          <Reveal as="div" className={styles.featuredInner}>
            <VideoBlock id="testimonialsReel1" maxWidth={420} />
          </Reveal>
        </section>

        <section className={styles.grid} aria-label="All testimonials">
          <Reveal as="div" className={styles.gridInner}>
            {TESTIMONIALS.map((t) => {
              const nameWords = t.name
                .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/, '')
                .split(/\s+/)
                .filter((w) => /^[A-Za-z]/.test(w));
              const initials = [nameWords[0], nameWords[nameWords.length - 1]]
                .filter(Boolean)
                .map((w) => w![0])
                .join('')
                .toUpperCase();
              return (
                <a key={t.id} href={t.sourceUrl} target="_blank" rel="noopener" className={styles.card}>
                  <div className={styles.media}>
                    {t.youtubeId ? (
                      <iframe
                        className={styles.iframe}
                        src={`https://www.youtube.com/embed/${t.youtubeId}`}
                        title={`${t.name} — video testimonial`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : t.videoUrl ? (
                      <video
                        className={styles.video}
                        src={t.videoUrl}
                        poster={t.posterUrl}
                        controls
                        playsInline
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : t.documentUrl ? (
                      <>
                        <Image
                          src={t.documentUrl}
                          alt={t.documentCaption ?? 'Original testimonial document'}
                          fill
                          sizes="(max-width: 700px) 100vw, 360px"
                          className={styles.documentImg}
                        />
                        <span className={styles.documentCaption}>{t.documentCaption}</span>
                      </>
                    ) : (
                      <>
                        <span className={styles.initials} aria-hidden="true">
                          {initials}
                        </span>
                        <span className={styles.pending}>Testimonial video pending</span>
                      </>
                    )}
                    <span className={styles.tag}>{t.tag}</span>
                  </div>
                  <p className={styles.text}>&ldquo;{t.excerpt}&rdquo;</p>
                  <div className={styles.foot}>
                    <span className={styles.name}>
                      {t.name} — {t.location}
                    </span>
                    <span className={styles.source}>Source: khatorepharma.com ↗</span>
                  </div>
                </a>
              );
            })}
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
