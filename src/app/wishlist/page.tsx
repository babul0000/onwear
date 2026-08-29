'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-zinc-100 p-6 text-zinc-400">
          <Heart className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800">Your wishlist is empty</h2>
        <p className="text-zinc-500 text-sm max-w-xs">Please log in to see and manage your saved wishlist items.</p>
        <Link href="/login" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md">
          Log In to Account
        </Link>
      </div>
    );
  }

  const items = wishlist?.items || [];

  const handleAddToCart = async (productId, itemId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      // Remove from wishlist after successfully adding to cart
      await removeFromWishlist(productId);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">My Wishlist</h1>
        <p className="text-sm text-zinc-500 mt-1">Products you have saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
          <div className="rounded-full bg-zinc-50 p-4 text-zinc-400 mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg">Your wishlist is empty</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Explore our catalog and click the heart icon to save products</p>
          <Link href="/products" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const discount = item.product.discountPrice !== null;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="absolute right-6 top-6 z-10 p-2 rounded-full shadow-sm border border-zinc-100 bg-white hover:text-red-500 hover:scale-105 transition-all text-zinc-400"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Link href={`/products/${item.product.id}`} className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100 block">
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                    alt={item.product.name}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </Link>

                <div className="mt-4 flex flex-col flex-1">
                  <Link href={`/products/${item.product.id}`} className="font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors mt-1 block line-clamp-1">
                    {item.product.name}
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2">
                    {discount ? (
                      <>
                        <span className="text-base font-bold text-zinc-900">{formatPrice(item.product.discountPrice)}</span>
                        <span className="text-xs text-zinc-400 line-through">{formatPrice(item.product.price)}</span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-zinc-900">{formatPrice(item.product.price)}</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <button
                      onClick={() => handleAddToCart(item.product.id, item.id)}
                      disabled={item.product.stock === 0}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="h-4 w-4" />
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
  );
}
