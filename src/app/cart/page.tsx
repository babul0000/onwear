'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const items = cart?.items || [];
  const cartSubtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice !== null && item.product.discountPrice !== undefined
      ? item.product.discountPrice
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingCost = cartSubtotal > 5000 || cartSubtotal === 0 ? 0 : 80;
  const grandTotal = cartSubtotal + shippingCost;

  const handleQtyChange = async (itemId, currentQty, increment, maxStock) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;
    if (maxStock && newQty > maxStock) return;

    await updateCartItem(itemId, newQty);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase">Shopping Bag</h1>
        <p className="text-xs font-semibold text-zinc-400 mt-1">
          Review your selections and proceed to checkout
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-3xl bg-white p-8">
          <div className="rounded-full bg-zinc-50 p-5 text-zinc-400 mb-4">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg uppercase tracking-wider">Your bag is empty</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-6 font-medium">Explore our catalog to find items you love</p>
          <Link href="/products" className="rounded-full bg-zinc-950 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-md">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const discount = item.product.discountPrice !== null && item.product.discountPrice !== undefined;
              const currentPrice = discount ? item.product.discountPrice! : item.product.price;
              const subtotal = currentPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100'}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-xl object-cover border border-zinc-100 bg-zinc-50 shrink-0"
                    />
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-xs uppercase tracking-tight text-zinc-900 hover:text-teal-650 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.sku && (
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">SKU: {item.product.sku}</p>
                      )}

                      {/* Variant Badges */}
                      {(item.size || item.color) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.size && (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-700 font-mono">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-700 font-mono">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 flex items-baseline gap-2">
                        {discount ? (
                          <>
                            <span className="text-xs font-black text-zinc-950 font-mono">{formatPrice(item.product.discountPrice)}</span>
                            <span className="text-[10px] text-zinc-400 line-through font-mono">{formatPrice(item.product.price)}</span>
                          </>
                        ) : (
                          <span className="text-xs font-black text-zinc-950 font-mono">{formatPrice(item.product.price)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity, false, item.product.stock)}
                        className="p-1 hover:bg-white rounded text-zinc-600 hover:text-zinc-900"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-zinc-800 font-mono">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity, true, item.product.stock)}
                        className="p-1 hover:bg-white rounded text-zinc-600 hover:text-zinc-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right sm:min-w-20">
                      <span className="text-sm font-black text-zinc-950 font-mono">{formatPrice(subtotal)}</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-rose-600 p-2 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center mt-2">
              <button
                onClick={clearCart}
                className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear Entire Bag
              </button>
              <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-teal-650 hover:text-teal-700 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Checkout Summary */}
          <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit flex flex-col gap-6">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">Order Summary</h3>

            <div className="flex flex-col gap-3 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="font-semibold text-zinc-900">
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  Tip: Get free shipping on orders over Tk 5,000!
                </p>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-4 flex justify-between items-baseline">
              <span className="text-base font-bold text-zinc-900">Total</span>
              <span className="text-2xl font-extrabold text-zinc-950">{formatPrice(grandTotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full rounded-full bg-zinc-950 py-3 text-center text-sm font-bold text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
