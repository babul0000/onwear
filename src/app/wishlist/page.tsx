'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/format';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, addToCart, openCartDrawer } = useCart();

  const items = wishlist?.items || [];

  const handleAddToCart = async (productId: string) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      await removeFromWishlist(productId);
      openCartDrawer();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-950">My Wishlist</h1>
        <p className="text-xs font-semibold text-zinc-400 mt-1">Products you have saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-3xl bg-white p-8">
          <div className="rounded-full bg-zinc-50 p-5 text-zinc-400 mb-4">
            <Heart className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg uppercase tracking-wider">Your wishlist is empty</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-6 font-medium">Explore our catalog and click the heart icon to save products</p>
          <Link href="/products" className="rounded-full bg-zinc-950 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-md">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item: any) => {
            const prod = item.product || {};
            const discount = prod.discountPrice !== null && prod.discountPrice !== undefined;
            const targetId = item.productId || prod.id;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col border border-zinc-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(targetId)}
                  className="absolute right-6 top-6 z-10 p-2 shadow-sm border border-zinc-100 bg-white hover:text-rose-600 hover:scale-105 transition-all text-zinc-400"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Link href={`/products/${targetId}`} className="aspect-[4/3] w-full overflow-hidden bg-zinc-50 border border-zinc-100 block">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                    alt={prod.name || 'Product'}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="mt-4 flex flex-col flex-1">
                  <Link href={`/products/${targetId}`} className="font-bold text-xs uppercase tracking-tight text-zinc-900 group-hover:text-teal-650 transition-colors mt-1 block line-clamp-1">
                    {prod.name || 'Product'}
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2">
                    {discount ? (
                      <>
                        <span className="text-xs font-black text-zinc-950 font-mono">{formatPrice(prod.discountPrice)}</span>
                        <span className="text-[10px] text-zinc-400 line-through font-mono">{formatPrice(prod.price)}</span>
                      </>
                    ) : (
                      <span className="text-xs font-black text-zinc-950 font-mono">{formatPrice(prod.price || 0)}</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <button
                      onClick={() => handleAddToCart(targetId)}
                      disabled={prod.stock === 0}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>{prod.stock === 0 ? 'Out of Stock' : 'Move to Bag'}</span>
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
