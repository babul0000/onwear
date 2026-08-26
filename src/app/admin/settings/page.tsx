'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { 
  Settings, Save, Globe, Phone, Mail, MapPin, 
  Truck, Upload, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { token, user } = useAuth();
  const { settings, refreshSettings } = useSettings();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [shippingInsideDhaka, setShippingInsideDhaka] = useState<number>(80);
  const [shippingOutsideDhaka, setShippingOutsideDhaka] = useState<number>(150);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current settings into form
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setTagline(settings.tagline || '');
      setLogoUrl(settings.logoUrl || null);
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setFacebookUrl(settings.facebookUrl || '');
      setInstagramUrl(settings.instagramUrl || '');
      setShippingInsideDhaka(settings.shippingInsideDhaka || 80);
      setShippingOutsideDhaka(settings.shippingOutsideDhaka || 150);
      setLoading(false);
    }
  }, [settings]);

  // Handle Logo Upload to ImgBB
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setLogoUrl(data.data.url);
        setMessage({ type: 'success', text: 'Logo uploaded successfully. Save changes to make it permanent!' });
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Logo upload failed.' });
      }
    } catch (err) {
      console.error('Error uploading logo to ImgBB:', err);
      setMessage({ type: 'error', text: 'An error occurred during image upload. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setMessage({ type: 'success', text: 'Logo removed. Click Save changes to apply.' });
  };

  // Submit Settings Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName,
          tagline,
          logoUrl,
          phone,
          email,
          address,
          facebookUrl,
          instagramUrl,
          shippingInsideDhaka,
          shippingOutsideDhaka
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        await refreshSettings(); // Instant reflect globally
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving settings.' });
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Settings className="h-7 w-7 text-indigo-600 animate-pulse" />
            Store Settings
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Configure your store's branding, contact information, social handles, and shipping fees dynamically.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT: Branding Card */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Branding Section */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-indigo-600" />
                Store Branding
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter store name (e.g. ONWEAR)"
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Tagline / Brand Description</label>
                  <textarea
                    rows={3}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Enter brand tagline or description..."
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 text-indigo-600" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Store Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="016XXXXXXXX"
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="support@domain.com"
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Store Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address, Sector, Area, Dhaka, Bangladesh"
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links & Connections */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                Social Profiles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Facebook Page URL</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/page"
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Instagram Profile URL</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/profile"
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Logo & Shipping Options */}
          <div className="space-y-6">
            
            {/* Logo Section */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-indigo-600" />
                Store Logo
              </h3>

              <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                {logoUrl ? (
                  <div className="text-center space-y-4">
                    <img 
                      src={logoUrl} 
                      alt="Store Logo Preview" 
                      className="h-16 max-w-full object-contain mx-auto border border-zinc-200 p-2 rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-[10px] text-zinc-400 font-semibold mb-3">No Logo Uploaded. Using text logo fallback.</p>
                  </div>
                )}

                <div className="mt-2">
                  <label className="cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
                    {uploading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 text-indigo-600" />
                        Upload Logo
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Shipping Charges */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-indigo-600" />
                Shipping Fees (BDT)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Inside Dhaka (Tk)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={shippingInsideDhaka}
                    onChange={(e) => setShippingInsideDhaka(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Outside Dhaka (Tk)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={shippingOutsideDhaka}
                    onChange={(e) => setShippingOutsideDhaka(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-zinc-950 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-3xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </div>
      </form>
    </div>
  );
}
