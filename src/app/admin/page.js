'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import Link from 'next/link';
import { Users, ShoppingBag, Receipt, DollarSign, Clock, CheckCircle2, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;

    async function loadStats() {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/products?limit=9999&includeDeleted=true`),
          fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        const userCount = usersData.success ? usersData.data.length : 0;
        const productCount = productsData.success ? productsData.data.length : 0;
        const ordersList = ordersData.success ? ordersData.data : [];

        // Compute revenue (Paid orders total amount)
        const totalRevenue = ordersList
          .filter((o) => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const pendingOrders = ordersList.filter((o) => o.status === 'PENDING').length;
        const deliveredOrders = ordersList.filter((o) => o.status === 'DELIVERED').length;

        setStats({
          users: userCount,
          products: productCount,
          orders: ordersList.length,
          revenue: totalRevenue,
          pending: pendingOrders,
          delivered: deliveredOrders
        });
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

  if (!token || !user || user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Access Denied</h2>
        <p className="text-zinc-500 text-sm">Only administrators can access this page.</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50 border-green-200' },
    { title: 'Total Orders', value: stats.orders, icon: Receipt, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Pending Orders', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Delivered Orders', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Total Products', value: stats.products, icon: ShoppingBag, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { title: 'Registered Users', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-indigo-600" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time store summaries and inventory metrics</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link href="/admin/products" className="rounded-full bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 transition-colors">
            Manage Products
          </Link>
          <Link href="/admin/categories" className="rounded-full bg-white border border-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
            Manage Categories
          </Link>
          <Link href="/admin/orders" className="rounded-full bg-white border border-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors">
            Manage Orders
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 border border-zinc-200 bg-white rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between border border-zinc-200 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-zinc-500">{card.title}</span>
                  <span className="text-3xl font-extrabold text-zinc-900">{card.value}</span>
                </div>
                <div className={`rounded-2xl border p-4 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Modules Navigation Panel */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6 mt-4">
        <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">Quick Access Administration Modules</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="flex flex-col gap-2 border border-zinc-100 p-4 rounded-xl hover:bg-zinc-50 transition-colors hover:border-indigo-200"
          >
            <h4 className="font-bold text-zinc-900 text-sm">Product Inventory</h4>
            <p className="text-xs text-zinc-500">Create, edit, soft delete products and update stocks.</p>
          </Link>

          <Link
            href="/admin/categories"
            className="flex flex-col gap-2 border border-zinc-100 p-4 rounded-xl hover:bg-zinc-50 transition-colors hover:border-indigo-200"
          >
            <h4 className="font-bold text-zinc-900 text-sm">Product Categories</h4>
            <p className="text-xs text-zinc-500">Manage categories, slugs, descriptions, and statuses.</p>
          </Link>

          <Link
            href="/admin/orders"
            className="flex flex-col gap-2 border border-zinc-100 p-4 rounded-xl hover:bg-zinc-50 transition-colors hover:border-indigo-200"
          >
            <h4 className="font-bold text-zinc-900 text-sm">Customer Orders</h4>
            <p className="text-xs text-zinc-500">View shipping addresses, verify totals, update tracking statuses.</p>
          </Link>

          <Link
            href="/admin/users"
            className="flex flex-col gap-2 border border-zinc-100 p-4 rounded-xl hover:bg-zinc-50 transition-colors hover:border-indigo-200"
          >
            <h4 className="font-bold text-zinc-900 text-sm">User Directory</h4>
            <p className="text-xs text-zinc-500">Monitor registered accounts, change roles, check details.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
