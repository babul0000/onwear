'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroNavigationProps {
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export default function HeroNavigation({ onPrev, onNext }: HeroNavigationProps) {
  return (
    <div className="absolute bottom-6 right-12 z-20 flex items-center gap-2 select-none">
      <button
        onClick={onPrev}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/60 bg-white/40 backdrop-blur-sm text-zinc-800 hover:bg-white hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={onNext}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/60 bg-white/40 backdrop-blur-sm text-zinc-800 hover:bg-white hover:border-zinc-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
