import type { Metadata } from 'next';
import React from 'react';
import { API_URL } from '../../../config';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn(`[layout] Error fetching product ${id} for metadata/schema:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Details | ONWEAR',
      description: "Explore signature apparel and men's clothing at ONWEAR Bangladesh.",
    };
  }

  const title = `${product.name} | Premium Men's Wear`;
  const rawDesc = product.description || `Buy ${product.name} at ONWEAR. Premium clothing in Bangladesh with fast nationwide delivery.`;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;
  const image = product.image || (product.images && product.images[0]) || 'https://i.ibb.co/HTB1fbYf/On-Wear-unique-way-of-elegance-1-jpg-2.jpg';
  const canonical = `https://www.onwearbd.com/products/${product.slug || product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'ONWEAR',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: image,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const product = await getProduct(id);

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean),
        description: product.description || product.name,
        sku: product.sku || product.id,
        brand: {
          '@type': 'Brand',
          name: 'ONWEAR',
        },
        offers: {
          '@type': 'Offer',
          url: `https://www.onwearbd.com/products/${product.slug || product.id}`,
          priceCurrency: 'BDT',
          price: product.discountPrice ?? product.price,
          availability:
            product.stock > 0 && product.status === 'ACTIVE'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'ONWEAR',
          },
        },
        ...(product.category ? { category: product.category.name } : {}),
      }
    : null;

  const breadcrumbSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.onwearbd.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category?.name || 'Products',
            item: `https://www.onwearbd.com/products${product.category?.slug ? `?category=${encodeURIComponent(product.category.slug)}` : ''}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://www.onwearbd.com/products/${product.slug || product.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  );
}
