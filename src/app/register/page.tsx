'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { 
  Mail, Lock, User, Phone, Store, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Sparkles, Gift, 
  CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLookbook from '../../components/AuthLookbook';

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
  const router = useRouter();

  // Password strength score calculation (0 to 4)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-zinc-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

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

  return (
    <div className="min-h-screen w-full bg-[#f8f8fa] font-sans flex items-center justify-center p-0 sm:p-4 lg:p-8 text-zinc-900 selection:bg-zinc-950 selection:text-white">
      
      {/* Main Dual-Pane Luxury Editorial Container */}
      <div className="w-full max-w-6xl min-h-screen sm:min-h-[720px] sm:rounded-3xl bg-white border-0 sm:border border-zinc-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Modern Minimalist Auth Form (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 bg-white">
          
          <div>
            {/* Top Brand Header & Animated Pill Switcher */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-black tracking-[0.2em] text-zinc-950 uppercase group">
                <div className="h-8 w-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <Store className="h-4 w-4" />
                </div>
                <span>ONWEAR</span>
              </Link>

              {/* Mode Pill Toggle */}
              <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-zinc-200 text-xs font-bold">
                <Link 
                  href="/login" 
                  className="px-3.5 py-1.5 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors"
                >
                  Sign In
                </Link>
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white shadow-xs">
                  Register
                </span>
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-6">
              <span className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-[0.25em] block mb-1">
                JOIN THE ARCHIVE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase font-sans">
                Create Account
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 font-medium leading-relaxed">
                Join our private shopping club for expedited deliveries and tailored styling privileges.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 mb-5 flex items-center gap-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 mb-5 flex items-center gap-2.5"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Password (Min 6 Characters) *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-11 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full h-full transition-all duration-300 ${
                            passwordStrength >= step ? strengthColors[passwordStrength] : 'bg-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Password Strength: <strong className="text-zinc-900">{strengthLabels[passwordStrength]}</strong></span>
                      {password.length < 6 && <span className="text-red-500 font-bold">Minimum 6 chars</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Welcome Gift Box */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                <Gift className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  🎁 Welcome Gift: Enjoy <strong>Tk 200 Off</strong> your 1st order with coupon <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px] font-bold">WELCOME200</code>.
                </span>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950/20 cursor-pointer accent-zinc-950"
                  />
                  <span className="text-[11px] text-zinc-600 font-medium">
                    I agree to the <span className="text-zinc-950 font-bold underline">Terms of Service</span> & Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 mt-3 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
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
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Or Sign Up With
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-2.5 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.832 0-8.232-3.893-8.232-8.529S7.408 1.457 12.24 1.457c2.477 0 4.183.993 5.378 2.128l3.1-3.1C18.665.414 15.657 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.618 0 12.28-5.357 12.28-12.24 0-.829-.071-1.636-.2-1.957H12.24z"/>
                </svg>
                <span>Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-2.5 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-5 border-t border-zinc-100 text-center text-xs text-zinc-500 font-medium mt-5">
            Already have an ONWEAR account?{' '}
            <Link href="/login" className="font-extrabold text-zinc-950 underline hover:text-zinc-700 transition-colors">
              Sign in here
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN: Lookbook Showcase (7 cols on lg) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7">
          <AuthLookbook mode="register" />
        </div>

      </div>

    </div>
  );
}
