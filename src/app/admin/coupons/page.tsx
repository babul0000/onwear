'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { Percent, Plus, Tag, Save, Loader2, Calendar, ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '../../../utils/format';

interface Coupon {
  id: string;
  code: string;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  minPurchase: number;
  firstOrderOnly: boolean;
  isActive: boolean;
  expiryDate: string | null;
  totalLimit: number;
  usedCount: number;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [totalLimit, setTotalLimit] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Load coupons list
  const loadCoupons = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCoupons(data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [token]);

  // Submit new coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Coupon code is required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      totalLimit: Number(totalLimit),
      firstOrderOnly,
      isActive,
      ...(expiryDate && { expiryDate: new Date(expiryDate).toISOString() })
    };

    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Coupon created successfully!' });
        setIsModalOpen(false);
        // Reset Form
        setCode('');
        setDiscountType('PERCENTAGE');
        setDiscountValue(10);
        setMinPurchase(0);
        setTotalLimit(100);
        setExpiryDate('');
        setFirstOrderOnly(false);
        setIsActive(true);
        // Reload list
        loadCoupons();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create coupon' });
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      setMessage({ type: 'error', text: 'An error occurred while creating the coupon' });
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
    <div className="p-6 max-w-6xl mx-auto text-zinc-700">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Percent className="h-7 w-7 text-indigo-600" />
            Store Coupons
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Manage, list, and create promo discount coupon codes for checking out orders.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-5 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4.5 px-6">Coupon Code</th>
                <th className="py-4.5 px-6">Discount</th>
                <th className="py-4.5 px-6">Min Purchase</th>
                <th className="py-4.5 px-6">Usage (Limit)</th>
                <th className="py-4.5 px-6">Expiry Date</th>
                <th className="py-4.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-bold text-zinc-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                    No coupons have been created yet. Click "New Coupon" to start.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-xl uppercase tracking-wider">
                        <Tag className="h-3 w-3" />
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {coupon.discountType === 'FLAT' 
                        ? formatPrice(coupon.discountValue) 
                        : `${coupon.discountValue}%`}
                    </td>
                    <td className="py-4 px-6">{formatPrice(coupon.minPurchase)}</td>
                    <td className="py-4 px-6">
                      {coupon.usedCount} <span className="text-zinc-400 font-semibold">/ {coupon.totalLimit}</span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500 font-semibold">
                      {coupon.expiryDate 
                        ? new Date(coupon.expiryDate).toLocaleDateString('en-BD', { dateStyle: 'medium' }) 
                        : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) 
                          ? 'Active' 
                          : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                <Tag className="h-5.5 w-5.5 text-indigo-600" />
                Create Promo Coupon
              </h2>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">Add a new coupon code with type, discount values, minimum purchase constraints, and usage limits.</p>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. WELCOME20"
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Rate (Tk)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Min Purchase (Tk)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstOrderOnly}
                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Valid for First Order Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Active immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-extrabold px-5 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-indigo-400" />
                      Create Coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
