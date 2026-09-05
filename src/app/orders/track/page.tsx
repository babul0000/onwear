'use client';

import React, { useState } from 'react';
import { API_URL } from '../../../config';
import { formatPrice } from '../../../utils/format';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  Printer,
  ShieldCheck,
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function GuestOrderTrackPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderId.trim()) {
      setError('Please enter your Order ID.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter the mobile phone number used during checkout.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/guest-track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError(data.message || 'No matching order found. Please verify your details.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Unable to track order. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Order received & pending verification' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified and approved' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Packed and prepared for courier' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'In transit with courier partner' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Successfully handed over' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10">
      {/* Header Section */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5 text-xs font-bold text-teal-800 tracking-wider font-mono uppercase shadow-sm">
          <Package className="h-3.5 w-3.5" />
          <span>Real-time Parcel Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 uppercase tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
          Enter your Order ID and the phone number provided during checkout to track current delivery status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrackOrder} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Order ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 550e8400-e29b-41d4-a716-..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-mono font-medium"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Mobile Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-1 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold p-3.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Track</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Result Card */}
      {order && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Tracking Stepper / Status Timeline */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-650 tracking-widest font-mono">
                  Order Status
                </span>
                <h2 className="text-xl font-black text-zinc-950 uppercase tracking-tight mt-0.5">
                  #{order.id}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider font-mono ${
                  order.status === 'CANCELLED'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : order.status === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-800'
                }`}>
                  Status: {order.status}
                </span>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm print:hidden"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress */}
            {order.status === 'CANCELLED' ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
                <strong className="uppercase tracking-wider">Order Cancelled</strong>
                <p className="mt-1">Reason: {order.cancelReason || 'Cancelled upon customer request or store policy.'}</p>
              </div>
            ) : (
              <div className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative gap-2">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                            isCompleted
                              ? 'bg-zinc-950 text-white ring-4 ring-zinc-100'
                              : 'bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-5 w-5 text-teal-400" /> : idx + 1}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isCurrent ? 'text-zinc-950 font-black' : isCompleted ? 'text-zinc-700' : 'text-zinc-400'
                        }`}>
                          {step.label}
                        </span>
                        <p className="text-[10px] text-zinc-400 hidden sm:block max-w-[120px]">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Purchased Items & Delivery Summary */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h3 className="font-black text-zinc-900 border-b border-zinc-100 pb-4 text-sm uppercase tracking-wider">
              Delivery & Order Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-zinc-100 pb-5">
              <div className="flex flex-col gap-1">
                <span className="font-black uppercase text-zinc-400 text-[10px] tracking-wider">Shipping Address</span>
                <p className="text-zinc-900 font-medium leading-relaxed">{order.shippingAddress}</p>
                <p className="text-zinc-500 font-mono mt-1">Phone: {order.phone}</p>
                {order.email && <p className="text-zinc-500 font-mono">Email: {order.email}</p>}
              </div>

              <div className="flex flex-col gap-1 sm:items-end">
                <span className="font-black uppercase text-zinc-400 text-[10px] tracking-wider">Payment Information</span>
                <p className="text-zinc-800 font-bold">
                  Method: <span className="uppercase text-zinc-950">{order.paymentMethod || 'COD'}</span>
                </p>
                <p className="text-zinc-600">
                  Payment Status:{' '}
                  <span className={`font-mono font-bold ${
                    order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </p>
                {order.trxId && (
                  <p className="text-[#E2136E] font-bold font-mono">
                    TrxID: {order.trxId}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <span className="font-black text-zinc-900 uppercase tracking-wider text-xs mb-3 block">
                Items in Package ({order.items?.length || 0})
              </span>
              <div className="divide-y divide-zinc-100">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 uppercase tracking-tight">{item.productName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-zinc-400">
                          <span>{formatPrice(item.price)} × {item.quantity}</span>
                          {item.size && (
                            <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono capitalize">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-950 font-mono text-sm">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Shipping Fee</span>
                <span className="font-mono font-bold text-zinc-800">{formatPrice(order.shippingCost || 0)}</span>
              </div>
              {order.discountApplied > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span className="font-mono">- {formatPrice(order.discountApplied)}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase tracking-wider text-zinc-950">Grand Total</span>
                <span className="text-2xl font-black text-teal-650 font-mono">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
