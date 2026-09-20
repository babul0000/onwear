import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy',
  description: 'Understand the ONWEAR 7-day return and exchange policy. Easy size exchanges, hassle-free returns, and full customer protection across Bangladesh.',
  alternates: {
    canonical: 'https://www.onwearbd.com/return-policy',
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Customer Assurance</span>
        <h1 className="text-3xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          Return & <span className="font-semibold">Exchange Policy</span>
        </h1>
        <p className="text-xs text-[#737373] mt-3 font-light leading-relaxed">
          At ONWEAR, we strive for 100% satisfaction. If you are not delighted with your purchase, we make exchanges and returns simple and transparent.
        </p>
      </div>

      <div className="space-y-10 text-xs text-[#404040] leading-relaxed">
        {/* Highlight Banner */}
        <div className="border border-zinc-200 bg-zinc-50 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">7-Day Hassle-Free Exchange</h2>
            <p className="text-xs text-[#737373] mt-1">
              You can exchange any garment within <strong>7 days</strong> of delivery for size mismatch, fitting adjustments, or color variations.
            </p>
          </div>
        </div>

        {/* Section 1: Conditions */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Conditions for Return & Exchange
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[#606060]">
            <li>The item must be in its original, unworn, unwashed, and undamaged condition.</li>
            <li>All original brand tags, labels, and packaging must remain fully intact.</li>
            <li>Proof of purchase (Order ID, Invoice number, or registered phone number) must be provided.</li>
            <li>Requests must be initiated within 7 calendar days from the date of package receipt.</li>
          </ul>
        </section>

        {/* Section 2: Defective or Wrong Items */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            Defective or Incorrect Orders
          </h2>
          <p>
            In the rare event that you receive a damaged garment, manufacturing defect, or incorrect size/product, ONWEAR will replace the item at <strong>zero additional delivery cost</strong>. Please notify our support team within 24 hours of receiving the parcel with photos of the issue.
          </p>
        </section>

        {/* Section 3: Exchange Process */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            How to Initiate an Exchange
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-[#606060]">
            <li>
              Contact our WhatsApp support team at <strong>+880 1603-742963</strong> or message us on Facebook with your Order ID.
            </li>
            <li>Specify the reason (e.g. need size 42 instead of 40).</li>
            <li>
              Our delivery partner will collect the returned parcel from your doorstep and deliver the replacement.
            </li>
          </ol>
        </section>

        {/* Section 4: Refunds */}
        <section className="space-y-4 border-t border-zinc-200 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Refund Policy
          </h2>
          <p>
            If a replacement size or alternative design is out of stock, or if you prefer a refund for an eligible damaged item, refunds are processed via the original payment method (bKash, Nagad, Card, or Bank transfer) within 3–5 working days of warehouse receipt.
          </p>
        </section>

        <div className="pt-6 border-t border-zinc-200 flex flex-wrap gap-4 items-center justify-between">
          <span className="text-zinc-500">Need help with an ongoing exchange?</span>
          <Link
            href="/contact"
            className="bg-[#232323] text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-black transition-colors"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
}
