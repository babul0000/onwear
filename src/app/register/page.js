'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await register(name, email, password, phone, address);
      if (res.success) {
        setSuccess('Registration successful! Redirecting to login page...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(res.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-zinc-950">Create Account</h2>
          <p className="text-sm text-zinc-500 mt-2">Sign up for your customer account</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="Min. 6 characters"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="017xxxxxxxx"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Shipping Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="House/Street, Area, City"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 mt-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
