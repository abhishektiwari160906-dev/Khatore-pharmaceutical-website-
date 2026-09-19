import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://www.khatorepharma.com/sitemap.xml',
    // Note: the LIVE site's robots.txt today has no Sitemap: directive at
    // all (verified during Phase 0) — this one does, which is a real
    // improvement, not a regression, once this app is what's deployed.
  };
}
