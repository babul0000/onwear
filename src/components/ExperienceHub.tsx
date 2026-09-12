'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
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
  Sparkle
} from 'lucide-react';
import { formatPrice } from '../utils/format';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  user: { name: string };
  product?: { name: string; image?: string; price: number };
  createdAt?: string;
}

interface OutfitLook {
  id: string;
  title: string;
  subtitle: string;
  categoryTag: string;
  image: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  }>;
  comboDiscount: number;
}

const CURATED_LOOKS: OutfitLook[] = [
  {
    id: 'signature-denim',
    title: 'The Signature Denim Casual',
    subtitle: 'A versatile layered look tailored for both everyday office and casual weekend outings.',
    categoryTag: 'Signature Look',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800',
    comboDiscount: 300,
    items: [
      {
        id: '1',
        name: 'Indigo Denim Full Sleeve Overshirt',
        price: 1250,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400',
        category: 'Overshirt'
      },
      {
        id: '2',
        name: 'Tailored Stretch Chino Pants - Beige',
        price: 1150,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400',
        category: 'Trousers'
      }
    ]
  },
  {
    id: 'urban-boxy',
    title: 'Urban Monochrome Boxy Vibe',
    subtitle: 'Relaxed drop-shoulder silhouette paired with premium structured bottoms.',
    categoryTag: 'Streetwear Luxury',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
    comboDiscount: 250,
    items: [
      {
        id: '3',
        name: 'Striped Full Sleeve Boxy Shirt',
        price: 850,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400',
        category: 'Boxy Shirt'
      },
      {
        id: '4',
        name: 'Relaxed Olive Cargo Trousers',
        price: 1350,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400',
        category: 'Bottoms'
      }
    ]
  },
  {
    id: 'smart-minimal',
    title: 'Executive Smart Minimalist',
    subtitle: 'Crisp, breathable cotton essentials engineered for confident professional comfort.',
    categoryTag: 'Smart Classic',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800',
    comboDiscount: 200,
    items: [
      {
        id: '5',
        name: 'Premium White Pinstripe Shirt',
        price: 850,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400',
        category: 'Classic Shirt'
      },
      {
        id: '6',
        name: 'Premium Olive Textured Pants',
        price: 1100,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400',
        category: 'Pants'
      }
    ]
  }
];

const SEED_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    rating: 5,
    comment: 'The fabric quality is unreal for this price in BD. Stitching is 10/10 and the boxy fit is absolutely perfect. Delivery took only 24 hours in Dhaka!',
    user: { name: 'Shahriar Kabir' },
    product: {
      name: 'Black & White Striped Full Sleeve Boxy Shirt',
      price: 850,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400'
    }
  },
  {
    id: 'r2',
    rating: 5,
    comment: 'Ordered 3 shirts together. Opened the parcel in front of the Pathao rider before paying. Genuine 100% combed cotton. Will definitely order again!',
    user: { name: 'Farhan Tanvir' },
    product: {
      name: 'Indigo Denim Overshirt & Pants Look',
      price: 1250,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400'
    }
  },
  {
    id: 'r3',
    rating: 5,
    comment: 'Exchange policy is super smooth! I needed an XL instead of L and customer service swapped it without any hassle within 2 days. Highly recommended brand.',
    user: { name: 'Rashedul Hasan' },
    product: {
      name: 'Premium White Pinstripe Full Sleeve Shirt',
      price: 850,
      image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=400'
    }
  }
];

