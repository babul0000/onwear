'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadZoom, setShouldLoadZoom] = useState(false);

  // Optimized image URLs
  const optimizedMainSrc = getOptimizedImageUrl(src, 900);
  const optimizedZoomSrc = getOptimizedImageUrl(zoomSrc || src, 1600);

  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setShouldLoadZoom(false);
  }, [src]);

  const handleMouseEnter = () => {
    // Only load the heavy zoom image when the user hovers
    if (!shouldLoadZoom) {
      setShouldLoadZoom(true);
    }
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
    if (!shouldLoadZoom) {
      setShouldLoadZoom(true);
    }

    // Touch devices tap-to-toggle
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
      className={`relative overflow-hidden aspect-[3/4] w-full bg-zinc-100 border border-[#e6e6e6] shadow-xs flex items-center justify-center cursor-zoom-in select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouchTap}
    >
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 animate-pulse" />
      )}

      {/* Base Image with Instant Eager Loading & Smooth Fade-in */}
      <img
        src={optimizedMainSrc}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Zoom Image Layer (Loaded on hover to maximize initial load speed) */}
      {shouldLoadZoom && (
        <img
          ref={zoomImageRef}
          src={optimizedZoomSrc}
          alt={`${alt} Zoomed`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none transition-opacity duration-200 ease-out"
          style={{
            transformOrigin: 'center',
            transform: 'scale(1)',
          }}
        />
      )}
    </div>
  );
}
