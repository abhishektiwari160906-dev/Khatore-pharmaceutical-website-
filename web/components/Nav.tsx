'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppCta } from './WhatsAppCta';
import styles from './Nav.module.css';

const LINKS = [
  { href: '/heritage', label: 'Heritage' },
  { href: '/science', label: 'Science' },
  { href: '/products', label: 'Products' },
  { href: '/global-presence', label: 'Global' },
  { href: '/contact', label: 'Contact' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <Link href="/" aria-label="Khatore Pharmaceuticals home" className={styles.logoLink}>
          <Image src="/assets/brand/khatore-logo.png" alt="Khatore Pharmaceuticals" width={130} height={44} priority />
        </Link>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <WhatsAppCta phone="918709206320" label="Talk to Khatore" className={styles.cta} />

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.burgerBar} ${open ? styles.burgerBarOpenTop : ''}`} />
          <span className={`${styles.burgerBar} ${open ? styles.burgerBarOpenMid : ''}`} />
          <span className={`${styles.burgerBar} ${open ? styles.burgerBarOpenBot : ''}`} />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!open}
      >
        <ul className={styles.mobileLinks}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} tabIndex={open ? 0 : -1}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <WhatsAppCta
          phone="918709206320"
          label="Talk to Khatore"
          className={styles.mobileCta}
        />
      </div>
    </nav>
  );
}
