import { NextResponse, type NextRequest } from 'next/server';

/**
 * Best-effort, DISPLAY-ONLY geo signal for dynamic country pricing
 * (Master Pricing pass, Section 2/13). Scoped to /api/pricing only --
 * every other route (including all statically generated product/concern
 * pages) is untouched, so none of them are forced out of SSG by this.
 *
 * `request.geo` is a Vercel-originated API; Netlify's Next Runtime
 * implements it for compatibility, but its real-world accuracy on this
 * deployment cannot be verified from this sandbox (no real visitor IP
 * exists here). That is exactly why it is never treated as
 * authoritative: it only ever informs a DISPLAY price before checkout.
 * The customer's own submitted shipping country remains the sole
 * authoritative source at order time -- see app/api/checkout/route.ts,
 * which re-resolves pricing itself and ignores this header entirely.
 */
export function middleware(request: NextRequest) {
  const country = request.geo?.country;
  if (!country) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khatore-country', country);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/pricing'],
};
