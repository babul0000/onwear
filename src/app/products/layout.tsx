import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: "All Products - Men's Clothing Collection",
  description: "Explore the complete collection of ONWEAR premium men's clothing in Bangladesh. Shop designer Panjabi, formal and casual shirts, polo t-shirts, and tailored trousers.",
  alternates: {
    canonical: 'https://www.onwearbd.com/products',
  },
  openGraph: {
    title: "All Products - Men's Clothing Collection | ONWEAR",
    description: "Discover signature menswear, designer panjabi, formal shirts, and essentials crafted for elegance.",
    url: 'https://www.onwearbd.com/products',
    siteName: 'ONWEAR',
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
