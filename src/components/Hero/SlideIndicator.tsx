'use client';

import React from 'react';

interface SlideIndicatorProps {
  activeIndex: number;
  totalSlides: number;
  progress: number; // 0 to 100
  onSelect: (index: number) => void;
}

export default function SlideIndicator({ activeIndex, totalSlides, progress, onSelect }: SlideIndicatorProps) {
  return (
    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-12 z-20 flex items-center gap-2 sm:gap-4 text-[10px] font-bold font-mono tracking-widest text-zinc-400 select-none">
      {/* Slide 01 */}
      <button
        onClick={() => onSelect(0)}
        className={`hover:text-zinc-950 transition-colors cursor-pointer text-[9px] sm:text-[10px] ${
          activeIndex === 0 ? 'text-zinc-950 font-black' : ''
        }`}
      >
        01
      </button>

      {/* Track 1 */}
      <div className="w-8 sm:w-16 h-[1.5px] bg-zinc-200 relative rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-zinc-950 transition-all duration-100 ease-linear"
          style={{
            width: activeIndex === 0 ? `${progress}%` : activeIndex > 0 ? '100%' : '0%',
          }}
        />
      </div>

      {/* Slide 02 */}
      <button
        onClick={() => onSelect(1)}
        className={`hover:text-zinc-950 transition-colors cursor-pointer text-[9px] sm:text-[10px] ${
          activeIndex === 1 ? 'text-zinc-950 font-black' : ''
        }`}
      >
        02
      </button>

      {/* Track 2 */}
      <div className="w-8 sm:w-16 h-[1.5px] bg-zinc-200 relative rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-zinc-950 transition-all duration-100 ease-linear"
          style={{
            width: activeIndex === 1 ? `${progress}%` : activeIndex > 1 ? '100%' : '0%',
          }}
        />
      </div>

      {/* Slide 03 */}
      <button
        onClick={() => onSelect(2)}
        className={`hover:text-zinc-950 transition-colors cursor-pointer text-[9px] sm:text-[10px] ${
          activeIndex === 2 ? 'text-zinc-950 font-black' : ''
        }`}
      >
        03
      </button>

      {/* Track 3 */}
      <div className="w-5 sm:w-8 h-[1.5px] bg-zinc-200 relative rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-zinc-950 transition-all duration-100 ease-linear"
          style={{
            width: activeIndex === 2 ? `${progress}%` : '0%',
          }}
        />
      </div>
    </div>
  );
}
