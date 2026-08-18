'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Mail, Save } from 'lucide-react';

export default function ProfilePage() {
  const { token, user, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm mt-2">Please log in to view your profile.</p>
        <button onClick={() => router.push('/login')} className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white">
          Log In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await updateProfile(name, phone, address);
      if (res.success) {
        setMessage('Profile updated successfully!');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">My Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account information and shipping address</p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{user.name}</h2>
            <span className="text-xs font-semibold text-zinc-400 uppercase">{user.role} Account</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email (Read Only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" />
              <span>Email Address (Account ID)</span>
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              placeholder="e.g. 017xxxxxxxx"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span>Default Shipping Address</span>
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 resize-none"
              placeholder="Street Address, City, Postal Code"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Saving updates...' : 'Save Profile Details'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
