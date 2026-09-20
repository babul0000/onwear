import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ONWEAR Privacy Policy. Learn how we collect, protect, and handle your personal data and shopping information with utmost security.',
  alternates: {
    canonical: 'https://www.onwearbd.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Security & Trust</span>
        <h1 className="text-3xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          Privacy <span className="font-semibold">Policy</span>
        </h1>
        <p className="text-xs text-[#737373] mt-3 font-light leading-relaxed">
          Last updated: September 2026. Your privacy is paramount to ONWEAR.
        </p>
      </div>

      <div className="space-y-8 text-xs text-[#404040] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            1. Information We Collect
          </h2>
          <p>
            When you visit or purchase from ONWEAR (onwearbd.com), we collect information necessary to fulfill your orders and enhance your shopping experience:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#606060]">
            <li><strong>Contact Information:</strong> Name, delivery address, phone number, and email address.</li>
            <li><strong>Order Details:</strong> Items purchased, sizes, billing details, and order history.</li>
            <li><strong>Device & Usage Data:</strong> IP address, browser type, and interaction cookies to improve site performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            2. How We Use Your Information
          </h2>
          <p>
            The collected information is used solely for legitimate business purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#606060]">
            <li>Processing, packing, and delivering your apparel orders.</li>
            <li>Sending order confirmations, tracking updates, and delivery alerts.</li>
            <li>Handling customer service requests and size exchanges.</li>
            <li>Detecting and preventing fraudulent orders and maintaining platform security.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            3. Payment Data Security
          </h2>
          <p>
            ONWEAR does <strong>not</strong> store your credit card numbers, debit card details, or mobile banking PINs. All online payments are handled directly by PCI-DSS compliant licensed payment gateways (e.g. SSLCommerz, bKash, Nagad) with SSL 256-bit encryption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            4. Third-Party Sharing
          </h2>
          <p>
            We will never sell, rent, or trade your personal information to third parties. We share only necessary delivery details (name, phone, address) with our contracted courier partners solely to execute doorstep delivery.
          </p>
        </section>

        <section className="space-y-3 border-t border-zinc-200 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-[#232323] uppercase">
            5. Contact Us Regarding Privacy
          </h2>
          <p>
            If you have questions about our privacy practices or wish to review/delete your account data, please contact us at <strong>onwear.25@gmail.com</strong> or call <strong>+880 1603-742963</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
