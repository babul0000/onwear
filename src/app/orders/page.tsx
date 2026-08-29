'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, ReceiptText } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function OrdersHistoryPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatusAlert, setPaymentStatusAlert] = useState<{
    status: 'success' | 'failed' | 'cancelled' | 'failed_initiation';
    orderId: string;
  } | null>(null);
  const router = useRouter();

  // Extract payment status parameters from redirect URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentParam = params.get('payment');
      const orderIdParam = params.get('orderId');
      if (paymentParam && orderIdParam) {
        setPaymentStatusAlert({
          status: paymentParam as any,
          orderId: orderIdParam
        });
        // Clear query parameters without reloading
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }
    }
  }, []);


  useEffect(() => {
    if (!token) return;

    async function loadOrders() {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm mt-2">Please log in to view your order history.</p>
        <button onClick={() => router.push('/login')} className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white">
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">My Orders</h1>
        <p className="text-sm text-zinc-500 mt-1">View and track your previous purchase history</p>
      </div>

      {paymentStatusAlert && (
        <div className={`rounded-xl border p-4 text-sm font-semibold flex flex-col gap-1.5 animate-in fade-in duration-300 ${
          paymentStatusAlert.status === 'success'
            ? 'border-green-200 bg-green-50 text-green-800'
            : paymentStatusAlert.status === 'failed'
            ? 'border-red-200 bg-red-50 text-red-800'
            : paymentStatusAlert.status === 'cancelled'
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-extrabold uppercase tracking-wide">
              {paymentStatusAlert.status === 'success' && '🎉 Payment Successful'}
              {paymentStatusAlert.status === 'failed' && '❌ Payment Failed'}
              {paymentStatusAlert.status === 'cancelled' && '⚠️ Payment Cancelled'}
              {paymentStatusAlert.status === 'failed_initiation' && '⚠️ Online Payment Failed'}
            </span>
            <button
              onClick={() => setPaymentStatusAlert(null)}
              className="text-xs font-bold hover:underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs opacity-90 font-medium">
            {paymentStatusAlert.status === 'success' && `Thank you! Your payment for Order ID: ${paymentStatusAlert.orderId} was successful and confirmed.`}
            {paymentStatusAlert.status === 'failed' && `The online payment attempt for Order ID: ${paymentStatusAlert.orderId} was unsuccessful. Please check your card/wallet details and try again.`}
            {paymentStatusAlert.status === 'cancelled' && `The payment session for Order ID: ${paymentStatusAlert.orderId} was cancelled.`}
            {paymentStatusAlert.status === 'failed_initiation' && `Your order was placed successfully (Order ID: ${paymentStatusAlert.orderId}), but we couldn't initiate the online payment gateway. You can pay or manage your order details below.`}
          </p>
        </div>
      )}


      {loading ? (
        <div className="mx-auto py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
          <div className="rounded-full bg-zinc-50 p-4 text-zinc-400 mb-4">
            <ReceiptText className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg">No orders placed yet</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Your ordered history will appear here once you place orders.</p>
          <Link href="/products" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md">
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.map((order) => {
                  const statusColors = {
                    PENDING: 'bg-zinc-50 text-zinc-700 border-zinc-200',
                    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
                    PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
                    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
                    CANCELLED: 'bg-red-50 text-red-700 border-red-200'
                  };

                  const paymentColors = {
                    UNPAID: 'bg-red-50 text-red-700 border-red-200',
                    PAID: 'bg-green-50 text-green-700 border-green-200',
                    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
                    REFUNDED: 'bg-zinc-50 text-zinc-700 border-zinc-200'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-900">{order.id}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          statusColors[order.status] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          paymentColors[order.paymentStatus] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 p-1.5"
                        >
                          <Eye className="h-4.5 w-4.5" />
                          <span className="hidden sm:inline">Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
