import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/data/products';
import { isValidCountryCode } from '@/data/countries';
import { resolveProductPricing } from '@/lib/pricing/resolve';

export const runtime = 'nodejs';

/**
 * DISPLAY-ONLY pricing lookup (Master Pricing pass, Section 2/3). Used
 * by client components like PriceTag to show a country-aware price
 * before checkout. This endpoint's output is never authoritative for an
 * actual order -- app/api/checkout/route.ts re-resolves pricing itself
 * from the submitted shipping country and ignores anything a client
 * fetched from here.
 *
 * Country, in priority order: an explicit ?country= (lets a page that
 * already knows the customer's selected country ask for that country's
 * price), then the x-khatore-country header set by middleware.ts from
 * best-effort geo-IP, then undefined -- which resolveProductPricing
 * treats as "unknown" and falls back to the configured default tier
 * (Section 13), never a guess.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const slug = url.searchParams.get('productId') ?? url.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const product = getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: `unknown product: ${slug}` }, { status: 404 });
  }

  const queryCountry = url.searchParams.get('country');
  const headerCountry = request.headers.get('x-khatore-country');
  const candidate = (queryCountry ?? headerCountry ?? '').trim().toUpperCase();
  const country = candidate && isValidCountryCode(candidate) ? candidate : undefined;

  const pricing = resolveProductPricing(product, country);
  return NextResponse.json({ pricing });
}
