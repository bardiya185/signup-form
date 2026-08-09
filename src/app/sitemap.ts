import type { MetadataRoute } from 'next';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/products', '/incredible-offers', '/blog', '/faq', '/contact',
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: 'daily', priority: path === '' ? 1 : 0.7 }));

  const categories: MetadataRoute.Sitemap = db.categories
    .filter((c) => c.is_active)
    .map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: 'daily', priority: 0.8 }));

  const products: MetadataRoute.Sitemap = db.products
    .filter((p) => p.status === 'active' && !p.deleted_at)
    .map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'hourly',
      priority: p.is_featured ? 0.9 : 0.6,
    }));

  const blog: MetadataRoute.Sitemap = db.blog_posts
    .filter((b) => b.status === 'published')
    .map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: b.published_at ?? b.created_at, changeFrequency: 'weekly', priority: 0.5 }));

  return [...staticRoutes, ...categories, ...products, ...blog];
}
