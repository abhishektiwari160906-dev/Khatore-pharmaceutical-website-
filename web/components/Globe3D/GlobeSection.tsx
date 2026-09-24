'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import styles from './Globe3D.module.css';

// Same chunk-fetch retry as the Bhui Amla dynamic import (app/page.tsx)
// -- a transient network failure loading this ssr:false component's
// chunk would otherwise silently leave the globe unmounted.
function importWithRetry<T>(load: () => Promise<T>, retries = 2, delayMs = 700): Promise<T> {
  return load().catch((err) => {
    if (retries <= 0) throw err;
    return new Promise((resolve) => setTimeout(resolve, delayMs)).then(() => importWithRetry(load, retries - 1, delayMs));
  });
}

const Globe3D = dynamic(() => importWithRetry(() => import('./Globe3D')).then((m) => m.Globe3D), {
  ssr: false,
  loading: () => null,
});

export interface GlobeSectionProps {
  compact?: boolean;
  className?: string;
}

/**
 * Mounts the (WebGL-heavy) Globe3D only once this section approaches
 * the viewport, and only once -- it never unmounts again after first
 * becoming visible, so scrolling past and back doesn't repeatedly
 * tear down/recreate the WebGL context.
 */
export function GlobeSection({ compact, className }: GlobeSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shouldMount]);

  return (
    <div ref={ref} className={className} style={{ height: '100%', width: '100%' }}>
      {shouldMount ? <Globe3D compact={compact} /> : <div className={styles.fallbackRing} aria-hidden="true" />}
    </div>
  );
}
