import type {
  PaymentProvider,
  PaymentProviderId,
  PaymentSessionRequest,
  PaymentSessionResult,
  WebhookVerificationResult,
} from './types';
import { buildRazorpayProvider } from './razorpay';
import { buildPayPalProvider } from './paypal';
import { buildPayUProviderReal } from './payu';

/**
 * The always-available default: no gateway is configured. Every method
 * responds honestly rather than pretending -- `createSession` reports
 * `available: false` (the checkout route falls back to the WhatsApp
 * order-handoff path when it sees this), and `verifyWebhook` always
 * reports `valid: false` (there is no secret to verify against, so no
 * webhook payload can ever be trusted as real).
 */
class UnconfiguredPaymentProvider implements PaymentProvider {
  readonly id = 'none' as const;
  readonly isConfigured = false;

  async createSession(_request: PaymentSessionRequest): Promise<PaymentSessionResult> {
    return { available: false, reason: 'No payment provider is configured yet.' };
  }

  async verifyWebhook(_rawBody: string, _signatureHeader: string | null): Promise<WebhookVerificationResult> {
    return { valid: false };
  }
}

/**
 * Where a real Cashfree integration would live once the merchant
 * account is approved (evaluated first -- see the gateway evaluation
 * report; not activated here). Expected env vars, none of which exist
 * in this environment today:
 *   CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_WEBHOOK_SECRET,
 *   CASHFREE_ENV ("sandbox" | "production")
 * createSession would call Cashfree's Order Create API server-side
 * with the server-computed amount and return its payment_session_id
 * for the client to open via Cashfree's Drop-in/Checkout SDK.
 * verifyWebhook would validate the `x-webhook-signature` header via
 * HMAC-SHA256 against CASHFREE_WEBHOOK_SECRET before trusting the
 * payload, per Cashfree's documented webhook verification.
 */
function buildCashfreeProvider(): PaymentProvider | null {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) return null;
  throw new Error(
    'Cashfree credentials are present but no Cashfree integration is implemented yet -- ' +
      'this is intentional (Section 12: do not activate a gateway without confirmed merchant eligibility). ' +
      'Implement CashfreePaymentProvider here when Khatore\'s Cashfree merchant account is approved.',
  );
}

const BUILDERS: Record<Exclude<PaymentProviderId, never>, () => PaymentProvider | null> = {
  cashfree: buildCashfreeProvider,
  // Razorpay, PayPal, and PayU are real implementations (razorpay.ts /
  // paypal.ts / payu.ts) -- see STATUS.md for exactly what in each has
  // been run against a live account vs. built against the documented
  // API/hash shape only (createSession needs real keys to actually
  // reach the gateway; Razorpay's webhook HMAC and PayU's request/
  // response hash are both pure math and fully unit-tested without any
  // real account; PayPal's verifyWebhook needs a live sandbox call this
  // environment cannot make, so it always returns invalid today).
  razorpay: buildRazorpayProvider,
  paypal: buildPayPalProvider,
  payu: buildPayUProviderReal,
};

/**
 * Client decision, 8 Oct: PayU + PayPal run simultaneously (Razorpay
 * joins once that account is live) -- the site is never limited to one
 * active gateway at a time, so every caller that needs "the" provider
 * for a specific currency/method must ask for it by id, not get
 * whichever one happens to be configured first.
 */
export function getPaymentProviderById(id: PaymentProviderId): PaymentProvider | null {
  return BUILDERS[id]();
}

/** Every provider with real credentials set, in a stable order. Used wherever the app needs to know "what can a customer pay with right now" (e.g. deciding which methods to show at checkout). */
export function getConfiguredPaymentProviders(): PaymentProvider[] {
  return (['payu', 'paypal', 'razorpay', 'cashfree'] as const)
    .map((id) => BUILDERS[id]())
    .filter((p): p is PaymentProvider => p !== null);
}

/**
 * Back-compat single-provider lookup (used by the generic webhook route
 * when no ?provider= is given, and anywhere that only ever expected one
 * gateway to be active). Tries providers in order and falls back to the
 * always-safe UnconfiguredPaymentProvider when none have credentials
 * set.
 */
export function getConfiguredPaymentProvider(): PaymentProvider {
  for (const id of ['cashfree', 'razorpay', 'paypal', 'payu'] as const) {
    const provider = BUILDERS[id]();
    if (provider) return provider;
  }
  return new UnconfiguredPaymentProvider();
}
