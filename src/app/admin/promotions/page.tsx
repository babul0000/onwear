'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  Save, 
  Upload, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Move,
  Eye,
  RefreshCw
} from 'lucide-react';

interface SlideData {
  id?: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  positionX?: number;
  positionY?: number;
  displayOrder?: number;
}

// Drag-to-Reposition Interactive Component (Facebook Cover Style)
function SlideRepositionStudio({
  imageUrl,
  positionX = 50,
  positionY = 50,
  onChange,
}: {
  imageUrl: string;
  positionX?: number;
  positionY?: number;
  onChange: (pos: { positionX: number; positionY: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 50, y: 50 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: positionX, y: positionY };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    // Moving up decreases Y, moving down increases Y
    const newX = Math.round(Math.max(0, Math.min(100, startOffset.current.x - (deltaX / rect.width) * 100)));
    const newY = Math.round(Math.max(0, Math.min(100, startOffset.current.y - (deltaY / rect.height) * 100)));

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
      <div className="flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase tracking-wider font-mono">
        <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
          <Move className="w-3.5 h-3.5 text-indigo-600" /> Click & Drag Photo to Reposition
        </span>
        <span className="text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg font-mono font-bold">
          Y-Axis: {positionY}% • X-Axis: {positionX}%
        </span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-[21/9] sm:aspect-[2.35/1] bg-zinc-950 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border-2 border-indigo-500/30 shadow-inner select-none touch-none group"
      >
        <img
          src={imageUrl}
          alt="Reposition preview"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
          style={{
            objectPosition: `${positionX}% ${positionY}%`,
          }}
        />

        {/* Reposition guidelines overlay */}
        <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>

        {/* Center Drag hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-zinc-950/75 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-2 shadow-xl border border-white/20 opacity-80 group-hover:opacity-100 transition-opacity font-mono">
            <Move className="w-3.5 h-3.5 text-indigo-400" />
            <span>Drag Up / Down to Align View</span>
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
            className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
              positionY === 0 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Top Focus (0%)
          </button>
          <button
            type="button"
            onClick={() => onChange({ positionX, positionY: 50 })}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
              positionY === 50 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Center Focus (50%)
          </button>
          <button
            type="button"
            onClick={() => onChange({ positionX, positionY: 100 })}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
              positionY === 100 ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Bottom Focus (100%)
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-[240px]">
          <span className="text-[9px] font-black text-zinc-400 uppercase font-mono">Y-Axis:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={positionY}
            onChange={(e) => onChange({ positionX, positionY: Number(e.target.value) })}
            className="w-full accent-indigo-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
            title="Fine tune vertical alignment"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminPromotionsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Hero Slides
  const loadSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/promotions/hero-slides`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSlides(data.data);
      }
    } catch (err) {
      console.error('Failed to load hero slides:', err);
      setMessage({ type: 'error', text: 'Failed to load slides from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Upload image to Cloudinary CDN
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideIdx(idx);
    setMessage(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'onwear/hero_slides');

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('onwear_token') : '');
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data && data.data.url) {
        const copy = [...slides];
        copy[idx].imageUrl = data.data.url;
        setSlides(copy);
        setMessage({ type: 'success', text: `Slide #${idx + 1} image uploaded & WebP optimized successfully!` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Image upload failed.' });
      }
    } catch (err) {
      console.error('Error uploading slide image:', err);
      setMessage({ type: 'error', text: 'An error occurred during image upload.' });
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  // Add new slide
  const handleAddSlide = () => {
    if (slides.length >= 5) {
      setMessage({ type: 'error', text: 'Maximum 5 slides allowed for optimal speed and experience.' });
      return;
    }
    const newSlide: SlideData = {
      title: `Hero Slide ${slides.length + 1}`,
      imageUrl: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789142084/onwear/hero_slides/gzm6j166gp64fcxcv0se.webp',
      linkUrl: '/products',
      positionX: 50,
      positionY: 50,
    };
    setSlides([...slides, newSlide]);
  };

  // Remove slide
  const handleRemoveSlide = (idx: number) => {
    if (slides.length <= 1) {
      setMessage({ type: 'error', text: 'At least 1 hero banner slide is required.' });
      return;
    }
    setSlides(slides.filter((_, i) => i !== idx));
  };

  // Reorder slides
  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const copy = [...slides];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSlides(copy);
  };

  // Save all slides to backend
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('onwear_token') : '');
    if (!authToken) {
      setMessage({ type: 'error', text: 'Authentication session expired. Please log in again.' });
      return;
    }

    if (slides.length === 0) {
      setMessage({ type: 'error', text: 'At least 1 slide is required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/promotions/hero-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ slides })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSlides(data.data);
        try {
          localStorage.setItem('onwear_hero_slides', JSON.stringify(data.data));
        } catch (_) {}
        setMessage({ type: 'success', text: '🎉 Hero banner and all slides updated & positioned successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update hero slides.' });
      }
    } catch (err) {
      console.error('Failed to save slides:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving slides.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-zinc-700">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-indigo-600 animate-bounce" />
            Homepage Hero Banners & Slider Studio
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            Customize hero carousel slides, drag to align view on desktop, and configure target links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSlides}
            className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Reload from server"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> : <Loader2 className="h-4 w-4 text-red-600 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        
        {/* Slide List */}
        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div key={slide.id || idx} className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm space-y-5">
              
              {/* Slide Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg uppercase tracking-wider font-mono">
                    Slide #{idx + 1}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded">
                      Primary Cover Slide
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all"
                      title="Move Slide Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                  {idx < slides.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all"
                      title="Move Slide Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  )}
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all ml-1"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reposition & Live View Studio Box */}
              {slide.imageUrl && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">
                    Desktop View & Alignment Preview (Aspect: 21:9 Widescreen)
                  </label>
                  <SlideRepositionStudio
                    imageUrl={slide.imageUrl}
                    positionX={slide.positionX ?? 50}
                    positionY={slide.positionY ?? 50}
                    onChange={({ positionX, positionY }) => {
                      const copy = [...slides];
                      copy[idx].positionX = positionX;
                      copy[idx].positionY = positionY;
                      setSlides(copy);
                    }}
                  />
                </div>
              )}

              {/* Slide Meta Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Slide Title / Alt Label</label>
                  <input
                    type="text"
                    required
                    value={slide.title}
                    onChange={(e) => {
                      const copy = [...slides];
                      copy[idx].title = e.target.value;
                      setSlides(copy);
                    }}
                    placeholder="e.g. Unique Way of Elegance"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Target Redirect URL</label>
                  <input
                    type="text"
                    required
                    value={slide.linkUrl || ''}
                    onChange={(e) => {
                      const copy = [...slides];
                      copy[idx].linkUrl = e.target.value;
                      setSlides(copy);
                    }}
                    placeholder="e.g. /products?category=shirt"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold"
                  />
                </div>
              </div>

              {/* Direct Image URL & Cloudinary Upload */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Direct Image Link</label>
                  <input
                    type="text"
                    required
                    value={slide.imageUrl}
                    onChange={(e) => {
                      const copy = [...slides];
                      copy[idx].imageUrl = e.target.value;
                      setSlides(copy);
                    }}
                    placeholder="Enter image URL"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider text-zinc-800 cursor-pointer shadow-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all h-[42px]">
                    <Upload className="h-3.5 w-3.5 text-indigo-600" />
                    {uploadingSlideIdx === idx ? 'Uploading & WebP...' : 'Upload New Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlideImageUpload(e, idx)}
                      className="hidden"
                      disabled={uploadingSlideIdx === idx}
                    />
                  </label>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Add Slide Button */}
        {slides.length < 5 && (
          <button
            type="button"
            onClick={handleAddSlide}
            className="w-full border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-white hover:bg-zinc-50 rounded-3xl py-4 flex items-center justify-center gap-2 text-xs font-black text-zinc-800 uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Another Slide (Up to 5)</span>
          </button>
        )}

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-zinc-200 shadow-xl flex items-center justify-between">
          <div className="text-xs font-bold text-zinc-500">
            Total active slides: <strong className="text-zinc-900">{slides.length}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploadingSlideIdx !== null}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-8 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:bg-zinc-400"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Saving & Applying...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-indigo-400" />
                  <span>Save & Apply All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
