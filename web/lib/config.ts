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

/**
 * Client-confirmed contact details. Two WhatsApp lines are both real and
 * both genuinely published by Khatore (already live on khatorepharma.com)
 * — one for India/World, one for US/UK/Europe. They are not duplicates
 * or a conflict; every call site should import the relevant one from
 * here rather than re-typing the digits.
 */
export const CONTACT = {
  email: 'support@khatorepharma.com',
  whatsappIndiaWorld: '918709206320',
  whatsappUsUkEu: '919665110525',
} as const;
