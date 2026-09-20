'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="border border-zinc-200 p-8 bg-zinc-50 text-center">
        <h3 className="text-sm font-semibold tracking-wider text-[#232323] uppercase mb-2">
          Message Received
        </h3>
        <p className="text-xs text-[#737373] leading-relaxed mb-4">
          Thank you for reaching out to ONWEAR. Our customer care team will respond to your WhatsApp or email shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs uppercase tracking-widest text-zinc-900 underline font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 p-8 bg-zinc-50">
      <h2 className="text-base font-semibold tracking-wider text-[#232323] uppercase mb-2">
        Send a Quick Inquiry
      </h2>
      <p className="text-xs text-[#737373] mb-6">
        Leave your name and inquiry, and we will get back to your WhatsApp or email immediately.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#404040] font-medium mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Tanvir Hasan"
            className="w-full text-xs p-3 border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#404040] font-medium mb-1">
            Phone Number (WhatsApp)
          </label>
          <input
            type="tel"
            required
            placeholder="017xxxxxxxx"
            className="w-full text-xs p-3 border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#404040] font-medium mb-1">
            Your Message / Question
          </label>
          <textarea
            rows={4}
            required
            placeholder="Write your order number or question here..."
            className="w-full text-xs p-3 border border-zinc-300 bg-white focus:outline-none focus:border-zinc-900 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#232323] text-white text-xs uppercase tracking-widest py-3 font-medium hover:bg-black transition-colors"
        >
          Submit Message
        </button>
      </form>
    </div>
  );
}
