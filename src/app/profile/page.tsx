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
  Plus,
  Edit2,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Status tracking constants
const STAGES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STAGE_LABELS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export default function ProfilePage() {
  const { token, user, updateProfile, logout } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const router = useRouter();

  // Tab State: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile'>('overview');

  // Customer Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Modal/Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressZone, setAddressZone] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>('INSIDE_DHAKA');
  const [addressDefault, setAddressDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [smsPref, setSmsPref] = useState(true); // default SMS preference checked
  const [emailPref, setEmailPref] = useState(false);

  // Guest Mode Tracking States
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestPhone, setGuestPhone] = useState('');
  const [guestOrderId, setGuestOrderId] = useState('');
  const [guestOrders, setGuestOrders] = useState<any[]>([]);
  const [loadingGuestOrders, setLoadingGuestOrders] = useState(false);
  const [guestError, setGuestError] = useState('');

  // General State
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [initiatingPaymentId, setInitiatingPaymentId] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState('');

  const handleCancelOrder = async (orderId: string, reason: string = 'Cancelled by customer') => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED', cancelReason: reason } : o))
        );
      } else {
        setDashboardError(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      setDashboardError('Error cancelling order. Try again.');
    }
  };

  // Pre-fill profile
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddressLine(user.address || '');
    }
  }, [user]);

  // Load Logged-in Customer Data
  useEffect(() => {
    if (!token) return;

    async function loadDashboardData() {
      // 1. Fetch Orders
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

      // 2. Fetch Addresses
      try {
        const res = await fetch(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAddresses(data.data);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadDashboardData();
  }, [token]);

  // Total Spent & Tier calculations
  const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const loyaltyTier = totalSpent >= 5000 ? 'GOLD TIER' : 'SILVER TIER';
  const tierProgressText = totalSpent >= 5000 ? 'Highest Level Achieved' : `${formatPrice(Math.max(0, 5000 - totalSpent))} to Gold`;

  // Handle Address Submit (Create or Update)
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    if (!addressName || !addressPhone || !addressLine) {
      setAddressError('Please fill out all address fields.');
      return;
    }

    const payload = {
      label: addressLabel,
      name: addressName,
      phone: addressPhone,
      line: addressLine,
      zone: addressZone,
      isDefault: addressDefault
    };

    const url = editingAddressId ? `${API_URL}/addresses/${editingAddressId}` : `${API_URL}/addresses`;
    const method = editingAddressId ? 'PUT' : 'POST';

    try {
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
        // Refresh address list
        const listRes = await fetch(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (listData.success) {
          setAddresses(listData.data);
        }
        // Reset form
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressLabel('Home');
        setAddressName(user?.name || '');
        setAddressPhone(user?.phone || '');
        setAddressLine('');
        setAddressZone('INSIDE_DHAKA');
        setAddressDefault(false);
      } else {
        setAddressError(data.message || 'Error saving address.');
      }
    } catch (err) {
      console.error(err);
      setAddressError('An error occurred while saving the address.');
    }
  };

  // Open Edit Address Form
  const openEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressName(addr.name);
    setAddressPhone(addr.phone);
    setAddressLine(addr.line);
    setAddressZone(addr.zone);
    setAddressDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.filter(a => a.id !== id));
        // Refresh to check if default flipped
        const listRes = await fetch(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (listData.success) {
          setAddresses(listData.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Profile Form Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const res = await updateProfile(name, phone, addressLine);
      if (res.success) {
        setProfileMessage('Account settings updated successfully!');
      } else {
        setProfileError(res.message || 'Failed to update settings.');
      }
    } catch (err) {
      console.error(err);
      setProfileError('An error occurred while saving details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle Online Payment Retry
  const handlePaymentInitiate = async (orderId: string) => {
    setInitiatingPaymentId(orderId);
    setDashboardError('');
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
        setDashboardError(data.message || 'Failed to connect to gateway.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setDashboardError('Failed to initiate online payment.');
    } finally {
      setInitiatingPaymentId(null);
    }
  };

  // Guest Mode tracking submit
  const handleGuestTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');
    setGuestOrders([]);
    if (!guestPhone) {
      setGuestError('Please enter your phone number.');
      return;
    }

    setLoadingGuestOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders/guest-track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: guestPhone,
          orderId: guestOrderId || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setGuestOrders(data.data);
        if (data.data.length === 0) {
          setGuestError('No orders found matching the criteria.');
        }
      } else {
        setGuestError(data.message || 'Tracking failed.');
      }
    } catch (err) {
      console.error(err);
      setGuestError('Connection error occurred while tracking.');
    } finally {
      setLoadingGuestOrders(false);
    }
  };

  // Render the stitch progress bar stepper (Core visual signature)
  const renderStitchStepper = (status: string) => {
    const currentIndex = STAGES.indexOf(status);
    const activeIndex = status === 'CANCELLED' ? 0 : currentIndex;
    const progressPercent = activeIndex === -1 ? 0 : (activeIndex / (STAGES.length - 1)) * 100;

    return (
      <div className="relative flex flex-col w-full my-6 select-none stitch-transition">
        {/* Repeating dashed thread lines */}
        <div className="absolute top-[5px] left-0 right-0 h-[2px] stitch-line pointer-events-none" />
        <div
          className="absolute top-[5px] left-0 h-[2px] stitch-line-active pointer-events-none transition-all duration-500 stitch-transition"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Stepper markers */}
        <div className="flex justify-between items-center relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            return (
              <div key={stage} className="flex flex-col items-center w-10 shrink-0">
                <div
                  className={`w-2.5 h-2.5 rotate-45 border stitch-transition transition-all duration-500 ${
                    isCompleted
                      ? 'bg-indigo border-indigo'
                      : 'bg-panel border-line'
                  }`}
                />
                <span className={`text-[8px] font-mono mt-3 uppercase tracking-wider font-semibold ${
                  isCompleted ? 'text-indigo font-bold' : 'text-muted'
                }`}>
                  {STAGE_LABELS[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      PENDING: 'bg-canvas text-ink border-line',
      CONFIRMED: 'bg-indigo/5 text-indigo border-indigo/20',
      PROCESSING: 'bg-ochre/5 text-ochre border-ochre/20',
      SHIPPED: 'bg-indigo/10 text-indigo border-indigo/35',
      DELIVERED: 'bg-green/10 text-green border-green/20',
      CANCELLED: 'bg-thread/5 text-thread border-thread/20'
    };
    return colors[status] || 'bg-canvas text-ink border-line';
  };

  // Payment status color helper
  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      UNPAID: 'bg-thread/5 text-thread border-thread/25',
      PAID: 'bg-green/10 text-green border-green/25',
      FAILED: 'bg-thread/10 text-thread border-thread/30',
      REFUNDED: 'bg-canvas text-muted border-line'
    };
    return colors[status] || 'bg-canvas text-ink border-line';
  };

  // Render guest orders or login view
  if (!token || !user) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 w-full text-ink selection:bg-indigo/10 selection:text-indigo">
        {isGuestMode ? (
          /* ==================== GUEST LITE ORDERS VIEW ==================== */
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-ochre tracking-widest">Guest Tracking</span>
                <h2 className="text-3xl font-display text-ink font-bold mt-1">Order Tracking</h2>
              </div>
              <button
                onClick={() => { setIsGuestMode(false); setGuestOrders([]); setGuestError(''); }}
                className="text-xs font-mono font-black uppercase text-indigo hover:underline border border-line px-4 py-2 bg-panel rounded-[4px]"
              >
                Sign In
              </button>
            </div>

            {guestError && (
              <div className="border border-thread/20 bg-thread/5 p-4 text-xs font-mono font-bold text-thread rounded-[4px]">
                ⚠️ {guestError}
              </div>
            )}

            {guestOrders.length === 0 ? (
              <form onSubmit={handleGuestTrackSubmit} className="border border-line bg-panel p-6 flex flex-col gap-4 rounded-[4px]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 017xxxxxxxx"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-mono rounded-[4px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="UUID or Order Number"
                    value={guestOrderId}
                    onChange={(e) => setGuestOrderId(e.target.value)}
                    className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-mono rounded-[4px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingGuestOrders}
                  className="rounded-[4px] bg-indigo py-3 text-center text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors disabled:bg-line disabled:text-muted"
                >
                  {loadingGuestOrders ? 'Searching...' : 'Track Orders'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs text-muted font-mono uppercase tracking-wider">{guestOrders.length} Guest Order(s) Found</p>
                  <button onClick={() => setGuestOrders([])} className="text-xs font-mono font-black text-indigo hover:underline">
                    New Tracking Request
                  </button>
                </div>

                {guestOrders.map((order) => (
                  <div key={order.id} className="border border-line bg-panel p-6 rounded-[4px] flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-line pb-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-muted uppercase">Guest Order ID</span>
                        <p className="font-mono text-xs font-bold text-ink">{order.id}</p>
                      </div>
                      <span className="border border-line px-3 py-1 bg-canvas rounded-[4px] text-xs font-mono font-bold uppercase tracking-wider">
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    {renderStitchStepper(order.status)}

                    <div className="mt-2 text-xs font-mono text-muted flex flex-col gap-1.5">
                      <p><strong className="text-ink">Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><strong className="text-ink">Shipping Address:</strong> {order.shippingAddress}</p>
                      <p><strong className="text-ink">Total Amount:</strong> {formatPrice(order.totalAmount)}</p>
                    </div>

                    <div className="border-t border-line pt-3 mt-1 flex flex-col gap-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs font-medium">
                          <span>{item.productName} (x{item.quantity})</span>
                          <span>{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ==================== DENIED LOGIN FLOW ==================== */
          <div className="border border-line bg-panel p-8 md:p-12 text-center rounded-[4px] flex flex-col items-center gap-6 animate-fadeIn max-w-2xl mx-auto">
            <span className="text-[10px] font-mono font-black uppercase text-ochre tracking-widest">Access Denied</span>
            <h2 className="text-3xl font-display text-ink font-bold leading-tight">Please Sign In</h2>
            <p className="text-sm text-muted max-w-md font-sans leading-relaxed">Please log in to your account to visit the ONWEAR customer portal or track your order with your guest checkout tracking ID.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm mt-2">
              <Link href="/login" className="flex-1 rounded-[4px] bg-indigo py-3 text-center text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors">
                Sign In / Login
              </Link>
              <button
                onClick={() => setIsGuestMode(true)}
                className="flex-1 border border-line rounded-[4px] py-3 text-center text-xs font-mono font-black uppercase text-ink hover:bg-canvas transition-colors bg-white"
              >
                Track Guest Order
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Find default address to display on overview
  const defaultAddress = addresses.find(a => a.isDefault);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 text-ink selection:bg-indigo/10 selection:text-indigo">
      {/* Title */}
      <div className="border-b border-line pb-4 flex justify-between items-baseline">
        <div>
          <span className="text-[10px] font-mono font-black uppercase text-ochre tracking-widest">ONWEAR Portal</span>
          <h1 className="text-3xl font-display text-ink font-bold mt-1">Customer Dashboard</h1>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 border border-line px-3 py-1.5 rounded-[4px] text-xs font-mono font-bold text-thread hover:bg-red-50/50 bg-panel transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Navigation Sidebar (Desktop Sidebar Nav - Fixed Width 224px) */}
        <div className="hidden lg:flex flex-col gap-1 border border-line bg-panel p-3 rounded-[4px] w-full lg:w-56 shrink-0">
          {/* User Quick Info */}
          <div className="flex items-center gap-3 border-b border-line pb-4 mb-2 px-2 pt-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-line bg-canvas text-ink font-mono font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4 className="font-bold text-ink text-sm font-sans line-clamp-1">{user.name}</h4>
              <span className="text-[9px] font-mono font-black uppercase text-muted tracking-wider">
                {loyaltyTier}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-mono font-black uppercase tracking-wider text-left transition-all ${
              activeTab === 'overview' ? 'bg-indigo text-white' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span>Overview</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-mono font-black uppercase tracking-wider text-left transition-all ${
              activeTab === 'orders' ? 'bg-indigo text-white' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span>My Orders ({orders.length})</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-mono font-black uppercase tracking-wider text-left transition-all ${
              activeTab === 'wishlist' ? 'bg-indigo text-white' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span>Wishlist ({wishlistItems.length})</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-mono font-black uppercase tracking-wider text-left transition-all ${
              activeTab === 'addresses' ? 'bg-indigo text-white' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span>Saved Addresses ({addresses.length})</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-mono font-black uppercase tracking-wider text-left transition-all ${
              activeTab === 'profile' ? 'bg-indigo text-white' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span>Profile Settings</span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>
        </div>

        {/* Dashboard Content Container */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {dashboardError && (
            <div className="rounded-[4px] border border-thread/20 bg-thread/5 p-4 text-xs font-mono font-bold text-thread flex justify-between items-center animate-in slide-in-from-top duration-300">
              <span>⚠️ {dashboardError}</span>
              <button onClick={() => setDashboardError('')} className="text-thread hover:opacity-80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ==================== TAB: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Bangladeshi + English greeting card */}
              <div className="border border-line bg-panel p-6 rounded-[4px] flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] font-mono font-black uppercase text-ochre tracking-widest">Welcome Back</span>
                <h2 className="text-3xl font-display text-ink font-bold mt-1">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-xs text-muted font-sans font-medium mt-1">Manage clothing orders, saved products, and verify delivery updates.</p>
              </div>

              {/* Stat Cards Grid (Mono layout) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Total Orders</span>
                  <span className="text-4xl font-display font-bold text-ink">{orders.length}</span>
                  <span className="text-[10px] font-mono uppercase text-muted mt-1 font-bold">OW Shopping History</span>
                </div>
                <div className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Wishlist Count</span>
                  <span className="text-4xl font-display font-bold text-ink">{wishlistItems.length}</span>
                  <span className="text-[10px] font-mono uppercase text-muted mt-1 font-bold">Saved Clothing Items</span>
                </div>
                <div className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Account Level</span>
                  <span className="text-xl font-display font-bold text-ink mt-2.5 tracking-tight">{loyaltyTier}</span>
                  <span className="text-[10px] font-mono uppercase text-ochre mt-1 font-black tracking-wider">{tierProgressText}</span>
                </div>
              </div>

              {/* Columns: Recent Orders & Shipping Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders Overview */}
                <div className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-line pb-2.5">
                    <h3 className="font-mono text-[10px] font-black uppercase text-ink tracking-widest">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] font-mono font-black uppercase text-indigo hover:underline">
                      See All
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="border-b border-line pb-3 last:border-0 last:pb-0 text-xs font-mono flex flex-col gap-2">
                          <div className="flex justify-between text-muted">
                            <span className="font-bold text-ink">ID: {order.id.slice(0, 8)}...</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-0.5">
                            <span className="text-muted font-sans font-medium">Grand Total</span>
                            <span className="text-base font-display font-bold text-ink">{formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold mt-1">
                            <span className={`border px-2 py-0.5 uppercase tracking-wider rounded-[4px] ${getStatusColor(order.status)}`}>
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                            <span className={`border px-2 py-0.5 uppercase tracking-wider rounded-[4px] ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted font-mono flex flex-col items-center gap-1.5">
                      <ReceiptText className="h-6 w-6 text-line" />
                      <p className="text-[10px] uppercase font-bold">No orders placed.</p>
                      <Link href="/products" className="text-[10px] font-black uppercase text-indigo hover:underline mt-1.5">
                        Shop Catalog
                      </Link>
                    </div>
                  )}
                </div>

                {/* Shipping Default Address */}
                <div className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-line pb-2.5">
                    <h3 className="font-mono text-[10px] font-black uppercase text-ink tracking-widest">Primary Shipping</h3>
                    <button onClick={() => setActiveTab('addresses')} className="text-[10px] font-mono font-black uppercase text-indigo hover:underline">
                      Manage
                    </button>
                  </div>

                  {defaultAddress ? (
                    <div className="text-xs flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-black uppercase text-ochre tracking-wider border border-line bg-canvas px-2.5 py-0.5 rounded-[4px]">
                          {defaultAddress.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted font-bold">Default Destination</span>
                      </div>
                      <div className="font-sans text-muted font-medium flex flex-col gap-1.5 mt-1">
                        <p><strong className="text-ink font-semibold">Recipient:</strong> {defaultAddress.name}</p>
                        <p><strong className="text-ink font-semibold">Contact Phone:</strong> {defaultAddress.phone}</p>
                        <p><strong className="text-ink font-semibold">Shipping Destination:</strong> {defaultAddress.line} ({defaultAddress.zone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka'})</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted font-mono flex flex-col items-center gap-1.5">
                      <MapPin className="h-6 w-6 text-line" />
                      <p className="text-[10px] uppercase font-bold">No default address found.</p>
                      <button onClick={() => setActiveTab('addresses')} className="text-[10px] font-black uppercase text-indigo hover:underline mt-1.5">
                        Add Shipping Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: MY ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="font-display font-bold text-ink text-xl border-b border-line pb-3">Order History</h3>

              {loadingOrders ? (
                <div className="py-20 text-center flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-indigo"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-line bg-panel p-12 text-center rounded-[4px] flex flex-col items-center gap-3">
                  <ReceiptText className="h-8 w-8 text-line" />
                  <h4 className="font-display font-bold text-sm text-ink">No Orders Found</h4>
                  <p className="text-xs text-muted max-w-xs font-sans">You haven't placed any orders yet. Browse our latest collection to get started.</p>
                  <Link href="/products" className="mt-2 border border-line bg-white hover:bg-canvas px-6 py-2 rounded-[4px] text-xs font-mono font-black uppercase text-ink">
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const canCancel = order.cancellable && order.status === 'PENDING';
                    return (
                      <div key={order.id} className="border border-line bg-panel rounded-[4px] overflow-hidden transition-all">
                        {/* Order Header Summary */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 text-xs font-mono font-semibold">
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted tracking-wider">Order Code</p>
                              <p className="text-ink font-bold mt-0.5">{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted tracking-wider">Order Date</p>
                              <p className="text-muted mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted tracking-wider">Total Value</p>
                              <p className="font-display font-bold text-ink mt-0.5 text-sm">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-3 border-t border-line/30 pt-3 md:border-0 md:pt-0">
                            <div className="flex items-center gap-2">
                              <span className={`border px-2.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wide rounded-[4px] ${getStatusColor(order.status)}`}>
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                              </span>
                              <span className={`border px-2.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wide rounded-[4px] ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                          </div>
                        </div>

                        {/* Order Details (Expands inline) */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-line/50 bg-canvas/30 flex flex-col gap-6 animate-fadeIn">
                            {/* Stitch tracker progress stepper */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-black uppercase text-ochre tracking-widest">Order Progress</span>
                              {renderStitchStepper(order.status)}
                            </div>

                            {/* Order Products Grid */}
                            <div className="flex flex-col gap-2.5">
                              <h4 className="text-[9px] font-mono font-black uppercase text-muted tracking-wider border-b border-line pb-1.5">Garment Details</h4>
                              <div className="flex flex-col gap-3">
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className="flex justify-between items-center text-xs font-mono font-semibold">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 border border-line bg-panel flex items-center justify-center shrink-0 rounded-[4px]">
                                        <ShoppingBag className="h-4 w-4 text-muted" />
                                      </div>
                                      <div>
                                        <p className="text-ink font-bold font-sans line-clamp-1">{item.productName}</p>
                                        <p className="text-muted text-[10px] mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                      </div>
                                    </div>
                                    <span className="text-ink font-bold">{formatPrice(item.subtotal)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Summary Totals & Address Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-line/45 pt-4">
                              <div className="text-xs font-mono text-muted flex flex-col gap-2">
                                <h4 className="text-[9px] font-black uppercase text-ink tracking-widest border-b border-line pb-1">Shipping Destination</h4>
                                <p><strong className="text-ink font-semibold">Phone:</strong> {order.phone}</p>
                                <p><strong className="text-ink font-semibold">Address:</strong> {order.shippingAddress}</p>
                                {order.note && <p><strong className="text-ink font-semibold">Client Note:</strong> "{order.note}"</p>}
                              </div>

                              <div className="flex flex-col gap-3">
                                <h4 className="text-[9px] font-mono font-black uppercase text-ink tracking-widest border-b border-line pb-1">Price Snapshot</h4>
                                <div className="flex flex-col gap-1.5 text-xs font-mono text-muted">
                                  <div className="flex justify-between">
                                    <span>Discount Applied</span>
                                    <span>-{formatPrice(order.discountApplied || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Shipping Delivery Cost</span>
                                    <span>{formatPrice(order.shippingCost || 0)}</span>
                                  </div>
                                  <div className="flex justify-between text-ink font-black text-sm pt-2 border-t border-dashed border-line">
                                    <span>Grand Total</span>
                                    <span className="text-base font-display font-bold">{formatPrice(order.totalAmount)}</span>
                                  </div>
                                </div>

                                {/* Active payment actions */}
                                {order.paymentStatus === 'UNPAID' && order.status === 'PENDING' && (
                                  <button
                                    onClick={() => handlePaymentInitiate(order.id)}
                                    disabled={initiatingPaymentId === order.id}
                                    className="w-full rounded-[4px] bg-indigo py-2.5 text-center text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:bg-line disabled:text-muted mt-2"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    <span>{initiatingPaymentId === order.id ? 'Connecting Gateway...' : 'Pay Online (SSLCommerz)'}</span>
                                  </button>
                                )}

                                {/* Cancel button if eligible */}
                                {canCancel && (
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Please enter reason for cancellation:', 'Ordered wrong size');
                                      if (reason !== null) {
                                        handleCancelOrder(order.id, reason || 'Cancelled by customer');
                                      }
                                    }}
                                    className="w-full border border-thread/20 bg-white text-thread hover:bg-thread/5 py-2 text-center text-[10px] font-mono font-black uppercase rounded-[4px] transition-all"
                                  >
                                    Cancel Order
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
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="font-display font-bold text-ink text-xl border-b border-line pb-3">My Wishlist</h3>

              {wishlistItems.length === 0 ? (
                <div className="border border-line bg-panel p-12 text-center rounded-[4px] flex flex-col items-center gap-3">
                  <Heart className="h-8 w-8 text-line" />
                  <h4 className="font-display font-bold text-sm text-ink">Your Wishlist is Empty</h4>
                  <p className="text-xs text-muted max-w-xs font-sans">You don't have any items saved in your wishlist yet.</p>
                  <Link href="/products" className="mt-2 border border-line bg-white hover:bg-canvas px-6 py-2 rounded-[4px] text-xs font-mono font-black uppercase text-ink">
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {wishlistItems.map((item: any) => {
                    const discount = item.product.discountPrice !== null;
                    const isOutOfStock = item.product.stock === 0;
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col rounded-[4px] border border-line bg-panel p-3 shadow-none transition-all hover:border-indigo"
                      >
                        {/* Remove from wishlist */}
                        <button
                          onClick={() => removeFromWishlist(item.product.id)}
                          className="absolute right-4 top-4 z-10 p-1 bg-white hover:text-thread border border-line rounded-[4px] transition-all text-muted"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <Link href={`/products/${item.product.id}`} className="aspect-[3/4] w-full overflow-hidden bg-canvas border border-line block">
                          <img
                            src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300'}
                            alt={item.product.name}
                            className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </Link>

                        <div className="mt-3.5 flex flex-col flex-1">
                          <Link href={`/products/${item.product.id}`} className="font-bold text-ink group-hover:text-indigo transition-colors text-xs line-clamp-1 block">
                            {item.product.name}
                          </Link>

                          <div className="mt-1 flex items-baseline gap-1.5 text-xs font-mono font-bold text-ink">
                            {discount ? (
                              <>
                                <span className="font-display font-bold text-sm">{formatPrice(item.product.discountPrice)}</span>
                                <span className="text-[10px] text-muted line-through font-medium">{formatPrice(item.product.price)}</span>
                              </>
                            ) : (
                              <span className="font-display font-bold text-sm">{formatPrice(item.product.price)}</span>
                            )}
                          </div>

                          <div className="mt-2.5">
                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isOutOfStock ? 'text-thread' : 'text-green'}`}>
                              {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-line/45">
                            <button
                              onClick={() => handleMoveToCart(item.product.id)}
                              disabled={isOutOfStock}
                              className="w-full flex items-center justify-center gap-1.5 rounded-[4px] bg-indigo py-2 text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors disabled:bg-line disabled:text-muted disabled:cursor-not-allowed"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Move to Bag</span>
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

          {/* ==================== TAB: ADDRESSES ==================== */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex justify-between items-baseline border-b border-line pb-3">
                <h3 className="font-display font-bold text-ink text-xl">Saved Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressLabel('Home');
                      setAddressName(user.name);
                      setAddressPhone(user.phone || '');
                      setAddressLine('');
                      setAddressZone('INSIDE_DHAKA');
                      setAddressDefault(false);
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-1 text-xs font-mono font-black uppercase text-indigo hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {showAddressForm ? (
                /* Address Add/Edit Form */
                <form onSubmit={handleAddressSubmit} className="border border-line bg-panel p-5 rounded-[4px] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-line pb-2.5">
                    <h4 className="text-xs font-mono font-black uppercase text-ink">
                      {editingAddressId ? 'Edit Shipping Address' : 'New Shipping Destination'}
                    </h4>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-muted hover:text-ink">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {addressError && (
                    <div className="border border-thread/20 bg-thread/5 p-3 text-xs font-mono font-bold text-thread rounded-[4px]">
                      ⚠️ {addressError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Address Tag (e.g. Home, Office)</label>
                      <input
                        type="text"
                        required
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-semibold rounded-[4px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Contact Person Name</label>
                      <input
                        type="text"
                        required
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-semibold rounded-[4px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Contact Phone Number</label>
                      <input
                        type="text"
                        required
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-mono font-semibold rounded-[4px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Delivery Zone</label>
                      <select
                        value={addressZone}
                        onChange={(e) => setAddressZone(e.target.value as any)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-semibold rounded-[4px]"
                      >
                        <option value="INSIDE_DHAKA">Inside Dhaka</option>
                        <option value="OUTSIDE_DHAKA">Outside Dhaka</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Street Address Details</label>
                    <textarea
                      required
                      rows={2}
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-medium rounded-[4px]"
                      placeholder="e.g. House 12, Road 4, Sector 3, Uttara, Dhaka"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 select-none cursor-pointer text-xs font-semibold py-1">
                    <input
                      type="checkbox"
                      checked={addressDefault}
                      onChange={(e) => setAddressDefault(e.target.checked)}
                      className="rounded border-line text-indigo focus:ring-indigo h-4 w-4"
                    />
                    <span>Set as Primary Shipping Destination</span>
                  </label>

                  <div className="flex gap-4 mt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-[4px] bg-indigo py-3 text-center text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors"
                    >
                      Save Destination Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="border border-line px-6 py-3 rounded-[4px] text-xs font-mono font-black uppercase text-ink hover:bg-canvas bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Saved Address Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingAddresses ? (
                    <div className="py-8 text-center md:col-span-2 flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-indigo"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="border border-dashed border-line bg-panel/30 p-8 rounded-[4px] text-center md:col-span-2 text-muted font-mono flex flex-col items-center gap-2">
                      <MapPin className="h-6 w-6 text-line" />
                      <p className="text-[10px] uppercase font-bold">No saved addresses found.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-[10px] font-black uppercase text-indigo hover:underline mt-1"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <>
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-line bg-panel p-4 rounded-[4px] flex flex-col justify-between gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[9px] font-black uppercase text-ochre border border-line bg-canvas px-2 py-0.5 rounded-[4px] tracking-wider">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[8px] font-mono uppercase bg-green/10 text-green border border-green/20 px-2 py-0.5 rounded-[4px] font-bold">
                                  Default Destination
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-medium text-muted flex flex-col gap-1 mt-1 font-sans">
                              <p><strong className="text-ink font-semibold">Recipient:</strong> {addr.name}</p>
                              <p><strong className="text-ink font-semibold">Phone:</strong> {addr.phone}</p>
                              <p><strong className="text-ink font-semibold">Line:</strong> {addr.line}</p>
                              <p><strong className="text-ink font-semibold">Zone:</strong> {addr.zone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
                            </div>
                          </div>

                          <div className="border-t border-line/30 pt-3 flex justify-end gap-3">
                            <button onClick={() => openEditAddress(addr)} className="text-muted hover:text-indigo" title="Edit Address">
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>
                            {!addr.isDefault && (
                              <button onClick={() => handleDeleteAddress(addr.id)} className="text-muted hover:text-thread" title="Delete Address">
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add new address placeholder box */}
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressLabel('Home');
                          setAddressName(user.name);
                          setAddressPhone(user.phone || '');
                          setAddressLine('');
                          setAddressZone('INSIDE_DHAKA');
                          setAddressDefault(false);
                          setShowAddressForm(true);
                        }}
                        className="border border-dashed border-line bg-panel/10 hover:bg-panel/30 hover:border-indigo p-6 rounded-[4px] flex flex-col items-center justify-center gap-2 text-muted transition-colors min-h-[160px]"
                      >
                        <Plus className="h-6 w-6 text-line" />
                        <span className="text-xs font-mono font-black uppercase text-ink tracking-wider">Add New Address</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB: PROFILE ==================== */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="font-display font-bold text-ink text-xl border-b border-line pb-3">Profile Settings</h3>

              {profileMessage && (
                <div className="rounded-[4px] bg-green/10 border border-green/20 p-4 text-xs font-mono font-bold text-green animate-in slide-in-from-top duration-300">
                  ✓ {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="rounded-[4px] border border-thread/20 bg-thread/5 p-4 text-xs font-mono font-bold text-thread animate-in slide-in-from-top duration-300">
                  ⚠️ {profileError}
                </div>
              )}

              <div className="border border-line bg-panel p-6 rounded-[4px]">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email (Read Only ID) */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted" />
                        <span>Account Email ID (Read-only)</span>
                      </label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="border border-line p-3 text-sm bg-canvas text-muted cursor-not-allowed font-mono rounded-[4px] font-semibold"
                      />
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-medium rounded-[4px]"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted" />
                        <span>Contact Phone Number</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-line p-3 text-sm bg-canvas focus:outline-none focus:border-indigo font-mono font-semibold rounded-[4px]"
                      />
                    </div>
                  </div>

                  {/* Password placeholder field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider">Password (Masked)</label>
                    <input
                      type="password"
                      disabled
                      value="•••••••••••••••"
                      className="border border-line p-3 text-sm bg-canvas text-muted cursor-not-allowed font-mono rounded-[4px]"
                    />
                  </div>

                  {/* Notification preference checkboxes */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-line/30 mt-1">
                    <label className="text-[10px] font-mono font-black uppercase text-muted tracking-wider mb-1 block">Notification Preferences</label>
                    <label className="flex items-center gap-2.5 select-none cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={smsPref}
                        onChange={(e) => setSmsPref(e.target.checked)}
                        className="rounded border-line text-indigo focus:ring-indigo h-4 w-4"
                      />
                      <span>Receive updates via SMS (Highly recommended for delivery status alerts)</span>
                    </label>
                    <label className="flex items-center gap-2.5 select-none cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={emailPref}
                        onChange={(e) => setEmailPref(e.target.checked)}
                        className="rounded border-line text-indigo focus:ring-indigo h-4 w-4"
                      />
                      <span>Receive receipt and newsletter updates via Email</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="w-full rounded-[4px] bg-indigo py-3.5 text-xs font-mono font-black uppercase text-white hover:bg-zinc-800 transition-colors shadow-none disabled:bg-line disabled:text-muted flex items-center justify-center gap-2 mt-4"
                  >
                    <Save className="h-4.5 w-4.5" />
                    <span>{loadingProfile ? 'Saving updates...' : 'Save Profile Details'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Navigation Bottom Tab Bar (as requested in mobile design spec) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-line bg-panel p-2 flex justify-around items-center z-40 select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'overview' ? 'text-indigo' : 'text-muted'}`}
        >
          <Grid className="h-5 w-5" />
          <span className="text-[9px] font-mono font-black uppercase">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'orders' ? 'text-indigo' : 'text-muted'}`}
        >
          <ReceiptText className="h-5 w-5" />
          <span className="text-[9px] font-mono font-black uppercase">Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'wishlist' ? 'text-indigo' : 'text-muted'}`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-[9px] font-mono font-black uppercase">Wishlist</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'addresses' ? 'text-indigo' : 'text-muted'}`}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-[9px] font-mono font-black uppercase">Address</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'profile' ? 'text-indigo' : 'text-muted'}`}
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-mono font-black uppercase">Profile</span>
        </button>
      </div>

      {/* Spacing spacer for mobile sticky bar */}
      <div className="lg:hidden h-14" />
    </div>
  );
}
