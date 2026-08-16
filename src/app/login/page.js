'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Store } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-12 bg-zinc-50 font-sans overflow-y-auto md:overflow-hidden">
      {/* LEFT COLUMN: Form Container (Occupies 5 columns on desktop) */}
      <div className="relative md:col-span-5 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-16 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* SMOOTH WAVY SVG OVERLAY (Visible on desktop, points rightwards overlaying the image) */}
        <div className="absolute top-0 bottom-0 right-[-23px] w-[24px] h-full text-white fill-current z-20 pointer-events-none hidden md:block select-none">
          <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path d="M0,0 L70,0 C75,80 65,160 80,240 C95,320 70,400 85,480 C100,560 75,640 90,720 C105,800 80,880 95,960 C100,980 90,990 85,1000 L0,1000 Z" />
          </svg>
        </div>

        {/* Brand Logo Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xl font-black tracking-[0.15em] text-zinc-950 uppercase">
            <Store className="h-5 w-5 text-teal-600" />
            <span>SHOPNEST</span>
          </Link>
        </div>

        {/* Welcome Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">SIGN IN</h2>
          <p className="text-sm text-zinc-400 mt-2 font-medium">Access your ShopNest account</p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 h-4.5 w-4.5 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-teal-50/70 border border-teal-100/50 rounded-full py-3.5 pl-12 pr-6 text-sm text-teal-900 placeholder-teal-300 outline-none focus:bg-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-medium"
              placeholder="e-mail"
            />
          </div>

          {/* Password Input */}
          <div className="relative w-full">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 h-4.5 w-4.5 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-teal-50/70 border border-teal-100/50 rounded-full py-3.5 pl-12 pr-6 text-sm text-teal-900 placeholder-teal-300 outline-none focus:bg-white focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-medium"
              placeholder="password"
            />
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="remember"
              defaultChecked
              className="rounded border-teal-200 text-teal-500 focus:ring-teal-400 w-4 h-4"
            />
            <label htmlFor="remember" className="text-xs text-zinc-400 font-semibold cursor-pointer select-none">
              Keep me signed in on this device
            </label>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-40 rounded-full bg-teal-400 hover:bg-teal-500 text-white font-extrabold py-3.5 text-xs tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-102 duration-200 uppercase mt-4 disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        {/* Social logins */}
        <div className="mt-12">
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b5998] text-white hover:opacity-90 hover:scale-105 transition-all shadow-sm">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.832 0-8.232-3.893-8.232-8.529S7.408 1.457 12.24 1.457c2.477 0 4.183.993 5.378 2.128l3.1-3.1C18.665.414 15.657 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.618 0 12.28-5.357 12.28-12.24 0-.829-.071-1.636-.2-1.957H12.24z"/>
              </svg>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1da1f2] text-white hover:opacity-90 hover:scale-105 transition-all shadow-sm">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-14 text-sm text-zinc-400 font-medium">
          New here?{' '}
          <Link href="/register" className="font-bold text-teal-500 hover:text-teal-600 underline">
            Create an account
          </Link>
        </p>
      </div>

      {/* RIGHT COLUMN: Clothing Brand Presentation Image (Occupies 7 columns on desktop) */}
      <div className="relative md:col-span-7 hidden md:block overflow-hidden bg-zinc-950">
        {/* Background Image: Premium Summer Clothing Model */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200"
          alt="Premium Clothing Model Collection"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-1000 hover:scale-102"
        />
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
        
        {/* Centered Premium Content Branding */}
        <div className="absolute bottom-20 right-20 text-right z-10 text-white select-none">
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-teal-400 mb-2">NEW ARRIVALS COLLECTION</p>
          <h1 className="text-4xl font-extrabold tracking-wider uppercase mb-1 leading-none">ELEVATE STYLE</h1>
          <p className="text-zinc-300 text-sm tracking-widest font-light">Find your signature clothing comfort at ShopNest</p>
        </div>
      </div>
    </div>
  );
}
