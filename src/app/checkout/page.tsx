'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import { CreditCard, ShoppingBag, Truck, Check, Percent } from 'lucide-react';
import { formatPrice } from '../../utils/format';

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
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Cash on Delivery

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

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load shipping rates from backend on mount
  useEffect(() => {
    async function fetchShippingRates() {
      try {
        const res = await fetch(`${API_URL}/shipping/rates`);
        const data = await res.json();
        if (data.success) {
          setInsideRate(data.data.insideDhaka);
          setOutsideRate(data.data.outsideDhaka);
          // Set initial shipping rate
          setShippingCost(data.data.insideDhaka);
        }
      } catch (err) {
        console.error('Error fetching shipping rates:', err);
      }
    }
    fetchShippingRates();
  }, []);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm mt-2">Please log in to proceed to checkout.</p>
        <button onClick={() => router.push('/login')} className="mt-4 rounded-full bg-zinc-950 px-6 py-2 text-white">
          Log In
        </button>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-800">Your cart is empty</h2>
        <p className="text-zinc-500 text-sm">Add some items before checking out.</p>
        <button onClick={() => router.push('/products')} className="rounded-full bg-zinc-950 px-6 py-2 text-white">
          Shop Now
        </button>
      </div>
    );
  }

  const cartSubtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice !== null ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const grandTotal = Math.max(0, cartSubtotal - discountApplied + shippingCost);

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
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const shippingAddress = `${address}, ${city}, ${postalCode} (${zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})`;

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          phone,
          email: email || undefined,
          note: note || undefined,
          couponCode: appliedCoupon || undefined,
          shippingCost,
          discountApplied
        })
      });

      const data = await res.json();
      if (data.success) {
        // Clear cart in context
        await clearCart();
        await fetchCart();
        // Redirect to customer orders list
        router.push('/orders');
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
        <p className="text-sm text-zinc-400 mt-1">Provide shipping details and place your order</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">Shipping Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Street Address</label>
              <input
                type="text"
                required
                placeholder="House no., Street name, Apartment"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
              />
            </div>

            {/* Zone Selection Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Shipping Zone</label>
              <select
                value={zone}
                onChange={handleZoneChange}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-none focus:border-zinc-450 font-bold text-zinc-800 cursor-pointer"
              >
                <option value="inside">Inside Dhaka</option>
                <option value="outside">Outside Dhaka</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">City / Area</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhanmondi, Uttara"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Postal Code</label>
              <input
                type="text"
                required
                placeholder="e.g. 1209"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-semibold"
              />
            </div>

            {/* Optional Order Note Field */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 mt-2">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Order Note (Optional)</label>
                <span className="text-[9px] font-bold text-zinc-400">{note.length}/200</span>
              </div>
              <textarea
                maxLength={200}
                rows={3}
                placeholder="e.g. Please deliver after 6 PM, or Please don't call before delivery."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 resize-none font-medium"
              />
            </div>
          </div>

          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg mt-6">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-zinc-950 bg-zinc-50/10 p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="text-zinc-950 focus:ring-zinc-950 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-zinc-950" />
                <div>
                  <p className="font-bold text-sm text-zinc-900">Cash on Delivery</p>
                  <p className="text-xs text-zinc-400 font-medium">Pay cash when items are delivered</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                disabled
                className="text-zinc-400"
              />
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-bold text-sm text-zinc-400">Online Payment</p>
                  <p className="text-xs text-zinc-400 font-medium">bKash, Nagad, Cards (Coming soon)</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-base">Items in Order</h3>
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => {
                const discount = item.product.discountPrice !== null;
                const currentPrice = discount ? item.product.discountPrice : item.product.price;
                return (
                  <div key={item.id} className="flex gap-3 justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=50'}
                        alt={item.product.name}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200 bg-zinc-50"
                      />
                      <div>
                        <p className="font-semibold text-zinc-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-zinc-400 font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-950">{formatPrice(currentPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input block */}
            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Coupon Code</label>
              
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 uppercase font-bold"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:bg-zinc-100 disabled:text-zinc-400"
                  >
                    {isValidatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Applied: <strong className="uppercase">{appliedCoupon}</strong></span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 font-bold underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[10px] font-bold text-red-600 mt-0.5">⚠️ {couponError}</p>
              )}
              {couponSuccess && !appliedCoupon && (
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">✓ {couponSuccess}</p>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2.5 text-sm text-zinc-500 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-900 font-bold">{formatPrice(cartSubtotal)}</span>
              </div>
              
              {discountApplied > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discountApplied)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="text-zinc-900 font-bold">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
            </div>

            <div className="border-t border-zinc-150 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-black text-zinc-900 uppercase">Total</span>
              <span className="text-2xl font-black text-zinc-950">{formatPrice(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-extrabold tracking-wider uppercase text-white hover:bg-zinc-800 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
