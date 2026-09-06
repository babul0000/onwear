'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import Link from 'next/link';
import { 
  Mail, Lock, User, Phone, Store, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Sparkles, Gift, 
  CheckCircle2, Loader2, AlertCircle, ShoppingBag
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) {
      setError('Please agree to the terms of service to create an account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name.trim(), email.trim(), password, phone.trim(), '');
      if (res.success) {
        setSuccess('🎉 Account created successfully! Redirecting you to sign in...');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          if (redirect) {
            router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
          } else {
            router.push('/login');
          }
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Please verify your details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const heroImage = settings?.registerImageUrl || 'https://i.ibb.co/FqHjfvxG/Gemini-Generated-Image-ino58qino58qino5.jpg';
  const heroTitle = settings?.registerTitle || 'START JOURNEY';
  const heroSubtitle = settings?.registerSubtitle || 'Join ONWEAR to unlock VIP privileges, track orders & save wishlists';

  return (
    <div className="min-h-screen w-full bg-[#09090b] font-sans flex items-center justify-center p-0 sm:p-4 lg:p-6 text-zinc-100 selection:bg-teal-500 selection:text-white">
      
      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-6xl min-h-screen sm:min-h-[680px] sm:rounded-3xl bg-zinc-900/90 border-0 sm:border border-zinc-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        
        {/* LEFT COLUMN: Modern Luxury Auth Form (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 bg-gradient-to-b from-zinc-900 to-zinc-950">
          
          {/* Top Brand Header & Quick Navigation */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-[0.2em] text-white uppercase group">
                <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-zinc-950 transition-all duration-300">
                  <Store className="h-4 w-4" />
                </div>
                <span>ONWEAR</span>
              </Link>

              {/* Mode Pill Toggle */}
              <div className="flex items-center bg-zinc-950 p-1 rounded-full border border-zinc-800 text-[11px] font-bold">
                <Link 
                  href="/login" 
                  className="px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-white shadow-sm">
                  Register
                </span>
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                Create Account
              </h1>
              <p className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed">
                Join our private shopping club for expedited deliveries and tailored fashion styling.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400 mb-5 flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-2xl bg-teal-500/10 border border-teal-500/20 p-4 text-xs font-semibold text-teal-400 mb-5 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all font-medium font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Password (Min 6 Characters) *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 pl-11 pr-11 text-xs text-white placeholder-zinc-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-teal-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-teal-500"
                  />
                  <span className="text-[11px] text-zinc-400 font-medium">
                    I agree to the <span className="text-zinc-200 underline">Terms of Service</span> & Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>JOIN ONWEAR NOW</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-950 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Or Sign Up With
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.832 0-8.232-3.893-8.232-8.529S7.408 1.457 12.24 1.457c2.477 0 4.183.993 5.378 2.128l3.1-3.1C18.665.414 15.657 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.618 0 12.28-5.357 12.28-12.24 0-.829-.071-1.636-.2-1.957H12.24z"/>
                </svg>
                <span>Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
              >
                <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400 font-medium mt-5">
            Already have an ONWEAR account?{' '}
            <Link href="/login" className="font-bold text-teal-400 hover:text-teal-300 underline transition-colors">
              Sign in here
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN: Luxury Fashion Editorial Showcase (7 cols on lg) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-zinc-950 group">
          {/* Background Image */}
          <img
            src={heroImage}
            alt="ONWEAR Signature Fashion"
            className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Luxury Vignette & Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />

          {/* Top VIP Badge */}
          <div className="absolute top-10 right-10 z-10">
            <span className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full shadow-2xl">
              <Gift className="h-3 w-3 text-teal-400" />
              <span>EXCLUSIVE MEMBER PRIVILEGES</span>
            </span>
          </div>

          {/* Bottom Editorial Content */}
          <div className="absolute bottom-10 left-10 right-10 z-10 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-black tracking-[0.3em] uppercase text-teal-400">
                JOIN THE ONWEAR INNER CIRCLE
              </p>
              <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight uppercase leading-none">
                {heroTitle}
              </h2>
              <p className="text-sm font-light text-zinc-300 max-w-md leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            {/* Feature Perks Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
                <Gift className="h-4 w-4 text-teal-400 mx-auto" />
                <p className="text-[10px] font-black uppercase text-white tracking-wider">Tk 200 Off</p>
                <p className="text-[9px] text-zinc-400 font-medium">On 1st Order</p>
              </div>

              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
                <ShoppingBag className="h-4 w-4 text-teal-400 mx-auto" />
                <p className="text-[10px] font-black uppercase text-white tracking-wider">Wishlist Sync</p>
                <p className="text-[9px] text-zinc-400 font-medium">Cross-device</p>
              </div>

              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center space-y-1">
                <ShieldCheck className="h-4 w-4 text-teal-400 mx-auto" />
                <p className="text-[10px] font-black uppercase text-white tracking-wider">Easy Returns</p>
                <p className="text-[9px] text-zinc-400 font-medium">7 Days Policy</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
