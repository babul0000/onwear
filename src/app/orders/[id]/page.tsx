'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../../../utils/format';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { ShoppingBag, ArrowLeft, Printer, Loader2, X, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../../components/ConfirmModal';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { token, user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered wrong size');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setShowCancelModal(false);
      } else {
        setCancelError(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      setCancelError('Error cancelling order. Try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        router.push('/orders');
      } else {
        alert(data.message || 'Failed to delete order from history');
      }
    } catch (err) {
      console.error('Delete order error:', err);
      alert('Error deleting order. Try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!token || !user) {
    return (
      <div className="w-full px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm">Please log in to view this order details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-20 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Order not found</h2>
        <button onClick={() => router.push('/orders')} className="mt-4 rounded-full bg-zinc-950 px-6 py-2 text-white cursor-pointer">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Order History</span>
        </button>

        <div className="flex items-center gap-3">
          {order.status === 'PENDING' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-all uppercase tracking-wider cursor-pointer shadow-xs"
            >
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-zinc-600" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Cancellation Notice Banner */}
      {order.status === 'CANCELLED' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-wider">Order Cancelled</span>
            <p>Reason: {order.cancelReason || 'Order was cancelled by customer.'}</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-center border border-red-300 bg-white hover:bg-red-50 text-red-700 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete from History</span>
          </button>
        </div>
      )}

      {/* Printable Invoice Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-650 tracking-widest font-mono">
              ONWEAR OFFICIAL INVOICE
            </span>
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mt-0.5">Order Receipt</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">Order #{order.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider font-mono ${
              order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-800'
            }`}>
              Status: {order.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider font-mono ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Shipping details & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-medium border-b border-zinc-100 pb-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-black text-zinc-900 uppercase tracking-wider text-[11px]">Shipping To:</h3>
            <p className="text-zinc-900 font-bold text-sm">{order.user?.name}</p>
            <p className="text-zinc-500 leading-relaxed">{order.shippingAddress}</p>
            <p className="text-zinc-500 font-mono">Phone: {order.phone}</p>
            {order.email && <p className="text-zinc-500 font-mono">Email: {order.email}</p>}
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <h3 className="font-black text-zinc-900 uppercase tracking-wider text-[11px]">Order & Payment Info:</h3>
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
            <p className="text-zinc-600">
              Method: <strong className="text-zinc-950 uppercase">{order.paymentMethod || 'COD'}</strong>
            </p>
            {order.trxId && (
              <p className="text-[#E2136E] font-bold font-mono">
                TrxID: {order.trxId} {order.paymentPhone ? `(${order.paymentPhone})` : ''}
              </p>
            )}
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
            <span className="text-2xl font-black text-zinc-950 font-mono">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-md rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative"
            >
              <button
                onClick={() => !cancelling && setShowCancelModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">Cancel This Order?</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Are you sure you want to cancel Order <span className="font-mono font-bold text-zinc-800">#{order.id.slice(0, 8).toUpperCase()}</span>? Reserved inventory will be returned to stock.
                </p>
              </div>

              {cancelError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-red-700 font-medium">
                  {cancelError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all cursor-pointer"
                >
                  <option value="Ordered wrong size">Ordered wrong size / need to change size</option>
                  <option value="Need to change delivery address">Need to change delivery address or phone</option>
                  <option value="Placed duplicate order">Placed duplicate order by mistake</option>
                  <option value="Delivery time too long">Delivery time too long</option>
                  <option value="Changed mind">Changed mind</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-extrabold py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancel'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete from History Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDeleteOrder}
        title="Delete Order from History?"
        description={`Are you sure you want to permanently delete cancelled order #${order.id.slice(0, 8).toUpperCase()} from your order history?`}
        confirmText="Delete from History"
        cancelText="Keep in History"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
