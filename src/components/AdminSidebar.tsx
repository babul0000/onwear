'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Store, LayoutDashboard, ShoppingBag, FolderTree, 
  Receipt, Users, ArrowRightLeft, Truck, Tag, Landmark, 
  BarChart3, Settings, ShoppingCart, ChevronDown, ChevronUp, 
  Sliders, Percent, LogOut, Megaphone, X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto bg-white text-zinc-600 select-none">
      {/* Brand Section */}
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <Link href="/admin" onClick={onClose} className="flex flex-col gap-0.5 select-none group">
          <span className="text-lg font-black tracking-[0.15em] text-zinc-950 transition-all group-hover:text-indigo-600">ONWEAR</span>
          <span className="text-[8px] tracking-wider w-fit font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">ADMIN PANEL</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
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
          onClick={onClose}
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
                onClick={onClose}
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
          onClick={onClose}
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
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/products' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/admin/products/add-product"
                onClick={onClose}
                className="block px-3 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Add Product
              </Link>
              <Link
                href="/admin/categories"
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/categories' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Categories
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
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/users' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Customers
              </Link>
              <Link
                href="/admin/reviews"
                onClick={onClose}
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
              <Link
                href="/admin/promotions"
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/promotions' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Promotions
              </Link>
              <Link
                href="/admin/coupons"
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/coupons' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Coupons
              </Link>
              <Link
                href="/admin/campaigns"
                onClick={onClose}
                className={`block px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/campaigns' ? 'text-indigo-600 bg-indigo-50/50' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Campaigns
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/admin/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
            pathname === '/admin/settings' 
              ? 'bg-zinc-950 text-white shadow-md font-extrabold' 
              : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-950'
          }`}
        >
          <Settings className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
          <span>Settings</span>
        </Link>

      </nav>

      {/* Exit to Shop & Logout */}
      <div className="p-4 border-t border-zinc-100 flex flex-col gap-1 shrink-0 text-[11px] font-bold">
        <Link 
          href="/"
          onClick={onClose}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-68 bg-white border-r border-zinc-200/85 flex-col shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300 ease-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
