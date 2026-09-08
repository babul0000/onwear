'use client';

import React, { useRef, useState } from 'react';
import { getOptimizedImageUrl } from '../utils/image';

interface ProductImageZoomProps {
  src: string;
  zoomSrc?: string;
  alt: string;
  className?: string;
}

export default function ProductImageZoom({ src, zoomSrc, alt, className = '' }: ProductImageZoomProps) {
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const isZoomedRef = useRef(false);
  const [shouldLoadZoom, setShouldLoadZoom] = useState(false);

  // Optimized image URLs
  const mainImageSrc = getOptimizedImageUrl(src, 900);
  const zoomImageSrc = getOptimizedImageUrl(zoomSrc || src, 1600);

  const handleMouseEnter = () => {
    setShouldLoadZoom(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldLoadZoom) {
      setShouldLoadZoom(true);
    }

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
    setShouldLoadZoom(true);

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
      className={`relative overflow-hidden aspect-[3/4] w-full bg-zinc-50 border border-[#e6e6e6] flex items-center justify-center cursor-zoom-in select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouchTap}
    >
      {/* Base Main Image - Always 100% visible and sharp */}
      <img
        src={mainImageSrc}
        alt={alt}
        loading="eager"
        decoding="async"
        className="h-full w-full object-cover block"
      />

      {/* High-res Zoom Overlay Layer (Smoothly fades in and magnifies on hover/touch) */}
      {shouldLoadZoom && (
        <img
          ref={zoomImageRef}
          src={zoomImageSrc}
          alt={`${alt} Zoomed`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none transition-opacity duration-200 ease-out z-10"
          style={{
            transformOrigin: 'center',
            transform: 'scale(1)',
          }}
        />
      )}
    </div>
  );
}
