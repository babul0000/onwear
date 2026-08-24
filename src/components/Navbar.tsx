'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  Search,
  Menu,
  X,
  Home
} from 'lucide-react';

const DEFAULT_NAV_CATEGORIES = [
  {
    id: 'shirt',
    name: 'Shirt',
    slug: 'shirt',
    subcategories: [
      { name: 'Half Sleeve Shirts', slug: 'half-sleeve-shirts' },
      { name: 'Full Sleeve Shirts', slug: 'full-sleeve-shirts' },
      { name: 'Classy Fit Shirts', slug: 'classy-fit-shirts' },
      { name: 'Check Shirts', slug: 'check-shirts' },
      { name: 'Boxy Fit Full Sleeve Shirts', slug: 'boxy-fit-full-sleeve-shirts' },
      { name: 'Boxy Fit Half Sleeve Shirts', slug: 'boxy-fit-half-sleeve-shirts' }
    ]
  },
  {
    id: 't-shirt',
    name: 'T-Shirt',
    slug: 't-shirt',
    subcategories: [
      { name: 'Half Sleeve T-Shirts', slug: 'half-sleeve-t-shirts' },
      { name: 'Drop Shoulder T-Shirts', slug: 'drop-shoulder-t-shirts' }
    ]
  },
  {
    id: 'pant',
    name: 'Pant',
    slug: 'pant',
    subcategories: [
      { name: 'Denim', slug: 'denim' },
      { name: 'Chino', slug: 'chino' },
      { name: 'Cargo', slug: 'cargo' }
    ]
  },
  {
    id: 'sandal',
    name: 'Sandal',
    slug: 'sandal',
    subcategories: [
      { name: 'Genuine Leather Slides', slug: 'genuine-leather-slides' },
      { name: 'Everyday Slides', slug: 'everyday-slides' }
    ]
  },
  {
    id: 'cap',
    name: 'Cap',
    slug: 'cap',
    subcategories: [
      { name: 'Baseball Caps', slug: 'baseball-caps' },
      { name: 'Dad Hats', slug: 'dad-hats' }
    ]
  },
  {
    id: 'winter-collection',
    name: 'Winter Collection',
    slug: 'winter-collection',
    subcategories: [
      { name: 'Full Sleeve Polo', slug: 'full-sleeve-polo' },
      { name: 'Full Sleeve T-Shirts', slug: 'full-sleeve-t-shirts' },
      { name: 'Winter Essentials', slug: 'winter-essentials' }
    ]
  },
  {
    id: 'trending',
    name: 'Trending',
    slug: 'trending',
    subcategories: [
      { name: 'Best Sellers', slug: 'best-sellers' },
      { name: 'Customer Favorites', slug: 'customer-favorites' },
      { name: 'Most Popular', slug: 'most-popular' }
    ]
  }
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart, wishlist } = useCart();
  const router = useRouter();

  // Component States
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_NAV_CATEGORIES);

  // Sum of quantities in cart
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  // Fetch categories for bottom navigation row
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          const fetchedCats = data.data;
          
          // Merge fetched categories from DB with our default navigation layout
          const merged = DEFAULT_NAV_CATEGORIES.map(defCat => {
            const match = fetchedCats.find((c: any) => c.slug.toLowerCase() === defCat.slug.toLowerCase());
            
            let subs = defCat.subcategories;
            if (match && match.subcategories && match.subcategories.length > 0) {
              subs = match.subcategories.map((s: any) => ({ name: s.name, slug: s.slug }));
            }

            return {
              ...defCat,
              id: match ? match.id : defCat.id,
              name: match ? match.name : defCat.name,
              subcategories: subs
            };
          });
          
          setCategories(merged);
        }
      } catch (err) {
        console.error('Error fetching navbar categories:', err);
      }
    }
    loadCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchOverlay(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* HEADER / NAVIGATION CONTAINER */}
      <header className="w-full bg-white relative py-3 md:py-4 border-b border-zinc-100/50 z-[60]">
        {/* MAIN HEADER ROW (Middle) */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between relative">
          
          {/* LEFT: Search Icon Toggle (Enclosed in a clean circle outline) */}
          <div className="flex items-center">
            <button
              onClick={() => setShowSearchOverlay(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 hover:bg-zinc-50 transition-colors duration-200 text-zinc-700"
              title="Search Products"
            >
              <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
          </div>

          {/* CENTER: Centered Logo ("ONWEAR" in clean uppercase bold font) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" className="flex items-center text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.12em] sm:tracking-[0.2em] text-zinc-950 hover:opacity-90 transition-opacity uppercase">
              ONWEAR
            </Link>
          </div>

          {/* RIGHT: User Profile / Hamburger Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Account Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-50 transition-colors duration-200 text-zinc-700"
                title="Account Settings"
              >
                <User className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>

              {/* Account Dropdown */}
              {showAccountDropdown && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowAccountDropdown(false)} />
                  <div className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-xl z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading ? (
                      <div className="p-2 text-center text-xs text-zinc-400">Loading...</div>
                    ) : user ? (
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="px-3 py-2 border-b border-zinc-50 mb-1">
                          <p className="font-bold text-zinc-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors font-semibold text-xs"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          Profile Settings
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <span>Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowAccountDropdown(false);
                          }}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left font-medium w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-sm">
                        <Link
                          href="/login"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-center rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors font-semibold px-3 py-2 text-zinc-800"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold px-3 py-2 text-white text-center"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-50 transition-colors duration-200 md:hidden text-zinc-700"
              aria-label="Open Side Menu"
            >
              <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* FULL-WIDTH SEARCH OVERLAY */}
        {showSearchOverlay && (
          <div className="absolute inset-0 bg-white z-50 flex items-center px-4 sm:px-6 lg:px-8 border-b border-zinc-200 animate-in fade-in duration-150">
            <div className="mx-auto max-w-3xl w-full flex items-center gap-4">
              <Search className="h-5 w-5 text-zinc-400 shrink-0" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-lg border-0 bg-transparent py-3 focus:outline-none focus:ring-0 placeholder-zinc-400 text-zinc-900"
                />
              </form>
              <button
                onClick={() => setShowSearchOverlay(false)}
                className="p-2 text-zinc-400 hover:text-zinc-800 transition-colors"
                aria-label="Close Search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CATEGORY NAVIGATION ROW (Sticky top - Desktop & Mobile) */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-10 md:h-12 flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-5 md:gap-8 text-[11px] md:text-xs tracking-wider text-zinc-500 font-medium h-full whitespace-nowrap min-w-max px-2 md:px-0">
            <Link href="/products" className="hover:text-zinc-950 transition-colors duration-200 h-full flex items-center">Shop</Link>
            {categories.map((cat: any) => {
              const subs = cat.subcategories || [];

              return (
                <div key={cat.id} className="relative group h-full flex items-center">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="hover:text-zinc-950 transition-colors duration-200 h-full flex items-center gap-0.5"
                  >
                    <span>{cat.name}</span>
                    {subs.length > 0 && <span className="text-[9px] text-zinc-400 font-bold hidden md:inline">▼</span>}
                  </Link>

                  {subs.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 hidden md:block">
                      <div className="w-56 bg-white border border-zinc-100 rounded-2xl p-2 shadow-xl flex flex-col gap-0.5 text-xs text-zinc-700">
                        {subs.map((sub: any, idx: number) => (
                          <Link
                            key={idx}
                            href={`/products?category=${sub.slug}`}
                            className="rounded-xl px-3 py-2 text-left hover:text-zinc-950 hover:bg-zinc-50 transition-colors font-medium"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBILE SIDEBAR DRAWER (Offcanvas Menu) */}
      {showMobileDrawer && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setShowMobileDrawer(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 bottom-0 right-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300 ease-out">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <Link href="/" onClick={() => setShowMobileDrawer(false)} className="text-xl font-bold tracking-wider text-zinc-950 uppercase">
                ONWEAR
              </Link>
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation inside Drawer */}
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Main Links</p>
                <Link
                  href="/"
                  onClick={() => setShowMobileDrawer(false)}
                  className="text-sm font-semibold text-zinc-800 hover:text-indigo-600 transition-colors py-2 block"
                >
                  Home Page
                </Link>
                <Link
                  href="/products"
                  onClick={() => setShowMobileDrawer(false)}
                  className="text-sm font-semibold text-zinc-800 hover:text-indigo-600 transition-colors py-2 block"
                >
                  Shop Catalog
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Product Categories</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setShowMobileDrawer(false)}
                    className="text-sm font-medium text-zinc-700 hover:text-indigo-600 transition-colors py-2 block border-b border-zinc-50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="text-xs text-zinc-500 mb-2">Logged in as <strong className="text-zinc-800">{user.name}</strong></div>
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileDrawer(false)}
                    className="flex justify-center items-center py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileDrawer(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-sm font-semibold text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileDrawer(false)}
                    className="flex justify-center items-center py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileDrawer(false)}
                    className="flex justify-center items-center py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* STICKY BOTTOM NAVIGATION BAR (Mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200 bg-white/95 backdrop-blur-md z-40 md:hidden flex items-center justify-around px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors w-14"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Category</span>
        </button>

        <Link
          href="/"
          className="flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors w-14"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>

        {user ? (
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors w-14"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors w-14"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-1">Login</span>
          </Link>
        )}
      </div>

      {/* 7. FLOATING STICKY CART ACTION BUTTON (Bottom Right - inspired by arjobd.com) */}
      <Link
        href="/cart"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 flex items-center justify-center rounded-full bg-[#bfa290] hover:bg-[#ae917f] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-14 h-14"
        title="View Shopping Cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-white animate-pulse">
            {cartCount}
          </span>
        )}
      </Link>

      {/* Spacer to prevent bottom nav from overlapping footer on mobile */}
      <div className="h-16 md:hidden w-full" />
    </>
  );
}
