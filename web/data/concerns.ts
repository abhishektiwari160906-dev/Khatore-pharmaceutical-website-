import { PRODUCTS, type Product } from './products';

/**
 * "Shop by Concern" data model — Visual/IA pass.
 *
 * A concern only belongs here when it is backed by already-approved
 * Khatore data (a product's approved description, or the Heritage
 * page's approved founding/clinical text). The five entries below are
 * the client-confirmed set (2026-09-28): each description is built
 * only from that product's already-approved data/products.ts copy,
 * framed with the client's own confirmed concern phrasing — nothing
 * invented (no new ingredients, statistics, or outcomes). Do not add
 * a category here to fill out a layout.
 */
export interface Concern {
  slug: string;
  name: string;
  /** Two-line homepage card label, e.g. ["Liver", "Vitality"]. */
  cardLabel: [string, string];
  /** Approved-language explanation, built only from existing approved copy. */
  description: string;
  productIds: string[];
}

export const CONCERNS: Concern[] = [
  {
    slug: 'liver-vitality',
    name: 'Liver Vitality',
    cardLabel: ['Liver', 'Vitality'],
    description:
      "Liver wellness has been Khatore's founding purpose since 1984 — Ayurvedic formulations for patients with liver ailments and jaundice, built on efficacy, safety and accessibility. Kamalahar, the formulation at the centre of that work, is designed to help maintain liver wellness and overall vitality: supporting healthy liver function, promoting natural detoxification, and aiding sustained digestive balance.",
    productIds: ['kamalahar'],
  },
  {
    slug: 'joint-pain',
    name: 'Ease Joint Pain',
    cardLabel: ['Joint', 'Pain'],
    description:
      'K-Matic is Khatore\'s Ayurvedic formulation to help ease joint pain — an innovative formulation made with twenty-one carefully selected ingredients, traditionally known in Ayurveda for their synergistic role in supporting joint comfort, musculoskeletal strength, and natural mobility.',
    productIds: ['k-matic'],
  },
  {
    slug: 'throat-lungs',
    name: 'Ease Throat and Lungs',
    cardLabel: ['Throat', 'and Lungs'],
    description:
      'K-Cuff is Khatore\'s Ayurvedic formulation to help ease throat and lung discomfort — a time-tested Tulsi-based Ayurvedic cough syrup, carefully prepared without alcohol or sedatives, traditionally valued in Ayurveda for supporting respiratory comfort, soothing throat irritation, and promoting natural wellness.',
    productIds: ['k-cuff-syrup'],
  },
  {
    slug: 'memory-concentration',
    name: 'Help Memory & Concentration',
    cardLabel: ['Memory', '& Concentration'],
    description:
      "K-Morex is Khatore's Ayurvedic formulation to help memory and concentration, for all age groups — an Ayurvedic formulation traditionally valued for supporting mental clarity, concentration, learning, and overall cognitive wellness.",
    productIds: ['k-morex-brain-tonic'],
  },
  {
    slug: 'menstrual-cycles',
    name: 'Manages Menstrual Cycles',
    cardLabel: ['Menstrual', 'Cycles'],
    description:
      "K-Mens is Khatore's Ayurvedic formulation that manages menstrual cycles — a time-tested, Ashoka-based Ayurvedic formulation traditionally valued in women's wellness, enriched with classical herbs that support healthy uterine function, promote natural blood circulation, and help in maintaining internal balance.",
    productIds: ['k-mens'],
  },
  {
    slug: 'wellness-energy',
    name: 'Wellness & Energy',
    cardLabel: ['Wellness', '& Energy'],
    description:
      "Kaptone is Khatore's Ayurvedic tonic for everyday wellness and energy — an Ayurvedic supplement for the restoration of health, nerves, energy and general well-being across all age groups for males and females, formulated to foster convalescence during fatigue or illness.",
    productIds: ['kaptone'],
  },
];

export function getConcernBySlug(slug: string): Concern | undefined {
  return CONCERNS.find((c) => c.slug === slug);
}

export function getConcernProducts(concern: Concern): Product[] {
  return PRODUCTS.filter((p) => concern.productIds.includes(p.productId));
}
