import { NextResponse } from 'next/server';
import { verifyPayUResponseHash } from '@/lib/payment/payu';
import { PayPalPaymentProvider } from '@/lib/payment/paypal';
import { seenPaymentEvents } from '@/lib/payment/idempotency';

export const runtime = 'nodejs';

/**
 * PayPal redirects the browser back here with a GET (?token=<paypal
 * order id>&PayerID=...) once the customer approves on PayPal's own
 * page -- unlike PayU, approval alone does not take the payment; it
 * still has to be captured server-side (PayPalPaymentProvider.captureOrder),
 * which is the actual, authoritative payment event. A cancelled
 * approval redirects here with no PayerID, which is treated as failed,
 * never as success.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const origin = new URL(request.url).origin;
  const url = new URL(request.url);
  const confirmationUrl = (query: string) => NextResponse.redirect(`${origin}/order-confirmation${query}`, { status: 303 });

  const token = url.searchParams.get('token'); // PayPal's own order id
  const payerId = url.searchParams.get('PayerID');
  if (!token || !payerId) {
    return confirmationUrl('?paymentStatus=failed&provider=paypal');
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return confirmationUrl('?paymentStatus=unverified&provider=paypal');
  }

  const provider = new PayPalPaymentProvider(clientId, clientSecret, process.env.PAYPAL_WEBHOOK_ID, process.env.PAYPAL_ENV);
  const result = await provider.captureOrder(token);

  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ khatore_paypal_capture_failed: { token, reason: result.reason } }));
    return confirmationUrl(`?paymentStatus=unverified&provider=paypal&token=${encodeURIComponent(token)}`);
  }

  const eventId = `paypal:${result.captureId ?? token}`;
  const alreadySeen = await seenPaymentEvents.has(eventId);
  if (!alreadySeen) {
    await seenPaymentEvents.markSeen(eventId);
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        khatore_payment_webhook: {
          orderId: result.referenceId,
          status: 'succeeded',
          gatewayTransactionId: result.captureId,
          gatewayReference: token,
          providerId: 'paypal',
          receivedAt: new Date().toISOString(),
        },
      }),
    );
  }

  return confirmationUrl(`?paymentStatus=succeeded&provider=paypal&txnid=${encodeURIComponent(result.referenceId ?? token)}`);
}

/**
 * PayU's own return flow (not a JSON webhook): after the customer pays
 * on PayU's hosted page, PayU does a browser form POST straight to
 * this URL (surl on success, furl on failure -- both point here, the
 * `status` field tells them apart) carrying the transaction result and
 * a reverse hash. This is the one place that result is trusted --
 * never the query string on a client-side redirect alone -- because
 * the reverse hash is verified server-side, right here, before anyone
 * sees a "paid" state (same principle as the generic /api/payments/webhook
 * route: a frontend redirect is never itself proof of payment).
 *
 * A tampered or missing hash is never treated as success, no matter
 * what `status` claims.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const origin = new URL(request.url).origin;
  const confirmationUrl = (query: string) => NextResponse.redirect(`${origin}/order-confirmation${query}`, { status: 303 });

  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!salt) {
    // No PayU account configured -- this route should never be reachable
    // in that state, but if it is, never fabricate a verified outcome.
    return confirmationUrl('?paymentStatus=unverified&provider=payu');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return confirmationUrl('?paymentStatus=unverified&provider=payu');
  }

  const get = (name: string) => {
    const v = form.get(name);
    return typeof v === 'string' ? v : '';
  };

  const fields = {
    key: get('key'),
    txnid: get('txnid'),
    amount: get('amount'),
    productinfo: get('productinfo'),
    firstname: get('firstname'),
    email: get('email'),
    status: get('status'),
    hash: get('hash'),
  };

  if (!fields.txnid || !fields.hash) {
    return confirmationUrl('?paymentStatus=unverified&provider=payu');
  }

  const valid = verifyPayUResponseHash(fields, salt);
  if (!valid) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ khatore_payu_return_invalid_hash: { txnid: fields.txnid, status: fields.status } }));
    return confirmationUrl(`?paymentStatus=unverified&provider=payu&txnid=${encodeURIComponent(fields.txnid)}`);
  }

  // PayU can deliver the same return more than once (user refresh, back
  // button) -- log the verified outcome once per transaction, same
  // idempotency discipline as the generic webhook route.
  const eventId = `payu:${fields.txnid}:${fields.status}`;
  const alreadySeen = await seenPaymentEvents.has(eventId);
  if (!alreadySeen) {
    await seenPaymentEvents.markSeen(eventId);
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        khatore_payment_webhook: {
          orderId: fields.txnid,
          status: fields.status === 'success' ? 'succeeded' : 'failed',
          gatewayTransactionId: fields.txnid,
          providerId: 'payu',
          receivedAt: new Date().toISOString(),
        },
      }),
    );
  }

  const outcome = fields.status === 'success' ? 'succeeded' : 'failed';
  return confirmationUrl(`?paymentStatus=${outcome}&provider=payu&txnid=${encodeURIComponent(fields.txnid)}`);
}
