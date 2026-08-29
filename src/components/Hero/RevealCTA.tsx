'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface RevealCTAProps {
  showCTA: boolean;
  mousePos: { x: number; y: number };
  isHovered: boolean;
}

export default function RevealCTA({ showCTA, mousePos, isHovered }: RevealCTAProps) {
  return (
    <>
      {/* Subtle Radial Cursor Spotlight Reveal Overlay (Desktop only) */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* Floating Animated Call To Action */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="rounded-full bg-zinc-950/90 backdrop-blur-sm px-10 py-4.5 text-xs font-black tracking-widest uppercase text-white shadow-2xl flex items-center gap-2.5">
              <span>View Collection</span>
              <ArrowRight className="h-4 w-4 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
