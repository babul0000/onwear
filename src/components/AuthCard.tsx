'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { 
  Mail, Lock, User, Phone, Store, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Sparkles, Gift, 
  CheckCircle2, Loader2, AlertCircle, X, RotateCcw,
  Check, RefreshCw, ShoppingBag, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthCardProps {
  initialMode: 'login' | 'register';
}

export default function AuthCard({ initialMode }: AuthCardProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, resendActivation } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Common form state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errorCode, setErrorCode] = useState<string | undefined>();

  // Resend Activation / Password Modal
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess('');
  }, [initialMode]);

  // Switch mode helper with URL synchronization
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccess('');
    const redirect = searchParams.get('redirect');
    const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    window.history.replaceState(null, '', `/${newMode}${redirectQuery}`);
  };

  // Password strength score (0 to 4)
  const passwordStrength = useMemo(() => {
    if (!regPassword) return 0;
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score += 1;
    if (/[0-9]/.test(regPassword) || /[^A-Za-z0-9]/.test(regPassword)) score += 1;
    return score;
  }, [regPassword]);

  const strengthLabels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-zinc-200', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(undefined);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        const redirect = searchParams.get('redirect');
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
          setResendEmail(loginEmail);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) {
      setError('Please agree to the terms of service to create an account.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(regName.trim(), regEmail.trim(), regPassword, regPhone.trim(), '');
      if (res.success) {
        setSuccess('🎉 Account created successfully! Redirecting you to sign in...');
        setTimeout(() => {
          setMode('login');
          setLoginEmail(regEmail);
          setSuccess('');
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

  // Handle Resend Activation Link
  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await resendActivation(resendEmail);
      setResendMessage(res.message || 'If an account exists, a secure activation link has been sent.');
    } catch (err) {
      setResendMessage('Something went wrong. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f7f9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-950 selection:text-white relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-zinc-200/50 via-zinc-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Container */}
      <div className="w-full max-w-[480px] z-10 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="inline-flex items-center text-2xl font-semibold tracking-[0.22em] text-zinc-950 uppercase pl-[0.22em] hover:opacity-80 transition-opacity">
            ONWEAR
          </Link>
          <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase">
            Signature Clothing & Apparel
          </p>
        </div>

        {/* Elevated Floating Auth Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-8 flex flex-col gap-6 relative">
          
          {/* Top Segmented Control (Pill Tabs) */}
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 relative">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                mode === 'login' ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                mode === 'register' ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Create Account
            </button>

            {/* Sliding Pill Indicator */}
            <motion.div
              layout
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-xs border border-zinc-200/60 ${
                mode === 'login' ? 'left-1.5' : 'left-[calc(50%+3px)]'
              }`}
            />
          </div>

          {/* Card Header Info */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight font-sans">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              {mode === 'login'
                ? 'Enter your credentials to access your orders and saved items.'
                : 'Join ONWEAR to track orders and receive member-exclusive benefits.'}
            </p>
          </div>

          {/* Welcome Gift Promo Callout (Register Mode) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900"
            >
              <Gift className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="text-[11px] font-semibold leading-tight">
                <strong>New Member Welcome:</strong> Get <strong>Tk 200 Off</strong> your first order with coupon code <span className="font-mono bg-amber-100 font-bold px-1.5 py-0.5 rounded text-amber-900">WELCOME200</span>.
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex flex-col gap-2"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
              {errorCode === 'ACCOUNT_PENDING_ACTIVATION' && (
                <button
                  type="button"
                  onClick={() => {
                    setResendEmail(loginEmail);
                    setShowResendModal(true);
                  }}
                  className="self-start underline text-xs font-bold text-zinc-950 hover:text-zinc-700 ml-6 cursor-pointer"
                >
                  Click here to resend activation link →
                </button>
              )}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Social Sign-In Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.832 0-8.232-3.893-8.232-8.529S7.408 1.457 12.24 1.457c2.477 0 4.183.993 5.378 2.128l3.1-3.1C18.665.414 15.657 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.618 0 12.28-5.357 12.28-12.24 0-.829-.071-1.636-.2-1.957H12.24z"/>
              </svg>
              <span>Google</span>
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative text-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Or with email
            </span>
          </div>

          {/* ===================== MODE: SIGN IN ===================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

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
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
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
          ) : (
            /* ===================== MODE: CREATE ACCOUNT ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Email Address *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-all font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Password (Min 6 Characters) *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
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
                {regPassword.length > 0 && (
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
                      <span>Strength: <strong className="text-zinc-900">{strengthLabels[passwordStrength]}</strong></span>
                      {regPassword.length < 6 && <span className="text-red-500 font-bold">Minimum 6 chars</span>}
                    </div>
                  </div>
                )}
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
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
          )}

          {/* Bottom Switcher */}
          <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500 font-medium">
            {mode === 'login' ? (
              <span>
                New to ONWEAR?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-extrabold text-zinc-950 underline hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-extrabold text-zinc-950 underline hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  Sign in instead
                </button>
              </span>
            )}
          </div>

        </div>

        {/* Customer Trust Badges */}
        <div className="grid grid-cols-3 gap-3 text-center text-zinc-500 text-[11px] font-semibold py-1">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Secure</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-sky-600" />
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
            <span>7-Day Return</span>
          </div>
        </div>

      </div>

      {/* Resend Activation / Forgot Password Modal */}
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
                  <span>Account Activation & Recovery</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Enter your registered email address to receive an account activation or password setup link.
                </p>
              </div>

              {resendMessage ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{resendMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleResendSubmit} className="flex flex-col gap-3 mt-1">
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
                        <span>Sending Link...</span>
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
