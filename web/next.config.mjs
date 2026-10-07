/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product/brand imagery is self-hosted under /public/assets now (see
    // ../assets/MANIFEST.md) — no remote patterns needed for those. Left
    // empty deliberately: do not silently allow arbitrary remote hosts.
    remotePatterns: [],
  },

  // Old-URL -> new-URL map (Phase 0 Gate C). Sourced from the LIVE
  // sitemap.xml (31 real indexed URLs, fetched and inventoried during
  // Phase 0) — only takes effect once this app is actually deployed at
  // khatorepharma.com, not before. Only mapped where a clear 1:1 new
  // route exists; the rest are listed below rather than silently
  // guessed at, since a wrong redirect is worse than none.
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/products.html', destination: '/products', permanent: true },
      { source: '/products/kamalahar.html', destination: '/products/kamalahar', permanent: true },
      { source: '/products/k-mens.html', destination: '/products/k-mens', permanent: true },
      { source: '/products/k-matic.html', destination: '/products/k-matic', permanent: true },
      { source: '/products/k-cuff.html', destination: '/products/k-cuff-syrup', permanent: true },
      { source: '/products/k-matic-oil.html', destination: '/products/k-matic-oil', permanent: true },
      { source: '/products/kaptone.html', destination: '/products/kaptone', permanent: true },
      { source: '/products/k-morex.html', destination: '/products/k-morex-brain-tonic', permanent: true },
      { source: '/products/k-matic-combo.html', destination: '/products/k-matic-combo', permanent: true },
      { source: '/contactus', destination: '/contact', permanent: true },

      // Closed 7 Oct per explicit client instruction: "there should not
      // be a single old page" after cutover. Each destination below is
      // a judgment call (documented per group), not a guess at content
      // that doesn't exist -- every one lands on a real, live page.
      //
      // /about-us split heritage/founding-story content from the
      // clinical-trial content into two routes (/heritage, /science).
      // One old URL can only 301 to one target -- chosen /heritage
      // since that's the primary "about Khatore" narrative; /science is
      // one click away via the main nav on every page.
      { source: '/about-us', destination: '/heritage', permanent: true },

      // /wellness.html and its three per-product pages map 1:1 onto the
      // equivalent /products routes.
      { source: '/wellness.html', destination: '/products', permanent: true },
      { source: '/wellness/kamalahar', destination: '/products/kamalahar', permanent: true },
      { source: '/wellness/k-mens', destination: '/products/k-mens', permanent: true },
      { source: '/wellness/k-matic', destination: '/products/k-matic', permanent: true },

      // The 10 old /testimonials/* URLs (by condition and by source)
      // have no dedicated page in this app -- testimonials live on the
      // homepage. All ten land there rather than 404ing.
      { source: '/testimonials/:path*', destination: '/', permanent: true },

      // No dedicated FAQ or customer-service page exists yet -- /contact
      // is the real, live page for exactly that kind of question.
      { source: '/faq', destination: '/contact', permanent: true },
      { source: '/customer-service', destination: '/contact', permanent: true },

      // Magento-generic utility/boilerplate pages, never real Khatore
      // content -- sent home rather than left as dead links.
      { source: '/enable-cookies', destination: '/', permanent: true },
      { source: '/privacy-policy-cookie-restriction-mode', destination: '/', permanent: true },
      { source: '/about-magento-demo-store', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
