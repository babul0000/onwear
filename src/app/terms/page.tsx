import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'ONWEAR Terms and Conditions. Guidelines regarding online orders, pricing, product availability, and service terms.',
  alternates: {
    canonical: 'https://www.onwearbd.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Agreement</span>
        <h1 className="text-3xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          Terms & <span className="font-semibold">Conditions</span>
        </h1>
        <p className="text-xs text-[#737373] mt-3 font-light leading-relaxed">
          Please read these terms carefully before placing an order on ONWEAR.
        </p>
      </div>

      <div className="space-y-8 text-xs text-[#404040] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            1. Overview & Acceptance
          </h2>
          <p>
            By accessing or ordering from onwearbd.com (&quot;ONWEAR&quot;, &quot;we&quot;, &quot;our&quot;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            2. Products & Pricing
          </h2>
          <p>
            All prices are listed in Bangladeshi Taka (BDT). While we make every effort to display accurate product photos and colors, screen displays and photographic lighting may result in minor color variations. We reserve the right to modify prices or discontinue products without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            3. Order Acceptance & Verification
          </h2>
          <p>
            Placing an order constitutes an offer to purchase. ONWEAR reserves the right to accept or decline any order, particularly in cases of stock discrepancies, suspected fraudulent activity, or unverified contact numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            4. Cancellations
          </h2>
          <p>
            Customers may cancel an order before it has been dispatched by contacting our customer care line. Once a package is handed over to the courier partner, standard return/exchange procedures apply.
          </p>
        </section>

        <section className="space-y-3 border-t border-zinc-200 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            5. Intellectual Property
          </h2>
          <p>
            All content, brand logos, imagery, typography, and website designs on ONWEAR are the intellectual property of ONWEAR and may not be reproduced or distributed without explicit written permission.
          </p>
        </section>
      </div>
    </div>
  );
}
