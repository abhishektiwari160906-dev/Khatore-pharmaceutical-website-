import { NextResponse } from 'next/server';
import { getConfiguredPaymentProvider } from '@/lib/payment/providers';

export const runtime = 'nodejs';

/**
 * The one endpoint a real payment gateway would call server-to-server
 * to report a payment outcome (Section 13's architecture: "Webhook ->
 * server-side verification -> Payment status update"). Today, with no
 * gateway configured, `verifyWebhook` always returns `valid: false`
 * (see lib/payment/providers.ts's UnconfiguredPaymentProvider), so this
 * always responds 200/ignored -- correct behaviour for an endpoint a
 * real gateway isn't calling yet, and never a source of a false
 * "payment successful" (Section 15: that can only come from here, once
 * a real provider is configured, never from a frontend redirect).
 *
 * Known gap, stated rather than hidden: there is no queryable
 * datastore yet (orders are recorded to the server log / optional
 * Sheet webhook, same as commercial events -- see lib/order/store.ts),
 * so a verified webhook cannot mutate a previously-created Order
 * object in place. Once Khatore has a real gateway AND a real
 * datastore, this is the point to look up the order by
 * `result.orderId` and persist `paymentStatus`/`gatewayTransactionId`.
 * Until then, a verified event is recorded as its own log entry keyed
 * by the same order id, which is enough for a human to reconcile
 * against the original order log entry.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') ?? request.headers.get('x-cf-signature');

  const provider = getConfiguredPaymentProvider();
  const result = await provider.verifyWebhook(rawBody, signature);

  if (!result.valid) {
    // Never trust an unverified payload -- respond 200 so an
    // unconfigured/misdirected sender doesn't retry forever, but do
    // nothing with the contents.
    return NextResponse.json({ ok: true, processed: false }, { status: 200 });
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      khatore_payment_webhook: {
        orderId: result.orderId,
        status: result.status,
        gatewayTransactionId: result.gatewayTransactionId,
        gatewayReference: result.gatewayReference,
        providerId: provider.id,
        receivedAt: new Date().toISOString(),
      },
    }),
  );

  return NextResponse.json({ ok: true, processed: true }, { status: 200 });
}
