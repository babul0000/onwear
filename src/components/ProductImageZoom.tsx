'use client';

import React, { useRef } from 'react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductImageZoom({ src, alt, className = '' }: ProductImageZoomProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const isZoomedRef = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches && imageRef.current) {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      imageRef.current.style.transformOrigin = `${x}% ${y}%`;
      imageRef.current.style.transform = 'scale(2.2)';
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches && imageRef.current) {
      imageRef.current.style.transformOrigin = 'center';
      imageRef.current.style.transform = 'scale(1)';
    }
  };

  const handleTouchTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply tap-to-toggle on mobile/touch devices where hover is not supported
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches && imageRef.current) {
      if (isZoomedRef.current) {
        imageRef.current.style.transformOrigin = 'center';
        imageRef.current.style.transform = 'scale(1)';
        isZoomedRef.current = false;
      } else {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        imageRef.current.style.transformOrigin = `${x}% ${y}%`;
        imageRef.current.style.transform = 'scale(2.2)';
        isZoomedRef.current = true;
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden aspect-[3/4] w-full bg-zinc-50 border border-zinc-200/50 shadow-sm flex items-center justify-center cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouchTap}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200 ease-out"
        style={{
          transformOrigin: 'center',
          transform: 'scale(1)',
        }}
      />
    </div>
  );
}
