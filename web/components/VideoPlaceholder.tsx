import type { VideoAsset } from '@/data/videos';
import styles from './VideoPlaceholder.module.css';

/**
 * Honest stand-in for a placement whose real media isn't self-hosted yet.
 * Never a fake frame, never a Drive URL — just the reserved slot, labeled,
 * so the section reads as "coming" rather than broken. `variant="dark"`
 * matches the cinematic full-bleed treatment for chapter-scale placements
 * (e.g. the Brand Video); the default is the light editorial chip.
 */
export function VideoPlaceholder({
  video,
  maxWidth,
  variant = 'light',
  eyebrow,
  heading,
}: {
  video: VideoAsset;
  maxWidth?: number;
  variant?: 'light' | 'dark';
  eyebrow?: string;
  heading?: string;
}) {
  if (variant === 'dark') {
    return (
      <div className={styles.cinematicFrame} style={{ ['--aspect' as string]: video.aspect ?? '16 / 9' }}>
        <div className={styles.cinematicText}>
          {eyebrow && <span className={styles.cinematicEyebrow}>{eyebrow}</span>}
          {heading && <h2 className={styles.cinematicHeading}>{heading}</h2>}
          <span className={styles.cinematicNote}>{video.title} — final asset in production</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.frame}
      style={{
        ['--aspect' as string]: video.aspect ?? '9 / 16',
        ...(maxWidth ? { ['--maxw' as string]: `${maxWidth}px` } : {}),
      }}
    >
      <svg className={styles.icon} width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#6874a0" strokeWidth="1.4" />
        <path d="M10 9L15 12L10 15V9Z" fill="#6874a0" />
      </svg>
      <span className={styles.title}>{video.title}</span>
      <span className={styles.note}>Final asset in production</span>
    </div>
  );
}
