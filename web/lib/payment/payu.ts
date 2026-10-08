import { createHash } from 'crypto';
import type {
  PaymentProvider,
  PaymentSessionRequest,
  PaymentSessionResult,
  WebhookVerificationResult,
} from './types';

/**
 * PayU's classic hash-based checkout (the integration this client's
 * merchant account uses -- UPI, cards, and net banking all live inside
 * PayU's own hosted payment page once the customer lands there; there
 * is no separate integration per method). No SDK, no API call to
 * create a session -- PayU authenticates the transaction purely from a
 * SHA-512 hash the merchant computes and PayU recomputes on its side,
 * so `createSession` below is a pure, offline, fully-testable
 * computation, exactly like Razorpay's webhook HMAC.
 *
 * Request hash (documented PayU formula, 6 empty pipe-separated slots
 * between udf5 and the salt):
 *   sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 *
 * Response/reverse hash (PayU posts back to surl/furl as a browser
 * form POST, not a JSON webhook -- this is the authoritative
 * confirmation this integration verifies, see app/api/payments/payu-return):
 *   sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */

/** Always exactly 10 slots -- this integration never sets udf1-10, but the field count must still match PayU's fixed formula or every hash mismatches. */
const TEN_EMPTY_UDFS = Array(10).fill('');

export function buildPayURequestHash(
  fields: {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
  },
  salt: string,
): string {
  // Documented order: key|txnid|amount|productinfo|firstname|email|udf1..udf10|salt
  const parts = [fields.key, fields.txnid, fields.amount, fields.productinfo, fields.firstname, fields.email, ...TEN_EMPTY_UDFS, salt];
  return createHash('sha512').update(parts.join('|'), 'utf8').digest('hex');
}

export interface PayUResponseFields {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  hash: string;
}

export function verifyPayUResponseHash(fields: PayUResponseFields, salt: string): boolean {
  // Documented reverse order: salt|status|udf10..udf1|email|firstname|productinfo|amount|txnid|key
  const parts = [
    salt,
    fields.status,
    ...[...TEN_EMPTY_UDFS].reverse(),
    fields.email,
    fields.firstname,
    fields.productinfo,
    fields.amount,
    fields.txnid,
    fields.key,
  ];
  const expected = createHash('sha512').update(parts.join('|'), 'utf8').digest('hex');
  return expected.toLowerCase() === fields.hash.toLowerCase();
}

/** PayU rejects a txnid over 25 chars or with characters outside [a-zA-Z0-9] -- derived from the order id, never random, so the same order always maps to the same txnid. */
export function deriveTxnId(orderId: string): string {
  return orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
}

function payUBaseUrl(env: string | undefined): string {
  return env === 'production' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';
}

export class PayUPaymentProvider implements PaymentProvider {
  readonly id = 'payu' as const;
  readonly isConfigured = true;

  constructor(
    private readonly merchantKey: string,
    private readonly merchantSalt: string,
    private readonly env: string | undefined,
  ) {}

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResult> {
    if (request.amount.currency !== 'INR') {
      return { available: false, reason: 'PayU in this integration is configured for INR orders only.' };
    }
    if (!request.successUrl || !request.failureUrl) {
      return { available: false, reason: 'PayU requires success/failure return URLs, which were not provided.' };
    }

    const txnid = deriveTxnId(request.orderId);
    const amount = request.amount.amount.toFixed(2);
    const productinfo = 'Khatore Pharmaceuticals order';
    // PayU requires separate first/last name fields; this integration
    // only collects one full-name field at checkout, so the whole name
    // goes in firstname -- never split heuristically (e.g. guessing on
    // the first space), which breaks for many real names.
    const firstname = request.customerName.slice(0, 60);

    const hash = buildPayURequestHash(
      { key: this.merchantKey, txnid, amount, productinfo, firstname, email: request.customerEmail },
      this.merchantSalt,
    );

    return {
      available: true,
      providerId: 'payu',
      mode: 'live',
      formAction: payUBaseUrl(this.env),
      formFields: {
        key: this.merchantKey,
        txnid,
        amount,
        productinfo,
        firstname,
        email: request.customerEmail,
        phone: request.customerPhone,
        surl: request.successUrl,
        furl: request.failureUrl,
        hash,
      },
    };
  }

  /**
   * The generic JSON webhook route (app/api/payments/webhook) does not
   * apply to PayU -- PayU's authoritative confirmation arrives as a
   * browser form POST to surl/furl, handled and reverse-hash-verified
   * in app/api/payments/payu-return/route.ts, not here. This exists
   * only to satisfy the PaymentProvider interface; it is never called
   * in the real PayU flow.
   */
  async verifyWebhook(_rawBody: string, _signatureHeader: string | null): Promise<WebhookVerificationResult> {
    return { valid: false };
  }
}

export function buildPayUProviderReal(): PaymentProvider | null {
  const merchantKey = process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  if (!merchantKey || !merchantSalt) return null;
  return new PayUPaymentProvider(merchantKey, merchantSalt, process.env.PAYU_ENV);
}
