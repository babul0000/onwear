'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import { CreditCard, ShoppingBag, Truck, Check, Percent, CheckCircle2, ArrowRight, ShieldCheck, Mail, Copy, Smartphone } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import Link from 'next/link';

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const { cart, clearCart, fetchCart } = useCart();
  const router = useRouter();

  // Shipping Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [zone, setZone] = useState('inside'); // default to inside Dhaka
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'ONLINE'>('COD');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Store payment numbers
  const [bkashNumber, setBkashNumber] = useState('01603742963');
  const [nagadNumber, setNagadNumber] = useState('01603742963');

  // Dynamic Shipping Rates States
  const [shippingCost, setShippingCost] = useState(80);
  const [insideRate, setInsideRate] = useState(80);
  const [outsideRate, setOutsideRate] = useState(150);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order Success Screen State
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    totalAmount: number;
    autoAccountCreated: boolean;
    customerEmail: string;
    paymentMethod?: string;
    trxId?: string;
  } | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load shipping rates and store settings from backend on mount
  useEffect(() => {
    async function fetchStoreConfig() {
      try {
        const [ratesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/shipping/rates`),
          fetch(`${API_URL}/settings`)
        ]);
        const ratesData = await ratesRes.json();
        const settingsData = await settingsRes.json();
        if (ratesData.success) {
          setInsideRate(ratesData.data.insideDhaka);
          setOutsideRate(ratesData.data.outsideDhaka);
          setShippingCost(ratesData.data.insideDhaka);
        }
        if (settingsData.success && settingsData.data) {
          if (settingsData.data.bkashNumber) setBkashNumber(settingsData.data.bkashNumber);
          if (settingsData.data.nagadNumber) setNagadNumber(settingsData.data.nagadNumber);
        }
      } catch (err) {
        console.error('Error fetching checkout configs:', err);
      }
    }
    fetchStoreConfig();
  }, []);

  const handleCopyNumber = (num: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    }
  };

  const items = cart?.items || [];

  const cartSubtotal = items.reduce((acc, item: any) => {
    const prod = (item.product || {}) as any;
    const price = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : (prod.price || 0);
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, cartSubtotal - discountApplied + shippingCost);

  // If order was just placed, render celebratory success card
  if (orderSuccessData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <div className="rounded-full bg-emerald-50 border border-emerald-100 p-5 text-emerald-600">
            <CheckCircle2 className="h-14 w-14" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase text-teal-650 tracking-widest font-mono">
              ORDER CONFIRMED
            </span>
            <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tight mt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">Order ID: #{orderSuccessData.orderId}</p>
          </div>

          {/* Direct Mobile Banking (bKash/Nagad) confirmation notice */}
          {(orderSuccessData.paymentMethod === 'BKASH' || orderSuccessData.paymentMethod === 'NAGAD') && (
            <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <Smartphone className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Payment Submitted via {orderSuccessData.paymentMethod}</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                TrxID: <strong className="font-mono text-zinc-950 bg-white/80 px-2 py-0.5 rounded border border-amber-200">{orderSuccessData.trxId}</strong>
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                Our verification team will verify this transaction ID and update your order status shortly.
              </p>
            </div>
          )}

          {orderSuccessData.autoAccountCreated ? (
            <div className="w-full bg-gradient-to-br from-teal-50/80 via-white to-zinc-50 border border-teal-200/80 rounded-2xl p-6 text-left flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
                <span>Account Created Automatically for You!</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                We've created an account for <strong className="text-zinc-900">{orderSuccessData.customerEmail}</strong> so you can track this shipment and view your order history anytime.
              </p>
              <div className="rounded-xl bg-white border border-teal-100 p-3.5 flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-xs font-medium text-zinc-700">
                  Check your inbox for a secure link to set your password and access your orders.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 max-w-md">
              Your order has been linked to your account. You can track status and view receipts anytime in your dashboard.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-zinc-100">
            <Link
              href={`/orders/${orderSuccessData.orderId}`}
              className="flex-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>View Order Receipt</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="flex-1 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold py-3.5 text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="rounded-full bg-zinc-50 p-6 text-zinc-400">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800">Your bag is empty</h2>
        <p className="text-zinc-400 text-xs">Add some products before checking out.</p>
        <button onClick={() => router.push('/products')} className="mt-2 rounded-full bg-zinc-950 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition-colors">
          Shop Catalog
        </button>
      </div>
    );
  }

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZone = e.target.value;
    setZone(selectedZone);
    if (selectedZone === 'inside') {
      setShippingCost(insideRate);
    } else {
      setShippingCost(outsideRate);
    }
  };

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: couponCode,
          subtotal: cartSubtotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountApplied(data.data.discountApplied);
        setAppliedCoupon(data.data.code);
        setCouponSuccess(`Coupon "${data.data.code}" applied! Discount: ${formatPrice(data.data.discountApplied)}`);
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon. Try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setDiscountApplied(0);
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address to receive order updates and account details.');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your mobile phone number.');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Please provide your complete shipping address.');
      setLoading(false);
      return;
    }

    // Direct Mobile Banking (bKash/Nagad) Validation
    if (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') {
      if (!paymentPhone.trim() || paymentPhone.trim().length < 10) {
        setError(`Please enter the ${paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} sender mobile number you used to make the payment.`);
        setLoading(false);
        return;
      }
      if (!trxId.trim() || trxId.trim().length < 4) {
        setError(`Please enter the ${paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} Transaction ID (TrxID).`);
        setLoading(false);
        return;
      }
    }

    const shippingAddress = `${address}${city ? `, ${city}` : ''}${postalCode ? ` - ${postalCode}` : ''} (${zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})`;

    // Map checkout items array
    const checkoutItemsPayload = items.map((item: any) => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null
    }));

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shippingAddress,
          items: checkoutItemsPayload,
          note: note || undefined,
          couponCode: appliedCoupon || undefined,
          shippingCost,
          discountApplied,
          paymentMethod,
          paymentPhone: paymentPhone.trim() || undefined,
          trxId: trxId.trim().toUpperCase() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        // Clear cart in context (both local guest and server cart)
        await clearCart();
        await fetchCart();

        if (paymentMethod === 'ONLINE') {
          // Initiate online payment via SSLCommerz
          try {
            const payHeaders: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            if (token) payHeaders['Authorization'] = `Bearer ${token}`;

            const payRes = await fetch(`${API_URL}/payments/sslcommerz/initiate/${data.data.id}`, {
              method: 'POST',
              headers: payHeaders
            });
            const payData = await payRes.json();
            if (payData.success && payData.data.gatewayUrl) {
              window.location.href = payData.data.gatewayUrl;
              return;
            } else {
              setOrderSuccessData({
                orderId: data.data.id,
                totalAmount: data.data.totalAmount,
                autoAccountCreated: data.data.autoAccountCreated,
                customerEmail: data.data.customerEmail || email,
                paymentMethod,
                trxId: trxId.trim().toUpperCase()
              });
            }
          } catch (payErr) {
            console.error('Failed to initiate online payment:', payErr);
            setOrderSuccessData({
              orderId: data.data.id,
              totalAmount: data.data.totalAmount,
              autoAccountCreated: data.data.autoAccountCreated,
              customerEmail: data.data.customerEmail || email,
              paymentMethod,
              trxId: trxId.trim().toUpperCase()
            });
          }
        } else {
          // COD or Direct bKash / Nagad Order Placed Success
          setOrderSuccessData({
            orderId: data.data.id,
            totalAmount: data.data.totalAmount,
            autoAccountCreated: data.data.autoAccountCreated,
            customerEmail: data.data.customerEmail || email,
            paymentMethod,
            trxId: trxId.trim().toUpperCase()
          });
        }
      } else {
        setError(data.message || 'Failed to place the order. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while placing the order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 text-zinc-850">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase">Checkout</h1>
        <p className="text-xs font-semibold text-zinc-400 mt-1">Provide shipping details and place your order</p>
      </div>

      {/* Guest Notice Banner */}
      {!user && (
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 text-xs font-medium text-teal-900 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
          <span>
            <strong>Guest Checkout:</strong> No prior registration needed. We will automatically create an account for you and email a link to set your password so you can track this order.
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-zinc-900 border-b border-zinc-100 pb-4 text-base uppercase tracking-wider">
            Shipping Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address (for order tracking & account) *</label>
              <input
                type="email"
                required
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Delivery Zone *</label>
              <select
                value={zone}
                onChange={handleZoneChange}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-semibold"
              >
                <option value="inside">Inside Dhaka ({formatPrice(insideRate)})</option>
                <option value="outside">Outside Dhaka ({formatPrice(outsideRate)})</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Street Address *</label>
              <textarea
                required
                rows={3}
                placeholder="House #, Road #, Area, District"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">City / District</label>
              <input
                type="text"
                placeholder="e.g. Dhaka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Postal Code</label>
              <input
                type="text"
                placeholder="e.g. 1229"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Order Note (Optional)</label>
              <input
                type="text"
                placeholder="Special instructions for delivery"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="border-t border-zinc-100 pt-6 flex flex-col gap-4">
            <h4 className="font-black text-zinc-900 text-xs uppercase tracking-wider">Payment Method</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COD Option */}
              <label
                className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950/10'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="h-4 w-4 text-zinc-950 focus:ring-zinc-950"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900">Cash on Delivery</span>
                  <span className="text-[10px] text-zinc-400">Pay cash upon delivery</span>
                </div>
              </label>

              {/* bKash Option */}
              <label
                className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'BKASH'
                    ? 'border-[#E2136E] bg-pink-50/60 shadow-sm ring-1 ring-[#E2136E]/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BKASH"
                  checked={paymentMethod === 'BKASH'}
                  onChange={() => setPaymentMethod('BKASH')}
                  className="h-4 w-4 text-[#E2136E] focus:ring-[#E2136E]"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#E2136E]">bKash</span>
                    <span className="text-[9px] bg-[#E2136E]/10 text-[#E2136E] font-black px-1.5 py-0.2 rounded font-mono uppercase">Direct</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Send Money / TrxID Verification</span>
                </div>
              </label>

              {/* Nagad Option */}
              <label
                className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'NAGAD'
                    ? 'border-[#F7921E] bg-amber-50/60 shadow-sm ring-1 ring-[#F7921E]/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="NAGAD"
                  checked={paymentMethod === 'NAGAD'}
                  onChange={() => setPaymentMethod('NAGAD')}
                  className="h-4 w-4 text-[#F7921E] focus:ring-[#F7921E]"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F7921E]">Nagad</span>
                    <span className="text-[9px] bg-[#F7921E]/10 text-[#F7921E] font-black px-1.5 py-0.2 rounded font-mono uppercase">Direct</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Send Money / TrxID Verification</span>
                </div>
              </label>

              {/* SSLCommerz Option */}
              <label
                className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950/10'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="h-4 w-4 text-zinc-950 focus:ring-zinc-950"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900">Online Gateway</span>
                  <span className="text-[10px] text-zinc-400">Cards & Instant Gateway (SSLCommerz)</span>
                </div>
              </label>
            </div>

            {/* Direct bKash Detailed Instructions & Form */}
            {paymentMethod === 'BKASH' && (
              <div className="border border-[#E2136E]/30 bg-pink-50/40 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#E2136E]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                    <span className="text-xs font-black uppercase text-[#E2136E] font-mono tracking-wider">bKash Send Money Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-600">Total:</span>
                    <span className="text-sm font-black text-zinc-950 font-mono">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Number & Copy Box */}
                <div className="flex items-center justify-between bg-white border border-pink-200/80 p-3.5 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR bKash Number (Personal)</span>
                    <span className="text-sm font-black text-zinc-950 font-mono tracking-wider">{bkashNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(bkashNumber)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E2136E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c90f61] transition-colors shadow-sm"
                  >
                    {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                  </button>
                </div>

                {/* Step instructions */}
                <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                  <p><strong className="text-zinc-900">ধাপ ১:</strong> বিকাশ অ্যাপ অথবা <strong>*247#</strong> ডায়াল করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                  <p><strong className="text-zinc-900">ধাপ ২:</strong> প্রাপক নম্বর হিসেবে <strong className="font-mono text-zinc-950">{bkashNumber}</strong> দিন।</p>
                  <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950">{formatPrice(grandTotal)}</strong> দিয়ে সেন্ড মানি সম্পন্ন করুন।</p>
                  <p><strong className="text-zinc-900">ধাপ ৪:</strong> সেন্ড মানি সম্পন্ন করার পর SMS থেকে <strong>Transaction ID (TrxID)</strong> এবং আপনার <strong>প্রেরক নম্বর</strong> নিচে দিন।</p>
                </div>

                {/* Inputs for Sender Number and TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200/40">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Your bKash Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="border border-pink-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#E2136E] font-mono font-medium shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">bKash Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J8K7L6M"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="border border-pink-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#E2136E] font-mono font-bold uppercase shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Direct Nagad Detailed Instructions & Form */}
            {paymentMethod === 'NAGAD' && (
              <div className="border border-[#F7921E]/30 bg-amber-50/40 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#F7921E]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F7921E]" />
                    <span className="text-xs font-black uppercase text-[#F7921E] font-mono tracking-wider">Nagad Send Money Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-600">Total:</span>
                    <span className="text-sm font-black text-zinc-950 font-mono">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Number & Copy Box */}
                <div className="flex items-center justify-between bg-white border border-amber-200/80 p-3.5 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR Nagad Number (Personal)</span>
                    <span className="text-sm font-black text-zinc-950 font-mono tracking-wider">{nagadNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(nagadNumber)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7921E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d87c14] transition-colors shadow-sm"
                  >
                    {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                  </button>
                </div>

                {/* Step instructions */}
                <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                  <p><strong className="text-zinc-900">ধাপ ১:</strong> নগদ অ্যাপ অথবা <strong>*167#</strong> ডায়াল করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                  <p><strong className="text-zinc-900">ধাপ ২:</strong> প্রাপক নম্বর হিসেবে <strong className="font-mono text-zinc-950">{nagadNumber}</strong> দিন।</p>
                  <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950">{formatPrice(grandTotal)}</strong> দিয়ে সেন্ড মানি সম্পন্ন করুন।</p>
                  <p><strong className="text-zinc-900">ধাপ ৪:</strong> সেন্ড মানি সম্পন্ন করার পর SMS থেকে <strong>Transaction ID (TrxID)</strong> এবং আপনার <strong>প্রেরক নম্বর</strong> নিচে দিন।</p>
                </div>

                {/* Inputs for Sender Number and TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/40">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Your Nagad Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="border border-amber-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#F7921E] font-mono font-medium shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Nagad Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7X8Y9Z01"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="border border-amber-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#F7921E] font-mono font-bold uppercase shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Order Summary & Placement */}
        <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-zinc-900 border-b border-zinc-100 pb-4 text-base uppercase tracking-wider">
            Order Summary
          </h3>

          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item: any) => {
              const prod = item.product || {};
              const price = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : (prod.price || 0);

              return (
                <div key={item.id} className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2">
                  <div className="flex items-center gap-3 flex-1 pr-2">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150'}
                      alt={prod.name}
                      className="h-10 w-10 object-cover rounded-lg border border-zinc-100 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 line-clamp-1">{prod.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400">
                        <span>Qty: {item.quantity}</span>
                        {item.size && (
                          <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono capitalize">
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 font-mono">{formatPrice(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Promo Code</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon || isValidatingCoupon}
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 uppercase font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:bg-zinc-300 shadow-sm"
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {couponSuccess && <p className="text-[11px] font-bold text-emerald-600">{couponSuccess}</p>}
            {couponError && <p className="text-[11px] font-bold text-red-600">{couponError}</p>}
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-xs font-medium">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-zinc-900">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping ({zone === 'inside' ? 'Dhaka' : 'Outside'})</span>
              <span className="font-mono font-bold text-zinc-900">{formatPrice(shippingCost)}</span>
            </div>
            {discountApplied > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied</span>
                <span className="font-mono">- {formatPrice(discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline border-t border-zinc-200 pt-3 text-zinc-950">
              <span className="text-sm font-black uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-teal-650 font-mono">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-950 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Confirm & Place Order</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
