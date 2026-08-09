'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?limit=8`)
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
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-zinc-50 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-6 text-left">
              <span className="inline-flex max-w-max items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                New Arrivals Available Now
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl">
                Find Your Premium Comfort at <span className="text-indigo-600">ShopNest</span>
              </h1>
              <p className="text-lg text-zinc-600 max-w-lg">
                Discover a curated collection of state-of-the-art gadgets, apparel, home essentials, and books. All at unbeatable prices.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/15 flex items-center gap-2"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/categories"
                  className="rounded-full bg-white border border-zinc-200 px-6 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] rounded-2xl bg-zinc-100 shadow-xl overflow-hidden border border-zinc-200/50">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600"
                  alt="ShopNest Banner"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Fast Shipping</h3>
              <p className="text-sm text-zinc-500">Free delivery on orders over $150</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Secure Payments</h3>
              <p className="text-sm text-zinc-500">100% secure checkouts & Cash on Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Easy Returns</h3>
              <p className="text-sm text-zinc-500">7-day hassle-free exchange policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Shop by Category</h2>
            <p className="text-sm text-zinc-500 mt-1">Explore our range of e-commerce departments</p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center gap-3">
                <div className="aspect-square w-full rounded-2xl bg-zinc-200"></div>
                <div className="h-4 w-2/3 rounded bg-zinc-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200/60 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=200'}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-sm text-zinc-700 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Featured Products</h2>
            <p className="text-sm text-zinc-500 mt-1">Our top picks and best sellers of the week</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span>See All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-200"></div>
                <div className="h-4 w-3/4 rounded bg-zinc-200"></div>
                <div className="h-4 w-1/3 rounded bg-zinc-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((prod) => {
              const discount = prod.discountPrice !== null;
              return (
                <div
                  key={prod.id}
                  className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <Link href={`/products/${prod.id}`} className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </Link>
                  <div className="mt-4 flex flex-col flex-1">
                    <span className="text-xs font-medium text-zinc-400">{prod.category?.name}</span>
                    <Link href={`/products/${prod.id}`} className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors mt-1 block line-clamp-1">
                      {prod.name}
                    </Link>

                    {/* Price Tag */}
                    <div className="mt-2 flex items-baseline gap-2">
                      {discount ? (
                        <>
                          <span className="text-lg font-bold text-zinc-900">${prod.discountPrice}</span>
                          <span className="text-sm text-zinc-400 line-through">${prod.price}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-zinc-900">${prod.price}</span>
                      )}
                    </div>

                    {/* Add to Cart button */}
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <button
                        onClick={() => addToCart(prod.id, 1)}
                        disabled={prod.stock === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{prod.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
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
