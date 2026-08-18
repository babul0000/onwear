'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Info } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

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

  // Determine current active page name
  const menuNames: Record<string, string> = {
    '/admin': 'Dashboard Overview',
    '/admin/products': 'Products Inventory',
    '/admin/categories': 'Product Categories',
    '/admin/orders': 'Customer Orders',
    '/admin/reviews': 'Customer Reviews',
    '/admin/users': 'User Directory',
  };
  const pageTitle = menuNames[pathname] || 'Admin Panel';

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans text-zinc-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <AdminHeader pageTitle={pageTitle} />
        <main className="p-8 flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
