import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.onwearbd.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/orders/track',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/checkout',
          '/cart',
          '/profile',
          '/orders$',
          '/orders/',
          '/api/',
          '/activate-account',
          '/set-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/orders/track',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/checkout',
          '/cart',
          '/profile',
          '/orders$',
          '/orders/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
