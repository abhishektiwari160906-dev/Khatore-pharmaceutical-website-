/**
 * Product data model (Master Build Directive, Section 13; extended for
 * the Commerce Foundation pass).
 * Modular objects, not hardcoded per-page markup — future fields
 * (ingredients, benefits, pack sizes, checkout_url, ...) are typed as
 * optional so they can be populated later without a schema change,
 * and are only filled in here where approved source data exists.
 */

/** Content-approval axis — has Khatore signed off the copy shown for this product. */
export type ContentStatus = 'approved' | 'pending-description';

/**
 * Commerce-availability axis — deliberately SEPARATE from ContentStatus.
 * A product's description can be pending Khatore's approval while the
 * product is still genuinely purchasable through the live Magento
 * store (that's the real, current state of all 8 products here) — the
 * two facts don't imply each other, so they aren't the same field.
 */
export type PurchaseState = 'BUY_NOW' | 'ENQUIRE' | 'UNAVAILABLE';

export interface Product {
  productId: string;
  slug: string;
  bgNum: string;
  name: string;
  format: string;
  image: string;
  /** Undefined, not invented, where no approved description exists yet — see status. */
  description?: string;
  status: ContentStatus;
  price?: { amount: number; currency: 'USD' };
  priceNote?: string;
  /** External Magento product page — the only purchase path today (Section 14). */
  checkoutUrl: string;
  /**
   * Explicit override for PurchaseState, only when Khatore has actually
   * said so (e.g. a real discontinuation or an enquire-only line). Leave
   * undefined for every product here — none of the 8 have such an
   * instruction on file, so all resolve via getPurchaseState()'s default
   * (real checkoutUrl present -> BUY_NOW) instead of a guess.
   */
  purchaseStateOverride?: PurchaseState;
  // Reserved for later, populated only when approved data exists:
  sku?: string;
  ingredients?: string[];
  benefits?: string[];
  usage?: string;
  packSizes?: string[];
  availability?: 'in-stock' | 'out-of-stock';
  /**
   * Set only where an already-approved source (e.g. the Heritage page's
   * own mission statement, which explicitly names Kamalahar as the
   * subject of the clinical trial program) ties this product to
   * Khatore's published clinical evidence. Never inferred from a study's
   * subject matter alone — that would be an efficacy claim by visual
   * association, which is exactly what this field must not create.
   */
  evidenceLinked?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Purchase state, derived only from fields that already exist on the
 * product — never a separate guess. `purchaseStateOverride` wins when
 * Khatore has actually said so; otherwise a real `checkoutUrl` means
 * BUY_NOW (today's real, live purchase path for all 8 products), and
 * its absence means ENQUIRE — there is no UNAVAILABLE case in the
 * current catalogue, only in the type, for whenever one is needed.
 */
export function getPurchaseState(product: Product): PurchaseState {
  if (product.purchaseStateOverride) return product.purchaseStateOverride;
  return product.checkoutUrl ? 'BUY_NOW' : 'ENQUIRE';
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
    // The Heritage page's own approved mission statement explicitly
    // names Kamalahar as the subject of the clinical trial program —
    // an already-published association, not an inference from this pass.
    evidenceLinked: true,
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
