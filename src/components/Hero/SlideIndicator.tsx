'use client';

import React from 'react';

interface SlideIndicatorProps {
  activeIndex: number;
  totalSlides: number;
  progress: number; // 0 to 100
  onSelect: (index: number) => void;
}

export default function SlideIndicator({ activeIndex, totalSlides, progress, onSelect }: SlideIndicatorProps) {
  const slides = Array.from({ length: totalSlides }, (_, i) => i);

  return (
    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-12 z-20 flex items-center gap-2 sm:gap-4 text-[10px] font-bold font-mono tracking-widest text-zinc-400 select-none">
      {slides.map((idx) => {
        const isActive = activeIndex === idx;
        const isPast = activeIndex > idx;
        const scale = isActive ? Math.min(Math.max(progress / 100, 0), 1) : isPast ? 1 : 0;
        const numLabel = String(idx + 1).padStart(2, '0');
        const trackWidth = idx === 2 ? 'w-5 sm:w-8' : 'w-8 sm:w-16';

        return (
          <React.Fragment key={idx}>
            <button
              onClick={() => onSelect(idx)}
              className={`cursor-pointer text-[9px] sm:text-[10px] transition-opacity duration-200 hover:opacity-100 ${
                isActive ? 'text-zinc-950 font-black opacity-100' : 'opacity-60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {numLabel}
            </button>

            <div className={`${trackWidth} h-[1.5px] bg-zinc-200 relative rounded-full overflow-hidden`}>
              <div
                className="absolute inset-0 w-full h-full bg-zinc-950 origin-left will-change-transform"
                style={{
                  transform: `scaleX(${scale})`,
                  transition: isActive ? 'transform 100ms linear' : 'transform 200ms ease-out',
                }}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
