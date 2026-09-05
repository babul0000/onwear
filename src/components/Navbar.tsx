'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Search,
  Menu,
  X,
  Home,
  ShoppingBag,
  Package,
  ArrowRight,
  Loader2,
  ChevronDown,
  Phone,
  MessageSquare
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
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { cart, wishlist, openCartDrawer } = useCart();
  const { settings } = useSettings();

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
          `${API_URL}/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`
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

  // Fetch categories dynamically from database
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const dynamicCats = data.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subcategories: (cat.subcategories || []).map((sub: any) => ({
              name: sub.name,
              slug: sub.slug
            }))
          }));
          setCategories(dynamicCats);
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
      {/* 0. DYNAMIC TOP ANNOUNCEMENT BAR */}
      {settings.announcementEnabled && settings.announcementText && (
        <div className="w-full bg-zinc-950 text-white text-[11px] font-semibold py-1.5 sm:py-2 px-3 sm:px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-zinc-800 z-[70] relative">
          {settings.announcementLink ? (
            <Link
              href={settings.announcementLink}
              className="hover:text-teal-400 transition-colors flex items-center gap-1.5 font-medium truncate max-w-[95vw]"
            >
              <span className="truncate">{settings.announcementText}</span>
              <ArrowRight className="h-3 w-3 shrink-0 inline" />
            </Link>
          ) : (
            <span className="truncate max-w-[95vw]">{settings.announcementText}</span>
          )}
        </div>
      )}

      {/* 1. MAIN HEADER ROW */}
      <header className="w-full bg-white relative py-2.5 sm:py-3.5 border-b border-zinc-100 z-[60]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between relative">
          
          {/* LEFT: Mobile Menu Drawer Toggle + Search Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 active:scale-95 transition-all text-zinc-800 md:hidden cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Button */}
            <button
              onClick={() => setShowSearchOverlay(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200/80 hover:bg-zinc-50 active:scale-95 transition-all text-zinc-700 cursor-pointer"
              title="Search Catalog"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* CENTER: Store Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-7 sm:h-9 md:h-11 w-auto object-contain max-w-[140px] sm:max-w-[180px]"
                />
              ) : (
                <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.14em] text-zinc-950 uppercase">
                  {settings.storeName || 'ONWEAR'}
                </span>
              )}
            </Link>
          </div>

          {/* RIGHT: Desktop Icons (Wishlist, Account) & Always-Visible Cart Bag */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist Link (Desktop) */}
            <Link
              href="/wishlist"
              className="relative hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 transition-colors text-zinc-700"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Toggle (Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer"
                title="Account Settings"
              >
                <User className="h-5 w-5" />
              </button>

              {/* Account Dropdown */}
              {showAccountDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowAccountDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-xl z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading ? (
                      <div className="p-3 text-center text-xs text-zinc-400">Loading...</div>
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
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors font-bold text-xs"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors text-xs font-semibold"
                        >
                          Profile & Addresses
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors text-xs font-semibold"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/orders/track"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold text-xs transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          <span>Track Parcel</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowAccountDropdown(false);
                          }}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left font-semibold text-xs w-full cursor-pointer mt-1"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 text-sm">
                        <Link
                          href="/login"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors font-bold px-3 py-2 text-zinc-900 text-xs"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-center rounded-xl bg-zinc-950 hover:bg-zinc-800 transition-colors font-bold px-3 py-2 text-white text-xs text-center"
                        >
                          Create Account
                        </Link>
                        <Link
                          href="/orders/track"
                          onClick={() => setShowAccountDropdown(false)}
                          className="flex items-center justify-center rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 transition-colors font-bold px-3 py-2 text-teal-900 text-center text-xs mt-1"
                        >
                          📦 Track Order
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Shopping Bag Button (Opens Cart Slide-Over Drawer) */}
            <button
              onClick={openCartDrawer}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Shopping Cart"
              aria-label="Open Shopping Bag"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-black text-white ring-2 ring-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* FULLSCREEN SEARCH OVERLAY WITH INSTANT LIVE RESULTS */}
        {showSearchOverlay && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-200 flex flex-col justify-start">
            <div className="bg-white border-b border-zinc-200 shadow-2xl p-4 sm:p-6 w-full max-h-[85vh] flex flex-col">
              <div className="mx-auto max-w-3xl w-full flex flex-col gap-4">
                
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 bg-zinc-100 rounded-2xl px-4 py-3 border border-zinc-200">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 text-teal-600 animate-spin shrink-0" />
                  ) : (
                    <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                  )}
                  <form onSubmit={handleSearchSubmit} className="flex-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search shirts, polo, pants, panjabi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-base border-0 bg-transparent focus:outline-none placeholder-zinc-400 text-zinc-950 font-medium"
                    />
                  </form>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setLiveResults([]);
                      }}
                      className="p-1 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowSearchOverlay(false);
                      setSearchQuery('');
                      setLiveResults([]);
                    }}
                    className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors ml-1"
                    aria-label="Close Search"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* LIVE RESULTS DROPDOWN */}
                {searchQuery.trim().length >= 2 && (
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-1">
                    <div className="flex justify-between items-center px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>Products ({liveResults.length})</span>
                      {liveResults.length > 0 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-teal-600 hover:underline flex items-center gap-1 font-bold text-xs"
                        >
                          <span>View All Results</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {liveResults.length === 0 && !isSearching ? (
                      <div className="py-8 text-center text-xs text-zinc-500">
                        No products found matching "{searchQuery}".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {liveResults.map((prod) => {
                          const hasDiscount = prod.discountPrice !== null && prod.discountPrice !== undefined;
                          const finalPrice = hasDiscount ? prod.discountPrice : prod.price;

                          return (
                            <div
                              key={prod.id}
                              onClick={() => handleSelectResult(prod.id)}
                              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-all cursor-pointer group"
                            >
                              <img
                                src={prod.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=100'}
                                alt={prod.name}
                                className="h-14 w-14 rounded-xl object-cover bg-zinc-100 shrink-0"
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider truncate">
                                  {prod.category?.name || 'ONWEAR'}
                                </span>
                                <span className="text-xs font-bold text-zinc-900 group-hover:text-teal-600 transition-colors truncate">
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
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setShowSearchOverlay(false)} />
          </div>
        )}
      </header>

      {/* 2. DESKTOP CATEGORY NAVIGATION ROW (Sticky Desktop Only) */}
      <div className="hidden md:block sticky top-0 z-40 w-full bg-white border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-center">
          <nav className="flex items-center gap-8 text-xs tracking-wider text-zinc-600 font-semibold h-full">
            <Link
              href="/products"
              className={`hover:text-zinc-950 transition-colors h-full flex items-center ${
                pathname === '/products' ? 'text-zinc-950 font-black border-b-2 border-zinc-950' : ''
              }`}
            >
              All Products
            </Link>
            {categories.map((cat: any) => {
              const subs = cat.subcategories || [];
              const isActive = pathname.includes(cat.slug);

              return (
                <div key={cat.id} className="relative group h-full flex items-center">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`hover:text-zinc-950 transition-colors h-full flex items-center gap-1 ${
                      isActive ? 'text-zinc-950 font-black' : ''
                    }`}
                  >
                    <span>{cat.name}</span>
                    {subs.length > 0 && <ChevronDown className="h-3 w-3 text-zinc-400 group-hover:rotate-180 transition-transform duration-200" />}
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

      {/* 3. MOBILE CATEGORY SCROLL PILLS STRIP (Sticky Mobile Only) */}
      <div className="md:hidden sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-xs">
        <div className="px-3 h-11 flex items-center overflow-x-auto no-scrollbar gap-2">
          <Link
            href="/products"
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              pathname === '/products'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Products
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-xs font-semibold whitespace-nowrap transition-all shrink-0"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 4. MOBILE SIDEBAR DRAWER (Sliding Left Offcanvas) */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowMobileDrawer(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[85vw] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 ease-out">
            {/* Drawer Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <Link
                href="/"
                onClick={() => setShowMobileDrawer(false)}
                className="text-lg font-black tracking-widest text-zinc-950 uppercase"
              >
                {settings.storeName || 'ONWEAR'}
              </Link>
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="p-2 rounded-full hover:bg-zinc-200 text-zinc-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              
              {/* Quick Navigation Links */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-1">
                  Menu
                </p>
                <Link
                  href="/"
                  onClick={() => setShowMobileDrawer(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 text-sm font-bold text-zinc-800"
                >
                  <Home className="h-4.5 w-4.5 text-zinc-500" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/products"
                  onClick={() => setShowMobileDrawer(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 text-sm font-bold text-zinc-800"
                >
                  <ShoppingBag className="h-4.5 w-4.5 text-zinc-500" />
                  <span>All Products</span>
                </Link>
                <Link
                  href="/orders/track"
                  onClick={() => setShowMobileDrawer(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-teal-50 text-teal-900 font-bold text-sm"
                >
                  <Package className="h-4.5 w-4.5 text-teal-600" />
                  <span>Track Parcel</span>
                </Link>
              </div>

              {/* Categories Accordion */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-1">
                  Categories
                </p>
                {categories.map((cat: any) => {
                  const subs = cat.subcategories || [];
                  const isExpanded = expandedMobileCat === cat.id;

                  return (
                    <div key={cat.id} className="border-b border-zinc-100 last:border-0 py-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setShowMobileDrawer(false)}
                          className="text-sm font-bold text-zinc-800 hover:text-teal-600 py-2 flex-1"
                        >
                          {cat.name}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            onClick={() => setExpandedMobileCat(isExpanded ? null : cat.id)}
                            className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories Dropdown */}
                      {subs.length > 0 && isExpanded && (
                        <div className="pl-3 pb-2 flex flex-col gap-1.5 border-l-2 border-zinc-200 ml-2 mt-1 animate-in slide-in-from-top-1 duration-150">
                          <Link
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setShowMobileDrawer(false)}
                            className="text-xs font-bold text-teal-600 py-1"
                          >
                            View All {cat.name}
                          </Link>
                          {subs.map((sub: any, idx: number) => (
                            <Link
                              key={idx}
                              href={`/products?category=${sub.slug}`}
                              onClick={() => setShowMobileDrawer(false)}
                              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 py-1"
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

              {/* Customer Contact Support */}
              <div className="flex flex-col gap-2 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Customer Hotline
                </p>
                <a
                  href={`tel:${settings.phone || '01603742963'}`}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-800"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{settings.phone || '01603-742963'}</span>
                </a>
              </div>

            </div>

            {/* Drawer Footer Auth Button */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 truncate">{user.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{user.role}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMobileDrawer(false)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs text-center shadow-xs"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileDrawer(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileDrawer(false)}
                    className="py-2.5 rounded-xl border border-zinc-200 text-center text-xs font-bold text-zinc-800 bg-white hover:bg-zinc-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileDrawer(false)}
                    className="py-2.5 rounded-xl bg-zinc-950 text-center text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. STICKY 5-TAB NATIVE APP MOBILE BOTTOM NAVIGATION */}
      {!pathname.startsWith('/products/') && pathname !== '/checkout' && (
        <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md z-40 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          
          {/* Tab 1: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              pathname === '/' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] mt-1">Home</span>
          </Link>

          {/* Tab 2: Shop */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              pathname === '/products' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] mt-1">Shop</span>
          </Link>

          {/* Tab 3: Track Order */}
          <Link
            href="/orders/track"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              pathname === '/orders/track' ? 'text-teal-650 font-bold' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] mt-1">Track</span>
          </Link>

          {/* Tab 4: Wishlist */}
          <Link
            href="/wishlist"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              pathname === '/wishlist' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-4 sm:right-6 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                {wishlistCount}
              </span>
            )}
            <span className="text-[10px] mt-1">Wishlist</span>
          </Link>

          {/* Tab 5: Profile / Login */}
          <Link
            href={user ? '/profile' : '/login'}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              pathname === '/profile' || pathname === '/login' ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] mt-1">{user ? 'Account' : 'Login'}</span>
          </Link>

        </div>
      )}
    </>
  );
}
