import { NextResponse, type NextRequest } from 'next/server';

/**
 * Geo signal for IP-based country pricing (Master Pricing pass,
 * Section 2/13; made authoritative at checkout too, Vrinda 9 Oct:
 * "automatic IP-based detection... no customer choice"). Scoped to
 * /api/pricing and /api/checkout only -- every other route (including
 * all statically generated product/concern pages) is untouched, so
 * none of them are forced out of SSG by this.
 *
 * Reads the `x-vercel-ip-country` header Vercel's own edge network
 * sets on every request (https://vercel.com/docs/edge-network/headers)
 * -- NOT `request.geo`, which this Next.js/Vercel combination does not
 * reliably populate (an earlier version of this file relied on it;
 * never actually verified working, since no real visitor IP exists in
 * this sandbox -- switched to the documented header directly instead
 * of continuing to trust an unverified API). A client cannot forge
 * this exact header name -- Vercel's edge strips/overwrites it before
 * the request reaches this code -- which is what makes it safe to use
 * as the AUTHORITATIVE source for the actual charged price in
 * app/api/checkout/route.ts, not just a display-only hint anymore.
 * `request.geo?.country` is kept as a secondary fallback only (e.g. a
 * non-Vercel host implementing the old API for compatibility).
 */
/**
 * Internal dashboard gate (Area 2): HTTP Basic Auth against
 * KHATORE_DASHBOARD_PASSWORD. Any username is accepted -- only the
 * password is checked, since there is exactly one shared credential,
 * not per-person accounts. With no password configured, the dashboard
 * is refused entirely (fails closed, never silently open).
 */
function checkDashboardAuth(request: NextRequest): NextResponse | null {
  const expected = process.env.KHATORE_DASHBOARD_PASSWORD;
  if (!expected) {
    return new NextResponse('Dashboard is not configured (KHATORE_DASHBOARD_PASSWORD unset).', { status: 503 });
  }
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice('Basic '.length));
      const password = decoded.split(':').slice(1).join(':');
      if (password === expected) return null; // authorized
    } catch {
      // fall through to challenge
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Khatore Dashboard"' },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard')) {
    const challenge = checkDashboardAuth(request);
    if (challenge) return challenge;
    return NextResponse.next();
  }

  const country = request.headers.get('x-vercel-ip-country') ?? request.geo?.country;
  if (!country) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khatore-country', country);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/pricing', '/api/checkout', '/dashboard/:path*', '/api/dashboard/:path*'],
};
