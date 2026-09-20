/**
 * The one typed commercial event-logging layer (Master Build Directive,
 * Section 10). TRAFFIC -> ENQUIRY -> ORDER -> PAYMENT -> FULFILLMENT ->
 * REVENUE. Only the five Phase-1 events are actually fired anywhere in
 * the app right now; the rest are schema placeholders so the contract
 * doesn't change shape when a real CRM/checkout lands later.
 *
 * Every event shares this envelope (Section 10's required fields).
 */
export interface EventEnvelope {
  event_name: CommercialEventName;
  event_version: 1;
  timestamp: string; // ISO 8601, set by the client helper — never trust a caller-supplied value server-side beyond this
  session_id: string;
  customer_id?: string;
  product_id?: string;
  product_name?: string;
  channel: 'web';
  source?: string; // e.g. referrer, campaign, utm data if present
  context?: string; // e.g. page path the event fired from
  metadata?: Record<string, string | number | boolean | null>;
}

// ---- Phase 1: implemented and actually fired ----
// add_to_cart / remove_from_cart / cart_viewed joined this list in the
// Commerce Foundation pass — the cart itself is real client-side
// functionality (Section: Cart Architecture), not a placeholder, so
// these fire for real like everything else here.
export type Phase1EventName =
  | 'product_viewed'
  | 'enquiry_submitted'
  | 'contact_form_submitted'
  | 'whatsapp_click'
  | 'external_checkout_redirect'
  | 'video_started'
  | 'video_completed'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'cart_viewed';

// ---- Future: schema placeholders only. Do NOT fire these yet — see
// Section 15, payment is an absolute phase boundary (Phase 5). Declared
// now purely so the union type — and therefore every consumer of it —
// doesn't need to change shape when they're turned on.
//
// checkout_started is here too, not in Phase 1, despite the cart being
// real: there is no real checkout step for it to describe yet (the
// cart's own CTA routes to a WhatsApp enquiry, which fires the
// already-active whatsapp_click instead) — adding it to Phase 1 would
// mean firing an event for a step that doesn't exist. ----
export type FutureEventName =
  | 'checkout_started'
  | 'order_placed'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'fulfillment_started'
  | 'fulfillment_completed'
  | 'refund'
  | 'repeat_purchase';

export type CommercialEventName = Phase1EventName | FutureEventName;

/** Events actually allowed to be sent right now. Enforced in client.ts. */
export const ACTIVE_EVENT_NAMES: readonly Phase1EventName[] = [
  'product_viewed',
  'enquiry_submitted',
  'contact_form_submitted',
  'whatsapp_click',
  'external_checkout_redirect',
  'video_started',
  'video_completed',
  'add_to_cart',
  'remove_from_cart',
  'cart_viewed',
];
