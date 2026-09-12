import React from 'react';
import Link from 'next/link';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-[#e6e6e6] bg-white py-12 text-[#969696] text-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Brand Description */}
        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold tracking-[0.16em] text-[#232323] uppercase">{settings.storeName}</span>
          <p className="text-[#969696] text-xs max-w-xs leading-relaxed">
            {settings.tagline}
          </p>
        </div>

        {/* Center: Contact Info & Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold tracking-[0.06em] text-[#232323] uppercase">Customer Care</h4>
          <ul className="flex flex-col gap-2 text-xs text-[#969696] font-medium">
            <li>
              <Link href="/orders/track" className="hover:text-[#232323] transition-colors text-[#232323] font-medium">
                📦 Track Your Order
              </Link>
            </li>
            <li>Address: {settings.address}</li>
            <li>Phone: {settings.phone}</li>
            <li>Email: {settings.email}</li>
          </ul>
        </div>

        {/* Right: Social Media Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold tracking-[0.06em] text-[#232323] uppercase">Follow Us</h4>
          <div className="flex gap-4 text-xs font-medium">
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
        <p>&copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
}

