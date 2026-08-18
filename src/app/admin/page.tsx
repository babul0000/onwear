'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import Link from 'next/link';
import { 
  Users, ShoppingBag, DollarSign, Clock, Truck, ShoppingCart, Percent, Tag, ArrowRight
} from 'lucide-react';
import QuickAddProduct from '../../components/QuickAddProduct';
import SalesOverviewChart from '../../components/SalesOverviewChart';
import AdminProductsTable from '../../components/AdminProductsTable';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    processingShipments: 0,
    completedDeliveries: 0,
    revenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    blockedProducts: 0,
    customersCount: 0,
    adminsCount: 0
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

      const usersList = usersData.success ? usersData.data : [];
      const ordersList = ordersData.success ? ordersData.data : [];
      const prodList = productsData.success ? productsData.data : [];
      
      setCategories(categoriesData.success ? categoriesData.data : []);
      setProductList(prodList.slice(0, 5)); // Recent 5 for dashboard overview

      // Compute statistics based on database records
      const processingShipments = ordersList.filter((o: any) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
      const completedDeliveries = ordersList.filter((o: any) => o.status === 'DELIVERED').length;

      const totalRevenue = ordersList
        .filter((o: any) => o.paymentStatus === 'PAID')
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      const activeProducts = prodList.filter((p: any) => p.status === 'ACTIVE' && !p.isDeleted).length;
      const blockedProducts = prodList.filter((p: any) => p.status === 'INACTIVE' || p.isDeleted).length;

      const customersCount = usersList.filter((u: any) => u.role === 'customer').length;
      const adminsCount = usersList.filter((u: any) => u.role === 'admin').length;

      setStats({
        processingShipments,
        completedDeliveries,
        revenue: totalRevenue,
        totalOrders: ordersList.length,
        activeProducts,
        blockedProducts,
        customersCount,
        adminsCount
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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto text-zinc-300">
      
      {/* 1. GROWTH MARKETING BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-zinc-950 border border-zinc-900/60 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Glow Filters */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="z-10 flex flex-col gap-1.5 max-w-xl">
          <span className="inline-flex w-fit items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
            Grow Your Store
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">Discover sales opportunities and improve your store performance.</h3>
          <p className="text-xs text-zinc-400 font-medium">Optimize catalog options, track customer transactions, and launch targeted promotional coupons.</p>
        </div>
        
        <Link 
          href="/admin/products"
          className="z-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0 flex items-center gap-1.5 border border-indigo-500/20"
        >
          <span>Quick Start</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 2. FOUR SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Delivery */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Delivery</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-3">
            <div>
              <p className="text-2xl font-black text-white">{stats.processingShipments}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Processing</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.completedDeliveries}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Completed</p>
            </div>
          </div>
        </div>

        {/* Card 2: Payment */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payment</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-3">
            <div>
              <p className="text-2xl font-black text-white">৳{stats.revenue.toLocaleString()}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Orders</p>
            </div>
          </div>
        </div>

        {/* Card 3: Product */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Products</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-3">
            <div>
              <p className="text-2xl font-black text-white">{stats.activeProducts}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Active</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.blockedProducts}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Blocked</p>
            </div>
          </div>
        </div>

        {/* Card 4: Users */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Users</span>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-3">
            <div>
              <p className="text-2xl font-black text-white">{stats.customersCount}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Customers</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats.adminsCount}</p>
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase mt-0.5 tracking-wider">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHART AND STATISTICS LAYOUT */}
      <SalesOverviewChart revenue={stats.revenue} orders={stats.totalOrders} />

      {/* 4. QUICK ADD PRODUCT FORM SECTION */}
      <QuickAddProduct token={token} categories={categories} onSuccess={loadStatsAndProducts} />

      {/* 5. PRODUCT LISTING CATALOG OVERVIEW TABLE */}
      <AdminProductsTable productList={productList} loading={loading} />
      
    </div>
  );
}
