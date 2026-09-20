import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "Categories - Men's Fashion Department",
  description: "Browse premium men's clothing categories at ONWEAR. Discover designer Panjabi, luxury formal shirts, casual wear, polo t-shirts, and trousers.",
  alternates: {
    canonical: 'https://www.onwearbd.com/categories',
  },
  openGraph: {
    title: "Categories - Men's Fashion Department | ONWEAR",
    description: "Browse high-end men's fashion categories. Tailored for elegance and all-day comfort.",
    url: 'https://www.onwearbd.com/categories',
    siteName: 'ONWEAR',
    type: 'website',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
