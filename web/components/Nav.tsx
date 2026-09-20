'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppCta } from './WhatsAppCta';
import { CartButton } from './Cart/CartButton';
import { SearchOverlay } from './Search/SearchOverlay';
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
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Recede on scroll-down past the first viewport, return on scroll-up —
  // keeps the chapter-scale hero/sections unobstructed without losing
  // navigation. Never hides while the mobile menu is open.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!open) {
          setHidden(y > lastY && y > 220);
        }
        lastY = y;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  return (
    <nav className={`${styles.nav} ${hidden ? styles.navHidden : ''}`}>
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
        <button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Search products">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <WhatsAppCta phone="918709206320" label="Talk to Khatore" className={styles.cta} />
        <CartButton className={styles.cartBtn} />

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
        <div className={styles.mobileUtilityRow} onClick={() => setOpen(false)}>
          <button
            type="button"
            className={styles.mobileSearchBtn}
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <CartButton className={styles.mobileCartBtn} />
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
