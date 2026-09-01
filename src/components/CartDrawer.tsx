'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const { cart, isCartDrawerOpen, closeCartDrawer, updateCartItem, removeFromCart } = useCart();
  const router = useRouter();

  if (!isCartDrawerOpen) return null;

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => {
    const p = item.product.discountPrice !== null && item.product.discountPrice !== undefined
      ? item.product.discountPrice
      : item.product.price;
    return acc + p * item.quantity;
  }, 0);

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    closeCartDrawer();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    closeCartDrawer();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Slide-over panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-zinc-100 p-2 text-zinc-900">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-zinc-950">
                Your Bag
              </h2>
              <p className="text-[11px] font-semibold text-zinc-400">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCartDrawer}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700 mb-1.5">
            <span>
              {remainingForFree === 0
                ? '🎉 You unlocked FREE Shipping!'
                : `Add ${formatPrice(remainingForFree)} more for FREE delivery`}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="rounded-full bg-zinc-100 p-5 text-zinc-400 mb-3">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Your bag is empty</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Explore our catalog and find something you love.
              </p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  router.push('/products');
                }}
                className="mt-6 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const hasDiscount =
                item.product.discountPrice !== null && item.product.discountPrice !== undefined;
              const unitPrice = hasDiscount
                ? item.product.discountPrice!
                : item.product.price;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-200"
                >
                  <img
                    src={
                      item.product.image ||
                      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200'
                    }
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover border border-zinc-100 shrink-0 bg-zinc-50"
                  />
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={closeCartDrawer}
                          className="text-xs font-bold uppercase tracking-tight text-zinc-900 hover:text-teal-650 line-clamp-1 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      {(item.size || item.color) && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.size && (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-zinc-700 font-mono">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-zinc-700 font-mono">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-50">
                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-zinc-950 font-mono">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-zinc-400 line-through font-mono">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateCartItem(item.id, item.quantity - 1)
                              : removeFromCart(item.id)
                          }
                          className="p-1 text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-zinc-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            item.quantity < item.product.stock &&
                            updateCartItem(item.id, item.quantity + 1)
                          }
                          className="p-1 text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 bg-white p-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Subtotal
              </span>
              <span className="text-lg font-black text-zinc-950 font-mono">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Taxes and shipping calculated at checkout.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-600 transition-colors shadow-lg shadow-zinc-950/10"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleViewCart}
                className="w-full rounded-full border border-zinc-200 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                View Full Bag
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>Guaranteed Safe & Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
