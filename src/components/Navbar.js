'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Store } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart, wishlist } = useCart();

  // Sum of quantities in cart
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-950">
            <Store className="h-6 w-6 text-indigo-600" />
            <span>Shop<span className="text-indigo-600">Nest</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-indigo-600 transition-colors">Shop</Link>
            <Link href="/categories" className="hover:text-indigo-600 transition-colors">Categories</Link>
          </nav>
        </div>

        {/* Action Items */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600"></div>
          ) : user ? (
            <>
              {/* Admin Access */}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-zinc-600 hover:text-red-500 transition-colors">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-zinc-600 hover:text-indigo-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Profile Link */}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="rounded-full p-2 text-zinc-500 hover:text-zinc-950 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 hover:text-indigo-600 transition-colors px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
