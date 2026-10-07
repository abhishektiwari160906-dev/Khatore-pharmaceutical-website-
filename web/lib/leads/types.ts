/**
 * A lead is a structured enquiry -- the fields the brief asked for
 * (Area 2): name, email, phone/WhatsApp, country, product interest,
 * message, UTM/source, timestamp, consent. Deliberately separate from
 * the general commercial-event model (lib/events/types.ts) because a
 * lead is a record to act on (follow up, export, count), not a
 * fire-and-forget analytics ping -- though every lead submission ALSO
 * fires a `contact_form_submitted`-style event via the existing event
 * layer, so the two stay consistent rather than duplicating tracking.
 */
export interface Lead {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  productInterest?: string;
  message: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  source: string; // e.g. "contact_page", "product_detail"
  consent: boolean;
  submittedAt: string; // ISO 8601
}