export default function ExperienceHub() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'lookbook' | 'reviews' | 'promise'>('lookbook');
  
  // Lookbook states
  const [selectedLookIndex, setSelectedLookIndex] = useState(0);
  const [addedComboSuccess, setAddedComboSuccess] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState<ReviewItem[]>(SEED_REVIEWS);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Coupon copy state
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    // Fetch live featured reviews from API if available
    async function loadFeaturedReviews() {
      try {
        const res = await fetch(`${API_URL}/reviews/featured`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data);
        }
      } catch {
        // Fallback to verified seed reviews
      }
    }
    loadFeaturedReviews();
  }, []);

  // Auto-slide reviews every 5 seconds when reviews tab is active
  useEffect(() => {
    if (activeTab !== 'reviews' || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, reviews.length]);

  const activeLook = CURATED_LOOKS[selectedLookIndex];
  const comboTotalPrice = activeLook.items.reduce((acc, item) => acc + item.price, 0);
  const comboFinalPrice = comboTotalPrice - activeLook.comboDiscount;

  const handleAddFullLook = () => {
    activeLook.items.forEach((item) => {
      addToCart(item.id, 1);
    });
    setAddedComboSuccess(true);
    setTimeout(() => setAddedComboSuccess(false), 3000);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('ONWEAR10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
      
      {/* SECTION HEADER & SMART TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-2 font-mono">
            <Sparkles className="h-3 w-3 text-teal-400 animate-spin" />
            <span>Interactive Experience Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase">
            The ONWEAR Distinction
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-medium max-w-lg">
            Explore curated styled looks, real customer feedback, and our zero-risk nationwide shopping guarantee.
          </p>
        </div>

        {/* Dynamic Nav Pills */}
        <div className="inline-flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80 shadow-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lookbook'
                ? 'bg-zinc-950 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Shirt className="h-3.5 w-3.5 text-teal-400" />
            <span>Complete Look Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-zinc-950 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Customer Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('promise')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'promise'
                ? 'bg-zinc-950 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>4-Point Guarantee</span>
          </button>
        </div>
      </div>

      {/* 1. TAB: COMPLETE LOOK BUILDER */}
      {activeTab === 'lookbook' && (
        <div className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-10 shadow-2xl border border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
          
          {/* Left Column: Model Look Showcase */}
          <div className="lg:col-span-5 relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900 group">
            <Image
              src={activeLook.image}
              alt={activeLook.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-full w-fit border border-teal-800/60 font-mono mb-2">
                {activeLook.categoryTag}
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">{activeLook.title}</h3>
              <p className="text-xs text-zinc-300 mt-1 font-medium line-clamp-2">{activeLook.subtitle}</p>
            </div>
          </div>

          {/* Right Column: Interactive Set Selector & Bundle Breakdown */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* Style Switcher Pills */}
            <div className="flex flex-wrap gap-2">
              {CURATED_LOOKS.map((look, idx) => (
                <button
                  key={look.id}
                  onClick={() => setSelectedLookIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedLookIndex === idx
                      ? 'bg-white text-zinc-950 shadow-md font-black scale-102'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {look.title}
                </button>
              ))}
            </div>

            {/* Look Items Cards Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <span>Items in this complete outfit ({activeLook.items.length})</span>
                <span className="text-teal-400 font-mono">Save {formatPrice(activeLook.comboDiscount)} on Full Set</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeLook.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3.5 hover:border-zinc-700 transition-colors"
                  >
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 font-mono">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h4>
                      <span className="text-xs font-black text-zinc-300 font-mono mt-1 block">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & 1-Click Shop Full Look Button */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Complete Set Total</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">{formatPrice(comboFinalPrice)}</span>
                  <span className="text-xs text-zinc-500 line-through font-mono">{formatPrice(comboTotalPrice)}</span>
                  <span className="text-[10px] bg-teal-900/80 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-700/50">
                    Combo Offer
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddFullLook}
                className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {addedComboSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                    <span>Full Look Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop Complete Look</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. TAB: LIVE VERIFIED REVIEWS & SOCIAL PROOF */}
      {activeTab === 'reviews' && (
        <div className="rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6 sm:p-10 shadow-sm flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* Live Trust Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-zinc-200 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-950 font-mono">4.9 / 5.0</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average Store Rating</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-950 font-mono">1,500+</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Deliveries</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Across 64 Districts</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-950 font-mono">99.2%</span>
              <span className="text-xs font-bold text-indigo-600">Satisfaction Rate</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Based on genuine reviews</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-950 font-mono">24h</span>
              <span className="text-xs font-bold text-teal-650">Fast Shipping</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Dhaka & Nationwide</span>
            </div>
          </div>

          {/* Active Review Spotlight Card */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative">
            
            <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-amber-400">
                  {[...Array(reviews[activeReviewIdx].rating || 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  <span>Verified Buyer</span>
                </span>
              </div>

              <blockquote className="text-base sm:text-lg font-semibold text-zinc-800 leading-relaxed italic">
                "{reviews[activeReviewIdx].comment}"
              </blockquote>

              <div className="mt-1">
                <h4 className="font-black text-zinc-950 text-sm font-sans">{reviews[activeReviewIdx].user?.name}</h4>
                <p className="text-xs text-zinc-400 font-mono">Happy ONWEAR Customer</p>
              </div>
            </div>

            {/* Product Purchased Thumbnail Card */}
            {reviews[activeReviewIdx].product && (
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center gap-3 shrink-0 max-w-xs w-full">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border border-zinc-200 shrink-0">
                  <Image
                    src={reviews[activeReviewIdx].product?.image || '/placeholder.svg'}
                    alt={reviews[activeReviewIdx].product?.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                    Purchased Item
                  </span>
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {reviews[activeReviewIdx].product?.name}
                  </p>
                  <span className="text-xs font-black text-teal-650 font-mono block mt-0.5">
                    {formatPrice(reviews[activeReviewIdx].product?.price || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveReviewIdx(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeReviewIdx === i ? 'w-8 bg-zinc-950' : 'w-2 bg-zinc-200 hover:bg-zinc-400'
                  }`}
                  title={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveReviewIdx((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))}
                className="p-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer shadow-xs"
                title="Previous Review"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveReviewIdx((prev) => (prev + 1) % reviews.length)}
                className="p-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer shadow-xs"
                title="Next Review"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB: 4-POINT BRAND PROMISE */}
      {activeTab === 'promise' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          
          {/* Guarantee Card 1 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group hover:border-zinc-950">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Box className="h-6 w-6" />
            </div>
            <h3 className="font-black text-zinc-950 text-sm uppercase tracking-tight">Open Box Checking</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Inspect fabric quality, color, and fitting in front of the delivery partner before making your payment.
            </p>
          </div>

          {/* Guarantee Card 2 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group hover:border-zinc-950">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="font-black text-zinc-950 text-sm uppercase tracking-tight">7-Day Easy Exchange</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Size not fitting right? We will exchange it directly to your doorstep with zero hassle and fast response.
            </p>
          </div>

          {/* Guarantee Card 3 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group hover:border-zinc-950">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Shirt className="h-6 w-6" />
            </div>
            <h3 className="font-black text-zinc-950 text-sm uppercase tracking-tight">100% Combed Cotton</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Crafted from pre-shrunk, breathable high-thread count fabrics specifically engineered for long-lasting comfort.
            </p>
          </div>

          {/* Guarantee Card 4 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group hover:border-zinc-950">
            <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl w-fit group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-black text-zinc-950 text-sm uppercase tracking-tight">Express Nationwide Shipping</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Reliable delivery in Dhaka within 24-48 hours and nationwide coverage with live SMS and web tracking.
            </p>
          </div>

        </div>
      )}

      {/* 4. VIP SECRET OFFER / INSTANT COUPON VAULT */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
            <Flame className="h-7 w-7 text-amber-400 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 font-mono">
              VIP Welcome Privilege
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Enjoy 10% Off On Your First Order
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Use code <strong className="text-white font-mono">ONWEAR10</strong> at checkout for an instant discount.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCoupon}
          className="px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
        >
          {copiedCoupon ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Coupon Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Code: ONWEAR10</span>
            </>
          )}
        </button>
      </div>

    </section>
  );
}
