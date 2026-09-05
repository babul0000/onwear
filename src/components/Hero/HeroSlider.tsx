'use client';

import React, { useState, useEffect, useRef } from 'react';
import HeroSlide from './HeroSlide';
import SlideIndicator from './SlideIndicator';
import HeroNavigation from './HeroNavigation';
import ProductHotspot from './ProductHotspot';

interface SlideData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

interface HeroSliderProps {
  slides: SlideData[];
  activeSlideIdx: number;
  setActiveSlideIdx: React.Dispatch<React.SetStateAction<number>>;
  isMobile: boolean;
  onHoverChange: (hovered: boolean) => void;
}

export default function HeroSlider({
  slides,
  activeSlideIdx,
  setActiveSlideIdx,
  isMobile,
  onHoverChange,
}: HeroSliderProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-play timer with progress percentage
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    const tickTime = 50; // Update progress every 50ms for smoothness
    const slideDuration = 4500; // 4.5 seconds per slide
    const progressStep = (tickTime / slideDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => prev + progressStep);
    }, tickTime);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Sync slide change and reset progress when timer completes
  useEffect(() => {
    if (progress >= 100) {
      setActiveSlideIdx((curr) => (curr + 1) % slides.length);
      setProgress(0);
    }
  }, [progress, slides.length, setActiveSlideIdx]);

  // Reset progress bar on slide index change manually
  useEffect(() => {
    setProgress(0);
  }, [activeSlideIdx]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIdx((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIdx((curr) => (curr + 1) % slides.length);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left -> Next slide
        handleNext();
      } else {
        // Swiped Right -> Prev slide
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsPaused(true);
      onHoverChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsPaused(false);
      onHoverChange(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="absolute inset-0 w-full h-full"
    >
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlideIdx;
        return (
          <HeroSlide
            key={slide.id || idx}
            imageUrl={slide.imageUrl}
            title={slide.title}
            isActive={isActive}
            isMobile={isMobile}
          >
            {/* Slide 2: Render Product Hotspots */}
            {idx === 1 && (
              <>
                {/* Hotspot 1: Oxford Shirt */}
                <ProductHotspot
                  x={32}
                  y={40}
                  name="Oxford Cotton Shirt"
                  price={49}
                  discountPrice={39}
                  slug="mens-slim-fit-oxford-cotton-shirt"
                  isMobile={isMobile}
                />
                {/* Hotspot 2: Chino Pants */}
                <ProductHotspot
                  x={60}
                  y={68}
                  name="Slim Stretch Chino"
                  price={59}
                  discountPrice={49}
                  slug="mens-chino-slim-fit-stretch-pants"
                  isMobile={isMobile}
                />
              </>
            )}
          </HeroSlide>
        );
      })}

      {/* Slide Progress Indicator */}
      <SlideIndicator
        activeIndex={activeSlideIdx}
        totalSlides={slides.length}
        progress={progress}
        onSelect={setActiveSlideIdx}
      />

      {/* Slide Navigation Controls */}
      <HeroNavigation onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
}
