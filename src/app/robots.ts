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
          '/favicon.ico',
          '/favicon-48x48.png',
          '/favicon-96x96.png',
          '/icon-192.png',
          '/icon-512.png',
          '/icon.svg',
          '/apple-icon.png',
          '/site.webmanifest',
          '/manifest.json',
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
          '/favicon.ico',
          '/favicon-48x48.png',
          '/favicon-96x96.png',
          '/icon-192.png',
          '/icon-512.png',
          '/icon.svg',
          '/apple-icon.png',
          '/site.webmanifest',
          '/manifest.json',
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
