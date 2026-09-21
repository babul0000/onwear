'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Star, Flame } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { getOptimizedImageUrl } from '../utils/image';
import EcommerceHero from '../components/Hero/EcommerceHero';
import SmartFitFinder from '../components/SmartFitFinder';
import FAQSection from '../components/FAQSection';
import CustomerReviewsSection from '../components/CustomerReviewsSection';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  image2?: string;
  stock: number;
  category?: {
    id?: string;
    name: string;
    slug?: string;
  };
}

const DEFAULT_HOME_CATEGORIES: Category[] = [
  {
    id: '03d9c0c8-b06d-4363-9625-5bca126c04ac',
    name: 'Shirts',
    slug: 'shirts',
    image: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789574760/onwear/categories/fgcoq9lgnetckbm1cv7x.webp'
  },
  {
    id: '9938e717-15df-40b0-87cf-cdb7460cd8c8',
    name: 'T-Shirt',
    slug: 't-shirt',
    image: 'https://i.ibb.co/N6TPhhdL/file-00000000960081f5b5af98dfcee00762.png'
  },
  {
    id: '3cad7560-f1e0-41e3-bee9-b4375d9ade32',
    name: 'Pants',
    slug: 'pants',
    image: 'https://i.ibb.co/CpnHnk19/d5506d9faabca527bcb56c0636dba360-jpg.jpg'
  },
  {
    id: '7500397b-6aa2-4c02-93bb-58f93b524fe3',
    name: 'Cap',
    slug: 'cap',
    image: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789269528/onwear/categories/ztwftipbdq0ognlufzwu.webp'
  }
];

