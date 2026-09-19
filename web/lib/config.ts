/**
 * Single source-of-truth for facts that are cleared for public use.
 * Every place on the site that needs these must import from here —
 * never re-type the literal value.
 */

/** Confirmed by the client (Master Build Directive, Section 5). Not a placeholder. */
export const HERITAGE_FOUNDING_YEAR = 1984;

export const BRAND = {
  name: 'Khatore Pharmaceuticals',
  legalName: 'Khatore Pharmaceuticals Pvt. Ltd.',
  flagshipProduct: 'Kamalahar',
  foundingCity: 'Barbil, Orissa',
} as const;
