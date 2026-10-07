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

  const country = request.geo?.country;
  if (!country) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khatore-country', country);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/pricing', '/dashboard/:path*', '/api/dashboard/:path*'],
};
