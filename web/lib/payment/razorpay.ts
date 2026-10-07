import { createHmac, timingSafeEqual } from 'crypto';
import type {
  PaymentProvider,
  PaymentSessionRequest,
  PaymentSessionResult,
  WebhookVerificationResult,
} from './types';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

/**
 * Verifies a Razorpay webhook payload's HMAC-SHA256 signature against
 * RAZORPAY_WEBHOOK_SECRET (the separate webhook secret set in the
 * Razorpay dashboard, NOT the API key_secret), per Razorpay's
 * documented webhook verification. Pure function -- no network, no
 * SDK -- so it is fully unit-testable with a synthetic secret, without
 * ever needing a real Razorpay account.
 */
export function verifyRazorpaySignature(rawBody: string, signatureHeader: string | null, webhookSecret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(signatureHeader, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        notes?: { orderId?: string };
      };
    };
  };
}

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly id = 'razorpay' as const;
  readonly isConfigured = true;

  constructor(
    private readonly keyId: string,
    private readonly keySecret: string,
    private readonly webhookSecret: string | undefined,
  ) {}

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResult> {
    if (request.amount.currency !== 'INR') {
      return { available: false, reason: 'Razorpay in this integration is configured for INR orders only.' };
    }
    const amountInPaise = Math.round(request.amount.amount * 100);
    const body = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: request.orderId,
      notes: { orderId: request.orderId },
    };

    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Basic ${auth}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { available: false, providerId: 'razorpay', reason: `Razorpay order create failed: ${res.status} ${text}`.slice(0, 300) };
      }
      const data = (await res.json()) as { id: string };
      return {
        available: true,
        providerId: 'razorpay',
        gatewayOrderId: data.id,
        publicKey: this.keyId,
        mode: 'live',
      };
    } catch (err) {
      return {
        available: false,
        providerId: 'razorpay',
        reason: `Razorpay order create threw: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<WebhookVerificationResult> {
    if (!this.webhookSecret) return { valid: false };
    if (!verifyRazorpaySignature(rawBody, signatureHeader, this.webhookSecret)) {
      return { valid: false };
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      return { valid: false };
    }

    const entity = payload.payload.payment?.entity;
    if (!entity) return { valid: false };

    const status: WebhookVerificationResult['status'] =
      payload.event === 'payment.captured' ? 'succeeded' : payload.event === 'payment.failed' ? 'failed' : undefined;
    if (!status) return { valid: false };

    return {
      valid: true,
      orderId: entity.notes?.orderId,
      status,
      gatewayTransactionId: entity.id,
      gatewayReference: entity.order_id,
      eventId: entity.id,
    };
  }
}

/**
 * Builds a real RazorpayPaymentProvider when RAZORPAY_KEY_ID/SECRET are
 * set. Without RAZORPAY_WEBHOOK_SECRET it still builds -- createSession
 * can still run against the live Orders API -- but verifyWebhook always
 * returns invalid (no secret to verify against), which is the correct,
 * honest behaviour rather than trusting an unverifiable payload.
 */
export function buildRazorpayProvider(): PaymentProvider | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new RazorpayPaymentProvider(keyId, keySecret, process.env.RAZORPAY_WEBHOOK_SECRET);
}
