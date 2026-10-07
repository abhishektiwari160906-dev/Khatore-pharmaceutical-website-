import type {
  PaymentProvider,
  PaymentSessionRequest,
  PaymentSessionResult,
  WebhookVerificationResult,
} from './types';

/**
 * PayPal has no local HMAC webhook verification like Razorpay/Cashfree
 * -- it requires a server-to-server call to PayPal's own
 * verify-webhook-signature endpoint, passing the transmission headers
 * and the raw event back to PayPal, which replies valid/invalid. That
 * means webhook verification genuinely cannot be checked by a unit
 * test without a live PayPal sandbox account -- unlike Razorpay's pure
 * HMAC check, there is no offline algorithm to test here. This file's
 * test only covers the parts that ARE pure: the request bodies this
 * code builds.
 */

function paypalApiBase(env: string | undefined): string {
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function buildPayPalOrderBody(request: PaymentSessionRequest): Record<string, unknown> {
  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: request.orderId,
        amount: {
          currency_code: request.amount.currency,
          value: request.amount.amount.toFixed(2),
        },
      },
    ],
  };
}

export function buildPayPalVerifyWebhookBody(
  webhookId: string,
  headers: { transmissionId: string; transmissionTime: string; certUrl: string; authAlgo: string; transmissionSig: string },
  event: unknown,
): Record<string, unknown> {
  return {
    webhook_id: webhookId,
    transmission_id: headers.transmissionId,
    transmission_time: headers.transmissionTime,
    cert_url: headers.certUrl,
    auth_algo: headers.authAlgo,
    transmission_sig: headers.transmissionSig,
    webhook_event: event,
  };
}

export class PayPalPaymentProvider implements PaymentProvider {
  readonly id = 'paypal' as const;
  readonly isConfigured = true;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly webhookId: string | undefined,
    private readonly env: string | undefined,
  ) {}

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(`${paypalApiBase(this.env)}/v1/oauth2/token`, {
      method: 'POST',
      headers: { authorization: `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`PayPal OAuth token request failed: ${res.status}`);
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResult> {
    if (request.amount.currency !== 'USD') {
      return { available: false, reason: 'PayPal in this integration is configured for USD orders only.' };
    }
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${paypalApiBase(this.env)}/v2/checkout/orders`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(buildPayPalOrderBody(request)),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { available: false, providerId: 'paypal', reason: `PayPal order create failed: ${res.status} ${text}`.slice(0, 300) };
      }
      const data = (await res.json()) as { id: string; links: Array<{ rel: string; href: string }> };
      const approve = data.links.find((l) => l.rel === 'approve');
      return {
        available: true,
        providerId: 'paypal',
        redirectUrl: approve?.href,
        mode: 'live',
      };
    } catch (err) {
      return {
        available: false,
        providerId: 'paypal',
        reason: `PayPal order create threw: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async verifyWebhook(rawBody: string, _signatureHeader: string | null): Promise<WebhookVerificationResult> {
    if (!this.webhookId) return { valid: false };

    let event: {
      id: string;
      event_type: string;
      resource?: { id?: string; custom_id?: string; invoice_id?: string; supplementary_data?: { related_ids?: { order_id?: string } } };
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return { valid: false };
    }

    // Real verification requires calling PayPal's verify-webhook-signature
    // API with the PayPal-Transmission-* headers (not just the body) --
    // this provider's test coverage is limited to the pure request-body
    // builder above; actually hitting this endpoint needs live sandbox
    // credentials this environment does not have. Until that call is
    // wired in and exercised against a real sandbox, this always returns
    // invalid rather than trusting an unverified payload.
    return { valid: false, orderId: event.resource?.custom_id, eventId: event.id };
  }
}

export function buildPayPalProvider(): PaymentProvider | null {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return new PayPalPaymentProvider(clientId, clientSecret, process.env.PAYPAL_WEBHOOK_ID, process.env.PAYPAL_ENV);
}
