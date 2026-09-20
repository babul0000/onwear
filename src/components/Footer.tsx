import React from 'react';
import Link from 'next/link';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-[#e6e6e6] bg-white py-12 text-[#969696] text-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="flex flex-col gap-3">
          <span className="text-lg font-semibold tracking-[0.22em] text-[#000000] uppercase pl-[0.22em]">
            {settings.storeName || 'ONWEAR'}
          </span>
          <p className="text-[#969696] text-xs max-w-xs leading-relaxed">
            {settings.tagline || 'Unique Way of Elegance — Premium Men\'s Clothing & Lifestyle Brand in Bangladesh.'}
          </p>
        </div>

        {/* Col 2: Customer Care */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold tracking-[0.06em] text-[#232323] uppercase">Customer Care</h4>
          <ul className="flex flex-col gap-2 text-xs text-[#969696]">
            <li>
              <Link href="/orders/track" className="hover:text-[#232323] transition-colors">
                📦 Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-[#232323] transition-colors">
                🚚 Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="hover:text-[#232323] transition-colors">
                🔄 Return & Exchange (7 Days)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Company & Policies */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold tracking-[0.06em] text-[#232323] uppercase">Company & Legal</h4>
          <ul className="flex flex-col gap-2 text-xs text-[#969696]">
            <li>
              <Link href="/about" className="hover:text-[#232323] transition-colors">
                About ONWEAR
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#232323] transition-colors">
                Contact Customer Care
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#232323] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#232323] transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Showroom & Social */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold tracking-[0.06em] text-[#232323] uppercase">Connect With Us</h4>
          <ul className="flex flex-col gap-2 text-xs text-[#969696]">
            <li>Showroom: {settings.address || 'Khilkhet, Dhaka - 1229'}</li>
            <li>Phone: {settings.phone || '+880 1603-742963'}</li>
            <li>Email: {settings.email || 'onwear.25@gmail.com'}</li>
          </ul>
          <div className="flex gap-4 text-xs font-medium pt-2">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#969696] hover:text-[#232323] transition-colors"
              >
                Facebook
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#969696] hover:text-[#232323] transition-colors"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 border-t border-[#e6e6e6] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#969696]">
        <p>&copy; {new Date().getFullYear()} {settings.storeName || 'ONWEAR'}. All rights reserved.</p>
        <p className="text-[11px] text-zinc-400">Unique Way of Elegance | Engineered in Bangladesh</p>
      </div>
    </footer>
  );
}

