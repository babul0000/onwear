'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroNavigationProps {
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export default function HeroNavigation({ onPrev, onNext }: HeroNavigationProps) {
  return (
    <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-12 z-20 flex items-center gap-1.5 sm:gap-2 select-none">
      <button
        onClick={onPrev}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200/60 bg-white/60 backdrop-blur-sm text-zinc-800 hover:bg-white hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
      <button
        onClick={onNext}
        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200/60 bg-white/60 backdrop-blur-sm text-zinc-800 hover:bg-white hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}
