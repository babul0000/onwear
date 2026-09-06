'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Edit, Upload, X, Plus, Trash2, Move, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import HeroSlider from './HeroSlider';
import RevealCTA from './RevealCTA';
import { API_URL } from '../../config';

interface SlideData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  positionX?: number;
  positionY?: number;
}

interface EcommerceHeroProps {
  user: any;
  token: string | null;
}

function SlideRepositionBox({
  imageUrl,
  positionX = 50,
  positionY = 50,
  onChange,
}: {
  imageUrl: string;
  positionX: number;
  positionY: number;
  onChange: (pos: { positionX: number; positionY: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, initialPosX: 50, initialPosY: 50 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: positionX,
      initialPosY: positionY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - startPos.current.x) / rect.width) * -100;
    const deltaY = ((e.clientY - startPos.current.y) / rect.height) * -100;

    const newX = Math.round(Math.min(100, Math.max(0, startPos.current.initialPosX + deltaX)));
    const newY = Math.round(Math.min(100, Math.max(0, startPos.current.initialPosY + deltaY)));

    onChange({ positionX: newX, positionY: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
        <span className="flex items-center gap-1 text-zinc-700">
          <Move className="w-3 h-3 text-zinc-500" /> Drag to Reposition (Facebook Style)
        </span>
        <span className="text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded font-bold">
          Y: {positionY}% • X: {positionX}%
        </span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-[16/7] bg-zinc-950 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-zinc-200 shadow-inner select-none touch-none group"
      >
        <img
          src={imageUrl}
          alt="Slide preview"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
          style={{
            objectPosition: `${positionX}% ${positionY}%`,
          }}
        />

        {/* Reposition guidelines overlay */}
        <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>

        {/* Center Drag hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-zinc-950/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg border border-white/15 opacity-80 group-hover:opacity-100 transition-opacity font-mono">
            <Move className="w-3 h-3" />
            <span>Click & Drag to Adjust View</span>
          </div>
        </div>
      </div>

      {/* Quick Align Presets & Slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-zinc-400 uppercase font-mono mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => onChange({ positionX, positionY: 0 })}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all ${
              positionY === 0 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Top Focus
          </button>
          <button
            type="button"
            onClick={() => onChange({ positionX, positionY: 50 })}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all ${
              positionY === 50 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Center Focus
          </button>
          <button
            type="button"
            onClick={() => onChange({ positionX, positionY: 100 })}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all ${
              positionY === 100 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Bottom Focus
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[220px]">
          <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Y-Axis:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={positionY}
            onChange={(e) => onChange({ positionX, positionY: Number(e.target.value) })}
            className="w-full accent-zinc-900 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
            title="Fine tune vertical alignment"
          />
        </div>
      </div>
    </div>
  );
}

export default function EcommerceHero({ user, token }: EcommerceHeroProps) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  const defaultSlides: SlideData[] = [
    {
      id: 'default-1',
      title: 'Hero Slide 1',
      imageUrl: 'https://i.ibb.co/HTB1fbYf/On-Wear-unique-way-of-elegance-1-jpg-2.jpg',
      linkUrl: '/products?category=shirt',
      positionX: 50,
      positionY: 50,
    },
    {
      id: 'default-2',
      title: 'Hero Slide 2',
      imageUrl: 'https://i.ibb.co/FqHjfvxG/Gemini-Generated-Image-ino58qino58qino5.jpg',
      linkUrl: '/products?category=denim',
      positionX: 50,
      positionY: 50,
    },
    {
      id: 'default-3',
      title: 'Hero Slide 3',
      imageUrl: 'https://i.ibb.co/rVYXTBD/Gemini-Generated-Image-p7ik1p7ik1p7ik1p.jpg',
      linkUrl: '/products?category=winter-collection',
      positionX: 50,
      positionY: 50,
    }
  ];

  // Slides State
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [editSlides, setEditSlides] = useState<SlideData[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  
  // Interaction States
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Hero Slides and load from localStorage cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem('onwear_hero_slides');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading slides cache:', e);
    }

    async function loadSlides() {
      try {
        const res = await fetch(`${API_URL}/promotions/hero-slides`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSlides(data.data);
          try {
            localStorage.setItem('onwear_hero_slides', JSON.stringify(data.data));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error loading hero slides:', err);
      }
    }
    loadSlides();
  }, []);

  // Scroll scale-down transition for the last slide (if multi-slide)
  useEffect(() => {
    if (activeSlideIdx !== activeSlides.length - 1 || activeSlides.length <= 1) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 400; // Transition finishes after 400px of scrolling
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSlideIdx, activeSlides.length]);

  // Track mouse coordinates for Spotlight Reveal CTA
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Clicking the slide
  const handleHeroClick = () => {
    const activeSlide = activeSlides[activeSlideIdx] || activeSlides[0];
    if (!activeSlide) return;

    if (isMobile) {
      if (showMobileCTA) {
        // Second tap opens the redirect URL
        if (activeSlide.linkUrl) router.push(activeSlide.linkUrl);
      } else {
        // First tap reveals CTA temporarily
        setShowMobileCTA(true);
      }
    } else {
      // Desktop opens instantly on click
      if (activeSlide.linkUrl) router.push(activeSlide.linkUrl);
    }
  };

  // Auto-hide mobile CTA after 3 seconds of inactivity
  useEffect(() => {
    if (!showMobileCTA) return;
    const timer = setTimeout(() => {
      setShowMobileCTA(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showMobileCTA]);

  // Admin: Open editor
  const handleEditHeroSlides = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slide click
    setEditSlides(JSON.parse(JSON.stringify(activeSlides)));
    setIsModalOpen(true);
  };

  // Admin: Add new slide
  const handleAddSlide = () => {
    if (editSlides.length >= 5) {
      alert('Maximum 5 slides allowed for optimal performance');
      return;
    }
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      title: `Hero Slide ${editSlides.length + 1}`,
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600',
      linkUrl: '/products',
      positionX: 50,
      positionY: 50,
    };
    setEditSlides([...editSlides, newSlide]);
  };

  // Admin: Remove slide
  const handleRemoveSlide = (idx: number) => {
    if (editSlides.length <= 1) {
      alert('At least 1 banner slide is required');
      return;
    }
    const copy = editSlides.filter((_, i) => i !== idx);
    setEditSlides(copy);
  };

  // Admin: Move slide
  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editSlides.length) return;
    const copy = [...editSlides];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setEditSlides(copy);
  };

  // Admin: Upload via ImgBB
  const handleSlideFileChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    setUploadingSlideIdx(idx);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.url) {
        const copy = [...editSlides];
        copy[idx].imageUrl = data.data.url;
        setEditSlides(copy);
      } else {
        alert(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Image upload failed.');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  // Admin: Save
  const handleSaveHeroSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/promotions/hero-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slides: editSlides })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSlides(data.data);
        try {
          localStorage.setItem('onwear_hero_slides', JSON.stringify(data.data));
        } catch (e) {}
        setIsModalOpen(false);
        setActiveSlideIdx(0);
        alert('Hero banner updated successfully!');
      } else {
        alert(data.message || 'Failed to update slides');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving hero slides');
    }
  };

  return (
    <>
      {/* Balanced, clamped responsive hero container */}
      <div className="relative w-full h-[52vh] min-h-[380px] max-h-[500px] sm:h-[65vh] sm:min-h-[480px] sm:max-h-[600px] md:h-[75vh] md:min-h-[540px] md:max-h-[720px] overflow-hidden flex items-end justify-center select-none">
        {/* Animated Slide container */}
        <motion.div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onClick={handleHeroClick}
          style={{
            scale: 1 - scrollProgress * 0.04,
            borderRadius: `${scrollProgress * 24}px`,
          }}
          className="absolute inset-0 w-full h-full bg-zinc-50 overflow-hidden cursor-pointer group"
        >
          {/* Admin Edit button overlay */}
          {user && user.role === 'admin' && (
            <button
              onClick={handleEditHeroSlides}
              className="absolute top-5 right-5 z-20 bg-white/95 hover:bg-white text-zinc-800 p-2.5 sm:p-3 rounded-full shadow-lg border border-zinc-200/60 flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider group/btn font-sans cursor-pointer"
              title="Edit Hero Banner & Slides"
            >
              <Edit className="h-4 w-4 text-zinc-900" />
              <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
                Edit Banner / Reposition
              </span>
            </button>
          )}

          {/* Core Slider / Single Banner rendering */}
          <HeroSlider
            slides={activeSlides}
            activeSlideIdx={activeSlideIdx}
            setActiveSlideIdx={setActiveSlideIdx}
            isMobile={isMobile}
            onHoverChange={setIsHovered}
          />

          {/* Interactive Mouse spotlight and reveal CTA button */}
          <RevealCTA
            showCTA={isMobile ? showMobileCTA : isHovered}
            mousePos={mousePos}
            isHovered={isHovered}
          />
        </motion.div>
      </div>

      {/* Admin Slide Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 text-zinc-850 max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-zinc-950 font-sans tracking-tight">Hero Banner & Positioning Studio</h3>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono">
                    {editSlides.length} {editSlides.length === 1 ? 'Single Banner' : 'Slides'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 font-sans">
                  Upload images, drag to reposition like a Facebook cover, and adjust redirect links for desktop & mobile.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Slide List */}
            <div className="flex flex-col gap-6 pt-1">
              {editSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="border border-zinc-200 bg-zinc-50/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-zinc-900 bg-zinc-200/80 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                        Slide #{idx + 1}
                      </span>
                      {editSlides.length === 1 && (
                        <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded font-sans flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Solo Hero Banner Mode
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, 'up')}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors"
                          title="Move Slide Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < editSlides.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, 'down')}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors"
                          title="Move Slide Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {editSlides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors ml-1"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Facebook Cover Style Drag-to-Reposition Preview Box */}
                  {slide.imageUrl && (
                    <SlideRepositionBox
                      imageUrl={slide.imageUrl}
                      positionX={slide.positionX ?? 50}
                      positionY={slide.positionY ?? 50}
                      onChange={({ positionX, positionY }) => {
                        const copy = [...editSlides];
                        copy[idx].positionX = positionX;
                        copy[idx].positionY = positionY;
                        setEditSlides(copy);
                      }}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Category Label */}
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Slide Title / Alt Label</label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].title = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. Unique Way of Elegance"
                      />
                    </div>

                    {/* Target Link */}
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Target Redirect Link</label>
                      <input
                        type="text"
                        required
                        value={slide.linkUrl || ''}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].linkUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. /products?category=shirt"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end font-sans">
                    {/* Image URL */}
                    <div className="flex flex-col gap-1.5 md:col-span-8">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Direct Image Link</label>
                      <input
                        type="text"
                        required
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].imageUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>

                    {/* Local File upload */}
                    <div className="md:col-span-4">
                      <div className="relative border border-dashed border-zinc-300 hover:border-zinc-500 bg-white hover:bg-zinc-50 transition-all rounded-xl p-2 flex items-center justify-center gap-1.5 cursor-pointer text-center h-[38px] w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSlideFileChange(e, idx)}
                          disabled={uploadingSlideIdx === idx}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {uploadingSlideIdx === idx ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-700">
                            <span className="h-3 w-3 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin"></span>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="text-[10px] font-bold text-zinc-700">Upload New Photo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Slide Button */}
            {editSlides.length < 5 && (
              <button
                type="button"
                onClick={handleAddSlide}
                className="w-full border border-dashed border-zinc-300 hover:border-zinc-600 bg-zinc-50 hover:bg-zinc-100/80 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wider transition-all cursor-pointer font-sans"
              >
                <Plus className="w-4 h-4 text-zinc-800" />
                <span>Add Another Slide (Up to 5)</span>
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-2 font-sans">
              <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                {editSlides.length === 1 ? 'Showing 1 single full-bleed banner' : `Carousel mode with ${editSlides.length} slides`}
              </span>
              
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-zinc-50 border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-650 hover:bg-zinc-100 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroSlides}
                  disabled={uploadingSlideIdx !== null}
                  className="rounded-full bg-zinc-950 text-white px-6 py-2.5 text-xs font-bold hover:bg-zinc-850 transition-all uppercase tracking-wider shadow-md disabled:bg-zinc-300 disabled:shadow-none cursor-pointer"
                >
                  Save & Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

