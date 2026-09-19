import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/data/products';

const SITE_URL = 'https://www.khatorepharma.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/heritage`, priority: 0.7 },
    { url: `${SITE_URL}/science`, priority: 0.7 },
    { url: `${SITE_URL}/products`, priority: 0.9 },
    { url: `${SITE_URL}/global-presence`, priority: 0.5 },
    { url: `${SITE_URL}/contact`, priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    priority: 1,
  }));

  return [...staticRoutes, ...productRoutes];
}
