'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { Megaphone, Save, Upload, Loader2, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function AdminPromotionsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  const [imageUrl, setImageUrl] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load hero cover photo
  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await fetch(`${API_URL}/promotions/hero`);
        const data = await res.json();
        if (data.success && data.data && data.data.imageUrl) {
          setCurrentImageUrl(data.data.imageUrl);
          setImageUrl(data.data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to load hero banner:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBanner();
  }, []);

  // Upload image to ImgBB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.url) {
        setImageUrl(data.data.url);
        setMessage({ type: 'success', text: 'Image uploaded successfully. Save changes to make it permanent!' });
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Image upload failed.' });
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      setMessage({ type: 'error', text: 'An error occurred during image upload.' });
    } finally {
      setUploading(false);
    }
  };

  // Save Banner
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!imageUrl.trim()) {
      setMessage({ type: 'error', text: 'Image URL is required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/promotions/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() })
      });

      const data = await res.json();
      if (data.success && data.data && data.data.imageUrl) {
        setCurrentImageUrl(data.data.imageUrl);
        setMessage({ type: 'success', text: 'Hero cover photo updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update hero cover photo' });
      }
    } catch (err) {
      console.error('Failed to update banner:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving the banner' });
    } finally {
      setSaving(false);
    }
  };

  if (!token || !user || user.role !== 'admin') {
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
            Promotions & Campaigns
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Configure and manage store homepage banner ads and promotional cover graphics.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT: Configure Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
              Homepage Hero Cover Photo
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Banner Image URL</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter direct image URL (e.g. https://images.unsplash.com/...)"
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                />
              </div>

              <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-8 w-8 text-zinc-400 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 mb-3">Or upload a local image file directly to get a hosting link</p>
                <label className="bg-white hover:bg-zinc-50 border border-zinc-200/80 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-700 cursor-pointer shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  {uploading ? 'Uploading Image...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 text-indigo-400" />
                    Save Banner
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
              Live Preview
            </h2>
            
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[10px] font-bold text-zinc-400">No Image Specified</span>
              )}
            </div>
            <p className="text-[9px] text-zinc-400 leading-relaxed font-semibold">
              This preview matches the format and aspect ratio on the homepage slider banner. Make sure your image has a wide aspect ratio for the best view.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
