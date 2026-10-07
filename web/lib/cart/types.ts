/**
 * Cart data model — Commerce Foundation pass. Client-only: nothing here
 * is sent anywhere except as commercial-event metadata (add_to_cart /
 * remove_from_cart / cart_viewed). There is no order, no payment, no
 * server-side cart. See CartContext.tsx for why the checkout path
 * routes to a WhatsApp enquiry instead of a fake "Proceed to Checkout".
 */
import type { CurrencyCode } from '@/data/currencies';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  format: string;
  /** Undefined when the product has no approved price — the drawer shows "Contact for pricing" for that line instead of inventing one. */
  price?: { amount: number; currency: CurrencyCode };
  priceNote?: string;
  quantity: number;
  /**
   * Snapshot of the resolved pricing (Master Pricing pass, Section 5)
   * taken at add-to-cart time via lib/pricing/resolve.ts. Undefined for
   * a product with no tiered pricing (today: everything but Kamalahar),
   * where `price` above is the whole story. The cart is still NOT the
   * source of truth -- checkout always re-resolves server-side from the
   * confirmed shipping country (Section 6).
   */
  regularPrice?: number;
  discountPercent?: number;
  tier?: string;
  country?: string;
  taxIncluded?: boolean;
  shippingIncluded?: boolean;
}
