'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import { CreditCard, ShoppingBag, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const { cart, clearCart, fetchCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Cash on Delivery

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm mt-2">Please log in to proceed to checkout.</p>
        <button onClick={() => router.push('/login')} className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white">
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
        <button onClick={() => router.push('/products')} className="rounded-full bg-indigo-600 px-6 py-2 text-white">
          Shop Now
        </button>
      </div>
    );
  }

  const cartSubtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice !== null ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingCost = cartSubtotal > 150 ? 0 : 15;
  const grandTotal = cartSubtotal + shippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const shippingAddress = `${address}, ${city}, ${postalCode}`;

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          phone
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Checkout</h1>
        <p className="text-sm text-zinc-500 mt-1">Provide shipping details and place your order</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">Shipping Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-zinc-700">Street Address</label>
              <input
                type="text"
                required
                placeholder="House no., Street name, Apartment"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-zinc-700">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhaka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-zinc-700">Postal Code</label>
              <input
                type="text"
                required
                placeholder="e.g. 1230"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>
          </div>

          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg mt-4">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-indigo-600 bg-indigo-50/30 p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="text-indigo-600 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-bold text-sm text-zinc-900">Cash on Delivery</p>
                  <p className="text-xs text-zinc-500">Pay cash when items are delivered</p>
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
                  <p className="font-bold text-sm text-zinc-400">Card Payment</p>
                  <p className="text-xs text-zinc-400">Online payment (Coming soon)</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-base">Items in Order</h3>
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => {
                const discount = item.product.discountPrice !== null;
                const currentPrice = discount ? item.product.discountPrice : item.product.price;
                return (
                  <div key={item.id} className="flex gap-3 justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=50'}
                        alt={item.product.name}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200"
                      />
                      <div>
                        <p className="font-semibold text-zinc-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900">${(currentPrice * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-zinc-150 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-900">Total</span>
              <span className="text-xl font-extrabold text-indigo-600">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-950 py-3 text-center text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
