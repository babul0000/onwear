'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { Truck, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { token, user } = useAuth();
  const [order, setOrder] = useState(null);
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Order not found</h2>
        <button onClick={() => router.push('/orders')} className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Order History</span>
        </button>
      </div>

      {/* Order Main Details Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Order Details</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">ID: {order.id}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
              Order: {order.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-bold text-zinc-900">Shipping Details</h3>
            <p className="text-zinc-600 mt-2">{order.user?.name}</p>
            <p className="text-zinc-500 mt-1">{order.shippingAddress}</p>
            <p className="text-zinc-500 mt-1">Phone: {order.phone}</p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Order Summary</h3>
            <p className="text-zinc-500 mt-2">
              Date Placed:{' '}
              <span className="text-zinc-800 font-medium">
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </p>
            <p className="text-zinc-500 mt-1">
              Payment Method: <span className="text-zinc-800 font-medium">Cash on Delivery</span>
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="border-t border-zinc-100 pt-6">
          <h3 className="font-bold text-zinc-900 mb-4">Items Ordered</h3>
          <div className="flex flex-col gap-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-zinc-400">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-zinc-950">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="border-t border-zinc-150 pt-4 flex justify-between items-baseline">
          <span className="text-base font-bold text-zinc-900">Total Paid</span>
          <span className="text-2xl font-extrabold text-indigo-600">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
