'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Store, ArrowRight, RefreshCw, Mail } from 'lucide-react';

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get('token') || '';
  const router = useRouter();
  const { verifyActivationToken, setPasswordAndActivate, resendActivation } = useAuth();

  const [status, setStatus] = useState<'LOADING' | 'VALID' | 'EXPIRED' | 'INVALID' | 'SUCCESS'>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState<{ name?: string; email?: string }>({});

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!rawToken) {
      setStatus('INVALID');
      setErrorMessage('Activation token is missing. Please check the link from your email.');
      return;
    }

    async function checkToken() {
      const res = await verifyActivationToken(rawToken);
      if (res.success && res.data) {
        setUserData(res.data);
        if (res.data.email) setResendEmail(res.data.email);
        setStatus('VALID');
      } else {
        if (res.message?.toLowerCase().includes('expired')) {
          setStatus('EXPIRED');
          setErrorMessage('This activation link has expired (valid for 24 hours).');
        } else if (res.message?.toLowerCase().includes('already been used')) {
          setStatus('INVALID');
          setErrorMessage('This activation link has already been used. You can log in with your password.');
        } else {
          setStatus('INVALID');
          setErrorMessage(res.message || 'This activation link is invalid.');
        }
      }
    }

    checkToken();
  }, [rawToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await setPasswordAndActivate(rawToken, password);
      if (res.success) {
        setStatus('SUCCESS');
        setTimeout(() => {
          router.push('/orders');
        }, 1800);
      } else {
        setErrorMessage(res.message || 'Failed to set password. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendSubmitting(true);
    setResendMessage('');
    try {
      const res = await resendActivation(resendEmail);
      setResendMessage(res.message || 'If an account exists, a new activation email has been sent.');
    } catch (err) {
      setResendMessage('Something went wrong. Please try again later.');
    } finally {
      setResendSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-50 px-4 py-12 font-sans">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-2xl font-black tracking-[0.15em] text-zinc-950 uppercase">
          <Store className="h-6 w-6 text-teal-600" />
          <span>ONWEAR</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-zinc-100 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-zinc-900 to-indigo-600" />

        {/* 1. LOADING STATE */}
        {status === 'LOADING' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950 mb-4" />
            <h2 className="text-lg font-bold text-zinc-800">Verifying Activation Link...</h2>
            <p className="text-xs text-zinc-400 mt-1">Please wait while we validate your security token.</p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 mb-4 border border-emerald-100">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Account Activated!</h2>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs font-medium">
              Your password has been saved. We are redirecting you to your order history...
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-teal-650">
              <span>Redirecting</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-650 border-t-transparent" />
            </div>
          </div>
        )}

        {/* 3. VALID TOKEN STATE (PASSWORD SETUP FORM) */}
        {status === 'VALID' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-650 tracking-widest font-mono">
                ACCOUNT ACTIVATION
              </span>
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mt-0.5">
                Set Your Password
              </h2>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-medium">
                Welcome {userData.name ? <strong className="text-zinc-800">{userData.name}</strong> : 'to OnWear'}! Create a secure password for <strong className="text-zinc-900">{userData.email}</strong> to access your order history and future purchases.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-4.5 w-4.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-12 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-4.5 w-4.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-11 pr-12 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password checks helper */}
              <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-400 py-1">
                <span className={password.length >= 6 ? 'text-teal-600 font-bold' : ''}>
                  • Minimum 6 characters {password.length >= 6 && '✓'}
                </span>
                <span className={password && confirmPassword && password === confirmPassword ? 'text-teal-600 font-bold' : ''}>
                  • Passwords match {password && confirmPassword && password === confirmPassword && '✓'}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account & Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 4. EXPIRED / INVALID STATE */}
        {(status === 'EXPIRED' || status === 'INVALID') && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-zinc-950 uppercase tracking-tight">
                {status === 'EXPIRED' ? 'Link Expired' : 'Invalid Link'}
              </h2>
              <p className="text-xs text-zinc-500 mt-1 font-medium">{errorMessage}</p>
            </div>

            {/* Resend Box */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs uppercase tracking-wider">
                <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
                <span>Request New Activation Link</span>
              </div>

              {resendMessage ? (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  {resendMessage}
                </p>
              ) : (
                <form onSubmit={handleResend} className="flex flex-col gap-2.5">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-950"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendSubmitting}
                    className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 text-xs tracking-wider transition-colors disabled:bg-zinc-300"
                  >
                    {resendSubmitting ? 'Sending...' : 'Send Activation Email'}
                  </button>
                </form>
              )}
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-100">
              <Link href="/login" className="font-bold text-teal-650 hover:underline">
                Go to Sign In
              </Link>
              <Link href="/products" className="font-bold text-zinc-500 hover:text-zinc-800">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
