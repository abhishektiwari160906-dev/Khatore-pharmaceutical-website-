import Link from 'next/link';
import styles from './ArchivePhotoSlot.module.css';

/**
 * Honest stand-in for a real archival photograph. No historical
 * Khatore photography exists in this project yet — this renders a
 * deliberately designed "pending" slot (museum-archive visual
 * language: deep black, restrained border, archival numbering) rather
 * than a fabricated, AI-generated, or stock "old-looking" image. Swap
 * in a real <Image> here the moment real photography is supplied —
 * nothing else about the surrounding layout needs to change.
 */
export function ArchivePhotoSlot({
  number,
  caption,
  href,
  large = false,
}: {
  number: string;
  caption: string;
  href?: string;
  large?: boolean;
}) {
  const content = (
    <>
      <span className={styles.number}>{number}</span>
      <div className={styles.pendingMark} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="15" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="12.5" r="4" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5L9.5 2.5H14.5L16 5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className={styles.pendingLabel}>Archival Photography — Pending</span>
      </div>
      <span className={styles.caption}>{caption}</span>
    </>
  );

  const className = `${styles.slot} ${large ? styles.slotLarge : ''}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
