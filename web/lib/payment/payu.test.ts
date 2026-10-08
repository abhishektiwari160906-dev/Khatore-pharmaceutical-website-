import { createHash } from 'crypto';
import { describe, it, expect } from 'vitest';
import { buildPayURequestHash, verifyPayUResponseHash, deriveTxnId, PayUPaymentProvider } from './payu';

describe('buildPayURequestHash', () => {
  it('matches PayU\'s documented formula computed independently', () => {
    const fields = {
      key: 'gtKFFx',
      txnid: 'KHTEST0001',
      amount: '299.00',
      productinfo: 'Khatore Pharmaceuticals order',
      firstname: 'Test Buyer',
      email: 'test@example.com',
    };
    const salt = 'eCwWELxi';

    // Independently reconstructed per PayU's docs: key|txnid|amount|
    // productinfo|firstname|email|udf1..udf10|salt, all 10 udfs empty.
    const expectedRaw = [fields.key, fields.txnid, fields.amount, fields.productinfo, fields.firstname, fields.email, ...Array(10).fill(''), salt].join('|');
    const expected = createHash('sha512').update(expectedRaw, 'utf8').digest('hex');

    expect(buildPayURequestHash(fields, salt)).toBe(expected);
    // Sanity: exactly 16 pipe separators for the 17-field sequence.
    expect((expectedRaw.match(/\|/g) ?? []).length).toBe(16);
  });

  it('is deterministic -- same input always produces the same hash', () => {
    const fields = { key: 'k', txnid: 't1', amount: '10.00', productinfo: 'p', firstname: 'f', email: 'e@x.com' };
    expect(buildPayURequestHash(fields, 'salt')).toBe(buildPayURequestHash(fields, 'salt'));
  });

  it('changes if the amount is tampered', () => {
    const base = { key: 'k', txnid: 't1', amount: '10.00', productinfo: 'p', firstname: 'f', email: 'e@x.com' };
    const tampered = { ...base, amount: '1000.00' };
    expect(buildPayURequestHash(base, 'salt')).not.toBe(buildPayURequestHash(tampered, 'salt'));
  });
});

describe('verifyPayUResponseHash', () => {
  function sign(fields: { key: string; txnid: string; amount: string; productinfo: string; firstname: string; email: string; status: string }, salt: string): string {
    const raw = [salt, fields.status, ...Array(10).fill(''), fields.email, fields.firstname, fields.productinfo, fields.amount, fields.txnid, fields.key].join('|');
    return createHash('sha512').update(raw, 'utf8').digest('hex');
  }

  const salt = 'eCwWELxi';
  const base = {
    key: 'gtKFFx',
    txnid: 'KHTEST0001',
    amount: '299.00',
    productinfo: 'Khatore Pharmaceuticals order',
    firstname: 'Test Buyer',
    email: 'test@example.com',
    status: 'success',
  };

  it('accepts a correctly-signed success response', () => {
    const hash = sign(base, salt);
    expect(verifyPayUResponseHash({ ...base, hash }, salt)).toBe(true);
  });

  it('accepts a correctly-signed failure response', () => {
    const failed = { ...base, status: 'failure' };
    const hash = sign(failed, salt);
    expect(verifyPayUResponseHash({ ...failed, hash }, salt)).toBe(true);
  });

  it('rejects a tampered amount even with the original hash (simulated attack: forged amount, stolen hash)', () => {
    const hash = sign(base, salt);
    const tampered = { ...base, amount: '1.00', hash };
    expect(verifyPayUResponseHash(tampered, salt)).toBe(false);
  });

  it('rejects a response signed with the wrong salt', () => {
    const hash = sign(base, 'wrong-salt');
    expect(verifyPayUResponseHash({ ...base, hash }, salt)).toBe(false);
  });

  it('rejects a status flip (failure forged as success) even reusing a real hash from the opposite status', () => {
    const failureHash = sign({ ...base, status: 'failure' }, salt);
    const forged = { ...base, status: 'success', hash: failureHash };
    expect(verifyPayUResponseHash(forged, salt)).toBe(false);
  });

  it('hash comparison is case-insensitive (PayU may send uppercase hex)', () => {
    const hash = sign(base, salt);
    expect(verifyPayUResponseHash({ ...base, hash: hash.toUpperCase() }, salt)).toBe(true);
  });
});

