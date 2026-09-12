'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { 
  ArrowLeft, 
  Eye, 
  X, 
  Save, 
  Printer, 
  Trash2, 
  RotateCcw, 
  Clock, 
  Flame, 
  ShieldAlert, 
  AlertTriangle,
  Loader2,
  PackageCheck
} from 'lucide-react';
import { formatPrice } from '../../../utils/format';

export default function AdminOrdersPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  // Selected order details states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState('PENDING');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');

  // Deletion modals state
  const [deleteModalOrder, setDeleteModalOrder] = useState<any | null>(null);
  const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders?includeDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
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
  }, [user, router]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const activeOrders = orders.filter((o) => !o.isDeleted);
  const trashedOrders = orders.filter((o) => o.isDeleted);

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

  // Perform Soft Delete (10-day trash retention)
  const handleSoftDelete = async (id: string) => {
    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Order moved to Trash. It will auto-delete in 10 days.');
        setDeleteModalOrder(null);
        if (selectedOrder?.id === id) {
          setSelectedOrder(null);
        }
        fetchOrders();
      } else {
        setError(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while deleting order');
    } finally {
      setIsDeleting(false);
    }
  };

  // Perform Permanent Hard Delete (Immediate wipe)
  const handleHardDelete = async (id: string) => {
    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/${id}?permanent=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Order permanently removed from database.');
        setDeleteModalOrder(null);
        if (selectedOrder?.id === id) {
          setSelectedOrder(null);
        }
        fetchOrders();
      } else {
        setError(data.message || 'Failed to permanently delete order');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while deleting order permanently');
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Trashed Order
  const handleRestore = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Order restored to active orders list successfully!');
        fetchOrders();
      } else {
        setError(data.message || 'Failed to restore order');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while restoring order');
    }
  };

  // Purge All Trashed Orders
  const handlePurgeAllTrash = async () => {
    setIsPurging(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/orders/purge-deleted`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('All trashed orders permanently purged from database!');
        fetchOrders();
        setShowPurgeAllModal(false);
      } else {
        setError(data.message || 'Failed to purge trash');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while purging trash');
    } finally {
      setIsPurging(false);
    }
  };

  // Calculate remaining days in trash
  const getDaysRemaining = (deletedAt: string | null, updatedAt: string, totalDays: number = 10) => {
    const dateToUse = deletedAt ? new Date(deletedAt) : new Date(updatedAt);
    const diffMs = Date.now() - dateToUse.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remaining = totalDays - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-zinc-50 text-zinc-700 border-zinc-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200'
  };

  const paymentColors: Record<string, string> = {
    UNPAID: 'bg-red-50 text-red-700 border-red-200',
    PAID: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUNDED: 'bg-zinc-50 text-zinc-700 border-zinc-200'
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950">Customer Orders</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage order statuses, 10-day trash retention, and payment updates</p>
        </div>

        {/* TABS: Active vs Trash */}
        <div className="inline-flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedOrder(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <PackageCheck className="h-4 w-4" />
            <span>Active Orders</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'active' ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-600'
            }`}>
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trash');
              setSelectedOrder(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-red-500 text-white shadow-xs'
                : 'text-zinc-500 hover:text-red-600'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>Trash (10-Day Purge)</span>
            {trashedOrders.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                activeTab === 'trash' ? 'bg-white text-red-600' : 'bg-red-100 text-red-700'
              }`}>
                {trashedOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-in fade-in">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 animate-in fade-in">
          {error}
        </div>
      )}

      {/* ACTIVE ORDERS TAB */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Order Details Panel */}
          {selectedOrder && (
            <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit flex flex-col gap-6 relative animate-fadeIn">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">Order Details</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2 mr-8">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    title="Print Order Receipt"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setDeleteModalOrder(selectedOrder)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer"
                    title="Delete this order"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
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
                  className="w-full rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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
              <div className="p-8 text-center text-sm font-semibold text-zinc-400">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">No active orders placed yet.</div>
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
                    {activeOrders.map((order) => {
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-900">{order.user?.name || 'Customer'}</div>
                            <div className="text-xs text-zinc-400">{order.user?.email || order.email || 'N/A'}</div>
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
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSelectOrder(order.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                title="View Order Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() => setDeleteModalOrder(order)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Order (Move to Trash / Permanent)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
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
      )}

      {/* TRASH TAB: 10-DAY AUTO-PURGE RETENTION */}
      {activeTab === 'trash' && (
        <div className="space-y-4">
          {/* Policy Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span>
                  <strong>10-Day Auto-Purge Policy:</strong> Trashed orders stay protected in Trash for 10 days. You can restore them anytime before they expire. After 10 days, the database permanently removes them automatically.
                </span>
              </div>
            </div>

            {trashedOrders.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPurgeAllModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer shrink-0"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Empty All Trash Now</span>
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400">Loading trash...</div>
            ) : trashedOrders.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400">
                Trash is empty! No trashed orders found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Order Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Order Status</th>
                      <th className="px-6 py-4">Auto-Purge In</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {trashedOrders.map((order) => {
                      const daysLeft = getDaysRemaining(order.deletedAt, order.updatedAt, 10);
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/60 bg-red-50/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-900">{order.user?.name || 'Customer'}</div>
                            <div className="text-[11px] text-zinc-400">{order.user?.email || order.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
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
                            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[11px] font-bold">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>{daysLeft} days left</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleRestore(order.id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Restore Order"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Restore</span>
                              </button>

                              <button
                                onClick={() => handleHardDelete(order.id)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Permanently Delete Now"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Forever</span>
                              </button>
                            </div>
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
      )}

      {/* DUAL DELETE CONFIRMATION MODAL */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 text-zinc-850">
            <button
              onClick={() => setDeleteModalOrder(null)}
              className="absolute right-5 top-5 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold mb-2.5 border border-red-200/60 font-mono">
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                <span>Delete Order Options</span>
              </div>
              <h2 className="text-lg font-black text-zinc-950 font-sans tracking-tight">How would you like to delete this order?</h2>
            </div>

            {/* Order Item Preview */}
            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-900">{deleteModalOrder.user?.name || 'Customer Order'}</span>
                <span className="font-bold text-zinc-900 font-mono">{formatPrice(deleteModalOrder.totalAmount)}</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
                <span>ID: {deleteModalOrder.id.slice(0, 8)}...</span>
                <span>•</span>
                <span>Status: {deleteModalOrder.status}</span>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5 font-sans">
              {/* Option 1: Soft Delete (Trash - 10 Days) */}
              <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 transition-all flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                    <Clock className="h-4.5 w-4.5 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-zinc-900">Move to Trash (10-Day Auto-Purge)</h4>
                      <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded font-mono">Recommended</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                      Hides order from active list immediately. Protected in <strong>Trash</strong> for 10 days with 1-click restore before auto-deletion.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleSoftDelete(deleteModalOrder.id)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                  <span>Move to Trash</span>
                </button>
              </div>

              {/* Option 2: Hard Delete (Permanent Wipe) */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-red-50/30 transition-all flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-zinc-200/80 text-zinc-700 rounded-xl flex-shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-zinc-900">Delete Permanently</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                      Instantly and permanently purges the order and receipt records from the database. <strong>Cannot be undone.</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleHardDelete(deleteModalOrder.id)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Permanently Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURGE ALL TRASH CONFIRMATION MODAL */}
      {showPurgeAllModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPurgeAllModal(false)}
              className="absolute right-5 top-5 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-3.5 bg-red-100/70 text-red-700 rounded-2xl w-fit">
              <Flame className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-950">Empty Entire Trash?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">
                Are you sure you want to permanently delete all <strong>{trashedOrders.length}</strong> trashed orders? This action will permanently remove all related order records and cannot be recovered.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeAllModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handlePurgeAllTrash}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isPurging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Wipe All Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
