'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
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
  Home,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatPrice } from '../utils/format';

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
  const { cart, wishlist, openCartDrawer } = useCart();
  const { settings } = useSettings();
  const router = useRouter();

  // Component States
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const [categories, setCategories] = useState(DEFAULT_NAV_CATEGORIES);

  // Sum of quantities in cart
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`
        );
        const data = await res.json();
        if (data.success) {
          setLiveResults(data.data || []);
        }
      } catch (err) {
        console.error('Error in live search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Fetch categories for bottom navigation row
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          const fetchedCats = data.data;

          // Merge fetched categories from DB with our default navigation layout
          const merged = DEFAULT_NAV_CATEGORIES.map((defCat) => {
            const match = fetchedCats.find(
              (c: any) => c.slug.toLowerCase() === defCat.slug.toLowerCase()
            );

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchOverlay(false);
      setSearchQuery('');
      setLiveResults([]);
    }
  };

  const handleSelectResult = (productId: string) => {
    setShowSearchOverlay(false);
    setSearchQuery('');
    setLiveResults([]);
    router.push(`/products/${productId}`);
  };

  return (
    <>
      {/* HEADER / NAVIGATION CONTAINER */}
      <header className="w-full bg-white relative py-3 md:py-4 border-b border-zinc-100/50 z-[60]">
        {/* MAIN HEADER ROW (Middle) */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between relative">
          {/* LEFT: Search Icon Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setShowSearchOverlay(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 hover:bg-zinc-50 transition-colors duration-200 text-zinc-700"
              title="Search Products"
            >
              <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
          </div>

          {/* CENTER: Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-7 sm:h-9 md:h-11 w-auto object-contain max-w-[150px]"
                />
              ) : (
                <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.12em] sm:tracking-[0.2em] text-zinc-950 uppercase">
                  {settings.storeName}
                </span>
              )}
            </Link>
          </div>

          {/* RIGHT: User Profile / Wishlist / Cart Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-50 transition-colors duration-200 text-zinc-700"
              title="Wishlist"
            >
              <Heart className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button (Opens Slide-over Drawer) */}
            <button
              onClick={openCartDrawer}
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-zinc-50 transition-colors duration-200 text-zinc-700"
              title="Shopping Bag"
            >
              <ShoppingCart className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-black text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

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
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowAccountDropdown(false)}
                  />
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
                          Dashboard
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          My Orders
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
                          className="flex items-center justify-center rounded-xl bg-zinc-950 hover:bg-zinc-800 transition-colors font-semibold px-3 py-2 text-white text-center"
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

        {/* FULL-WIDTH SEARCH OVERLAY WITH INSTANT LIVE RESULTS */}
        {showSearchOverlay && (
          <div className="absolute inset-x-0 top-0 bg-white z-50 border-b border-zinc-200 shadow-2xl animate-in fade-in duration-150">
            <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-teal-600 animate-spin shrink-0" />
                ) : (
                  <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                )}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type to search (e.g. Linen Shirt, Denim Pant, Black T-Shirt)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-base sm:text-lg border-0 bg-transparent py-2 focus:outline-none focus:ring-0 placeholder-zinc-400 text-zinc-950 font-medium"
                  />
                </form>
                <button
                  onClick={() => {
                    setShowSearchOverlay(false);
                    setSearchQuery('');
                    setLiveResults([]);
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-800 transition-colors"
                  aria-label="Close Search"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* LIVE RESULTS DROPDOWN */}
              {searchQuery.trim().length >= 2 && (
                <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>Search Results ({liveResults.length})</span>
                    {liveResults.length > 0 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="text-teal-650 hover:underline flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {liveResults.length === 0 && !isSearching ? (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      No products found for "{searchQuery}".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 max-h-80 overflow-y-auto pr-1">
                      {liveResults.map((prod) => {
                        const hasDiscount =
                          prod.discountPrice !== null && prod.discountPrice !== undefined;
                        const finalPrice = hasDiscount ? prod.discountPrice : prod.price;

                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectResult(prod.id)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer group"
                          >
                            <img
                              src={
                                prod.image ||
                                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=100'
                              }
                              alt={prod.name}
                              className="h-12 w-12 rounded-lg object-cover bg-zinc-100 shrink-0"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider truncate">
                                {prod.category?.name || 'OnWear'}
                              </span>
                              <span className="text-xs font-bold text-zinc-900 group-hover:text-teal-650 transition-colors truncate">
                                {prod.name}
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xs font-black text-zinc-950 font-mono">
                                  {formatPrice(finalPrice)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[10px] text-zinc-400 line-through font-mono">
                                    {formatPrice(prod.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* DESKTOP CATEGORY NAVIGATION ROW (Sticky top - Desktop only) */}
      <div className="hidden md:block sticky top-0 z-50 w-full bg-white border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
          <nav className="flex items-center gap-8 text-xs tracking-wider text-zinc-500 font-medium h-full">
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
                    {subs.length > 0 && <span className="text-[9px] text-zinc-400 font-bold">▼</span>}
                  </Link>

                  {subs.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
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

      {/* MOBILE CATEGORY NAVIGATION ROW (Sticky top - Mobile only) */}
      <div className="md:hidden sticky top-0 z-50 w-full bg-white border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl px-4 h-10 flex items-center overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-5 text-[11px] tracking-wider text-zinc-500 font-medium h-full whitespace-nowrap min-w-max px-2">
            <Link href="/products" className="hover:text-zinc-950 transition-colors duration-200 h-full flex items-center">Shop</Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="hover:text-zinc-950 transition-colors duration-200 h-full flex items-center"
              >
                {cat.name}
              </Link>
            ))}
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
                {categories.map((cat) => {
                  const subs = cat.subcategories || [];
                  const isExpanded = expandedMobileCat === cat.id;

                  return (
                    <div key={cat.id} className="border-b border-zinc-50 py-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setShowMobileDrawer(false)}
                          className="text-sm font-semibold text-zinc-700 hover:text-indigo-650 transition-colors py-2 flex-1"
                        >
                          {cat.name}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            onClick={() => setExpandedMobileCat(isExpanded ? null : cat.id)}
                            className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors text-lg font-bold"
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        )}
                      </div>

                      {subs.length > 0 && isExpanded && (
                        <div className="pl-4 pb-2 flex flex-col gap-2 border-l-2 border-zinc-150/80 mt-1 animate-in slide-in-from-top-2 duration-150">
                          <Link
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setShowMobileDrawer(false)}
                            className="text-xs font-bold text-indigo-600 hover:underline py-1"
                          >
                            Shop All {cat.name}
                          </Link>
                          {subs.map((sub: any, idx: number) => (
                            <Link
                              key={idx}
                              href={`/products?category=${sub.slug}`}
                              onClick={() => setShowMobileDrawer(false)}
                              className="text-xs text-zinc-500 hover:text-indigo-650 py-1"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* 7. FLOATING STICKY CART ACTION BUTTON (Bottom Right) */}
      <button
        onClick={openCartDrawer}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 flex items-center justify-center rounded-full bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xl hover:scale-105 transition-all duration-300 w-14 h-14 border border-zinc-700"
        title="Open Shopping Bag"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-black text-white ring-2 ring-white animate-pulse">
            {cartCount}
          </span>
        )}
      </button>

      {/* Spacer to prevent bottom nav from overlapping footer on mobile */}
      <div className="h-16 md:hidden w-full" />
    </>
  );
}
