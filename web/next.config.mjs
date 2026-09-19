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
      // NOT mapped, on purpose -- a wrong redirect is worse than none:
      //
      //   /about-us  -- ambiguous. On the live site this single URL covers
      //     both the heritage/founding story AND the clinical-trial
      //     content (there's even a #clinicalTrial anchor into the same
      //     page). This app splits that into two real routes, /heritage
      //     and /science -- a single old URL can only 301 to one new
      //     target. Needs a client decision (or a lightweight interstitial
      //     page at /about-us that links to both) before cutover, not a
      //     guess here.
      //
      //   /wellness.html, /wellness/kamalahar, /wellness/k-mens, /wellness/k-matic
      //   /testimonials/* (10 URLs, by condition and by source)
      //   /faq, /customer-service
      //   /enable-cookies, /privacy-policy-cookie-restriction-mode
      //     -- no corresponding page exists in this app yet.
      //
      //   /about-magento-demo-store -- stray indexed Magento default
      //     page, not real content. Flag for removal at the source, not
      //     something to migrate.
    ];
  },
};

export default nextConfig;
