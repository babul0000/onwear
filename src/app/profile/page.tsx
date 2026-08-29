'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import { formatPrice } from '../../utils/format';
import Link from 'next/link';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Save,
  ShoppingBag,
  Heart,
  Trash2,
  ReceiptText,
  Clock,
  CreditCard,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Grid,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ProfilePage() {
  const { token, user, updateProfile, logout } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const router = useRouter();

  // Tab State: 'overview' | 'orders' | 'wishlist' | 'profile'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'profile'>('overview');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Payment State
  const [initiatingPaymentId, setInitiatingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');

  // Set Profile fields
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load Orders
  useEffect(() => {
    if (!token) return;

    async function fetchOrders() {
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
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [token]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-zinc-100 p-6 text-zinc-400">
          <User className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm max-w-xs">Please log in to view your profile dashboard.</p>
        <button onClick={() => router.push('/login')} className="mt-4 rounded-full bg-zinc-950 px-8 py-3 font-semibold text-white hover:bg-zinc-800 transition-colors shadow-md">
          Log In
        </button>
      </div>
    );
  }

  // Handle Profile Update Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const res = await updateProfile(name, phone, address);
      if (res.success) {
        setProfileMessage('Profile updated successfully!');
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileError('An error occurred while updating profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle inline SSLCommerz payment initiation
  const handlePaymentInitiate = async (orderId: string) => {
    setInitiatingPaymentId(orderId);
    setPaymentError('');
    try {
      const res = await fetch(`${API_URL}/payments/sslcommerz/initiate/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data.gatewayUrl) {
        window.location.href = data.data.gatewayUrl;
      } else {
        setPaymentError(data.message || 'Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setPaymentError('An error occurred while connecting to payment gateway.');
    } finally {
      setInitiatingPaymentId(null);
    }
  };

  // Move wishlist item to cart
  const handleMoveToCart = async (productId: string) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      await removeFromWishlist(productId);
    }
  };

  // Wishlist items list
  const wishlistItems = wishlist?.items || [];

  // Active status color helper
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
      PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
      SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      DELIVERED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
  };

  // Payment status color helper
  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      UNPAID: 'bg-red-50 text-red-700 border-red-200',
      PAID: 'bg-green-50 text-green-700 border-green-200',
      FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
      REFUNDED: 'bg-zinc-100 text-zinc-700 border-zinc-200'
    };
    return colors[status] || 'bg-zinc-50 text-zinc-700 border-zinc-200';
  };

  // Find most recent order for overview tab
  const recentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 text-zinc-800">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase">Account Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage orders, wishlist, and update profile settings</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-1">
          {/* User Quick Info */}
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-2 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-zinc-950 line-clamp-1 text-sm">{user.name}</h4>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => { setActiveTab('overview'); setSelectedOrderId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'overview' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'orders' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <ReceiptText className="h-4 w-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('wishlist'); setSelectedOrderId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'wishlist' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>My Wishlist ({wishlistItems.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'profile' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Settings</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all text-left mt-4 border-t border-zinc-100 pt-4"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Dashboard Content Container */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {paymentError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex justify-between items-center animate-in slide-in-from-top duration-300">
              <span>⚠️ {paymentError}</span>
              <button onClick={() => setPaymentError('')} className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ==================== TAB: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Premium Welcome Header Card */}
              <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 text-white shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
                  <ShoppingBag className="h-60 w-60" />
                </div>
                <div className="flex flex-col gap-1.5 z-10">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Customer Portal</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Welcome back, {user.name}!</h2>
                  <p className="text-xs text-zinc-400 font-medium max-w-md">Track orders, manage shipping endpoints, and manage items in your wishlist.</p>
                </div>
                <div className="text-[10px] text-zinc-400 font-bold mt-4 z-10 border-t border-white/10 pt-4">
                  Account registration ID: {user.email}
                </div>
              </div>

              {/* Stats Widget Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-1.5 hover:border-zinc-300 transition-colors">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Purchase Summary</span>
                  <span className="text-3xl font-black text-zinc-950">{orders.length}</span>
                  <p className="text-xs text-zinc-400 font-medium">Orders placed in your account</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-1.5 hover:border-zinc-300 transition-colors">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Saved For Later</span>
                  <span className="text-3xl font-black text-zinc-950">{wishlistItems.length}</span>
                  <p className="text-xs text-zinc-400 font-medium">Items waiting in wishlist</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-1.5 hover:border-zinc-300 transition-colors">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Account Level</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <UserCheck className="h-5 w-5 text-zinc-900" />
                    <span className="text-base font-black text-zinc-950 uppercase">{user.role}</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Standard Shopping Account</p>
                </div>
              </div>

              {/* Two Column Layout: Recent Order & Quick Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Order Widget */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-tight">Recent Order</h3>
                    {recentOrder && (
                      <button
                        onClick={() => { setActiveTab('orders'); setSelectedOrderId(recentOrder.id); }}
                        className="text-[10px] font-bold text-zinc-450 hover:underline uppercase"
                      >
                        Detail
                      </button>
                    )}
                  </div>

                  {recentOrder ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-zinc-400 font-bold">ID: {recentOrder.id.slice(0, 8)}...</span>
                        <span className="text-zinc-500 font-bold">
                          {new Date(recentOrder.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500 font-medium">Grand Total</span>
                        <span className="text-xl font-black text-zinc-950">{formatPrice(recentOrder.totalAmount)}</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">Order Status</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${getStatusColor(recentOrder.status)}`}>
                            {recentOrder.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">Payment Status</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${getPaymentStatusColor(recentOrder.paymentStatus)}`}>
                            {recentOrder.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {recentOrder.paymentStatus === 'UNPAID' && recentOrder.status === 'PENDING' && (
                        <button
                          onClick={() => handlePaymentInitiate(recentOrder.id)}
                          disabled={initiatingPaymentId === recentOrder.id}
                          className="w-full mt-2 rounded-xl bg-zinc-950 py-2.5 text-center text-xs font-black uppercase text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-200 disabled:text-zinc-400"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{initiatingPaymentId === recentOrder.id ? 'Initiating...' : 'Pay Online Now'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 flex flex-col items-center gap-2">
                      <ReceiptText className="h-8 w-8 text-zinc-300" />
                      <p className="text-xs font-semibold">No orders placed yet.</p>
                      <Link href="/products" className="text-xs font-black uppercase text-zinc-950 hover:underline mt-2">
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Profile Summary */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-tight">Delivery Address</h3>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-[10px] font-bold text-zinc-450 hover:underline uppercase"
                    >
                      Update
                    </button>
                  </div>

                  <div className="flex flex-col gap-3.5 text-xs text-zinc-600 font-medium">
                    <div className="flex gap-2.5 items-start">
                      <User className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Contact Person</p>
                        <p className="text-zinc-900 font-bold mt-0.5">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Phone className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Phone Number</p>
                        <p className="text-zinc-900 font-bold mt-0.5">{user.phone || 'Not provided yet'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Shipping Destination</p>
                        <p className="text-zinc-900 font-bold mt-0.5 leading-relaxed">{user.address || 'No shipping address set yet. Update profile settings to configure.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-zinc-950 text-lg border-b border-zinc-100 pb-3">Order History</h3>

              {loadingOrders ? (
                <div className="py-20 text-center flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
                  <ReceiptText className="h-8 w-8 text-zinc-400 mb-2" />
                  <h4 className="font-bold text-zinc-800 text-sm">No orders found</h4>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">You have not placed any orders yet.</p>
                  <Link href="/products" className="rounded-full bg-zinc-950 px-6 py-2 text-xs font-bold text-white uppercase shadow-sm">
                    Go Shopping
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => {
                    const isExpanded = selectedOrderId === order.id;
                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm transition-all hover:border-zinc-300`}
                      >
                        {/* Summary Header */}
                        <div
                          onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 text-xs font-semibold">
                            <div>
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Order ID</p>
                              <p className="font-mono font-bold text-zinc-900 mt-0.5">{order.id.slice(0, 8)}...</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Date</p>
                              <p className="text-zinc-600 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Grand Total</p>
                              <p className="font-black text-zinc-950 mt-0.5">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-3 border-t border-zinc-50 pt-3 md:border-0 md:pt-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                          </div>
                        </div>

                        {/* Inline Detail Section */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-zinc-100 bg-zinc-50/20 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
                            {/* Products summary */}
                            <div className="flex flex-col gap-3">
                              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-100 pb-1.5">Items Ordered</h4>
                              <div className="flex flex-col gap-3.5">
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className="flex justify-between items-center text-xs font-semibold">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 bg-zinc-100 rounded-lg border border-zinc-200 overflow-hidden flex items-center justify-center">
                                        <ShoppingBag className="h-4 w-4 text-zinc-400" />
                                      </div>
                                      <div>
                                        <p className="text-zinc-900 font-bold line-clamp-1">{item.productName}</p>
                                        <p className="text-zinc-400 text-[10px] font-bold mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                      </div>
                                    </div>
                                    <span className="text-zinc-950 font-bold">{formatPrice(item.subtotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Summary Invoice & Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 pt-4 items-start">
                              {/* Left: Shipping destination details */}
                              <div className="flex flex-col gap-3 text-xs">
                                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Shipping Details</h4>
                                <div className="flex flex-col gap-1.5 font-medium text-zinc-600">
                                  <p><strong className="text-zinc-900 font-bold">Contact Phone:</strong> {order.phone}</p>
                                  <p><strong className="text-zinc-900 font-bold">Destination Address:</strong> {order.shippingAddress}</p>
                                  {order.note && <p><strong className="text-zinc-900 font-bold">Note:</strong> "{order.note}"</p>}
                                </div>
                              </div>

                              {/* Right: Payment details & actions */}
                              <div className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-100 pb-1">Cost Summary</h4>
                                <div className="flex flex-col gap-1.5 text-xs font-medium text-zinc-500">
                                  <div className="flex justify-between">
                                    <span>Discount Applied</span>
                                    <span>-{formatPrice(order.discountApplied || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Shipping Delivery Cost</span>
                                    <span>{formatPrice(order.shippingCost || 0)}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-950 font-black text-sm pt-2 border-t border-dashed border-zinc-200">
                                    <span>Grand Total</span>
                                    <span>{formatPrice(order.totalAmount)}</span>
                                  </div>
                                </div>

                                {/* Active payment actions */}
                                {order.paymentStatus === 'UNPAID' && order.status === 'PENDING' && (
                                  <button
                                    onClick={() => handlePaymentInitiate(order.id)}
                                    disabled={initiatingPaymentId === order.id}
                                    className="w-full rounded-xl bg-zinc-950 py-3 text-center text-xs font-black uppercase text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-200 disabled:text-zinc-400 shadow-sm mt-2"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    <span>{initiatingPaymentId === order.id ? 'Connecting Gateway...' : 'Pay Online via SSLCommerz'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: WISHLIST ==================== */}
          {activeTab === 'wishlist' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-zinc-950 text-lg border-b border-zinc-100 pb-3">My Wishlist</h3>

              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
                  <Heart className="h-8 w-8 text-zinc-400 mb-2 animate-pulse" />
                  <h4 className="font-bold text-zinc-800 text-sm">Your wishlist is empty</h4>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">Explore our catalog and click the heart icon to save products.</p>
                  <Link href="/products" className="rounded-full bg-zinc-950 px-6 py-2 text-xs font-bold text-white uppercase shadow-sm">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {wishlistItems.map((item: any) => {
                    const discount = item.product.discountPrice !== null;
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromWishlist(item.product.id)}
                          className="absolute right-6 top-6 z-10 p-1.5 rounded-full shadow-sm border border-zinc-100 bg-white hover:text-red-500 hover:scale-105 transition-all text-zinc-400"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <Link href={`/products/${item.product.id}`} className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100 block">
                          <img
                            src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                            alt={item.product.name}
                            className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </Link>

                        <div className="mt-3 flex flex-col flex-1">
                          <Link href={`/products/${item.product.id}`} className="font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors text-xs line-clamp-1 block">
                            {item.product.name}
                          </Link>

                          <div className="mt-1 flex items-baseline gap-1.5 text-xs font-bold">
                            {discount ? (
                              <>
                                <span className="text-zinc-950">{formatPrice(item.product.discountPrice)}</span>
                                <span className="text-[10px] text-zinc-400 line-through font-medium">{formatPrice(item.product.price)}</span>
                              </>
                            ) : (
                              <span className="text-zinc-950">{formatPrice(item.product.price)}</span>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-zinc-100">
                            <button
                              onClick={() => handleMoveToCart(item.product.id)}
                              disabled={item.product.stock === 0}
                              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-1.5 text-xs font-black uppercase text-white hover:bg-zinc-800 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>{item.product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: PROFILE EDIT ==================== */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h3 className="font-bold text-zinc-950 text-lg border-b border-zinc-100 pb-3">Update Profile</h3>

              {profileMessage && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs font-bold text-green-700 animate-in slide-in-from-top duration-300">
                  ✓ {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 animate-in slide-in-from-top duration-300">
                  ⚠️ {profileError}
                </div>
              )}

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                  {/* Email (Read Only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Account Email ID (Read-only)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed font-semibold"
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-semibold"
                      placeholder="e.g. 017xxxxxxxx"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Default Shipping Address</span>
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 resize-none font-semibold"
                      placeholder="Street Address, City, Postal Code"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="w-full rounded-full bg-zinc-950 py-3.5 text-xs font-black uppercase text-white hover:bg-zinc-800 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-2 mt-2"
                  >
                    <Save className="h-4.5 w-4.5" />
                    <span>{loadingProfile ? 'Saving Updates...' : 'Save Profile Details'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

