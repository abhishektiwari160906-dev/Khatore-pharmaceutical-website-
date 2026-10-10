import { describe, it, expect } from 'vitest';
import { POST } from './route';
import type { Order } from '@/lib/order/types';

/**
 * 10 Oct: "show a full price breakdown ... for EVERY tier and on EVERY
 * order." These exercise the real checkout route end-to-end (not just
 * resolveProductPricing in isolation) so a regression in how the route
 * attaches `breakdown` to a line item -- the exact kind of bug this task
 * is about -- would actually be caught here. x-khatore-country is set
 * directly, the same header middleware.ts derives from Vercel's real
 * edge geo-IP in production (never spoofable there; here it's just how
 * the route itself is unit-tested).
 */
function checkoutRequest(countryHeader: string): Request {
  return new Request('https://example.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-khatore-country': countryHeader },
    body: JSON.stringify({
      customer: { fullName: 'Test Customer', email: 'test@example.com', phone: '0000000000' },
      shipping: { address: '1 Test St', city: 'Testville', region: 'TS', postalCode: '00000', country: countryHeader },
      items: [{ slug: 'kamalahar', quantity: 1 }],
    }),
  });
}

describe('POST /api/checkout -- Base/Shipping/Tax breakdown on the real order record', () => {
  // GH/KE deliberately, not MY/PH: GHS and KES are both in
  // GATEWAY_UNSUPPORTED_CURRENCIES (data/currencies.ts), so the order
  // stays charged in the tier's own base USD with no live-FX network
  // call -- keeping this test deterministic and offline. MY (MYR) and PH
  // (PHP) are real, verified-chargeable local currencies instead, which
  // would convert unitPrice away from the flat USD total asserted below.
  const cases: Array<{ country: string; tier: string; base: number; shipping: number; tax: number; total: number }> = [
    { country: 'US', tier: 'TIER_1', base: 237, shipping: 50, tax: 12, total: 299 },
    { country: 'GH', tier: 'TIER_2', base: 187, shipping: 50, tax: 12, total: 249 },
    { country: 'KE', tier: 'TIER_3', base: 137, shipping: 50, tax: 12, total: 199 },
  ];

  for (const c of cases) {
    it(`stores Base/Shipping/Tax/Total on a real ${c.tier} order (${c.country}) -- ${c.base}+${c.shipping}+${c.tax}=${c.total}`, async () => {
      const res = await POST(checkoutRequest(c.country));
      expect(res.status).toBe(201);
      const data = (await res.json()) as { order: Order };
      expect(data.order.pricingTier).toBe(c.tier);

      const line = data.order.items[0]!;
      expect(line.breakdown).toBeDefined();
      expect(line.breakdown).toEqual({ base: c.base, shipping: c.shipping, tax: c.tax });
      // Total must equal the sum of the three stored fields -- never a
      // second, independently-hardcoded number that could drift from them.
      expect(line.breakdown!.base + line.breakdown!.shipping + line.breakdown!.tax).toBe(c.total);
      expect(line.unitPrice.amount).toBe(c.total);
      expect(data.order.total.amount).toBe(c.total);
    });
  }

  it('India (Tier 4) has no breakdown -- flat, all-inclusive by design, left as-is', async () => {
    const res = await POST(checkoutRequest('IN'));
    const data = (await res.json()) as { order: Order };
    expect(data.order.pricingTier).toBe('TIER_4_INDIA');
    expect(data.order.items[0]!.breakdown).toBeUndefined();
    expect(data.order.total.amount).toBe(12999);
  });
});
