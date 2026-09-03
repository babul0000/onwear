'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { token, user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?limit=9`)
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        if (catsData.success) setCategories(catsData.data);
        if (prodsData.success) setProducts(prodsData.data);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-24 bg-white">
      {/* 1. IMMERSIVE REVEAL HERO SECTION */}
      <EcommerceHero user={user} token={token} />

      {/* 2. MINIMALIST TRUST BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-zinc-100 py-10">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-teal-50 p-3 text-teal-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Fast Shipping</h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Free home delivery on order value above $50</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-teal-50 p-3 text-teal-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Premium Quality</h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Finest hand-selected organic fabrics and fits</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-teal-50 p-3 text-teal-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Easy Exchange</h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium">Hassle-free 7-day return and exchange policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC CATEGORIES GRID (Clean Cards, Hover Zoom) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10">
        <div className="flex items-end justify-between border-b border-zinc-50 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-wider text-zinc-950 uppercase">Shop by Category</h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Browse our premium departments</p>
          </div>
          <Link href="/categories" className="text-xs font-bold uppercase tracking-wider text-teal-650 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[3/4] w-full bg-zinc-100"></div>
                <div className="h-3 w-2/3 rounded bg-zinc-100 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative aspect-[3/4] w-full bg-zinc-50 overflow-hidden border border-zinc-100 shadow-sm transition-all duration-300">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300'}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 group-hover:text-teal-650 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. PREMIUM LOOKBOOK HIGHLIGHT (Unique Section) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-zinc-950 overflow-hidden text-white shadow-xl min-h-[50vh]">
          <div className="lg:col-span-5 p-10 sm:p-16 flex flex-col justify-center gap-6">
            <span className="text-xs font-bold tracking-[0.25em] text-teal-400 uppercase">THE OUTFIT INSPIRATION</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-none">THE DENIM OVERCOAT LOOK</h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Combine our signature Indigo Denim Overshirt with tailormade stretch pants for a modern casual lookup that fits both office work and weekend outings.
            </p>
            <div>
              <Link
                href="/products?category=denim"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-teal-400 hover:text-white border-b-2 border-teal-400 pb-1.5 transition-colors duration-300"
              >
                <span>Shop This Look</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000"
              alt="Denim Lookbook Collection"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
            />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS GRID (Dynamic Feed, Badges) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10">
        <div className="flex items-end justify-between border-b border-zinc-50 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-wider text-zinc-950 uppercase">New Arrivals</h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Fresh additions to the collection</p>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-teal-650 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[3/4] w-full bg-zinc-100"></div>
                <div className="h-4 w-2/3 rounded bg-zinc-100"></div>
                <div className="h-3 w-1/3 rounded bg-zinc-100"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3">
            {products.slice(0, 9).map((product) => {
              const hasDiscount = product.discountPrice !== undefined && product.discountPrice !== null;
              const hasTwoImages = !!product.image2;
              
              return (
                <div key={product.id} className="group relative flex flex-col gap-3">
                  {/* Image wrapper */}
                  <div 
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="relative aspect-[3/4] w-full bg-zinc-50 overflow-hidden border border-zinc-100 shadow-sm cursor-pointer"
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
                      <span className="absolute top-3 left-3 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                        Out of stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                        Low stock
                      </span>
                    ) : hasDiscount ? (
                      <span className="absolute top-3 left-3 bg-teal-50 text-teal-650 text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                        Sale
                      </span>
                    ) : null}

                    {/* Quick add floating button */}
                    {product.stock > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id, 1);
                        }}
                        className="absolute bottom-4 right-4 bg-zinc-950 text-white p-3 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-800"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Product metadata */}
                  <div className="flex flex-col gap-1 px-1">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider font-mono">
                      {product.category?.name || 'ONWEAR'}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-bold text-xs uppercase tracking-tight text-zinc-850 hover:text-teal-650 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-zinc-900 font-mono">
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
