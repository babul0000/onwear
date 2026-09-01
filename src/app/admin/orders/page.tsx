'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { ArrowLeft, ShoppingBag, Eye, X, Save, Printer } from 'lucide-react';
import { formatPrice } from '../../../utils/format';

export default function AdminOrdersPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected order details states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState('PENDING');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleSelectOrder = async (orderId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setStatus(data.data.status);
        setPaymentStatus(data.data.paymentStatus);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, paymentStatus })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Order status updated successfully!');
        setSelectedOrder(data.data);
        fetchOrders();
      } else {
        setError(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Customer Orders</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage order statuses and payment updates</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Order Details Panel */}
        {selectedOrder && (
          <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit flex flex-col gap-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Order Details</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="mr-8 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                title="Print Order Receipt"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="text-sm text-zinc-600 flex flex-col gap-3">
              <div>
                <p className="font-bold text-zinc-900">Customer Details</p>
                <p className="mt-1">{selectedOrder.user?.name}</p>
                <p className="text-xs text-zinc-400">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="font-bold text-zinc-900">Shipping Location</p>
                <p className="mt-1">{selectedOrder.shippingAddress}</p>
                <p className="mt-1 font-mono text-xs">Phone: {selectedOrder.phone}</p>
                {selectedOrder.note && (
                  <p className="mt-1 text-xs text-amber-700 italic">Note: {selectedOrder.note}</p>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <p className="font-bold text-zinc-900 text-sm mb-3">Order Items</p>
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start text-xs border-b border-zinc-50 pb-2">
                    <div className="flex flex-col flex-1 pr-2">
                      <span className="font-semibold text-zinc-800 line-clamp-1">{item.productName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400">
                        <span>Qty: {item.quantity}</span>
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
                    <span className="font-bold text-zinc-900 font-mono">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-baseline border-t border-dashed border-zinc-100 pt-3 mt-3">
                <span className="text-xs font-bold text-zinc-800">Total Paid</span>
                <span className="text-base font-extrabold text-teal-650 font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Change Status Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-zinc-100 pt-4 flex flex-col gap-4">
              <h4 className="font-bold text-zinc-900 text-sm">Update Order Status</h4>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500">Order Tracking</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-zinc-950 font-semibold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-zinc-950 font-semibold"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </form>
          </aside>
        )}

        {/* Orders Table */}
        <div className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm h-fit ${
          selectedOrder ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          {loading ? (
            <div className="p-8 text-center">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">No orders placed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-zinc-500">
                <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Payment</th>
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
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-900">{order.user?.name}</div>
                          <div className="text-xs text-zinc-400">{order.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900 font-mono">{formatPrice(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                            statusColors[order.status] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                            paymentColors[order.paymentStatus] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSelectOrder(order.id)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 p-1.5"
                          >
                            <Eye className="h-4.5 w-4.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