function balanceProductsByCategory(items: Product[], maxTotal: number = 12): Product[] {
  if (!items || items.length === 0) return [];

  const groups: { [catKey: string]: Product[] } = {};
  items.forEach((p) => {
    const key = (p.category?.slug || p.category?.name || 'other').toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const result: Product[] = [];
  const groupKeys = Object.keys(groups);
  let index = 0;
  let hasMore = true;

  while (hasMore && result.length < maxTotal) {
    hasMore = false;
    for (const key of groupKeys) {
      if (index < groups[key].length) {
        result.push(groups[key][index]);
        hasMore = true;
        if (result.length >= maxTotal) break;
      }
    }
    index++;
  }

  if (result.length < maxTotal) {
    const addedIds = new Set(result.map((p) => p.id));
    for (const item of items) {
      if (!addedIds.has(item.id)) {
        result.push(item);
        if (result.length >= maxTotal) break;
      }
    }
  }

  return result;
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_HOME_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryProductsMap, setCategoryProductsMap] = useState<Record<string, Product[]>>({});
  const [categoryLoading, setCategoryLoading] = useState(false);
  const { addToCart } = useCart();
  const { token, user } = useAuth();

  useEffect(() => {
    try {
      const cachedCats = localStorage.getItem('onwear_categories_cache');
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }

      const cachedRaw = localStorage.getItem('onwear_raw_products_cache');
      if (cachedRaw) {
        const parsedRaw = JSON.parse(cachedRaw);
        if (Array.isArray(parsedRaw) && parsedRaw.length > 0) {
          setRawProducts(parsedRaw);
        }
      }

      const cachedProds = localStorage.getItem('onwear_home_products_cache');
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const balanced = balanceProductsByCategory(parsed, 12);
          setProducts(balanced);
          setCategoryProductsMap((prev) => ({ ...prev, all: balanced }));
        }
      }

      const cachedCamps = localStorage.getItem('onwear_campaigns_cache');
      if (cachedCamps) {
        const parsed = JSON.parse(cachedCamps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCampaigns(parsed);
        }
      }
    } catch (e) {}

    async function loadData() {
      try {
        const [catsRes, prodsRes, campsRes] = await Promise.all([
          fetch(`${API_URL}/categories`).catch(() => null),
          fetch(`${API_URL}/products?limit=36`).catch(() => null),
          fetch(`${API_URL}/campaigns`).catch(() => null)
        ]);
        const catsData = catsRes ? await catsRes.json() : null;
        const prodsData = prodsRes ? await prodsRes.json() : null;
        const campsData = campsRes ? await campsRes.json() : null;

        if (catsData && catsData.success && Array.isArray(catsData.data) && catsData.data.length > 0) {
          setCategories(catsData.data);
          try {
            localStorage.setItem('onwear_categories_cache', JSON.stringify(catsData.data));
          } catch (e) {}
        }
        if (prodsData && prodsData.success && Array.isArray(prodsData.data) && prodsData.data.length > 0) {
          setRawProducts(prodsData.data);
          const balanced = balanceProductsByCategory(prodsData.data, 12);
          setProducts(balanced);
          setCategoryProductsMap((prev) => ({ ...prev, all: balanced }));
          try {
            localStorage.setItem('onwear_raw_products_cache', JSON.stringify(prodsData.data));
            localStorage.setItem('onwear_home_products_cache', JSON.stringify(balanced));
          } catch (e) {}
        }
        if (campsData && campsData.success && Array.isArray(campsData.data)) {
          const active = campsData.data.filter((c: any) => c.isActive);
          setCampaigns(active);
          try {
            localStorage.setItem('onwear_campaigns_cache', JSON.stringify(active));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectCategory = async (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') return;
    if (categoryProductsMap[slug] && categoryProductsMap[slug].length > 0) return;

    // Instantly filter from raw products if available
    const localFiltered = rawProducts.filter(
      (p) =>
        p.category?.slug?.toLowerCase() === slug.toLowerCase() ||
        p.category?.name?.toLowerCase() === slug.toLowerCase() ||
        (slug === 'shirts' && p.category?.slug?.toLowerCase() === 'shirt') ||
        (slug === 'pants' && p.category?.slug?.toLowerCase() === 'pant')
    );

    if (localFiltered.length > 0) {
      setCategoryProductsMap((prev) => ({
        ...prev,
        [slug]: localFiltered
      }));
    } else {
      setCategoryLoading(true);
    }

    try {
      const res = await fetch(`${API_URL}/products?limit=12&category=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCategoryProductsMap((prev) => ({
          ...prev,
          [slug]: data.data
        }));
      } else if (localFiltered.length === 0) {
        setCategoryProductsMap((prev) => ({
          ...prev,
          [slug]: []
        }));
      }
    } catch (err) {
      console.error(`Error fetching products for category ${slug}:`, err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const currentProducts = selectedCategory === 'all'
    ? products
    : (categoryProductsMap[selectedCategory] || []);

  const isProductsLoading = loading || (selectedCategory !== 'all' && categoryLoading && !categoryProductsMap[selectedCategory]);

  const activeCampaign = campaigns.length > 0 ? campaigns[0] : null;

  return (
    <div className="flex flex-col gap-20 pb-24 bg-white">
      {/* 1. IMMERSIVE REVEAL HERO SECTION */}
      <EcommerceHero user={user} token={token} />

      {/* 1.5. ACTIVE FLASH SALE / CAMPAIGN BANNER (IF ACTIVE) */}
      {activeCampaign && (
        <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-md shrink-0">
                <Flame className="h-8 w-8 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded font-mono">
                  Active Flash Campaign
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight mt-1">{activeCampaign.name}</h3>
                {activeCampaign.description && (
                  <p className="text-xs text-white/90 mt-0.5">{activeCampaign.description}</p>
                )}
              </div>
            </div>

            <Link
              href="/products"
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-black text-xs uppercase tracking-wider py-3.5 px-8 shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <span>Explore Campaign</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}


      {/* 3. DYNAMIC CATEGORIES GRID */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-6 sm:gap-10">
        <div className="flex items-end justify-between border-b border-[#e6e6e6] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-medium tracking-[0.06em] text-[#232323] uppercase">Shop by Category</h2>
            <p className="text-[11px] text-[#969696] mt-0.5 font-medium tracking-[0.04em] uppercase">Browse our premium departments</p>
          </div>
          <Link href="/categories" className="text-xs font-semibold uppercase tracking-[0.06em] text-[#232323] hover:text-[#727272] flex items-center gap-1.5 transition-colors">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="aspect-[3/4] w-full bg-zinc-100"></div>
                <div className="h-3 w-2/3 bg-zinc-100 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden border border-zinc-100 shadow-xs transition-all duration-300">
                  <Image
                    src={getOptimizedImageUrl(cat.image, 400, 80)}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-xs uppercase tracking-[0.05em] text-[#232323] group-hover:text-zinc-600 transition-colors text-center truncate w-full px-1">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW ARRIVALS GRID */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-4 sm:gap-5 border-b border-[#e6e6e6] pb-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-medium tracking-[0.06em] text-[#232323] uppercase">New Arrivals</h2>
              <p className="text-[11px] text-[#969696] mt-0.5 font-medium tracking-[0.04em] uppercase">Fresh additions to the collection</p>
            </div>
            <Link 
              href={selectedCategory === 'all' ? '/products' : `/products?category=${selectedCategory}`} 
              className="text-xs font-semibold uppercase tracking-[0.06em] text-[#232323] hover:text-[#727272] flex items-center gap-1.5 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#232323] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#232323] text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="aspect-[3/4] w-full bg-zinc-100"></div>
                <div className="h-4 w-2/3 bg-zinc-100"></div>
                <div className="h-3 w-1/3 bg-zinc-100"></div>
              </div>
            ))}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider">
              No products found in this category yet
            </p>
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className="text-xs font-semibold uppercase tracking-wider px-5 py-2.5 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors rounded-full cursor-pointer"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
            {currentProducts.slice(0, 12).map((product) => {
              const hasDiscount = product.discountPrice !== undefined && product.discountPrice !== null;
              const hasTwoImages = !!product.image2;
              
              return (
                <div key={product.id} className="group relative flex flex-col gap-2.5">
                  {/* Image wrapper */}
                  <div 
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden border border-zinc-100 shadow-xs cursor-pointer"
                  >
                    <Image
                      src={getOptimizedImageUrl(product.image, 600, 80)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                        hasTwoImages ? 'group-hover:opacity-0' : ''
                      }`}
                    />
                    
                    {hasTwoImages && (
                      <Image
                        src={getOptimizedImageUrl(product.image2, 600, 80)}
                        alt={`${product.name} alternate`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}

                    {/* Stock status badge */}
                    {product.stock <= 0 ? (
                      <span className="absolute top-2.5 left-2.5 bg-red-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-xs">
                        Out of stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-xs">
                        Low stock
                      </span>
                    ) : hasDiscount ? (
                      <span className="absolute top-2.5 left-2.5 bg-teal-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-xs">
                        Sale
                      </span>
                    ) : null}

                    {/* Quick add floating button (Visible on mobile, animated on desktop) */}
                    {product.stock > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id, 1);
                        }}
                        className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-zinc-950/90 hover:bg-zinc-950 text-white p-2.5 sm:p-3 shadow-md opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 active:scale-90 transition-all duration-200 cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>

                  {/* Product metadata */}
                  <div className="flex flex-col gap-1 px-0.5 pt-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs sm:text-[13px] font-normal tracking-[0.02em] capitalize text-[#232323] hover:text-[#727272] transition-colors truncate block"
                      title={product.name}
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-medium text-[#232323]">
                        {formatPrice(hasDiscount ? product.discountPrice! : product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-[#969696] line-through font-normal">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. CUSTOMER REVIEWS & EXPERIENCES */}
      <CustomerReviewsSection />

      {/* 6. SMART SIZE & FIT STUDIO */}
      <SmartFitFinder />

      {/* 7. FREQUENTLY ASKED QUESTIONS & FAQ SCHEMA */}
      <FAQSection />
    </div>
  );
}
