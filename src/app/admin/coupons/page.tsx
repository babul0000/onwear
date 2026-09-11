'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { Percent, Plus, Tag, Save, Loader2, Calendar, ShoppingBag, X, Trash2, Edit2, Sparkles, CheckCircle2, Flame, ShieldAlert, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../../../utils/format';
import ConfirmModal from '../../../components/ConfirmModal';

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

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalCoupon, setDeleteModalCoupon] = useState<Coupon | null>(null);
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

  const openCreateModal = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinPurchase(0);
    setTotalLimit(100);
    setExpiryDate('');
    setFirstOrderOnly(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinPurchase(coupon.minPurchase);
    setTotalLimit(coupon.totalLimit);
    setExpiryDate(coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '');
    setFirstOrderOnly(coupon.firstOrderOnly);
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  // Submit coupon (Create or Update)
  const handleSubmitCoupon = async (e: React.FormEvent) => {
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
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null
    };

    try {
      const url = editingId ? `${API_URL}/coupons/${editingId}` : `${API_URL}/coupons`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!' });
        setIsModalOpen(false);
        loadCoupons();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save coupon' });
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving coupon' });
    } finally {
      setSaving(false);
    }
  };

  // Delete coupon
  const handleDeleteCouponConfirm = async () => {
    if (!deleteModalCoupon || !token) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/coupons/${deleteModalCoupon.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Coupon "${deleteModalCoupon.code}" deleted successfully!` });
        setDeleteModalCoupon(null);
        loadCoupons();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete coupon' });
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setMessage({ type: 'error', text: 'An error occurred while deleting coupon' });
    } finally {
      setIsDeleting(false);
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto text-zinc-700">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Percent className="h-7 w-7 text-indigo-600" />
            Promo & Discount Coupons
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Manage, create, and customize customer discount voucher codes.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-5 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                <th className="py-4 px-6">Coupon Voucher</th>
                <th className="py-4 px-6">Discount</th>
                <th className="py-4 px-6">Min Purchase</th>
                <th className="py-4 px-6">Usage (Limit)</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-bold text-zinc-700 font-sans">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-semibold">
                    No coupons have been created yet. Click "New Coupon" to start.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-black text-[11px] rounded-xl uppercase tracking-wider font-mono">
                        <Tag className="h-3 w-3" />
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-zinc-950">
                      {coupon.discountType === 'FLAT' 
                        ? formatPrice(coupon.discountValue) 
                        : `${coupon.discountValue}%`}
                    </td>
                    <td className="py-4 px-6 font-mono">{formatPrice(coupon.minPurchase)}</td>
                    <td className="py-4 px-6 font-mono">
                      <span className="text-zinc-900">{coupon.usedCount}</span> <span className="text-zinc-400 font-semibold">/ {coupon.totalLimit}</span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500 font-mono">
                      {coupon.expiryDate 
                        ? new Date(coupon.expiryDate).toLocaleDateString('en-BD', { dateStyle: 'medium' }) 
                        : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono ${
                        coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) 
                          ? 'Active' 
                          : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModalCoupon(coupon)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-zinc-850">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2 font-sans tracking-tight">
                <Tag className="h-5 w-5 text-indigo-600" />
                {editingId ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Set discount value, minimum order spend constraints, and redemption limits.
              </p>
            </div>

            {/* Live Voucher Ticket Preview */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-zinc-900 to-zinc-950 text-white rounded-2xl border border-indigo-700/40 shadow-lg relative overflow-hidden font-mono">
              <div className="absolute right-3 -bottom-6 opacity-10 font-black text-7xl select-none">
                %
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">ONWEAR VOUCHER</span>
                  {firstOrderOnly && (
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-400/30">1st Order</span>
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-400">
                  {expiryDate ? `Expires: ${expiryDate}` : 'No Expiration'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black tracking-tight text-white">
                    {discountType === 'PERCENTAGE' ? `${discountValue || 0}% OFF` : `৳${discountValue || 0} OFF`}
                  </span>
                  {minPurchase > 0 && (
                    <p className="text-[10px] text-zinc-300 mt-0.5">Min. Spend: ৳{minPurchase}</p>
                  )}
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-sm font-black tracking-widest text-indigo-200">
                  {code || 'COUPONCODE'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitCoupon} className="space-y-4 font-sans">
              
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">Coupon Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-black uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-bold cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Cash (৳ Tk)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">Min Purchase (৳ Tk)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5 font-mono">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 font-sans">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstOrderOnly}
                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Valid for First Order Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Coupon is Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100 font-sans">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 text-zinc-650 font-bold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-850 text-white font-black px-6 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:bg-zinc-300"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{editingId ? 'Update Coupon' : 'Create Coupon'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={deleteModalCoupon !== null}
        onClose={() => setDeleteModalCoupon(null)}
        onConfirm={handleDeleteCouponConfirm}
        title={`Delete Coupon "${deleteModalCoupon?.code}"?`}
        description="Are you sure you want to delete this coupon? Customers will no longer be able to apply it during checkout."
        confirmText="Yes, Delete Coupon"
        cancelText="Keep Coupon"
        variant="danger"
        loading={isDeleting}
        itemPreview={
          deleteModalCoupon
            ? {
                title: deleteModalCoupon.code,
                subtitle: deleteModalCoupon.discountType === 'PERCENTAGE' ? `${deleteModalCoupon.discountValue}% Discount` : `৳${deleteModalCoupon.discountValue} Flat Off`,
                badge: deleteModalCoupon.isActive ? 'Active' : 'Inactive',
              }
            : undefined
        }
      />

    </div>
  );
}
