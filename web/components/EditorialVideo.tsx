'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/events/client';
import type { VideoAsset } from '@/data/videos';
import styles from './EditorialVideo.module.css';

/**
 * Muted, looped, ambient B-roll treatment (Reels 1/2/3/4's default). Only
 * plays while scrolled into view (IntersectionObserver), never autoplays
 * off-screen, and respects prefers-reduced-motion by staying on the
 * poster frame and never starting playback.
 */
export function EditorialVideo({ video, caption }: { video: VideoAsset; caption?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          el.play().catch(() => {
            // Autoplay can be blocked (e.g. low-power mode) — the poster
            // frame is a complete fallback, so there's nothing to recover.
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div className={styles.frame} style={{ ['--aspect' as string]: video.aspect ?? '9 / 16' }}>
      {reducedMotion ? (
        <img src={video.poster} alt={video.title} className={styles.media} />
      ) : (
        <video
          ref={videoRef}
          className={styles.media}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => {
            if (!startedRef.current) {
              startedRef.current = true;
              trackEvent('video_started', {
                metadata: { video_id: video.id, title: video.title, treatment: 'editorial' },
              });
            }
          }}
        />
      )}
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
  );
}
