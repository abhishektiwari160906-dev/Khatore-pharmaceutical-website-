'use client';

import { useRef, useState } from 'react';
import { trackEvent } from '@/lib/events/client';
import type { VideoAsset } from '@/data/videos';
import styles from './CinematicVideo.module.css';

/**
 * Deliberate click-to-play treatment for the long-form Brand Video — not
 * an autoplay background. Shows the poster with a play affordance until
 * the visitor chooses to watch; only then does playback (unmuted, with
 * native controls) start.
 */
export function CinematicVideo({
  video,
  label,
  eyebrow,
  heading,
}: {
  video: VideoAsset;
  label?: string;
  eyebrow?: string;
  heading?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    setPlaying(true);
    trackEvent('video_started', {
      metadata: { video_id: video.id, title: video.title, treatment: 'cinematic' },
    });
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  return (
    <div className={styles.frame} style={{ ['--aspect' as string]: video.aspect ?? '16 / 9' }}>
      {playing ? (
        <video
          ref={videoRef}
          className={styles.media}
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          onEnded={() =>
            trackEvent('video_completed', {
              metadata: { video_id: video.id, title: video.title, treatment: 'cinematic' },
            })
          }
        />
      ) : (
        <>
          {video.poster && <img src={video.poster} alt={video.title} className={styles.poster} />}
          <div className={styles.scrim} aria-hidden="true" />
          {(eyebrow || heading) && (
            <div className={styles.textBlock}>
              {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
              {heading && <h2 className={styles.heading}>{heading}</h2>}
            </div>
          )}
          <button
            type="button"
            className={styles.playButton}
            onClick={start}
            aria-label={`Play ${video.title}`}
          >
            <span className={styles.disc}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M6 4L16 10L6 16V4Z" fill="#061a70" />
              </svg>
            </span>
          </button>
          {label && <span className={styles.label}>{label}</span>}
        </>
      )}
    </div>
  );
}
