'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, LayoutDashboard, ShoppingBag, FolderTree, 
  Receipt, MessageSquare, Users, LogOut, ArrowRightLeft, Bell, Info
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: Receipt },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  // Determine current active page name
  const currentItem = menuItems.find(item => item.href === pathname);
  const pageTitle = currentItem ? currentItem.name : 'Admin Panel';

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-68 bg-white border-r border-zinc-200/80 flex flex-col shrink-0">
        
        {/* Brand/Logo */}
        <div className="p-6 border-b border-zinc-100 flex items-center">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-black tracking-wider text-zinc-950">
            <Store className="h-5 w-5 text-indigo-600" />
            <span className="tracking-[0.1em]">ONWEAR</span>
            <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
          </Link>
        </div>

        {/* Admin Profile Details */}
        <div className="mx-4 my-6 p-4 bg-zinc-50/80 rounded-2xl flex items-center justify-between border border-zinc-100 hover:bg-zinc-100/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-zinc-950 text-white shadow-md hover:bg-zinc-900' 
                    : 'text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Exit & Shop Redirection */}
        <div className="p-4 border-t border-zinc-100 flex flex-col gap-1.5">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/70 rounded-2xl text-sm font-bold transition-all"
          >
            <ArrowRightLeft className="h-4.5 w-4.5 text-zinc-400" />
            <span>View Client Shop</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-950">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="h-8.5 w-8.5 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm">
                <Bell className="h-4 w-4" />
              </button>
              <button className="h-8.5 w-8.5 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm">
                <Info className="h-4 w-4" />
              </button>
            </div>
            
            <Link 
              href="/"
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 transition-all shadow-sm"
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
