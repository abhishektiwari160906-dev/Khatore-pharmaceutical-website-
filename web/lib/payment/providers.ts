import type {
  PaymentProvider,
  PaymentProviderId,
  PaymentSessionRequest,
  PaymentSessionResult,
  WebhookVerificationResult,
} from './types';
import { buildRazorpayProvider } from './razorpay';
import { buildPayPalProvider } from './paypal';

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

/** Same shape again, for PayU -- not implemented, same reasoning. */
function buildPayUProvider(): PaymentProvider | null {
  const merchantKey = process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  if (!merchantKey || !merchantSalt) return null;
  throw new Error(
    'PayU credentials are present but no PayU integration is implemented yet -- see buildCashfreeProvider for the pattern to follow.',
  );
}

const BUILDERS: Record<Exclude<PaymentProviderId, never>, () => PaymentProvider | null> = {
  cashfree: buildCashfreeProvider,
  // Razorpay and PayPal are real implementations (razorpay.ts /
  // paypal.ts) -- see STATUS.md for exactly what in each has been run
  // against a live sandbox vs. built against the documented API shape
  // only (createSession needs real keys to actually call the gateway;
  // Razorpay's verifyWebhook is pure HMAC and unit-tested without any
  // keys; PayPal's verifyWebhook needs a live sandbox call this
  // environment cannot make, so it always returns invalid today).
  razorpay: buildRazorpayProvider,
  paypal: buildPayPalProvider,
  payu: buildPayUProvider,
};

/**
 * The one place the app asks "which payment provider is active". Tries
 * providers in order (Cashfree, Razorpay, PayPal, PayU) and falls back
 * to the always-safe UnconfiguredPaymentProvider when none have
 * credentials set -- which is the actual state of this deployment
 * right now (no real keys exist in this environment for any of them).
 */
export function getConfiguredPaymentProvider(): PaymentProvider {
  for (const id of ['cashfree', 'razorpay', 'paypal', 'payu'] as const) {
    const provider = BUILDERS[id]();
    if (provider) return provider;
  }
  return new UnconfiguredPaymentProvider();
}
