'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, Edit, Upload } from 'lucide-react';
import { formatPrice } from '../utils/format';

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
  
  // Hero interactive slide states
  const [slides, setSlides] = useState<any[]>([]);
  const [editSlides, setEditSlides] = useState<any[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  const defaultSlides = [
    {
      id: 'default-1',
      title: 'Casual Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600',
      linkUrl: '/products?category=shirt'
    },
    {
      id: 'default-2',
      title: 'Refined Denim',
      imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1600',
      linkUrl: '/products?category=denim'
    },
    {
      id: 'default-3',
      title: 'Winter Collection',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600',
      linkUrl: '/products?category=winter-collection'
    }
  ];

  const activeSlides = slides.length === 3 ? slides : defaultSlides;

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes, slidesRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?limit=8`),
          fetch(`${API_URL}/promotions/hero-slides`)
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        const slidesData = await slidesRes.json();

        if (catsData.success) setCategories(catsData.data);
        if (prodsData.success) setProducts(prodsData.data);
        if (slidesData.success && slidesData.data && slidesData.data.length === 3) {
          setSlides(slidesData.data);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-slide every 2 seconds
  useEffect(() => {
    if (activeSlides.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlideIdx((prevIdx) => (prevIdx + 1) % activeSlides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);


  const handleEditHeroSlides = () => {
    const currentSlides = slides.length === 3 ? slides : defaultSlides;
    setEditSlides(JSON.parse(JSON.stringify(currentSlides)));
    setIsModalOpen(true);
  };

  const handleSlideFileChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    setUploadingSlideIdx(idx);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.url) {
        const copy = [...editSlides];
        copy[idx].imageUrl = data.data.url;
        setEditSlides(copy);
      } else {
        alert(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      alert('An error occurred during image upload.');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const handleSaveHeroSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/promotions/hero-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slides: editSlides })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length === 3) {
        setSlides(data.data);
        setIsModalOpen(false);
        alert('Hero banner slides updated successfully!');
      } else {
        alert(data.message || 'Failed to update slides');
      }
    } catch (err) {
      console.error('Error saving hero slides:', err);
      alert('An error occurred while saving the slides');
    }
  };



  return (
    <div className="flex flex-col gap-20 pb-24 bg-white">
      {/* 1. HERO SECTION (Clean Slide Show layout with dynamic bottom hover CTA button) */}
      <section className="group relative w-full min-h-[85vh] bg-zinc-50 flex items-end justify-center overflow-hidden">
        {user && user.role === 'admin' && (
          <button
            onClick={handleEditHeroSlides}
            className="absolute top-6 right-6 z-20 bg-white/95 hover:bg-white text-zinc-800 p-3 rounded-full shadow-lg border border-zinc-200/50 flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider group/btn font-sans"
            title="Edit Hero Slides"
          >
            <Edit className="h-4 w-4 text-zinc-900" />
            <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
              Edit Hero Slides
            </span>
          </button>
        )}
        
        {/* Layered sliding images for smooth cross-fading transition */}
        <div className="absolute inset-0 z-0 select-none">
          {activeSlides.map((slide, idx) => (
            <img
              key={slide.id || idx}
              src={slide.imageUrl}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-out ${
                idx === activeSlideIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
              }`}
            />
          ))}
        </div>

        {/* CTA Button centered at the bottom section with smooth slide-up hover animation */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 flex justify-center pb-12">
          <Link
            href="/products"
            className="rounded-full bg-zinc-950/90 backdrop-blur-sm hover:bg-zinc-950 px-12 py-4.5 text-xs font-black tracking-widest uppercase text-white shadow-2xl flex items-center gap-2.5 transition-all duration-500 ease-out opacity-100 translate-y-0 md:opacity-0 md:translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 select-none hover:scale-105"
          >
            <span>View All Product</span>
            <ArrowRight className="h-4 w-4 animate-pulse" />
          </Link>
        </div>
      </section>

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
          <Link href="/categories" className="text-xs font-bold uppercase tracking-wider text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100"></div>
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
                <div className="relative aspect-[3/4] w-full rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100 shadow-sm transition-all duration-300">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300'}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 group-hover:text-teal-600 transition-colors">
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

      {/* 5. MINIMALIST FEATURED PRODUCTS GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10">
        <div className="flex items-end justify-between border-b border-zinc-50 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-wider text-zinc-950 uppercase">Featured Products</h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Handpicked styles of the season</p>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span>View Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100"></div>
                <div className="h-4 w-3/4 rounded bg-zinc-100"></div>
                <div className="h-3 w-1/3 rounded bg-zinc-100"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((prod) => {
              const discount = prod.discountPrice !== null;
              return (
                <div
                  key={prod.id}
                  className="group relative flex flex-col transition-all duration-300"
                >
                  {/* Badge */}
                  {discount && (
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-teal-500 px-2.5 py-1 text-[9px] font-bold text-white tracking-wider uppercase">
                      Sale
                    </span>
                  )}

                  <Link href={`/products/${prod.id}`} className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-50 relative block">
                    {/* Primary Image */}
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-0"
                    />

                    {/* Secondary Image (Fades in & zooms slightly on hover) */}
                    {prod.image2 && (
                      <img
                        src={prod.image2}
                        alt={`${prod.name} Hover`}
                        className="absolute inset-0 h-full w-full object-cover opacity-0 scale-100 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!token) {
                            router.push('/login');
                            return;
                          }
                          const res = await addToCart(prod.id, 1);
                          if (res.success) {
                            router.push('/checkout');
                          }
                        }}
                        disabled={prod.stock === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-sm py-2.5 text-xs font-bold text-zinc-950 hover:bg-white transition-all shadow-md uppercase tracking-wider disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{prod.stock > 0 ? 'Order Now' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </Link>

                  <div className="mt-3 flex flex-col flex-1 px-0.5">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{prod.category?.name}</span>
                    <Link href={`/products/${prod.id}`} className="font-bold text-zinc-900 group-hover:text-teal-600 transition-colors mt-1 block text-sm tracking-tight line-clamp-1">
                      {prod.name}
                    </Link>

                    {/* Price and Rating Row */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        {discount ? (
                          <>
                            <span className="text-base font-extrabold text-zinc-900">{formatPrice(prod.discountPrice)}</span>
                            <span className="text-xs text-zinc-400 line-through font-medium">{formatPrice(prod.price)}</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-zinc-900">{formatPrice(prod.price)}</span>
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

      {/* Edit Hero Slides Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl max-w-2xl w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 text-zinc-800 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Update Hover Hero Slides</h3>
              <p className="text-xs text-zinc-500 mt-1">Configure labels, redirection links, and upload banner photos for the 3 homepage hover categories.</p>
            </div>

            <div className="flex flex-col gap-6 pt-2">
              {editSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="border-b border-zinc-150 pb-5 last:border-0 last:pb-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo bg-zinc-100 px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-mono">
                      Category Slide #{idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Label */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Slide label / Title</label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].title = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. Refined Denim"
                      />
                    </div>

                    {/* Target Link */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Target Redirect URL</label>
                      <input
                        type="text"
                        required
                        value={slide.linkUrl || ''}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].linkUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. /products?category=denim"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Image URL */}
                    <div className="flex flex-col gap-1.5 md:col-span-8">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Banner Image URL</label>
                      <input
                        type="text"
                        required
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].imageUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>

                    {/* Local File upload */}
                    <div className="md:col-span-4">
                      <div className="relative border border-dashed border-zinc-200 hover:border-zinc-500 hover:bg-zinc-50 transition-all rounded-xl p-2.5 flex items-center justify-center gap-1.5 cursor-pointer text-center h-[38px] w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSlideFileChange(e, idx)}
                          disabled={uploadingSlideIdx === idx}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {uploadingSlideIdx === idx ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-700">
                            <span className="h-3 w-3 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin"></span>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-650">Upload File</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 mt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-zinc-50 border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-650 hover:bg-zinc-100 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHeroSlides}
                disabled={uploadingSlideIdx !== null}
                className="rounded-full bg-zinc-950 text-white px-5 py-2.5 text-xs font-bold hover:bg-zinc-850 transition-all uppercase tracking-wider shadow-md disabled:bg-zinc-300 disabled:shadow-none"
              >
                Save All Slides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
