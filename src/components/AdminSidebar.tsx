'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Store, LayoutDashboard, ShoppingBag, FolderTree, 
  Receipt, Users, ArrowRightLeft, Truck, Tag, Landmark, 
  BarChart3, Settings, ShoppingCart, ChevronDown, ChevronUp, 
  Sliders, Percent, LogOut, Megaphone
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    delivery: true,
    orders: true,
    products: true,
    data: true,
    marketing: false
  });

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const handlePlaceholderClick = (e: React.MouseEvent, moduleName: string) => {
    e.preventDefault();
    alert(`🚧 Coming Soon\n\nThe "${moduleName}" module is currently under development.`);
  };

  const userName = user?.name || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="w-68 bg-white border-r border-zinc-200/85 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto text-zinc-600 select-none">
      
      {/* Brand Section */}
      <div className="p-6 border-b border-zinc-100 flex items-center shrink-0">
        <Link href="/admin" className="flex flex-col gap-0.5 select-none group">
          <span className="text-lg font-black tracking-[0.15em] text-zinc-950 transition-all group-hover:text-indigo-600">ONWEAR</span>
          <span className="text-[8px] tracking-wider w-fit font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded shadow-sm">ADMIN</span>
        </Link>
      </div>

      {/* Admin Profile Widget */}
      <div className="mx-4 my-4 p-4 bg-zinc-50/80 rounded-2xl flex items-center shrink-0 border border-zinc-100">
        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-md mr-3 shrink-0">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-zinc-900 truncate leading-none mb-1">{userName}</p>
          <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Administrator</p>
        </div>
      </div>

      {/* Navigation menu items */}
      <nav className="flex-1 px-3 space-y-1 pb-6 text-[11px] font-bold">
        
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
            pathname === '/admin' 
              ? 'bg-zinc-950 text-white shadow-md font-extrabold' 
              : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-950'
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Delivery Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => toggleMenu('delivery')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer text-left"
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
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/orders' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Shipments
              </Link>
            </div>
          )}
        </div>

        {/* Orders Link */}
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
            pathname === '/admin/orders' 
              ? 'bg-zinc-950 text-white shadow-md font-extrabold' 
              : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-950'
          }`}
        >
          <ShoppingCart className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span>Orders</span>
        </Link>

        {/* Products Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => toggleMenu('products')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4.5 w-4.5 text-zinc-400" />
              <span>Products</span>
            </div>
            {openMenus.products ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {openMenus.products && (
            <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
              <Link
                href="/admin/products"
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/products' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-755'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/admin/products/add-product"
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Add Product
              </Link>
              <Link
                href="/admin/categories"
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/categories' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Categories
              </Link>
              <Link
                href="/admin/products"
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Inventory
              </Link>
            </div>
          )}
        </div>

        {/* Data Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => toggleMenu('data')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer text-left"
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
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/users' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Customers
              </Link>
              <Link
                href="/admin/users"
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/users' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Users
              </Link>
              <Link
                href="/admin/reviews"
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/reviews' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Reviews
              </Link>
            </div>
          )}
        </div>

        {/* Marketing Dropdown */}
        <div className="space-y-0.5">
          <button
            onClick={() => toggleMenu('marketing')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <Megaphone className="h-4.5 w-4.5 text-zinc-400" />
              <span>Marketing</span>
            </div>
            {openMenus.marketing ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {openMenus.marketing && (
            <div className="pl-9 pr-2 space-y-0.5 animate-fadeIn">
              <a
                href="#"
                onClick={(e) => handlePlaceholderClick(e, 'Promotions')}
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Promotions
              </a>
              <a
                href="#"
                onClick={(e) => handlePlaceholderClick(e, 'Coupons')}
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Coupons
              </a>
              <a
                href="#"
                onClick={(e) => handlePlaceholderClick(e, 'Campaigns')}
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Campaigns
              </a>
            </div>
          )}
        </div>

        {/* Finance */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Finance')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer"
        >
          <Landmark className="h-4.5 w-4.5 text-zinc-400" />
          <span>Finance</span>
        </a>

        {/* Sales Program */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Sales Program')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer"
        >
          <Percent className="h-4.5 w-4.5 text-zinc-400" />
          <span>Sales Program</span>
        </a>

        {/* Settings */}
        <a
          href="#"
          onClick={(e) => handlePlaceholderClick(e, 'Settings')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-zinc-100/70 hover:text-zinc-950 transition-all cursor-pointer"
        >
          <Settings className="h-4.5 w-4.5 text-zinc-400" />
          <span>Settings</span>
        </a>

      </nav>

      {/* Exit to Shop & Logout */}
      <div className="p-4 border-t border-zinc-100 flex flex-col gap-1 shrink-0 text-[11px] font-bold">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100/70 hover:text-zinc-900 rounded-2xl transition-all"
        >
          <ArrowRightLeft className="h-4.5 w-4.5 text-zinc-400" />
          <span>View Shop</span>
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all text-left cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-red-500/80" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
