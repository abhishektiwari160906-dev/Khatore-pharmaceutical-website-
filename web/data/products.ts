/**
 * Product data model (Master Build Directive, Section 13).
 * Modular objects, not hardcoded per-page markup — future fields
 * (ingredients, benefits, pack sizes, checkout_url, ...) are typed as
 * optional so they can be populated later without a schema change,
 * and are only filled in here where approved source data exists.
 */

export interface Product {
  productId: string;
  slug: string;
  bgNum: string;
  name: string;
  format: string;
  image: string;
  /** Undefined, not invented, where no approved description exists yet — see status. */
  description?: string;
  status: 'approved' | 'pending-description';
  price?: { amount: number; currency: 'USD' };
  priceNote?: string;
  /** External Magento product page — the only purchase path today (Section 14). */
  checkoutUrl: string;
  // Reserved for later, populated only when approved data exists:
  sku?: string;
  ingredients?: string[];
  benefits?: string[];
  packSizes?: string[];
  availability?: 'in-stock' | 'out-of-stock';
  metadata?: Record<string, unknown>;
}

export const PRODUCTS: Product[] = [
  {
    productId: 'kamalahar',
    slug: 'kamalahar',
    bgNum: '01',
    name: 'Kamalahar',
    format: 'Capsule · Full Course 6 Months · 100 Caps × 12 Bottles',
    image: '/assets/products/01-kamalahar.png',
    description:
      'A traditional Ayurvedic formulation designed to help maintain liver wellness and overall vitality. Enriched with time-tested herbs, it supports healthy liver function, promotes natural detoxification, and aids in sustaining digestive balance.',
    status: 'approved',
    price: { amount: 399, currency: 'USD' },
    priceNote: 'Full 6-month course',
    checkoutUrl: 'https://www.khatorepharma.com/products/kamalahar.html',
  },
  {
    productId: 'k-mens',
    slug: 'k-mens',
    bgNum: '02',
    name: 'K-Mens',
    format: 'Capsule · Full Course 3 Months · 30 Caps × 12 Bottles',
    image: '/assets/products/02-k-mens.png',
    status: 'pending-description',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Full 3-month course',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-mens.html',
  },
  {
    productId: 'k-matic',
    slug: 'k-matic',
    bgNum: '03',
    name: 'K-Matic',
    format: 'Capsule · Full Course 3 Months · 30 Caps × 12 Bottles',
    image: '/assets/products/03-k-matic.png',
    description:
      'Ayurvedic support for joint strength and flexibility. [Description pending final wording approval from Khatore.]',
    status: 'pending-description',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Full 3-month course',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic.html',
  },
  {
    productId: 'k-cuff-syrup',
    slug: 'k-cuff-syrup',
    bgNum: '04',
    name: 'K-Cuff Syrup',
    format: 'Syrup · 200 ML × 6 Bottles · Non-sedative, non-alcoholic',
    image: '/assets/products/04-k-cuff-syrup.png',
    description:
      'A non-sedative, non-alcoholic Ayurvedic cough syrup. [Description pending final wording approval from Khatore.]',
    status: 'pending-description',
    price: { amount: 149, currency: 'USD' },
    priceNote: '6 bottles',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-cuff.html',
  },
  {
    productId: 'k-matic-oil',
    slug: 'k-matic-oil',
    bgNum: '05',
    name: 'K-Matic Oil',
    format: 'Oil',
    image: '/assets/products/05-k-matic-oil.png',
    status: 'pending-description',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic-oil.html',
  },
  {
    productId: 'kaptone',
    slug: 'kaptone',
    bgNum: '06',
    name: 'Kaptone',
    format: 'Capsule',
    image: '/assets/products/06-kaptone.jpg',
    status: 'pending-description',
    checkoutUrl: 'https://www.khatorepharma.com/products/kaptone.html',
  },
  {
    productId: 'k-morex-brain-tonic',
    slug: 'k-morex-brain-tonic',
    bgNum: '07',
    name: 'K-Morex Brain-Tonic',
    format: 'Tonic',
    image: '/assets/products/07-k-morex-brain-tonic.jpg',
    status: 'pending-description',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-morex.html',
  },
  {
    productId: 'k-matic-combo',
    slug: 'k-matic-combo',
    bgNum: '08',
    name: 'K-Matic Combo',
    format: 'Combo Pack',
    image: '/assets/products/08-k-matic-combo.png',
    status: 'pending-description',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic-combo.html',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
