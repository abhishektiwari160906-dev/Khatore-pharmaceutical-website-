/**
 * Typed scaffolding for a future customer-account system — Commerce
 * Foundation pass, Section 13 ("Future Customer Account").
 *
 * NOTHING HERE IS IMPLEMENTED. No auth, no persistence, no UI reads or
 * writes these types anywhere in the app yet — they exist only so a
 * later account/order build doesn't have to invent a shape from
 * scratch or restructure the commercial-event/cart layers to fit one.
 * Do not construct real instances of these from fabricated data.
 */

export interface Address {
  id: string;
  label?: string; // e.g. "Home", "Clinic"
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string; // state/province
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  phone?: string;
}

export interface SavedProduct {
  productId: string;
  savedAt: string; // ISO 8601
}

export interface OrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: { amount: number; currency: 'USD' };
}

/**
 * Mirrors the commercial event layer's own phase boundary
 * (lib/events/types.ts): an Order can only exist once real
 * checkout/payment functionality exists — this type is declared now so
 * that layer and this one agree on shape when that day comes, not
 * because any Order is ever created by code today.
 */
export interface Order {
  orderId: string;
  customerId: string;
  placedAt: string; // ISO 8601
  lines: OrderLine[];
  shippingAddress: Address;
  status: 'placed' | 'payment_pending' | 'paid' | 'fulfilled' | 'delivered' | 'refunded' | 'cancelled';
  total: { amount: number; currency: 'USD' };
}

export interface Account {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  savedProducts: SavedProduct[];
  /** Populated by a future order history query — never inline order objects. */
  orderIds: string[];
}
