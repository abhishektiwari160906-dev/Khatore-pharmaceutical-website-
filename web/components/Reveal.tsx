'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * The site's one motion primitive: fades/lifts content in as it enters
 * the viewport, using the exact .rv/.on pattern from the approved v5/v6
 * prototype (khatore-homepage-v6-1.html). Content is always present in
 * the DOM and readable without JS — this only ever toggles a class.
 */
export function Reveal({
  as: Tag = 'div',
  delay,
  className = '',
  children,
}: {
  as?: ElementType;
  delay?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('on');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay ? ` d${delay}` : '';
  const Component = Tag as ElementType<{ ref?: typeof ref; className?: string; children?: ReactNode }>;

  return (
    <Component ref={ref} className={`rv${delayClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}
