'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, LayoutDashboard, ShoppingBag, FolderTree, 
  Receipt, MessageSquare, Users, ArrowRightLeft, Bell, Info,
  Truck, CreditCard, Tag, Landmark, BarChart3, Settings, Shield,
  BadgeAlert, ShoppingCart, UserCog, ChevronDown, ChevronUp, Sliders, Percent
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Dropdown menus states
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    delivery: true,
    order: true,
    product: true,
    data: true
  });

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!token || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <Info className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Access Denied</h2>
          <p className="text-zinc-500 mt-2 text-sm">Only registered administrators have permissions to view this control dashboard.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors shadow-md"
          >
            Go back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceholderClick = (e: React.MouseEvent, moduleName: string) => {
    e.preventDefault();
    alert(`${moduleName} module is under development and will be available in the next release!`);
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      
      {/* SIDEBAR (Wider scrollable area for high-end feel) */}
      <aside className="w-68 bg-white border-r border-zinc-200/80 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-100">
        
        {/* Brand/Logo */}
        <div className="p-6 border-b border-zinc-100 flex items-center shrink-0">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-black tracking-wider text-zinc-950">
            <Store className="h-5 w-5 text-indigo-600" />
            <span className="tracking-[0.1em]">ONWEAR</span>
            <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
          </Link>
        </div>

        {/* Admin Profile Details */}
        <div className="mx-4 my-4 p-4 bg-zinc-50/80 rounded-2xl flex items-center shrink-0 border border-zinc-100">
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-md mr-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-zinc-900 truncate leading-none">{user.name}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Admin Panel</p>
          </div>
        </div>

        {/* MOCKUP SIDEMENU LIST */}
        <nav className="flex-1 px-3 space-y-1 pb-6">
          
          {/* Main Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              pathname === '/admin' 
                ? 'bg-zinc-950 text-white shadow-md' 
                : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* 1. Delivery Dropdown */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleMenu('delivery')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-4.5 w-4.5 text-zinc-400" />
                <span>Delivery</span>
              </div>
              {openMenus.delivery ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {openMenus.delivery && (
              <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
                <Link
                  href="/admin/orders"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/orders' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Shipments tracking
                </Link>
              </div>
            )}
          </div>

          {/* 2. Order Dropdown */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleMenu('order')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4.5 w-4.5 text-zinc-400" />
                <span>Order</span>
              </div>
              {openMenus.order ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {openMenus.order && (
              <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
                <Link
                  href="/admin/orders"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/orders' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Manage orders
                </Link>
              </div>
            )}
          </div>

          {/* 3. Product Dropdown */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleMenu('product')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4.5 w-4.5 text-zinc-400" />
                <span>Product</span>
              </div>
              {openMenus.product ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {openMenus.product && (
              <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
                <Link
                  href="/admin/products"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/products' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Products inventory
                </Link>
                <Link
                  href="/admin/categories"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/categories' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Categories
                </Link>
              </div>
            )}
          </div>

          {/* 4. My Promotion */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'My Promotion')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Tag className="h-4.5 w-4.5 text-zinc-400" />
            <span>My Promotion</span>
          </a>

          {/* 5. Purchase Manage */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Purchase Manage')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-zinc-400" />
            <span>Purchase Manage</span>
          </a>

          {/* 6. Finance */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Finance')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Landmark className="h-4.5 w-4.5 text-zinc-400" />
            <span>Finance</span>
          </a>

          {/* 7. Data Dropdown (Reviews & Users) */}
          <div className="space-y-0.5">
            <button
              onClick={() => toggleMenu('data')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4.5 w-4.5 text-zinc-400" />
                <span>Data</span>
              </div>
              {openMenus.data ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {openMenus.data && (
              <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
                <Link
                  href="/admin/users"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/users' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  User Directory
                </Link>
                <Link
                  href="/admin/reviews"
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    pathname === '/admin/reviews' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  Customer Reviews
                </Link>
              </div>
            )}
          </div>

          {/* 8. Seller Development */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Seller Development')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Sliders className="h-4.5 w-4.5 text-zinc-400" />
            <span>Seller Development</span>
          </a>

          {/* 9. Sales Program */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Sales Program')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Percent className="h-4.5 w-4.5 text-zinc-400" />
            <span>Sales Program</span>
          </a>

          {/* 10. Buyer Services */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Buyer Services')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Users className="h-4.5 w-4.5 text-zinc-400" />
            <span>Buyer Services</span>
          </a>

          {/* 11. Shop */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Shop Settings')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Store className="h-4.5 w-4.5 text-zinc-400" />
            <span>Shop Settings</span>
          </a>

          {/* 12. Settings */}
          <a
            href="#"
            onClick={(e) => handlePlaceholderClick(e, 'Settings')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
          >
            <Settings className="h-4.5 w-4.5 text-zinc-400" />
            <span>Settings</span>
          </a>

        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-100 flex flex-col gap-1.5 shrink-0">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-2xl text-xs font-bold transition-all"
          >
            <ArrowRightLeft className="h-4.5 w-4.5 text-zinc-400" />
            <span>View Client Shop</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
            <span>System Status:</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Online</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm cursor-pointer">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm cursor-pointer">
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <Link 
              href="/"
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-[11px] font-black tracking-wider uppercase text-zinc-700 bg-white hover:bg-zinc-50 transition-all shadow-sm"
            >
              View Shop
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-8 flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
