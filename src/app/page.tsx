'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, Flame } from 'lucide-react';
import { formatPrice } from '../utils/format';
import EcommerceHero from '../components/Hero/EcommerceHero';

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
    name: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { token, user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes, campsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?limit=9`),
          fetch(`${API_URL}/campaigns`).catch(() => null)
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        const campsData = campsRes ? await campsRes.json() : null;

        if (catsData.success) setCategories(catsData.data);
        if (prodsData.success) setProducts(prodsData.data);
        if (campsData && campsData.success && Array.isArray(campsData.data)) {
          setCampaigns(campsData.data.filter((c: any) => c.isActive));
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCampaign = campaigns.length > 0 ? campaigns[0] : null;

  return (
    <div className="flex flex-col gap-20 pb-24 bg-white">
      {/* 1. IMMERSIVE REVEAL HERO SECTION */}
      <EcommerceHero user={user} token={token} />

      {/* 1.5. ACTIVE FLASH SALE / CAMPAIGN BANNER (IF ACTIVE) */}
      {activeCampaign && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
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

      {/* 2. MINIMALIST TRUST BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-y border-zinc-100 py-6 sm:py-10">
          <div className="flex items-center sm:items-start gap-4">
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider">Fast Shipping</h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Free delivery on order above {formatPrice(settings.freeShippingMinAmount || 2500)}
              </p>
            </div>
          </div>
          <div className="flex items-center sm:items-start gap-4">
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider">Premium Quality</h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">Finest hand-selected fabrics & bespoke craftsmanship</p>
            </div>
          </div>
          <div className="flex items-center sm:items-start gap-4">
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider">Easy Exchange</h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">Hassle-free 7-day return and exchange policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6 sm:gap-10">
        <div className="flex items-end justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-950 uppercase">Shop by Category</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Browse our premium departments</p>
          </div>
          <Link href="/categories" className="text-xs font-bold uppercase tracking-wider text-teal-650 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="aspect-[3/4] w-full rounded-xl bg-zinc-100"></div>
                <div className="h-3 w-2/3 rounded bg-zinc-100 mx-auto"></div>
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
                <div className="relative aspect-[3/4] w-full rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100 shadow-xs transition-all duration-300">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300'}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-800 group-hover:text-teal-650 transition-colors text-center truncate w-full px-1">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. DYNAMIC LOOKBOOK SHOWCASE SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-zinc-950 overflow-hidden text-white shadow-xl min-h-auto lg:min-h-[50vh]">
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-16 flex flex-col justify-center gap-4 sm:gap-6 order-2 lg:order-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-teal-400 uppercase font-mono">
              {settings.lookbookTitle || 'THE SIGNATURE COLLECTION'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase leading-tight">
              {settings.lookbookSubtitle || 'THE DENIM OVERCOAT LOOK'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              {settings.lookbookDescription || 'Combine our signature pieces for a modern tailored aesthetic suited for every occasion.'}
            </p>
            <div>
              <Link
                href={settings.lookbookLinkUrl || '/products'}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-teal-400 hover:text-white border-b-2 border-teal-400 pb-1.5 transition-colors duration-300"
              >
                <span>Shop This Look</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 relative min-h-[220px] sm:min-h-[300px] lg:min-h-full overflow-hidden order-1 lg:order-2">
            <img
              src={settings.lookbookImageUrl || 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000'}
              alt={settings.lookbookSubtitle || 'Lookbook Collection'}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
            />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6 sm:gap-10">
        <div className="flex items-end justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-950 uppercase">New Arrivals</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Fresh additions to the collection</p>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-teal-650 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100"></div>
                <div className="h-4 w-2/3 rounded bg-zinc-100"></div>
                <div className="h-3 w-1/3 rounded bg-zinc-100"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 sm:grid-cols-3 lg:grid-cols-3">
            {products.slice(0, 9).map((product) => {
              const hasDiscount = product.discountPrice !== undefined && product.discountPrice !== null;
              const hasTwoImages = !!product.image2;
              
              return (
                <div key={product.id} className="group relative flex flex-col gap-2.5">
                  {/* Image wrapper */}
                  <div 
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="relative aspect-[3/4] w-full rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100 shadow-xs cursor-pointer"
                  >
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400'}
                      alt={product.name}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                        hasTwoImages ? 'group-hover:opacity-0' : ''
                      }`}
                    />
                    
                    {hasTwoImages && (
                      <img
                        src={product.image2}
                        alt={`${product.name} alternate`}
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}

                    {/* Stock status badge */}
                    {product.stock <= 0 ? (
                      <span className="absolute top-2.5 left-2.5 bg-red-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        Out of stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        Low stock
                      </span>
                    ) : hasDiscount ? (
                      <span className="absolute top-2.5 left-2.5 bg-teal-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
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
                        className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-zinc-950/90 hover:bg-zinc-950 text-white p-2.5 sm:p-3 rounded-full shadow-md opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 active:scale-90 transition-all duration-200 cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>

                  {/* Product metadata */}
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider font-mono">
                      {product.category?.name || 'ONWEAR'}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-bold text-xs uppercase tracking-tight text-zinc-900 hover:text-teal-650 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-zinc-950 font-mono">
                          {formatPrice(hasDiscount ? product.discountPrice! : product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-zinc-400 line-through font-semibold font-mono">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-bold text-zinc-500">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
