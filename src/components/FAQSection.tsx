'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I place an order on ONWEAR?",
    answer: "Placing an order is simple! Browse our collections, select your desired color and size, and click 'Add to Cart' or 'Buy Now'. Proceed to checkout, provide your delivery address and phone number, and choose between Cash on Delivery (COD) or instant online payment."
  },
  {
    question: "What are the delivery charges and delivery times across Bangladesh?",
    answer: "We deliver nationwide across all 64 districts in Bangladesh. Inside Dhaka city, the delivery charge is ৳60 and parcels arrive within 24–48 hours. Outside Dhaka, the delivery charge is ৳120 with an estimated delivery time of 2–4 working days."
  },
  {
    question: "What is your return or exchange policy?",
    answer: "We offer a 7-day hassle-free exchange policy. If the size does not fit or you wish to change colors, contact our WhatsApp support (+880 1603-742963) within 7 days of receiving your package. If you receive a damaged or defective item, we replace it at zero extra charge."
  },
  {
    question: "Can I inspect the parcel before making payment (Cash on Delivery)?",
    answer: "Yes, Cash on Delivery is available across all districts in Bangladesh. You may inspect the package upon arrival in front of the courier delivery representative before paying."
  },
  {
    question: "How can I find my perfect size?",
    answer: "Each product page features a detailed Smart Fit Guide and sizing chart with exact chest, length, and shoulder measurements in inches. You can also use our interactive Smart Size & Fit Studio on the homepage."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Schema.org FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 border-t border-zinc-100 bg-zinc-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
            Frequently Asked <span className="font-semibold">Questions</span>
          </h2>
          <p className="text-xs text-[#737373] mt-3 font-light">
            Everything you need to know about shopping, nationwide shipping, and size guarantees at ONWEAR.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-medium tracking-wide text-[#232323] group-hover:text-black transition-colors pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-zinc-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-[#666666] leading-relaxed animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
