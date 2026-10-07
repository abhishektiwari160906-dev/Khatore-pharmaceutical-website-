/**
 * Provider-agnostic payment abstraction (Master Website Upgrade,
 * Sections 12-13). NOTHING in this file is wired to a real gateway.
 * `getConfiguredPaymentProvider()` (see providers.ts) returns the
 * inactive `UnconfiguredPaymentProvider` unless a real provider's
 * credentials are present in the server environment -- which they are
 * not, anywhere in this codebase, today.
 *
 * This exists so that once Khatore's merchant account with a chosen
 * gateway (Cashfree evaluated first; Razorpay/PayU as alternatives --
 * see the payment gateway evaluation delivered alongside this code,
 * not hard-coded here) is actually approved, activating it is: (1) add
 * a class implementing PaymentProvider for that gateway's real SDK/API,
 * (2) set its env vars, (3) register it in providers.ts. No change to
 * the checkout route, the checkout page, or the order model.
 */

import type { CurrencyCode } from '@/data/currencies';

export type PaymentProviderId = 'cashfree' | 'razorpay' | 'payu' | 'paypal';

export interface PaymentSessionRequest {
  orderId: string;
  amount: { amount: number; currency: CurrencyCode };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentSessionResult {
  /** True only when a real gateway session was created. */
  available: boolean;
  /** Present only when available -- the URL/token the client uses to open the gateway's own hosted/tokenized checkout (PayPal's approve link, Cashfree's hosted page, etc.). */
  redirectUrl?: string;
  /** Razorpay has no redirect URL -- the client opens Razorpay Checkout.js with this order id + the public key below. */
  gatewayOrderId?: string;
  /** Razorpay's publishable key id -- safe to expose to the client, required to open Checkout.js. */
  publicKey?: string;
  providerId?: PaymentProviderId;
  /**
   * 'live' = a real sandbox/production API call to the gateway succeeded.
   * 'mock' = no real credentials were available, so this is a
   * documented-shape stand-in -- the request/response structure matches
   * the provider's real API, but nothing was actually sent to them.
   * Never omit this when mode is 'mock': a caller must not treat a mock
   * session as a real one (Section 14 -- never fake a successful call).
   */
  mode?: 'live' | 'mock';
  /** Human-readable reason when unavailable (e.g. "no payment provider configured yet"). Never exposes secrets. */
  reason?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  orderId?: string;
  status?: 'succeeded' | 'failed' | 'cancelled';
  gatewayTransactionId?: string;
  gatewayReference?: string;
  /** The gateway's own id for this specific event -- used to make webhook processing idempotent (a retried delivery of the same event must not be double-processed). */
  eventId?: string;
}

/**
 * Every real gateway integration implements this. Secret keys/webhook
 * secrets are read from server-only environment variables inside the
 * implementation -- never passed in, never present in any client
 * bundle (Section 17).
 */
export interface PaymentProvider {
  readonly id: PaymentProviderId | 'none';
  readonly isConfigured: boolean;
  /** Creates a gateway checkout session server-side. Never called from the client directly. */
  createSession(request: PaymentSessionRequest): Promise<PaymentSessionResult>;
  /**
   * Verifies a webhook payload's signature against the provider's
   * webhook secret and returns the authoritative payment outcome.
   * This -- never a frontend redirect -- is the only source of truth
   * for `paymentStatus: 'succeeded'` (Section 15).
   */
  verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<WebhookVerificationResult>;
}
