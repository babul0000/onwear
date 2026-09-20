import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Fast nationwide doorstep delivery with ONWEAR. Learn about shipping charges, delivery times for Dhaka and outside Dhaka, and order tracking.',
  alternates: {
    canonical: 'https://www.onwearbd.com/shipping-policy',
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Nationwide Logistics</span>
        <h1 className="text-3xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          Shipping & <span className="font-semibold">Delivery Policy</span>
        </h1>
        <p className="text-xs text-[#737373] mt-3 font-light leading-relaxed">
          Fast, secure, and tracked delivery across all 64 districts in Bangladesh.
        </p>
      </div>

      <div className="space-y-10 text-xs text-[#404040] leading-relaxed">
        {/* Shipping Rates Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-zinc-200 p-6 bg-zinc-50">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-zinc-900" />
              <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">Inside Dhaka City</h2>
            </div>
            <p className="text-2xl font-light text-[#232323] mb-2">৳60 <span className="text-xs text-zinc-500 font-normal">Delivery Fee</span></p>
            <p className="text-xs text-[#737373] mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-900" /> Estimated Time: <strong>24 – 48 Hours</strong>
            </p>
            <p className="text-[11px] text-zinc-500">Home delivery directly to your doorstep across Dhaka metropolitan area.</p>
          </div>

          <div className="border border-zinc-200 p-6 bg-zinc-50">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-zinc-900" />
              <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">Outside Dhaka (All Districts)</h2>
            </div>
            <p className="text-2xl font-light text-[#232323] mb-2">৳120 <span className="text-xs text-zinc-500 font-normal">Delivery Fee</span></p>
            <p className="text-xs text-[#737373] mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-900" /> Estimated Time: <strong>2 – 4 Working Days</strong>
            </p>
            <p className="text-[11px] text-zinc-500">Reliable courier delivery to all divisional and district locations in Bangladesh.</p>
          </div>
        </div>

        {/* Section 1: Order Processing */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            Order Verification & Dispatch
          </h2>
          <p>
            Once you place an order, our customer support team may contact you via phone or WhatsApp to verify order details, sizing, and address. Once confirmed, orders are dispatched within 12–24 hours from our Dhaka fulfillment center.
          </p>
        </section>

        {/* Section 2: Cash on Delivery & Inspection */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Cash on Delivery (COD) & Inspection
          </h2>
          <p>
            We provide convenient Cash on Delivery (COD) across Bangladesh. You are welcome to inspect the outer packaging and verify the parcel in front of the courier representative.
          </p>
        </section>

        {/* Section 3: Tracking */}
        <section className="space-y-3 border-t border-zinc-200 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            Live Order Tracking
          </h2>
          <p>
            You can track your order status in real time anytime by entering your Phone Number or Order ID on our dedicated tracking page.
          </p>
          <div className="pt-2">
            <Link
              href="/orders/track"
              className="inline-block bg-[#232323] text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-black transition-colors"
            >
              Track Your Order Now
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
