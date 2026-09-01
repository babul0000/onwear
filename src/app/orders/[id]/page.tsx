'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { Truck, ShoppingBag, ArrowLeft, Printer } from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { token, user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    async function loadOrder() {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [token, orderId]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm">Please log in to view this order details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Order not found</h2>
        <button onClick={() => router.push('/orders')} className="mt-4 rounded-full bg-zinc-950 px-6 py-2 text-white">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Order History</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-50 shadow-sm transition-all"
        >
          <Printer className="h-4 w-4 text-zinc-600" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Printable Invoice Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-650 tracking-widest font-mono">
              ONWEAR OFFICIAL INVOICE
            </span>
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mt-0.5">Order Receipt</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">Order #{order.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono">
              Status: {order.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider font-mono ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-medium border-b border-zinc-100 pb-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-black text-zinc-900 uppercase tracking-wider text-[11px]">Shipping To:</h3>
            <p className="text-zinc-900 font-bold text-sm">{order.user?.name}</p>
            <p className="text-zinc-500 leading-relaxed">{order.shippingAddress}</p>
            <p className="text-zinc-500 font-mono">Phone: {order.phone}</p>
            {order.email && <p className="text-zinc-500 font-mono">Email: {order.email}</p>}
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <h3 className="font-black text-zinc-900 uppercase tracking-wider text-[11px]">Order Info:</h3>
            <p className="text-zinc-500">
              Date:{' '}
              <span className="text-zinc-900 font-bold">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </p>
            {order.couponCode && (
              <p className="text-emerald-700 font-bold">Coupon: {order.couponCode.toUpperCase()}</p>
            )}
            {order.note && (
              <p className="text-zinc-400 italic text-[11px] max-w-xs mt-1">Note: {order.note}</p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h3 className="font-black text-zinc-900 uppercase tracking-wider text-xs mb-4">Purchased Items</h3>
          <div className="flex flex-col divide-y divide-zinc-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-3 flex gap-4 items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
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
                <span className="font-black text-zinc-950 font-mono text-sm">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown & Total Price */}
        <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Delivery Fee</span>
            <span className="font-mono font-bold text-zinc-800">{formatPrice(order.shippingCost || 0)}</span>
          </div>
          {order.discountApplied > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount</span>
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
  );
}

