'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, Edit, Upload } from 'lucide-react';

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
  const [bannerUrl, setBannerUrl] = useState<string>('https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, prodsRes, bannerRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products?limit=8`),
          fetch(`${API_URL}/promotions/hero`)
        ]);
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        const bannerData = await bannerRes.json();

        if (catsData.success) setCategories(catsData.data);
        if (prodsData.success) setProducts(prodsData.data);
        if (bannerData.success && bannerData.data && bannerData.data.imageUrl) {
          setBannerUrl(bannerData.data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEditBanner = () => {
    setInputUrl(bannerUrl);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    if (!apiKey) {
      alert('ImgBB API Key is not set. Please add NEXT_PUBLIC_IMGBB_API_KEY to your environment variables.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.url) {
        setInputUrl(data.data.url);
      } else {
        alert(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      alert('An error occurred during image upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!inputUrl.trim()) {
      alert('Image URL cannot be empty');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/promotions/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: inputUrl.trim() })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.imageUrl) {
        setBannerUrl(data.data.imageUrl);
        setIsModalOpen(false);
        alert('Banner updated successfully!');
      } else {
        alert(data.message || 'Failed to update banner');
      }
    } catch (err) {
      console.error('Error updating banner:', err);
      alert('An error occurred while updating the banner');
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-24 bg-white">
      {/* 1. HERO SECTION (Editorial Style, split screen layout with fashion models) */}
      <section className="relative w-full min-h-[85vh] bg-zinc-50 flex items-center overflow-hidden">
        {user && user.role === 'admin' && (
          <button
            onClick={handleEditBanner}
            className="absolute top-6 right-6 z-20 bg-white/90 hover:bg-white text-zinc-800 p-3 rounded-full shadow-lg border border-zinc-200/50 flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider group"
            title="Edit Banner Image"
          >
            <Edit className="h-4 w-4 text-indigo-600" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
              Edit Banner
            </span>
          </button>
        )}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerUrl}
            alt="Men's Premium Clothing Collection"
            className="w-full h-full object-cover object-top opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 py-20">
          <div className="max-w-xl flex flex-col gap-6 text-left">
            <span className="text-xs font-bold tracking-[0.25em] text-teal-600 uppercase">
              NEW ARRIVALS 2026
            </span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-950 uppercase leading-none">
              THE ART OF <br />
              <span className="text-teal-600">MODERN STYLE</span>
            </h1>
            <p className="text-base text-zinc-500 max-w-md leading-relaxed font-medium">
              Explore our new curated capsule collection of premium men's shirts, tailored pants, heavyweight tees, and refined denim.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/products"
                className="rounded-full bg-zinc-950 px-8 py-4 text-xs font-bold tracking-wider text-white hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 uppercase"
              >
                <span>Shop Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?category=denim"
                className="rounded-full bg-white border border-zinc-200 px-8 py-4 text-xs font-bold tracking-wider text-zinc-700 hover:bg-zinc-50 transition-all uppercase"
              >
                Explore Denim
              </Link>
            </div>
          </div>
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-100"></div>
                <div className="h-4 w-3/4 rounded bg-zinc-100"></div>
                <div className="h-3 w-1/3 rounded bg-zinc-100"></div>
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
                  className="group relative flex flex-col transition-all duration-300"
                >
                  {/* Badge */}
                  {discount && (
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-teal-500 px-2.5 py-1 text-[9px] font-bold text-white tracking-wider uppercase">
                      Sale
                    </span>
                  )}

                  <Link href={`/products/${prod.id}`} className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-50 relative block">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                    
                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
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
                            <span className="text-base font-extrabold text-zinc-900">${prod.discountPrice}</span>
                            <span className="text-xs text-zinc-400 line-through font-medium">${prod.price}</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-zinc-900">${prod.price}</span>
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

      {/* Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl max-w-md w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 text-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Update Hero Banner</h3>
              <p className="text-xs text-zinc-500 mt-1">Change the cover photo of the home page by providing a URL or uploading from your device.</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Option A: Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {/* Option B: Local Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Upload Local File (via ImgBB)</label>
                <div className="relative border border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-650">
                      <span className="h-4 w-4 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading to ImgBB...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-zinc-400 group-hover:text-indigo-650 transition-colors" />
                      <span className="text-xs font-bold text-zinc-600">Click to choose image</span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">PNG, JPG, WEBP</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-zinc-50 border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-650 hover:bg-zinc-100 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={isUploading}
                className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-indigo-700 transition-all uppercase tracking-wider shadow-md disabled:bg-zinc-300 disabled:shadow-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
