import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white py-12 text-zinc-500 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Brand Description */}
        <div className="flex flex-col gap-4">
          <span className="text-lg font-black tracking-[0.2em] text-zinc-950 uppercase">ONWEAR</span>
          <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
            Unique way of elegance. Established 2023. Premium quality men's clothing brand based in Dhaka, Bangladesh.
          </p>
        </div>

        {/* Center: Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-widest text-zinc-900 uppercase">Contact Us</h4>
          <ul className="flex flex-col gap-2 text-xs text-zinc-400 font-medium">
            <li>Address: Khilkhet, Dhaka, Bangladesh, 1229</li>
            <li>Phone: 01603-742663</li>
            <li>Email: onwear.25@gmail.com</li>
          </ul>
        </div>

        {/* Right: Social Media Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-widest text-zinc-900 uppercase">Follow Us</h4>
          <div className="flex gap-4 text-xs font-semibold">
            <a
              href="https://facebook.com/onwear.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-950 transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com/onwear_bd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-950 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-zinc-50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <p>&copy; {new Date().getFullYear()} OnWear. All rights reserved.</p>
        <p>Built with Next.js + Express.js + PostgreSQL + Prisma.</p>
      </div>
    </footer>
  );
}
