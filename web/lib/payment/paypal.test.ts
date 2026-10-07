import { describe, it, expect } from 'vitest';
import { buildPayPalOrderBody, buildPayPalVerifyWebhookBody, PayPalPaymentProvider } from './paypal';

describe('buildPayPalOrderBody', () => {
  it('shapes a USD order per PayPal Orders v2 API', () => {
    const body = buildPayPalOrderBody({
      orderId: 'KH-TEST-0001',
      amount: { amount: 299, currency: 'USD' },
      customerName: 'Test Buyer',
      customerEmail: 'test@example.com',
      customerPhone: '+15551234567',
    });
    expect(body).toEqual({
      intent: 'CAPTURE',
      purchase_units: [
        { reference_id: 'KH-TEST-0001', amount: { currency_code: 'USD', value: '299.00' } },
      ],
    });
  });
});

describe('buildPayPalVerifyWebhookBody', () => {
  it('shapes the verify-webhook-signature request PayPal expects', () => {
    const body = buildPayPalVerifyWebhookBody(
      'WH-TEST-ID',
      { transmissionId: 't1', transmissionTime: '2026-10-07T00:00:00Z', certUrl: 'https://paypal.com/cert', authAlgo: 'SHA256withRSA', transmissionSig: 'sig123' },
      { id: 'evt_1', event_type: 'PAYMENT.CAPTURE.COMPLETED' },
    );
    expect(body.webhook_id).toBe('WH-TEST-ID');
    expect(body.transmission_id).toBe('t1');
    expect((body.webhook_event as { id: string }).id).toBe('evt_1');
  });
});

describe('PayPalPaymentProvider.verifyWebhook', () => {
  it('returns invalid (not live-verified) even for a well-formed event, since no sandbox call was made', async () => {
    const provider = new PayPalPaymentProvider('client_id', 'client_secret', 'WH-TEST-ID', 'sandbox');
    const event = { id: 'evt_1', event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { custom_id: 'KH-TEST-0001' } };
    const result = await provider.verifyWebhook(JSON.stringify(event), 'irrelevant-header');
    expect(result.valid).toBe(false);
  });

  it('returns invalid when no webhook id is configured', async () => {
    const provider = new PayPalPaymentProvider('client_id', 'client_secret', undefined, 'sandbox');
    const result = await provider.verifyWebhook('{}', null);
    expect(result.valid).toBe(false);
  });
});
