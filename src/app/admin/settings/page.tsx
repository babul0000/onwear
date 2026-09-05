'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { 
  Settings, Save, Globe, Phone, Mail, MapPin, 
  Truck, Upload, Loader2, Sparkles, Image as ImageIcon,
  Bell, Smartphone, Layers, CheckCircle2
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

  // Form States - Branding & General
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // Payment Gateways & WhatsApp
  const [bkashNumber, setBkashNumber] = useState('01603742963');
  const [nagadNumber, setNagadNumber] = useState('01603742963');
  const [whatsappNumber, setWhatsappNumber] = useState('8801603742963');

  // Shipping & Free Delivery
  const [shippingInsideDhaka, setShippingInsideDhaka] = useState<number>(80);
  const [shippingOutsideDhaka, setShippingOutsideDhaka] = useState<number>(150);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState<number>(2500);

  // Top Announcement Bar
  const [announcementText, setAnnouncementText] = useState('🎉 Free Shipping on all orders above Tk 2,500! Use coupon ONWEAR10');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementLink, setAnnouncementLink] = useState('/products');

  // Homepage Lookbook Showcase
  const [lookbookTitle, setLookbookTitle] = useState('THE SIGNATURE COLLECTION');
  const [lookbookSubtitle, setLookbookSubtitle] = useState('THE DENIM OVERCOAT LOOK');
  const [lookbookDescription, setLookbookDescription] = useState('Combine our signature Indigo Denim Overshirt with tailormade stretch pants for a modern casual lookup that fits both office work and weekend outings.');
  const [lookbookImageUrl, setLookbookImageUrl] = useState('https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000');
  const [lookbookLinkUrl, setLookbookLinkUrl] = useState('/products?category=denim');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLookbook, setUploadingLookbook] = useState(false);
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
      setBkashNumber(settings.bkashNumber || '01603742963');
      setNagadNumber(settings.nagadNumber || '01603742963');
      setWhatsappNumber(settings.whatsappNumber || '8801603742963');
      setShippingInsideDhaka(settings.shippingInsideDhaka || 80);
      setShippingOutsideDhaka(settings.shippingOutsideDhaka || 150);
      setFreeShippingMinAmount(settings.freeShippingMinAmount !== undefined ? settings.freeShippingMinAmount : 2500);
      setAnnouncementText(settings.announcementText || '');
      setAnnouncementEnabled(settings.announcementEnabled !== undefined ? settings.announcementEnabled : true);
      setAnnouncementLink(settings.announcementLink || '/products');
      setLookbookTitle(settings.lookbookTitle || 'THE SIGNATURE COLLECTION');
      setLookbookSubtitle(settings.lookbookSubtitle || 'THE DENIM OVERCOAT LOOK');
      setLookbookDescription(settings.lookbookDescription || '');
      setLookbookImageUrl(settings.lookbookImageUrl || '');
      setLookbookLinkUrl(settings.lookbookLinkUrl || '/products?category=denim');
      setLoading(false);
    }
  }, [settings]);

  // Handle Image Upload to ImgBB
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'lookbook'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingLookbook(true);
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
        if (type === 'logo') {
          setLogoUrl(data.data.url);
          setMessage({ type: 'success', text: 'Logo uploaded successfully. Save changes to make it permanent!' });
        } else {
          setLookbookImageUrl(data.data.url);
          setMessage({ type: 'success', text: 'Lookbook image uploaded successfully. Save changes to apply!' });
        }
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Image upload failed.' });
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      setMessage({ type: 'error', text: 'An error occurred during image upload. Please try again.' });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingLookbook(false);
    }
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
          bkashNumber,
          nagadNumber,
          whatsappNumber,
          shippingInsideDhaka,
          shippingOutsideDhaka,
          freeShippingMinAmount,
          announcementText,
          announcementEnabled,
          announcementLink,
          lookbookTitle,
          lookbookSubtitle,
          lookbookDescription,
          lookbookImageUrl,
          lookbookLinkUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'All settings updated and applied globally in real-time!' });
        await refreshSettings();
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
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-teal-600" />
            <span>Store Master Control</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            Manage branding, top notification bar, mobile banking accounts, shipping fees, lookbook banners, and customer support.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || uploadingLogo || uploadingLookbook}
          className="rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider py-3.5 px-8 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2 spans) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. TOP ANNOUNCEMENT BAR CONTROL */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-teal-600" />
                <span>Top Announcement Notice Bar</span>
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950"></div>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {announcementEnabled ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Announcement Notice Text
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. 🎉 Free Shipping on all orders above Tk 2,500! Use coupon ONWEAR10"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Clickable Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="e.g. /products or /campaigns/eid-sale"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-mono font-medium focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>
          </div>

          {/* 2. MOBILE BANKING & WHATSAPP (Direct Payment Gateways) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-4 flex items-center gap-2">
              <Smartphone className="h-4.5 w-4.5 text-teal-600" />
              <span>Mobile Banking Numbers & WhatsApp Support</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#E2136E] tracking-wider mb-1.5">
                  bKash Merchant Number *
                </label>
                <input
                  type="text"
                  required
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-zinc-50 border border-pink-200 rounded-2xl px-4 py-3 text-xs text-zinc-950 font-mono font-bold focus:bg-white focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#F7921E] tracking-wider mb-1.5">
                  Nagad Personal Number *
                </label>
                <input
                  type="text"
                  required
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-zinc-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-zinc-950 font-mono font-bold focus:bg-white focus:outline-none focus:border-[#F7921E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1.5">
                  WhatsApp Support Number *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8801XXXXXXXXX"
                  className="w-full bg-zinc-50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs text-zinc-950 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 3. HOMEPAGE LOOKBOOK SHOWCASE SECTION */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-teal-600" />
              <span>Homepage Lookbook Banner Showcase</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Badge Title
                </label>
                <input
                  type="text"
                  value={lookbookTitle}
                  onChange={(e) => setLookbookTitle(e.target.value)}
                  placeholder="e.g. THE SIGNATURE COLLECTION"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={lookbookSubtitle}
                  onChange={(e) => setLookbookSubtitle(e.target.value)}
                  placeholder="e.g. THE DENIM OVERCOAT LOOK"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-bold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={lookbookDescription}
                  onChange={(e) => setLookbookDescription(e.target.value)}
                  placeholder="Brief story or fashion styling tip..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-medium focus:bg-white focus:outline-none focus:border-zinc-950 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Lookbook Image URL
                </label>
                <input
                  type="text"
                  value={lookbookImageUrl}
                  onChange={(e) => setLookbookImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-mono focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Shop Link Redirect URL
                </label>
                <input
                  type="text"
                  value={lookbookLinkUrl}
                  onChange={(e) => setLookbookLinkUrl(e.target.value)}
                  placeholder="/products?category=denim"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-mono focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="cursor-pointer bg-zinc-50 border border-dashed border-zinc-300 hover:border-zinc-600 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 transition-all">
                  {uploadingLookbook ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                      <span>Uploading Lookbook Image...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-zinc-500" />
                      <span>Upload Lookbook Photo via File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'lookbook')}
                    disabled={uploadingLookbook}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 4. CONTACT INFORMATION */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-4 flex items-center gap-2">
              <Phone className="h-4.5 w-4.5 text-teal-600" />
              <span>Contact Information & Social Profiles</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Support Phone
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Physical Office / Store Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-medium focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-medium focus:bg-white focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1 span) */}
        <div className="space-y-8">
          
          {/* 1. BRANDING & LOGO */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-4 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-teal-600" />
              <span>Branding & Logo</span>
            </h3>

            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                Store Brand Name
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-950 font-black uppercase tracking-wider focus:bg-white focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                Brand Tagline
              </label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-medium focus:bg-white focus:outline-none focus:border-zinc-950 resize-none"
              />
            </div>

            {/* Logo Preview & Upload */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
              {logoUrl ? (
                <div className="text-center space-y-3">
                  <img 
                    src={logoUrl} 
                    alt="Logo Preview" 
                    className="h-14 max-w-full object-contain mx-auto border border-zinc-200 p-2 rounded-xl bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full"
                  >
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="h-8 w-8 text-zinc-300 mx-auto mb-1" />
                  <p className="text-[10px] text-zinc-400 font-semibold">Using Text Logo</p>
                </div>
              )}

              <div className="mt-3">
                <label className="cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all">
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-zinc-950" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Upload Logo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. SHIPPING RATES & FREE DELIVERY THRESHOLD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-4 flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-teal-600" />
              <span>Shipping & Delivery Rules</span>
            </h3>

            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                Inside Dhaka Rate (BDT)
              </label>
              <input
                type="number"
                min="0"
                required
                value={shippingInsideDhaka}
                onChange={(e) => setShippingInsideDhaka(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">
                Outside Dhaka Rate (BDT)
              </label>
              <input
                type="number"
                min="0"
                required
                value={shippingOutsideDhaka}
                onChange={(e) => setShippingOutsideDhaka(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-emerald-700 tracking-wider mb-1.5">
                Free Delivery Minimum Threshold (BDT)
              </label>
              <input
                type="number"
                min="0"
                required
                value={freeShippingMinAmount}
                onChange={(e) => setFreeShippingMinAmount(Number(e.target.value))}
                placeholder="2500"
                className="w-full bg-emerald-50/50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs text-emerald-950 font-mono font-black focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Orders with subtotal above this amount get <strong>100% Free Shipping</strong> automatically.
              </p>
            </div>
          </div>

          {/* Final Submit Button */}
          <button
            type="submit"
            disabled={saving || uploadingLogo || uploadingLookbook}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider py-4 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving All Settings...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Apply All Settings</span>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}
