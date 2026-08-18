'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, LayoutDashboard, ShoppingBag, FolderTree, 
  Receipt, Users, ArrowRightLeft, Truck, Tag, Landmark, 
  BarChart3, Settings, ShoppingCart, ChevronDown, ChevronUp, Sliders, Percent
} from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
  userRole: string;
}

export default function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    delivery: true,
    order: true,
    product: true,
    data: true
  });

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const handlePlaceholderClick = (e: React.MouseEvent, moduleName: string) => {
    e.preventDefault();
    alert(`${moduleName} module is under development and will be available in the next release!`);
  };

  return (
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
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900 truncate leading-none">{userName}</p>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Sidemenu Navigation */}
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

        {/* Delivery Dropdown */}
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
            <div className="pl-9 pr-2 space-y-0.5">
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

        {/* Order Dropdown */}
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
            <div className="pl-9 pr-2 space-y-0.5">
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

        {/* Product Dropdown */}
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
            <div className="pl-9 pr-2 space-y-0.5">
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

        {/* My Promotion */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'My Promotion')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Tag className="h-4.5 w-4.5 text-zinc-400" />
          <span>My Promotion</span>
        </a>

        {/* Purchase Manage */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Purchase Manage')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <ShoppingCart className="h-4.5 w-4.5 text-zinc-400" />
          <span>Purchase Manage</span>
        </a>

        {/* Finance */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Finance')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Landmark className="h-4.5 w-4.5 text-zinc-400" />
          <span>Finance</span>
        </a>

        {/* Data Dropdown */}
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
            <div className="pl-9 pr-2 space-y-0.5">
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

        {/* Seller Development */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Seller Development')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Sliders className="h-4.5 w-4.5 text-zinc-400" />
          <span>Seller Development</span>
        </a>

        {/* Sales Program */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Sales Program')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Percent className="h-4.5 w-4.5 text-zinc-400" />
          <span>Sales Program</span>
        </a>

        {/* Buyer Services */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Buyer Services')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Users className="h-4.5 w-4.5 text-zinc-400" />
          <span>Buyer Services</span>
        </a>

        {/* Shop */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Shop Settings')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Store className="h-4.5 w-4.5 text-zinc-400" />
          <span>Shop Settings</span>
        </a>

        {/* Settings */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Settings')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 transition-all"
        >
          <Settings className="h-4.5 w-4.5 text-zinc-400" />
          <span>Settings</span>
        </a>
      </nav>

      {/* Exit to Shop */}
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
  );
}