describe('deriveTxnId', () => {
  it('strips non-alphanumeric characters and caps at 25 chars', () => {
    const txnid = deriveTxnId('KH-1A2B3C-D4E5F6-EXTRA-LONG-SUFFIX');
    expect(txnid).toMatch(/^[a-zA-Z0-9]+$/);
    expect(txnid.length).toBeLessThanOrEqual(25);
  });

  it('is deterministic for the same order id', () => {
    expect(deriveTxnId('KH-ABC123')).toBe(deriveTxnId('KH-ABC123'));
  });

  it('produces different ids for different orders', () => {
    expect(deriveTxnId('KH-ABC123')).not.toBe(deriveTxnId('KH-XYZ789'));
  });
});

describe('PayUPaymentProvider.createSession', () => {
  it('rejects a non-INR order', async () => {
    const provider = new PayUPaymentProvider('key', 'salt', 'test');
    const result = await provider.createSession({
      orderId: 'KH-TEST',
      amount: { amount: 299, currency: 'USD' },
      customerName: 'Test Buyer',
      customerEmail: 'test@example.com',
      customerPhone: '+911234567890',
      successUrl: 'https://example.com/return',
      failureUrl: 'https://example.com/return',
    });
    expect(result.available).toBe(false);
  });

  it('rejects when success/failure URLs are missing', async () => {
    const provider = new PayUPaymentProvider('key', 'salt', 'test');
    const result = await provider.createSession({
      orderId: 'KH-TEST',
      amount: { amount: 12999, currency: 'INR' },
      customerName: 'Test Buyer',
      customerEmail: 'test@example.com',
      customerPhone: '+911234567890',
    });
    expect(result.available).toBe(false);
  });

  it('builds a real, verifiable form session for a valid INR order', async () => {
    const provider = new PayUPaymentProvider('gtKFFx', 'eCwWELxi', 'test');
    const result = await provider.createSession({
      orderId: 'KH-ABC123',
      amount: { amount: 12999, currency: 'INR' },
      customerName: 'Jane Buyer',
      customerEmail: 'jane@example.com',
      customerPhone: '+911234567890',
      successUrl: 'https://example.com/api/payments/return',
      failureUrl: 'https://example.com/api/payments/return',
    });
    expect(result.available).toBe(true);
    expect(result.formAction).toBe('https://test.payu.in/_payment');
    expect(result.formFields?.key).toBe('gtKFFx');
    expect(result.formFields?.amount).toBe('12999.00');
    expect(result.formFields?.surl).toBe('https://example.com/api/payments/return');
    // The hash in the session must match what an independent computation gives.
    const expectedHash = buildPayURequestHash(
      {
        key: 'gtKFFx',
        txnid: result.formFields!.txnid!,
        amount: '12999.00',
        productinfo: result.formFields!.productinfo!,
        firstname: 'Jane Buyer',
        email: 'jane@example.com',
      },
      'eCwWELxi',
    );
    expect(result.formFields?.hash).toBe(expectedHash);
  });

  it('uses production.payu.in only when PAYU_ENV is production', async () => {
    const provider = new PayUPaymentProvider('key', 'salt', 'production');
    const result = await provider.createSession({
      orderId: 'KH-ABC123',
      amount: { amount: 100, currency: 'INR' },
      customerName: 'Jane Buyer',
      customerEmail: 'jane@example.com',
      customerPhone: '+911234567890',
      successUrl: 'https://example.com/return',
      failureUrl: 'https://example.com/return',
    });
    expect(result.formAction).toBe('https://secure.payu.in/_payment');
  });
});
