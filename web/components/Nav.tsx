import Image from 'next/image';
import Link from 'next/link';
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
  return (
    <nav className={styles.nav}>
      <Link href="/" aria-label="Khatore Pharmaceuticals home">
        <Image src="/assets/brand/khatore-logo.png" alt="Khatore Pharmaceuticals" width={130} height={44} />
      </Link>
      <ul className={styles.links}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <WhatsAppCta phone="918709206320" label="Talk to Khatore" className={styles.cta} />
    </nav>
  );
}
