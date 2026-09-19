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
      url: `${baseUrl}/orders/track`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
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
  try {
    const res = await fetch(`${API_URL}/products?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.data?.products || data.data || [];
      if (Array.isArray(products)) {
        productPages = products.map((prod: any) => ({
          url: `${baseUrl}/products/${prod.id}`,
          lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.85,
        }));
      }
    }
  } catch (err) {
    console.warn('[sitemap] Error fetching products for sitemap:', err);
  }

  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
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
  } catch (err) {
    console.warn('[sitemap] Error fetching categories for sitemap:', err);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
