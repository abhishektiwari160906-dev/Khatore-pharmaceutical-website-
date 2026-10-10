/**
 * Product data model (Master Build Directive, Section 13; extended for
 * the Commerce Foundation pass).
 * Modular objects, not hardcoded per-page markup — future fields
 * (ingredients, benefits, pack sizes, checkout_url, ...) are typed as
 * optional so they can be populated later without a schema change,
 * and are only filled in here where approved source data exists.
 */

import type { CurrencyCode } from './currencies';

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
  price?: { amount: number; currency: CurrencyCode };
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

// Descriptions/ingredients/usage for the 7 non-Kamalahar products below
// are quoted verbatim from Khatore's own live product pages
// (khatorepharma.com/products/<slug>.html — see each entry's
// checkoutUrl), fetched and ported directly, not invented.
export const PRODUCTS: Product[] = [
  {
    productId: 'kamalahar',
    slug: 'kamalahar',
    bgNum: '01',
    name: 'Kamalahar',
    format: 'Capsule · Full Course 6 Months · 100 Caps × 12 Bottles',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC09503.jpg), replacing the old flat white-background shot.
    image: '/assets/products/01-kamalahar.jpg',
    // 10 Oct: replaced with the cleared copy deck's "Short Story" text
    // (verbatim) -- see data/productCopy.ts for the full deck
    // (benefits, conditions addressed, clinical info, lifestyle
    // protocol), shown on this product's detail page.
    description:
      'High stress, heavy meals, urban pollution, and alcohol strain your liver first. Kamalahar works at the cellular level to optimize liver function tests (LFTs), protect liver parenchyma, and promote tissue regeneration.',
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
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC07098.jpg), replacing the old shot at this same path.
    image: '/assets/products/02-k-mens.jpg',
    // 10 Oct: replaced with the cleared copy deck's "Short Story" text
    // (verbatim) -- see data/productCopy.ts for the full deck.
    description:
      "Period days shouldn't pause your life. K-Mens is a clinically inspired uterine sedative and hemostatic formulation that modulates reproductive endocrine pathways to soothe menstrual pain and restore cycle predictability.",
    status: 'approved',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Full 3-month course',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-mens.html',
    ingredients: [
      'Saraca indica (Ashoka)',
      'Woodfordia fruticosa',
      'Zingiber officinale',
      'Berberis aristata',
      'Nymphea nouchali',
      'Terminalia chebula',
      'Terminalia belerica',
      'Emblica officinalis',
      'Mangifera indica',
      'Carum bulbocastanum',
      'Adhatoda vasica',
      'Santalum album',
    ],
    usage:
      '2 capsules 2 times a day for 6 months, or as directed by a physician. Reduce intake of sour foods, chillies, spices, fatty/oily foods and non-veg. Not advisable during pregnancy. No adverse effects reported when taken as advised by the physician.',
  },
  {
    productId: 'k-matic',
    slug: 'k-matic',
    bgNum: '03',
    name: 'K-Matic',
    format: 'Capsule · Full Course 3 Months · 30 Caps × 12 Bottles',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC00906.jpg, the capsule-bottle shots from the shared "K-Matic"
    // subfolder), replacing the old shot at this same path.
    image: '/assets/products/03-k-matic.jpg',
    // 10 Oct: replaced with the cleared copy deck's "Short Story" text
    // (verbatim) -- see data/productCopy.ts for the full deck.
    description:
      'Built for bodies in motion. K-Matic Capsules deliver systemic anti-inflammatory bio-actives internally to regulate cytokines, protect cartilage, and soothe deep neuro-muscular discomfort.',
    status: 'approved',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Full 3-month course',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic.html',
    ingredients: ['Purified Guggulu', 'Purified Kuchila (Strychnos nux-vomica)', 'Soubhagya Bhasma', 'Malla Sindoor', 'Ras Sindoor'],
    usage:
      '2 capsules, 3 times a day after meals, or as directed by the physician, for 3 months. Reduce intake of sour foods, chillies, spices, fatty/oily food and non-vegetarian items. Individuals with special health conditions should take it only under physician supervision.',
  },
  {
    productId: 'k-cuff-syrup',
    slug: 'k-cuff-syrup',
    bgNum: '04',
    name: 'K-Cuff Syrup',
    format: 'Syrup · 200 ML × 6 Bottles · Non-sedative, non-alcoholic',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC07017.jpg), replacing the old shot at this same path.
    image: '/assets/products/04-k-cuff-syrup.jpg',
    description:
      'K-Cuff is a time-tested Tulsi-based Ayurvedic cough syrup, carefully prepared without alcohol or sedatives — traditionally valued in Ayurveda for supporting respiratory comfort, soothing throat irritation, and promoting natural wellness.',
    status: 'approved',
    price: { amount: 149, currency: 'USD' },
    priceNote: '6 bottles',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-cuff.html',
    ingredients: [
      'Solanum virginianum',
      'Terminalia chebula',
      'Zingiber officinale',
      'Piper longum',
      'Piper nigrum',
      'Cinnamomum verum',
      'Elettaria cardamomum',
      'Cinnamomum tamala',
      'Mesua ferrea',
      'Ocimum tenuiflorum (Tulsi)',
      'Mentha',
      'Apis mellifera',
    ],
    usage:
      'Adults: 10 ml thrice daily. Children: 5 ml thrice daily, or as directed by a physician. Results and experiences may vary; use under the supervision of a qualified physician.',
  },
  {
    productId: 'k-matic-oil',
    slug: 'k-matic-oil',
    bgNum: '05',
    name: 'K-Matic Oil',
    format: 'Topical Oil · Half Course 6 Weeks · 100 ML × 6 Bottles',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC00895.jpg, the oil-bottle shots from the same shared
    // "K-Matic" subfolder), replacing the old shot at this same path.
    image: '/assets/products/05-k-matic-oil.jpg',
    // 10 Oct: replaced with the cleared copy deck's "Short Story" text
    // (verbatim) -- see data/productCopy.ts for the full deck.
    description:
      'Your instant "off button" for localized pain. Formulated for rapid dermal penetration, this warming rub delivers targeted analgesic relief directly to tight muscles and painful nerve endings.',
    status: 'approved',
    price: { amount: 139, currency: 'USD' },
    priceNote: 'Half course 6 weeks',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic-oil.html',
    ingredients: [
      'Ashwagandha',
      'Gokshur',
      'Punarnava',
      'Gandhali',
      'Nirgundi',
      'Lodhra',
      'Manjishtha',
      'Musta',
      'Guduchi (Giloy)',
      'Adrak',
      'Kuchla (Shodhit)',
      'Chitrak',
      'Pippali',
      'Chavya',
      'Shahi Jeera',
      'Til ka Tel',
      'Nilgiri ka Tel',
    ],
    usage:
      '5 to 10 ml, thrice daily, massaged thoroughly on the affected area for 6 weeks. No complications, contraindications or side effects observed to date.',
  },
  {
    productId: 'kaptone',
    slug: 'kaptone',
    bgNum: '06',
    name: 'Kaptone',
    format: 'Tonic · Half Course 6 Weeks · 210 ML × 6 Bottles',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC06992.jpg), replacing the old shot at this same path.
    image: '/assets/products/06-kaptone.jpg',
    description:
      'An Ayurvedic supplement for the restoration of health, nerves, energy and general well-being across all age groups for males and females — formulated to foster convalescence during fatigue or illness.',
    status: 'approved',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Half course 6 weeks',
    checkoutUrl: 'https://www.khatorepharma.com/products/kaptone.html',
    ingredients: [
      'Purified Vitis vinifera (Draksha)',
      'Woodfordia fruticosa (Dhataki)',
      'Cardamomum (Elaichi)',
      'Cinnamomum leaf (Malabathrum)',
      'Callicarpa macrophylla (Gandhaphali)',
      'Piper nigrum (Dhanwantari)',
      'Piper longum (Pippali)',
      'Embelia ribes (Vidanga)',
    ],
    usage:
      'Adults: 10 ml thrice daily. Children: 5 ml thrice daily, for 6 weeks. No adverse effects reported when taken as advised by the physician.',
  },
  {
    productId: 'k-morex-brain-tonic',
    slug: 'k-morex-brain-tonic',
    bgNum: '07',
    name: 'K-Morex Brain-Tonic',
    format: 'Tonic · Half Course 6 Weeks · 200 ML × 6 Bottles',
    // 10 Oct: real product photography from Vrinda's Drive folder
    // (DSC09707.jpg), replacing the old shot at this same path.
    image: '/assets/products/07-k-morex-brain-tonic.jpg',
    description:
      'An Ayurvedic formulation traditionally valued for supporting mental clarity, concentration, learning, and overall cognitive wellness.',
    status: 'approved',
    price: { amount: 149, currency: 'USD' },
    priceNote: 'Half course 6 weeks',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-morex.html',
    ingredients: [
      'Purified Bacopa monnieri (Brahmi)',
      'Asparagus racemosus (Shatavari)',
      'Withania somnifera (Ashwagandha)',
      'Tinospora cordifolia (Guduchi)',
      'Acorus calamus (Bacha)',
      'Terminalia chebula',
      'Vetiveria zizanoides',
      'Ginger',
      'Fennel',
    ],
    usage:
      'Adults: 10 to 15 ml twice daily. Children: 5 ml twice daily, for 6 weeks. No adverse effects reported when taken as advised by the physician.',
  },
  {
    productId: 'k-matic-combo',
    slug: 'k-matic-combo',
    bgNum: '08',
    name: 'K-Matic Combo',
    format: 'Combination · Half Course 6 Weeks · Capsules + Oil × 6 each',
    // 10 Oct: the only one of 8 products NOT re-photographed this
    // pass -- Vrinda's Drive "K-Matic" subfolder has real capsule shots
    // (used for k-matic above) and real oil shots (used for
    // k-matic-oil above), but no shot showing both together as a combo
    // pack. Old image kept rather than guessing/compositing one.
    image: '/assets/products/08-k-matic-combo.png',
    // 10 Oct: replaced with the cleared copy deck's "Short Story" text
    // (verbatim) -- see data/productCopy.ts for the full deck.
    description:
      'Why choose between surface comfort and root care? This dual-pathway clinical system combines internal capsular therapy for tissue repair with transdermal oil for rapid local pain suppression.',
    status: 'approved',
    price: { amount: 179, currency: 'USD' },
    priceNote: 'Half course combination',
    checkoutUrl: 'https://www.khatorepharma.com/products/k-matic-combo.html',
    ingredients: [
      'Capsules: Purified Guggulu, purified Kuchila (Strychnos nux-vomica), Abhrak Bhasma, Soubhagya Bhasma, Malla Sindoor, Ras Sindoor',
      'Oil: Ashwagandha, Gokshur, Punarnava, Gandhali, Nirgundi, Lodhra, Manjishtha, Musta, Guduchi (Giloy), Adrak, Kuchla (Shodhit), Chitrak, Pippali, Chavya, Shahi Jeera, Til ka Tel, Nilgiri ka Tel',
    ],
    usage:
      'Capsules: 2 capsules 2 times a day for 6 weeks. Oil: 5 to 10 ml, thrice daily on the affected area, for 6 weeks. Higher doses of the capsules are contraindicated in hypertension — use under qualified physician guidance, particularly with pre-existing conditions.',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
