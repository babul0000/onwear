'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';

interface HotspotProps {
  x: number; // percentage left
  y: number; // percentage top
  name: string;
  price: number;
  discountPrice?: number | null;
  slug: string;
  isMobile: boolean;
}

export default function ProductHotspot({ x, y, name, price, discountPrice, slug, isMobile }: HotspotProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent clicking slide
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsOpen(false);
  };

  return (
    <div
      className="absolute z-30 select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pulsing Hotspot Dot */}
      <button
        onClick={toggleOpen}
        className="relative flex h-6 w-6 items-center justify-center focus:outline-none cursor-pointer"
        aria-label={`View product hotspot for ${name}`}
      >
        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-white/40 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border border-zinc-950/20 shadow-md"></span>
      </button>

      {/* Popover Product Detail Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // prevent clicking slide
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-white/20 bg-white/70 backdrop-blur-md p-3.5 shadow-xl text-zinc-900"
          >
            <h4 className="text-[11px] font-black uppercase text-zinc-950 font-sans tracking-wide truncate">
              {name}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs font-bold font-mono">
                {formatPrice(discountPrice !== undefined && discountPrice !== null ? discountPrice : price)}
              </span>
              {discountPrice !== undefined && discountPrice !== null && (
                <span className="text-[10px] text-zinc-400 font-bold line-through font-mono">
                  {formatPrice(price)}
                </span>
              )}
            </div>
            
            <Link
              href={`/products/${slug}`}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-teal-650 hover:text-teal-700 font-sans border-b border-transparent hover:border-teal-650 pb-0.5 transition-colors"
            >
              <span>View Product</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
