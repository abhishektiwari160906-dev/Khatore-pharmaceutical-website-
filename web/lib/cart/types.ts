/**
 * Cart data model — Commerce Foundation pass. Client-only: nothing here
 * is sent anywhere except as commercial-event metadata (add_to_cart /
 * remove_from_cart / cart_viewed). There is no order, no payment, no
 * server-side cart. See CartContext.tsx for why the checkout path
 * routes to a WhatsApp enquiry instead of a fake "Proceed to Checkout".
 */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  format: string;
  /** Undefined when the product has no approved price — the drawer shows "Contact for pricing" for that line instead of inventing one. */
  price?: { amount: number; currency: 'USD' };
  priceNote?: string;
  quantity: number;
}
