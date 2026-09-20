import { PRODUCTS, type Product } from './products';

/**
 * "Shop by Concern" data model — Visual/IA pass.
 *
 * A concern only belongs here when it is backed by already-approved
 * Khatore data (a product's approved description, or the Heritage
 * page's approved founding/clinical text). Today that is exactly one
 * entry: Liver Vitality, backed by Kamalahar's approved description
 * and by the Heritage record naming liver ailments as the company's
 * founding purpose. Do not add a category here to fill out a layout —
 * see the homepage/heritage directive this pass implements.
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
];

export function getConcernBySlug(slug: string): Concern | undefined {
  return CONCERNS.find((c) => c.slug === slug);
}

export function getConcernProducts(concern: Concern): Product[] {
  return PRODUCTS.filter((p) => concern.productIds.includes(p.productId));
}
