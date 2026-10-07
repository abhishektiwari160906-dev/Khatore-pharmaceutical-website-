import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifyRazorpaySignature, RazorpayPaymentProvider } from './razorpay';

const SECRET = 'test_webhook_secret_do_not_use_in_prod';

function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

describe('verifyRazorpaySignature', () => {
  it('accepts a correctly signed payload', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    expect(verifyRazorpaySignature(body, sign(body), SECRET)).toBe(true);
  });

  it('rejects a payload signed with the wrong secret', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    expect(verifyRazorpaySignature(body, sign(body, 'wrong_secret'), SECRET)).toBe(false);
  });

  it('rejects a tampered body with a signature from the original body', () => {
    const originalBody = JSON.stringify({ event: 'payment.captured', amount: 29900 });
    const signature = sign(originalBody);
    const tamperedBody = JSON.stringify({ event: 'payment.captured', amount: 1 });
    expect(verifyRazorpaySignature(tamperedBody, signature, SECRET)).toBe(false);
  });

  it('rejects when there is no signature header at all', () => {
    expect(verifyRazorpaySignature('{}', null, SECRET)).toBe(false);
  });
});

describe('RazorpayPaymentProvider.verifyWebhook', () => {
  const provider = new RazorpayPaymentProvider('rzp_test_key', 'rzp_test_secret', SECRET);

  it('returns a succeeded result for a validly signed payment.captured event', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_abc123',
            order_id: 'order_xyz789',
            notes: { orderId: 'KH-TEST-0001' },
          },
        },
      },
    };
    const body = JSON.stringify(payload);
    const result = await provider.verifyWebhook(body, sign(body));
    expect(result.valid).toBe(true);
    expect(result.status).toBe('succeeded');
    expect(result.orderId).toBe('KH-TEST-0001');
    expect(result.gatewayTransactionId).toBe('pay_abc123');
    expect(result.eventId).toBe('pay_abc123');
  });

  it('returns invalid for a tampered payment.captured event (amount/order swapped in by an attacker)', async () => {
    const realPayload = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_abc123', order_id: 'order_xyz789', notes: { orderId: 'KH-TEST-0001' } } } },
    };
    const realBody = JSON.stringify(realPayload);
    const realSignature = sign(realBody);

    const forgedPayload = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_forged', order_id: 'order_forged', notes: { orderId: 'KH-TEST-0001' } } } },
    };
    const forgedBody = JSON.stringify(forgedPayload);

    const result = await provider.verifyWebhook(forgedBody, realSignature);
    expect(result.valid).toBe(false);
  });

  it('returns invalid when no webhook secret is configured', async () => {
    const noSecretProvider = new RazorpayPaymentProvider('rzp_test_key', 'rzp_test_secret', undefined);
    const result = await noSecretProvider.verifyWebhook('{}', 'anything');
    expect(result.valid).toBe(false);
  });

  it('maps payment.failed to a failed status', async () => {
    const payload = {
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_failed1', order_id: 'order_failed1', notes: { orderId: 'KH-TEST-0002' } } } },
    };
    const body = JSON.stringify(payload);
    const result = await provider.verifyWebhook(body, sign(body));
    expect(result.valid).toBe(true);
    expect(result.status).toBe('failed');
  });
});
