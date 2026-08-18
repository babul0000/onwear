'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import Link from 'next/link';
import { 
  Users, ShoppingBag, DollarSign, Clock
} from 'lucide-react';
import QuickAddProduct from '../../components/QuickAddProduct';
import SalesOverviewChart from '../../components/SalesOverviewChart';
import AdminProductsTable from '../../components/AdminProductsTable';

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
  const [productList, setProductList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  const loadStatsAndProducts = async () => {
    if (!token) return;
    try {
      const [usersRes, productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/products?limit=9999&includeDeleted=true`),
        fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/categories`)
      ]);

      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const categoriesData = await categoriesRes.json();

      const userCount = usersData.success ? usersData.data.length : 0;
      const productCount = productsData.success ? productsData.data.length : 0;
      const ordersList = ordersData.success ? ordersData.data : [];
      const prodList = productsData.success ? productsData.data : [];
      
      setCategories(categoriesData.success ? categoriesData.data : []);
      setProductList(prodList.slice(0, 5)); // Keep first 5 for the catalog summary

      // Compute revenue (Paid orders total amount)
      const totalRevenue = ordersList
        .filter((o: any) => o.paymentStatus === 'PAID')
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      const pendingOrders = ordersList.filter((o: any) => o.status === 'PENDING').length;
      const deliveredOrders = ordersList.filter((o: any) => o.status === 'DELIVERED').length;

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
  };

  useEffect(() => {
    loadStatsAndProducts();
  }, [token]);

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* 1. BLUE AD BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none select-none">
          <svg className="h-full w-auto" viewBox="0 0 200 200" fill="currentColor">
            <path d="M0 0h200v200H0z" />
          </svg>
        </div>
        
        <div className="z-10 flex flex-col gap-1.5 max-w-xl">
          <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            Grow Sales
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">The easiest way to increase sales up to 22 times.</h3>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium">Unleash the power of this sales tactic and increase your revenue by 22 times.</p>
        </div>
        
        <Link 
          href="/admin/products"
          className="z-10 bg-white hover:bg-zinc-50 text-indigo-700 font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md shrink-0"
        >
          Get Started
        </Link>
      </div>

      {/* 2. FOUR SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Delivery */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Delivery</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-50 pt-3">
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{stats.pending}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Processing</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{stats.delivered}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Processed</p>
            </div>
          </div>
        </div>

        {/* Card 2: Payment */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-50 pt-3">
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">${stats.revenue.toFixed(0)}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{stats.orders}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Total Orders</p>
            </div>
          </div>
        </div>

        {/* Card 3: Product */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-50 pt-3">
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{stats.products}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">In Catalog</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">0</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Blocked</p>
            </div>
          </div>
        </div>

        {/* Card 4: Response */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Users</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-50 pt-3">
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{stats.users}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Customers</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">1</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Administrators</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHART AND STATISTICS LAYOUT */}
      <SalesOverviewChart revenue={stats.revenue} orders={stats.orders} />

      {/* 4. QUICK ADD PRODUCT FORM SECTION */}
      <QuickAddProduct token={token} categories={categories} onSuccess={loadStatsAndProducts} />

      {/* 5. PRODUCT LISTING CATALOG OVERVIEW TABLE */}
      <AdminProductsTable productList={productList} loading={loading} />
      
    </div>
  );
}
