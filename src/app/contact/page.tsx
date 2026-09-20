import type { Metadata } from 'next';
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactForm from '../../components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - Customer Care & Support',
  description: 'Get in touch with ONWEAR customer care. Call us at +8801603742963, email onwear.25@gmail.com, or visit us in Khilkhet, Dhaka.',
  alternates: {
    canonical: 'https://www.onwearbd.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#969696] uppercase">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-[0.08em] text-[#232323] uppercase mt-2">
          Contact <span className="font-semibold">ONWEAR</span>
        </h1>
        <p className="text-sm text-[#737373] mt-4 leading-relaxed font-light">
          Have a question about an order, size guidance, or custom requests? Our customer care team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold tracking-wider text-[#232323] uppercase mb-4">
              Customer Support Details
            </h2>
            <p className="text-xs text-[#737373] leading-relaxed mb-6">
              Reach out directly through any of the channels below. We strive to respond to all inquiries within 2 hours during active business periods.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#232323]">Phone & WhatsApp</h3>
                <p className="text-sm text-[#404040] mt-1 font-medium">+880 1603-742963</p>
                <p className="text-xs text-[#969696]">Direct calls & WhatsApp messaging available</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#232323]">Email Inquiries</h3>
                <p className="text-sm text-[#404040] mt-1 font-medium">onwear.25@gmail.com</p>
                <p className="text-xs text-[#969696]">For order inquiries, partnerships & feedback</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#232323]">Showroom / Hub Location</h3>
                <p className="text-sm text-[#404040] mt-1 font-medium">Khilkhet, Dhaka - 1229</p>
                <p className="text-xs text-[#969696]">Dhaka, Bangladesh</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#232323]">Operating Hours</h3>
                <p className="text-sm text-[#404040] mt-1 font-medium">Everyday: 10:00 AM – 10:00 PM</p>
                <p className="text-xs text-[#969696]">Online ordering active 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Message Form */}
        <ContactForm />
      </div>
    </div>
  );
}
