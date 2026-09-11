'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, ShieldCheck, ArrowUpRight, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  highlight: string;
}

interface AuthLookbookProps {
  mode: 'login' | 'register';
}

export default function AuthLookbook({ mode }: AuthLookbookProps) {
  const { settings } = useSettings();

  const slides: Slide[] = [
    {
      id: 1,
      tag: 'LOOK 01 // SIGNATURE DRAPE',
      title: settings?.loginTitle || 'THE MODERN SILHOUETTE',
      subtitle: settings?.loginSubtitle || 'Minimalist cuts, heavyweight cottons, and refined streetwear craftsmanship.',
      image: settings?.loginImageUrl || 'https://i.ibb.co/HTB1fbYf/On-Wear-unique-way-of-elegance-1-jpg-2.jpg',
      highlight: '100% Organic Heavyweight Cotton',
    },
    {
      id: 2,
      tag: 'LOOK 02 // TAILORED ARCHIVE',
      title: settings?.registerTitle || 'EFFORTLESS LUXURY',
      subtitle: settings?.registerSubtitle || 'Engineered for daily movement with understated luxury aesthetics.',
      image: settings?.registerImageUrl || 'https://i.ibb.co/FqHjfvxG/Gemini-Generated-Image-ino58qino58qino5.jpg',
      highlight: 'Tailored Streetwear Proportions',
    },
    {
      id: 3,
      tag: 'LOOK 03 // SEASONAL ESSENTIALS',
      title: 'PRECISION & COMFORT',
      subtitle: 'Every stitch reflects our commitment to premium wardrobe essentials.',
      image: settings?.lookbookImageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      highlight: 'All-Day Breathable Weave',
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[current];

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-full overflow-hidden bg-zinc-950 select-none flex flex-col justify-between p-8 sm:p-10 lg:p-12 text-white">
      {/* Background Crossfade Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeSlide.id}
            src={activeSlide.image}
            alt={activeSlide.title}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Ambient Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/75 via-transparent to-zinc-950/40" />
      </div>

      {/* Top Header & Season Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-zinc-200">
            SS/26 APPAREL ARCHIVE
          </span>
        </div>

        {/* Slide navigation controls */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 p-1 rounded-full">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === current ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`View slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Editorial Content & High-Fashion Typography */}
      <div className="relative z-10 space-y-6 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black tracking-[0.25em] uppercase text-zinc-300 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                {activeSlide.tag}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-medium">
                {activeSlide.highlight}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-[1.05] font-sans">
              {activeSlide.title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-normal max-w-md">
              {activeSlide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Exclusive VIP Member Perks Strip */}
        <div className="pt-2 border-t border-white/15 grid grid-cols-3 gap-2.5">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
            <Gift className="h-4 w-4 text-amber-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-wider text-white">Tk 200 Gift</p>
            <p className="text-[9px] text-zinc-400 font-medium">On 1st Order</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
            <Truck className="h-4 w-4 text-sky-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-wider text-white">Express Delivery</p>
            <p className="text-[9px] text-zinc-400 font-medium">Inside & Outside Dhaka</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-wider text-white">100% Original</p>
            <p className="text-[9px] text-zinc-400 font-medium">Authentic Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
