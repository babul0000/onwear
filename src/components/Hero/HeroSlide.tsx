'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeroSlideProps {
  imageUrl: string;
  title: string;
  isActive: boolean;
  isMobile: boolean;
  children?: React.ReactNode;
}

export default function HeroSlide({ imageUrl, title, isActive, isMobile, children }: HeroSlideProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Reset offset if slide becomes inactive
  useEffect(() => {
    if (!isActive) {
      setMouseOffset({ x: 0, y: 0 });
    }
  }, [isActive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !isActive) return;
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5; // -0.5 to 0.5
    // Cap parallax offset at 12px for high-end subtle depth
    setMouseOffset({ x: x * 12, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-700 ease-out select-none ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      {/* Parallax Image Layer */}
      <motion.img
        src={imageUrl}
        alt={title}
        animate={{
          x: mouseOffset.x,
          y: mouseOffset.y,
          scale: isActive ? 1.02 : 1.0,
        }}
        transition={{
          type: 'tween',
          ease: 'easeOut',
          duration: 0.5,
        }}
        className="absolute inset-0 w-full h-full object-cover object-top origin-center"
        style={{
          width: '100%',
          height: '100%',
        }}
        loading="lazy"
      />

      {/* Render Hotspots or custom indicators overlay if any */}
      {isActive && children}
    </div>
  );
}
