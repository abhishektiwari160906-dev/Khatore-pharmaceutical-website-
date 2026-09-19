import type { Metadata } from 'next';
import { HERITAGE_FOUNDING_YEAR, BRAND } from '@/lib/config';
import './globals.css';

const SITE_URL = 'https://www.khatorepharma.com';

/**
 * Organization schema — only facts already approved/used elsewhere on
 * the site (name, founding year, address from the footer, logo). No
 * aggregateRating, review, or other schema type requiring evidence we
 * don't have.
 */
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.legalName,
  alternateName: BRAND.name,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/brand/khatore-logo.png`,
  foundingDate: String(HERITAGE_FOUNDING_YEAR),
  foundingLocation: BRAND.foundingCity,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'P.O. Barbil',
    addressLocality: 'Barbil',
    addressRegion: 'Orissa',
    postalCode: '758035',
    addressCountry: 'IN',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Khatore Pharmaceuticals — Ayurvedic Knowledge Since 1984',
    template: '%s — Khatore Pharmaceuticals',
  },
  description:
    'Khatore Pharmaceuticals (GMP Certified): Ayurvedic formulations with published clinical research. 1M+ patients, 30+ countries. Est. 1984, Barbil, India.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Khatore Pharmaceuticals',
    title: 'Khatore Pharmaceuticals — Ayurvedic Knowledge Since 1984',
    description:
      'Khatore Pharmaceuticals (GMP Certified): Ayurvedic formulations with published clinical research. 1M+ patients, 30+ countries. Est. 1984, Barbil, India.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khatore Pharmaceuticals — Ayurvedic Knowledge Since 1984',
    description:
      'Khatore Pharmaceuticals (GMP Certified): Ayurvedic formulations with published clinical research.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts for now — self-hosting these is a Phase 1
            performance task (Section 25), tracked in assets/MANIFEST.md,
            not done in this pass. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@300;400&family=Playfair+Display:ital,wght@1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
