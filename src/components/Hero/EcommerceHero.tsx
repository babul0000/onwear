'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Edit, Upload, X } from 'lucide-react';
import HeroSlider from './HeroSlider';
import RevealCTA from './RevealCTA';
import { API_URL } from '../../config';

interface SlideData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

interface EcommerceHeroProps {
  user: any;
  token: string | null;
}

export default function EcommerceHero({ user, token }: EcommerceHeroProps) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  // Slides State
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [editSlides, setEditSlides] = useState<any[]>([]);
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

  const defaultSlides: SlideData[] = [
    {
      id: 'default-1',
      title: 'Casual Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600',
      linkUrl: '/products?category=shirt'
    },
    {
      id: 'default-2',
      title: 'Refined Denim',
      imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1600',
      linkUrl: '/products?category=denim'
    },
    {
      id: 'default-3',
      title: 'Winter Collection',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600',
      linkUrl: '/products?category=winter-collection'
    }
  ];

  const activeSlides = slides.length === 3 ? slides : defaultSlides;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Hero Slides
  useEffect(() => {
    async function loadSlides() {
      try {
        const res = await fetch(`${API_URL}/promotions/hero-slides`);
        const data = await res.json();
        if (data.success && data.data && data.data.length === 3) {
          setSlides(data.data);
        }
      } catch (err) {
        console.error('Error loading hero slides:', err);
      }
    }
    loadSlides();
  }, []);

  // Scroll scale-down transition for the 3rd Slide
  useEffect(() => {
    if (activeSlideIdx !== 2) {
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
  }, [activeSlideIdx]);

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
    const activeSlide = activeSlides[activeSlideIdx];
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
      if (data.success && data.data && data.data.length === 3) {
        setSlides(data.data);
        setIsModalOpen(false);
        alert('Hero banner slides updated successfully!');
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
      <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden flex items-end justify-center select-none">
        {/* Animated Slide container (Scroll scale-down transition applies here on slide 3) */}
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
              className="absolute top-6 right-6 z-20 bg-white/95 hover:bg-white text-zinc-800 p-3 rounded-full shadow-lg border border-zinc-200/50 flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider group/btn font-sans"
              title="Edit Hero Slides"
            >
              <Edit className="h-4 w-4 text-zinc-900" />
              <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
                Edit Hero Slides
              </span>
            </button>
          )}

          {/* Core Slider rendering */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl max-w-2xl w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 text-zinc-805 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-zinc-950 font-sans">Update Hover Hero Slides</h3>
                <p className="text-xs text-zinc-500 mt-1 font-sans">Configure labels, redirection links, and upload banner photos for the 3 homepage hover categories.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 pt-2">
              {editSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="border-b border-zinc-150 pb-5 last:border-0 last:pb-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo bg-zinc-100 px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-mono">
                      Category Slide #{idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Label */}
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Slide label / Title</label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].title = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. Refined Denim"
                      />
                    </div>

                    {/* Target Link */}
                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Target Redirect URL</label>
                      <input
                        type="text"
                        required
                        value={slide.linkUrl || ''}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].linkUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900"
                        placeholder="e.g. /products?category=denim"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end font-sans">
                    {/* Image URL */}
                    <div className="flex flex-col gap-1.5 md:col-span-8">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Banner Image URL</label>
                      <input
                        type="text"
                        required
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const copy = [...editSlides];
                          copy[idx].imageUrl = e.target.value;
                          setEditSlides(copy);
                        }}
                        className="w-full border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 font-mono"
                      />
                    </div>

                    {/* Local File upload */}
                    <div className="md:col-span-4">
                      <div className="relative border border-dashed border-zinc-200 hover:border-zinc-500 hover:bg-zinc-50 transition-all rounded-xl p-2.5 flex items-center justify-center gap-1.5 cursor-pointer text-center h-[38px] w-full">
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
                            <Upload className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-650">Upload File</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 mt-2 font-sans">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-zinc-50 border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-650 hover:bg-zinc-100 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHeroSlides}
                disabled={uploadingSlideIdx !== null}
                className="rounded-full bg-zinc-950 text-white px-5 py-2.5 text-xs font-bold hover:bg-zinc-850 transition-all uppercase tracking-wider shadow-md disabled:bg-zinc-300 disabled:shadow-none"
              >
                Save All Slides
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
