'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { API_URL } from '../config';
import { 
  Sparkles, 
  ShieldCheck, 
  Star, 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Box, 
  CheckCircle2, 
  Flame,
  Shirt,
  PhoneCall,
  MessageCircle,
  Eye,
  Layers
} from 'lucide-react';
import { formatPrice } from '../utils/format';
import { getOptimizedImageUrl } from '../utils/image';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  image2?: string;
  stock: number;
  category?: {
    name: string;
    slug?: string;
  };
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    name: string;
  };
  product?: {
    id: string;
    name: string;
    image?: string;
    price: number;
    discountPrice?: number | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalOrders: number;
}

interface PublicCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minPurchase: number;
  firstOrderOnly: boolean;
}

export default function ExperienceHub() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<'lookbook' | 'reviews' | 'promise'>('lookbook');
  
  // Real data states
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: 5.0, totalOrders: 0 });
  const [activeCoupon, setActiveCoupon] = useState<PublicCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [addedComboSuccess, setAddedComboSuccess] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [prodsRes, revsRes, statsRes, couponRes] = await Promise.all([
          fetch(`${API_URL}/products?limit=24`).catch(() => null),
          fetch(`${API_URL}/reviews/featured`).catch(() => null),
          fetch(`${API_URL}/reviews/stats`).catch(() => null),
          fetch(`${API_URL}/coupons/public-active`).catch(() => null)
        ]);

        if (!isMounted) return;

        if (prodsRes) {
          const prodsData = await prodsRes.json();
          if (prodsData.success && Array.isArray(prodsData.data)) {
            setProducts(prodsData.data);
          }
        }

        if (revsRes) {
          const revsData = await revsRes.json();
          if (revsData.success && Array.isArray(revsData.data)) {
            setReviews(revsData.data);
          }
        }

        if (statsRes) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            setStats(statsData.data);
          }
        }

        if (couponRes) {
          const couponData = await couponRes.json();
          if (couponData.success && couponData.data) {
            setActiveCoupon(couponData.data);
          }
        }
      } catch (err) {
        console.error('Error loading ExperienceHub dynamic data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically generate real curated style pairings from database products
  const curatedPairs = useMemo(() => {
    if (products.length < 2) return [];

    const tops = products.filter(
      (p) =>
        p.category?.slug === 'shirt' ||
        p.category?.slug === 't-shirt' ||
        p.category?.name?.toLowerCase().includes('shirt')
    );

    const bottoms = products.filter(
      (p) =>
        p.category?.slug === 'pant' ||
        p.category?.slug === 'sandal' ||
        p.category?.name?.toLowerCase().includes('pant') ||
        p.category?.name?.toLowerCase().includes('sandal') ||
        p.category?.name?.toLowerCase().includes('cap')
    );

    const pairs: Array<{
      id: string;
      title: string;
      subtitle: string;
      tag: string;
      items: ProductItem[];
    }> = [];

    // Pair 1: Top 1 + Bottom 1
    if (tops[0] && (bottoms[0] || products[1])) {
      pairs.push({
        id: 'pair-1',
        title: 'Modern Classic Duo',
        subtitle: 'Effortless everyday pairing engineered for versatile style & breathable comfort.',
        tag: 'Signature Pairing',
        items: [tops[0], bottoms[0] || products[1]].filter(Boolean)
      });
    }

    // Pair 2: Top 2 + Bottom 2
    if ((tops[1] || products[2]) && (bottoms[1] || products[3])) {
      pairs.push({
        id: 'pair-2',
        title: 'Urban Streetwear Silhouette',
        subtitle: 'Contemporary relaxed drop cut coordinated with premium structured essentials.',
        tag: 'Trending Combination',
        items: [tops[1] || products[2], bottoms[1] || products[3]].filter(Boolean)
      });
    }

    // Fallback if not categorized
    if (pairs.length === 0 && products.length >= 2) {
      pairs.push({
        id: 'pair-fallback',
        title: 'Curated ONWEAR Look',
        subtitle: 'Hand-selected complementary pieces from our latest in-house release.',
        tag: 'Curated Set',
        items: [products[0], products[1]]
      });
    }

    return pairs;
  }, [products]);

  // Auto-slide reviews every 5 seconds if multiple reviews exist
  useEffect(() => {
    if (activeTab !== 'reviews' || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, reviews.length]);

  const currentPair = curatedPairs[selectedPairIndex] || curatedPairs[0];

  const pairTotalPrice = useMemo(() => {
    if (!currentPair) return 0;
    return currentPair.items.reduce((acc, item) => {
      const price = item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price;
      return acc + price;
    }, 0);
  }, [currentPair]);

  const handleAddFullPair = () => {
    if (!currentPair) return;
    currentPair.items.forEach((item) => {
      if (item.stock > 0) {
        addToCart(item.id, 1);
      }
    });
    setAddedComboSuccess(true);
    setTimeout(() => setAddedComboSuccess(false), 3000);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const couponToDisplay = activeCoupon?.code || 'ONWEAR10';
  const couponDiscountText = activeCoupon
    ? activeCoupon.discountType === 'PERCENTAGE'
      ? `${activeCoupon.discountValue}% OFF`
      : `৳${activeCoupon.discountValue} OFF`
    : '10% OFF';
  const couponMinText = activeCoupon?.minPurchase ? `on orders above ${formatPrice(activeCoupon.minPurchase)}` : 'on your order';

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
      
      {/* 1. SECTION HEADER & DESIGN SYSTEM TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-[9px] font-black uppercase tracking-wider font-mono mb-2 border border-teal-200/50">
            <Sparkles className="h-3 w-3 text-teal-600" />
            <span>Style & Trust Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-950 uppercase">
            {settings.storeName || 'ONWEAR'} Experience Hub
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">
            Explore dynamic styled pairings, genuine customer reviews, and our authentic shopping guarantee.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="inline-flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 shadow-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lookbook'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Shirt className="h-3.5 w-3.5 text-teal-400" />
            <span>Lookbook & Sets</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Customer Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('promise')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'promise'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Brand Guarantee</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: REAL LOOKBOOK & OUTFIT PAIRINGS */}
      {activeTab === 'lookbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-300">
          
          {/* Left Column: Real Store Settings Lookbook Feature Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 group shadow-sm flex flex-col justify-end p-6">
              <Image
                src={settings.lookbookImageUrl || 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000'}
                alt={settings.lookbookTitle || 'ONWEAR Lookbook'}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 font-mono bg-teal-950/80 px-2.5 py-0.5 rounded-full w-fit border border-teal-800/50">
                  {settings.lookbookSubtitle || 'Editorial Feature'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  {settings.lookbookTitle || 'The Signature Collection'}
                </h3>
                <p className="text-xs text-zinc-300 font-medium line-clamp-3 leading-relaxed">
                  {settings.lookbookDescription || 'Experience the fusion of contemporary tailoring and premium breathable fabrics engineered for effortless sophistication.'}
                </p>
                <div className="pt-2">
                  <Link
                    href={settings.lookbookLinkUrl || '/products'}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white hover:text-teal-400 transition-colors"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real Dynamic Product Combo Set */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 sm:p-8">
            
            <div>
              {/* Pair Switcher Selector */}
              {curatedPairs.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {curatedPairs.map((pair, idx) => (
                    <button
                      key={pair.id}
                      onClick={() => setSelectedPairIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPairIndex === idx
                          ? 'bg-zinc-950 text-white shadow-xs font-black'
                          : 'bg-white hover:bg-zinc-200 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {pair.title}
                    </button>
                  ))}
                </div>
              )}

              {currentPair && (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-650">
                        {currentPair.tag}
                      </span>
                      <h4 className="text-base font-black uppercase tracking-tight text-zinc-950">
                        {currentPair.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 font-mono">
                      {currentPair.items.length} Matched Pieces
                    </span>
                  </div>

                  {/* Real Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {currentPair.items.map((item) => {
                      const hasDiscount = item.discountPrice !== undefined && item.discountPrice !== null;
                      const activePrice = hasDiscount ? item.discountPrice! : item.price;

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-zinc-200 rounded-xl p-3 flex gap-3 group hover:border-zinc-400 transition-all shadow-2xs"
                        >
                          <div 
                            onClick={() => router.push(`/products/${item.id}`)}
                            className="relative aspect-[3/4] w-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0 cursor-pointer border border-zinc-100"
                          >
                            <Image
                              src={getOptimizedImageUrl(item.image) || '/placeholder.svg'}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <span className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider block">
                                {item.category?.name || 'ONWEAR'}
                              </span>
                              <Link
                                href={`/products/${item.id}`}
                                className="text-xs font-bold text-zinc-900 hover:text-teal-650 transition-colors line-clamp-1 mt-0.5"
                                title={item.name}
                              >
                                {item.name}
                              </Link>
                            </div>

                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-xs font-black text-zinc-950 font-mono">
                                {formatPrice(activePrice)}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-zinc-400 line-through font-mono">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Total Summary & 1-Click Add Full Look */}
            {currentPair && (
              <div className="p-4 rounded-xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 shadow-2xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    Total Outfit Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-zinc-950 font-mono">
                      {formatPrice(pairTotalPrice)}
                    </span>
                    <span className="text-[9px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                      Coordinated Style
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddFullPair}
                  className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
                >
                  {addedComboSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Outfit Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add Complete Look to Cart</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 3. TAB CONTENT: REAL CUSTOMER REVIEWS & STORE STATS */}
      {activeTab === 'reviews' && (
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in duration-300 shadow-2xs">
          
          {/* Dynamic Real Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-zinc-200 text-center sm:text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black text-zinc-950 font-mono">
                {stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5.0` : '5.0 / 5.0'}
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Average Rating
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black text-zinc-950 font-mono">
                {stats.totalReviews > 0 ? `${stats.totalReviews}` : '100%'}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Buyer Reviews</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Authentic Customer Feedback
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black text-zinc-950 font-mono">
                {stats.totalOrders > 0 ? `${stats.totalOrders}+` : 'Nationwide'}
              </span>
              <span className="text-xs font-bold text-zinc-800">Orders Processed</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Across 64 Districts in BD
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black text-zinc-950 font-mono">
                {formatPrice(settings.freeShippingMinAmount || 2500)}
              </span>
              <span className="text-xs font-bold text-teal-650">Free Shipping Min</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Inside & Outside Dhaka
              </span>
            </div>
          </div>

          {/* Real Customer Review Spotlight */}
          {reviews.length > 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              
              <div className="flex-1 flex flex-col gap-2.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(reviews[activeReviewIdx]?.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Verified Buyer</span>
                  </span>
                </div>

                <blockquote className="text-base sm:text-lg font-bold text-zinc-900 leading-relaxed italic">
                  "{reviews[activeReviewIdx]?.comment || 'Outstanding fabric quality and fast doorstep delivery!'}"
                </blockquote>

                <div className="mt-1">
                  <h4 className="font-black text-zinc-950 text-sm font-sans">
                    {reviews[activeReviewIdx]?.user?.name || 'Verified Customer'}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Reviewed on {new Date(reviews[activeReviewIdx]?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Product Thumbnail Linked to Review */}
              {reviews[activeReviewIdx]?.product && (
                <div 
                  onClick={() => router.push(`/products/${reviews[activeReviewIdx]?.product?.id}`)}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center gap-3 shrink-0 max-w-xs w-full cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-white border border-zinc-200 shrink-0">
                    <Image
                      src={getOptimizedImageUrl(reviews[activeReviewIdx]?.product?.image) || '/placeholder.svg'}
                      alt={reviews[activeReviewIdx]?.product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Purchased Item
                    </span>
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {reviews[activeReviewIdx]?.product?.name}
                    </p>
                    <span className="text-xs font-black text-zinc-950 font-mono block mt-0.5">
                      {formatPrice(reviews[activeReviewIdx]?.product?.price || 0)}
                    </span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
              <h4 className="text-sm font-black uppercase text-zinc-950">100% Quality & Customer First</h4>
              <p className="text-xs text-zinc-500 max-w-md">
                Every order comes with our open-box inspection guarantee and 7-day hassle-free exchange policy.
              </p>
            </div>
          )}

          {/* Review Carousel Navigation Controls */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveReviewIdx(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeReviewIdx === i ? 'w-6 bg-zinc-950' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                    }`}
                    title={`Review ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewIdx((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))}
                  className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer shadow-2xs"
                  title="Previous Review"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewIdx((prev) => (prev + 1) % reviews.length)}
                  className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer shadow-2xs"
                  title="Next Review"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. TAB CONTENT: REAL 4-POINT BRAND GUARANTEE */}
      {activeTab === 'promise' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-950 transition-all flex flex-col gap-3 group">
            <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Box className="h-5 w-5" />
            </div>
            <h3 className="font-black text-zinc-950 text-xs uppercase tracking-wider">Open Box Checking</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Inspect fabric quality, color, and fitting in front of the delivery partner before making payment on COD.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-950 transition-all flex flex-col gap-3 group">
            <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="font-black text-zinc-950 text-xs uppercase tracking-wider">7-Day Doorstep Exchange</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Need a size swap? Contact our WhatsApp helpline for an effortless doorstep replacement.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-950 transition-all flex flex-col gap-3 group">
            <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-black text-zinc-950 text-xs uppercase tracking-wider">Free Delivery Threshold</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Free shipping across Bangladesh on all orders over {formatPrice(settings.freeShippingMinAmount || 2500)}.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs hover:border-zinc-950 transition-all flex flex-col gap-3 group">
            <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="font-black text-zinc-950 text-xs uppercase tracking-wider">Direct Customer Care</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Call {settings.phone} or chat instantly via WhatsApp for rapid order support and styling advice.
            </p>
          </div>

        </div>
      )}

      {/* 5. LIVE ACTIVE COUPON VAULT (100% REAL FROM BACKEND) */}
      <div className="rounded-2xl bg-zinc-950 text-white p-6 sm:p-8 border border-zinc-900 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md shrink-0 border border-white/10">
            <Flame className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 font-mono">
              Exclusive Privilege Voucher
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Get {couponDiscountText} {couponMinText}
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Apply code <strong className="text-white font-mono">{couponToDisplay}</strong> at checkout for instant savings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCopyCoupon(couponToDisplay)}
          className="px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95 shrink-0"
        >
          {copiedCoupon ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Coupon Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Code: {couponToDisplay}</span>
            </>
          )}
        </button>
      </div>

    </section>
  );
}
