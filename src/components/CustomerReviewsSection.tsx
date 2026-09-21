'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, CheckCircle2, Sparkles, Quote, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';
import { getOptimizedImageUrl } from '../utils/image';

interface RealReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice?: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalOrders: number;
}

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<RealReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const loadRealReviews = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const [featRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/reviews/featured?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }).catch(() => null),
        fetch(`${API_URL}/reviews/stats?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }).catch(() => null),
      ]);

      if (featRes && featRes.ok) {
        const featData = await featRes.json();
        if (featData.success && Array.isArray(featData.data)) {
          // Strictly filter out any deleted reviews
          const active = featData.data.filter((r: any) => !r.isDeleted);
          const mapped: RealReviewItem[] = active.map((r: any) => ({
            id: r.id,
            rating: r.rating || 5,
            comment: r.comment || '',
            createdAt: r.createdAt,
            userName: r.user?.name || 'Customer',
            productId: r.product?.id || r.productId,
            productName: r.product?.name || 'ONWEAR Apparel',
            productImage: r.product?.image || '',
            productPrice: r.product?.discountPrice || r.product?.price,
          }));

          setReviews(mapped);
        } else {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
          setStats({
            totalReviews: statsData.data.totalReviews || 0,
            averageRating: statsData.data.averageRating || 5.0,
            totalOrders: statsData.data.totalOrders || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load real reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealReviews();

    // 1. Instant re-fetch whenever user switches back to this browser tab
    const handleFocus = () => {
      loadRealReviews();
    };
    window.addEventListener('focus', handleFocus);

    // 2. Instant re-fetch when a review is deleted or added in admin or product page
    const handleReviewUpdate = () => {
      loadRealReviews();
    };
    window.addEventListener('onwear_review_updated', handleReviewUpdate);

    // 3. Instant cross-tab synchronization via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'onwear_review_updated') {
        loadRealReviews();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('onwear_review_updated', handleReviewUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadRealReviews]);

  // If there are no reviews or all reviews have been deleted, do not display the section
  if (!loading && reviews.length === 0) {
    return null;
  }

  // If still loading initial state and no reviews, keep empty until confirmed
  if (loading && reviews.length === 0) {
    return null;
  }

  // Seamless looping marquee items: duplicate only as needed without creating artificial duplicate clutter
  const repeatCount = reviews.length === 1 ? 2 : reviews.length === 2 ? 3 : 2;
  const marqueeItems = Array.from({ length: repeatCount }).flatMap(() => reviews);

  return (
    <section className="w-full border-t border-[#e6e6e6] bg-white py-14 sm:py-18 overflow-hidden relative">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[#e6e6e6] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono border border-zinc-200">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Real Customer Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.04em] text-[#232323] uppercase">
              What Our Gentlemen Say
            </h2>
            <p className="text-xs text-[#727272] mt-1 font-normal tracking-[0.02em] max-w-xl">
              100% verified ratings and genuine reviews from real customers across Bangladesh.
            </p>
          </div>

          {/* Real Live Database Metrics Badge */}
          {stats && stats.totalReviews > 0 ? (
            <div className="flex items-center gap-4 sm:gap-6 bg-zinc-50 border border-zinc-200 px-4 py-3 shrink-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-[#232323]">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(stats.averageRating)
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'stroke-zinc-300 fill-none'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#727272] uppercase tracking-wider">
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'Verified Review' : 'Verified Reviews'}
                </span>
              </div>

              <div className="h-8 w-px bg-zinc-200" />

              <div className="flex flex-col">
                <span className="text-lg font-black text-emerald-600">
                  {stats.totalOrders}+
                </span>
                <span className="text-[10px] font-medium text-[#727272] uppercase tracking-wider">
                  Orders Delivered
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3.5 py-2 shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-[11px] font-semibold text-zinc-700 tracking-wide uppercase">
                100% Authentic Customer Reviews
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Real Reviews Infinite Marquee (Sharp Non-Rounded Aesthetics) */}
      <div
        className="relative w-full overflow-hidden mt-6 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle Side Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Marquee Track */}
        <div
          className={`flex gap-5 sm:gap-6 py-2 ${
            isPaused ? 'animate-marquee [animation-play-state:paused]' : 'animate-marquee'
          }`}
        >
          {marqueeItems.map((rev, idx) => (
            <div
              key={`${rev.id}-${idx}`}
              className="flex flex-col justify-between shrink-0 w-[300px] sm:w-[350px] md:w-[380px] p-5 sm:p-6 bg-zinc-50/90 border border-zinc-200/90 hover:border-zinc-900 hover:bg-white transition-all duration-300 group/card"
            >
              {/* Header: Rating & Verified Badge */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'stroke-zinc-300 fill-none'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-zinc-700 ml-1">
                      ({rev.rating}/5)
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Review Text */}
                <div className="relative">
                  <Quote className="h-4 w-4 text-zinc-300 mb-1" />
                  <p className="text-xs text-zinc-700 leading-relaxed font-normal line-clamp-4">
                    {rev.comment}
                  </p>
                </div>
              </div>

              {/* Footer: Product Thumbnail & Customer Info (Sharp Rectangular Design) */}
              <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-zinc-200/70">
                {rev.productName && (
                  <Link
                    href={`/products/${rev.productId}`}
                    className="flex items-center gap-2.5 p-2 bg-white border border-zinc-200 hover:border-zinc-900 transition-colors"
                    title={rev.productName}
                  >
                    {rev.productImage && (
                      <div className="relative h-10 w-10 overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200">
                        <Image
                          src={getOptimizedImageUrl(rev.productImage, 80, 75)}
                          alt={rev.productName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">
                        Reviewed Product
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-800 truncate">
                        {rev.productName}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Customer Name & Date */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-zinc-900 text-white font-bold text-[9px] flex items-center justify-center tracking-wider">
                      {rev.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#232323] text-xs">
                      {rev.userName}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-medium">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
