'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { 
  Mail, Lock, Store, Eye, EyeOff, ArrowRight, 
  Sparkles, CheckCircle2, Loader2, X, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLookbook from '../../components/AuthLookbook';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Resend Activation Modal
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const { login, resendActivation } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        
        if (redirect && redirect.startsWith('/')) {
          router.push(redirect);
        } else if (typeof document !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
          const referrerPath = new URL(document.referrer).pathname;
          if (referrerPath !== '/login' && referrerPath !== '/register') {
            router.push(referrerPath);
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } else {
        setError(res.message || 'Login failed. Please verify your email and password.');
        setErrorCode(res.code);
        if (res.code === 'ACCOUNT_PENDING_ACTIVATION') {
          setResendEmail(email);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await resendActivation(resendEmail);
      setResendMessage(res.message || 'If an account exists, a new activation email has been sent.');
    } catch (err) {
      setResendMessage('Something went wrong. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f8fa] font-sans flex items-center justify-center p-0 sm:p-4 lg:p-8 text-zinc-900 selection:bg-zinc-950 selection:text-white">
      
      {/* Main Dual-Pane Luxury Editorial Container */}
      <div className="w-full max-w-6xl min-h-screen sm:min-h-[700px] sm:rounded-3xl bg-white border-0 sm:border border-zinc-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Modern Minimalist Auth Form (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 bg-white">
          
          <div>
            {/* Top Brand Header & Animated Pill Switcher */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-black tracking-[0.2em] text-zinc-950 uppercase group">
                <div className="h-8 w-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <Store className="h-4 w-4" />
                </div>
                <span>ONWEAR</span>
              </Link>

              {/* Mode Pill Toggle */}
              <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-zinc-200 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white shadow-xs">
                  Sign In
                </span>
                <Link 
                  href="/register" 
                  className="px-3.5 py-1.5 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-7">
              <span className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-[0.25em] block mb-1">
                MEMBERS PORTAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase font-sans">
                Welcome Back
              </h1>
              <p className="text-xs text-zinc-500 mt-1.5 font-medium leading-relaxed">
                Enter your credentials to access your orders, wishlist, and VIP member perks.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 mb-6 flex flex-col gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
                {errorCode === 'ACCOUNT_PENDING_ACTIVATION' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResendEmail(email);
                      setShowResendModal(true);
                    }}
                    className="self-start underline text-xs font-bold text-zinc-950 hover:text-zinc-700 ml-6 cursor-pointer"
                  >
                    Click here to resend activation link →
                  </button>
                )}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResendModal(true)}
                    className="text-[10px] font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                  >
                    Forgot / Activate?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-11 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950/20 cursor-pointer accent-zinc-950"
                  />
                  <span className="text-xs text-zinc-600 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-4 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO ONWEAR</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Or Continue With
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.832 0-8.232-3.893-8.232-8.529S7.408 1.457 12.24 1.457c2.477 0 4.183.993 5.378 2.128l3.1-3.1C18.665.414 15.657 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.618 0 12.28-5.357 12.28-12.24 0-.829-.071-1.636-.2-1.957H12.24z"/>
                </svg>
                <span>Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Bottom Footer Switcher */}
          <div className="pt-6 border-t border-zinc-100 text-center text-xs text-zinc-500 font-medium mt-6">
            Don't have an ONWEAR account?{' '}
            <Link href="/register" className="font-extrabold text-zinc-950 underline hover:text-zinc-700 transition-colors">
              Create an account now
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN: Lookbook Showcase (7 cols on lg) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7">
          <AuthLookbook mode="login" />
        </div>

      </div>

      {/* Resend Activation / Password Modal */}
      <AnimatePresence>
        {showResendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col gap-4 text-zinc-900 relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowResendModal(false);
                  setResendMessage('');
                }}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-zinc-950">
                  <Sparkles className="h-5 w-5 text-zinc-900" />
                  <span>Resend Activation Link</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Enter your registered email address to receive a secure account activation or password setup link.
                </p>
              </div>

              {resendMessage ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{resendMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleResend} className="flex flex-col gap-3 mt-1">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Sending Activation Link...</span>
                      </>
                    ) : (
                      <span>Send Activation Link</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
