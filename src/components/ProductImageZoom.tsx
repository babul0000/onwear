'use client';

import React, { useRef } from 'react';

interface ProductImageZoomProps {
  src: string;
  zoomSrc?: string;
  alt: string;
  className?: string;
}

export default function ProductImageZoom({ src, zoomSrc, alt, className = '' }: ProductImageZoomProps) {
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const isZoomedRef = useRef(false);

  const activeZoomSrc = zoomSrc || src;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches && zoomImageRef.current) {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      
      zoomImageRef.current.style.transformOrigin = `${x}% ${y}%`;
      zoomImageRef.current.style.transform = 'scale(2.2)';
      zoomImageRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches && zoomImageRef.current) {
      zoomImageRef.current.style.transformOrigin = 'center';
      zoomImageRef.current.style.transform = 'scale(1)';
      zoomImageRef.current.style.opacity = '0';
    }
  };

  const handleTouchTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply tap-to-toggle on mobile/touch devices where hover is not supported
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches && zoomImageRef.current) {
      if (isZoomedRef.current) {
        zoomImageRef.current.style.transformOrigin = 'center';
        zoomImageRef.current.style.transform = 'scale(1)';
        zoomImageRef.current.style.opacity = '0';
        isZoomedRef.current = false;
      } else {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        zoomImageRef.current.style.transformOrigin = `${x}% ${y}%`;
        zoomImageRef.current.style.transform = 'scale(2.2)';
        zoomImageRef.current.style.opacity = '1';
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
      {/* Base Image (Static layout) */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />

      {/* Zoom Image Layer (Fades in on hover & tracks mouse dynamically) */}
      <img
        ref={zoomImageRef}
        src={activeZoomSrc}
        alt={`${alt} Zoomed`}
        className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none transition-opacity duration-200 ease-out"
        style={{
          transformOrigin: 'center',
          transform: 'scale(1)',
        }}
      />
    </div>
  );
}
