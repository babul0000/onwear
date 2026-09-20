import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - The Story of ONWEAR',
  description: 'Learn about ONWEAR - Unique Way of Elegance. Premium men\'s fashion brand in Bangladesh dedicated to modern craftsmanship and timeless design.',
  alternates: {
    canonical: 'https://www.onwearbd.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Our Heritage</span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          About <span className="font-semibold">ONWEAR</span>
        </h1>
        <p className="text-sm text-[#737373] mt-4 leading-relaxed font-light">
          Unique Way of Elegance — redefining modern men&apos;s lifestyle and contemporary craftsmanship in Bangladesh.
        </p>
      </div>

      {/* Story Section */}
      <div className="space-y-12 text-[#404040] leading-relaxed text-sm">
        <section className="bg-zinc-50 border border-zinc-200 p-8 sm:p-10 rounded-none">
          <h2 className="text-lg font-semibold tracking-wider text-[#232323] uppercase mb-4">
            Our Philosophy
          </h2>
          <p className="mb-4">
            Founded with a vision to deliver unmatched elegance, <strong>ONWEAR</strong> bridges the gap between traditional Bangladeshi sartorial traditions and modern international fashion. We believe that true style isn&apos;t loud—it is subtle, meticulously tailored, and timeless.
          </p>
          <p>
            From our signature designer Panjabis for festive celebrations to precision-tailored formal shirts and refined casuals, every piece is curated to offer comfort, confidence, and sophistication.
          </p>
        </section>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-zinc-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-[#232323] mb-2">Premium Fabrics</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              We handpick 100% fine cotton, linen blends, and breathable weaves to ensure luxurious feel and durability.
            </p>
          </div>

          <div className="border border-zinc-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-[#232323] mb-2">Artisanal Fit</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              Engineered with ergonomic smart-fit sizing patterns tailored specifically for Bangladeshi and South Asian body profiles.
            </p>
          </div>

          <div className="border border-zinc-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-[#232323] mb-2">Fair Value</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              Direct-to-consumer model eliminating middlemen markups so you enjoy designer-grade menswear at genuine pricing.
            </p>
          </div>
        </div>

        {/* Customer Promise */}
        <section className="border-t border-zinc-200 pt-10">
          <h2 className="text-lg font-semibold tracking-wider text-[#232323] uppercase mb-4">
            Our Commitment to You
          </h2>
          <p className="mb-4">
            Customer satisfaction is at the core of ONWEAR. Whether you are shopping online from Dhaka, Chittagong, Sylhet, or anywhere across Bangladesh, we guarantee fast nationwide delivery, seamless exchange policies, and attentive customer care.
          </p>
          <div className="pt-4 flex gap-4">
            <Link
              href="/products"
              className="inline-block bg-[#232323] text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-black transition-colors"
            >
              Explore Collection
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-[#232323] text-[#232323] text-xs uppercase tracking-widest px-6 py-3 hover:bg-zinc-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
