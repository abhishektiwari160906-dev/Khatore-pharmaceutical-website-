'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppCta } from './WhatsAppCta';
import { CartButton } from './Cart/CartButton';
import { SearchOverlay } from './Search/SearchOverlay';
import { CONTACT } from '@/lib/config';
import styles from './Nav.module.css';

/**
 * Standard WhatsApp glyph (speech bubble + handset) -- recognisable at a
 * glance rather than a generic chat-bubble icon, so visitors immediately
 * know what this opens.
 */
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.45 3.44 1.32 4.94L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.21 0 4.29.86 5.86 2.43a8.26 8.26 0 0 1 2.43 5.81c0 4.55-3.71 8.25-8.29 8.25a8.3 8.3 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.27-4.39c0-4.55 3.71-8.24 8.27-8.24Zm-4.54 4.6c-.17 0-.44.06-.67.32-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.57.13.17 1.74 2.77 4.28 3.78 2.12.84 2.55.67 3.01.63.46-.04 1.49-.6 1.7-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.56.13-.17.25-.64.82-.78.99-.15.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.38-.78-1.88-.2-.49-.41-.43-.56-.44-.15-.01-.31-.01-.48-.01Z" />
    </svg>
  );
}

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

  // Same Escape-to-close pattern already used by SearchOverlay/CartDrawer.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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
        <WhatsAppCta
          phone={CONTACT.whatsappIndiaWorld}
          label={<WhatsAppIcon />}
          bare
          aria-label="Chat with Khatore on WhatsApp"
          className={styles.whatsappIconBtn}
        />
        <WhatsAppCta phone={CONTACT.whatsappIndiaWorld} label="Talk to Khatore" className={styles.cta} />
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
          phone={CONTACT.whatsappIndiaWorld}
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
          <WhatsAppCta
            phone={CONTACT.whatsappIndiaWorld}
            label={<WhatsAppIcon />}
            bare
            aria-label="Chat with Khatore on WhatsApp"
            className={styles.whatsappIconBtn}
          />
          <CartButton className={styles.mobileCartBtn} />
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
