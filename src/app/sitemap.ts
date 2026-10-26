import { MetadataRoute } from 'next';
import { API_URL } from '../config';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.onwearbd.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/orders/track`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (isValidUrl(API_URL)) {
    try {
      const res = await fetch(`${API_URL}/products?limit=500`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const products = data.data?.products || data.data || [];
        if (Array.isArray(products)) {
          productPages = products.map((prod: any) => ({
            url: `${baseUrl}/products/${prod.slug || prod.id}`,
            lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.85,
          }));
        }
      }
    } catch (err: any) {
      console.warn('[sitemap] Skipped dynamic product fetch:', err?.message || err);
    }

    try {
      const res = await fetch(`${API_URL}/categories`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const categories = data.data || [];
        if (Array.isArray(categories)) {
          categoryPages = categories.map((cat: any) => ({
            url: `${baseUrl}/products?category=${encodeURIComponent(cat.slug || cat.id)}`,
            lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.75,
          }));
        }
      }
    } catch (err: any) {
      console.warn('[sitemap] Skipped dynamic category fetch:', err?.message || err);
    }
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
