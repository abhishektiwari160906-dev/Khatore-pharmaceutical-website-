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
export type Phase1EventName =
  | 'product_viewed'
  | 'enquiry_submitted'
  | 'contact_form_submitted'
  | 'whatsapp_click'
  | 'external_checkout_redirect'
  | 'video_started'
  | 'video_completed';

// ---- Future: schema placeholders only. Do NOT fire these yet — see
// Section 15, payment is an absolute phase boundary (Phase 5). Declared
// now purely so the union type — and therefore every consumer of it —
// doesn't need to change shape when they're turned on. ----
export type FutureEventName =
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
];
