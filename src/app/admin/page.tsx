'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import Link from 'next/link';
import { 
  Users, ShoppingBag, DollarSign, Clock, Truck, ShoppingCart, ArrowRight, CheckCircle2, Package
} from 'lucide-react';
import QuickAddProduct from '../../components/QuickAddProduct';
import SalesOverviewChart from '../../components/SalesOverviewChart';
import AdminProductsTable from '../../components/AdminProductsTable';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    activeProducts: 0,
    blockedProducts: 0,
    customersCount: 0,
    adminsCount: 0
  });

  const [statusCounts, setStatusCounts] = useState({
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0
  });

  const [topProducts, setTopProducts] = useState<any[]>([]);
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
      const totalUsers = usersList.length;
      const totalProducts = prodList.filter((p: any) => !p.isDeleted).length;
      const totalOrders = ordersList.length;
      const totalRevenue = ordersList
        .filter((o: any) => o.paymentStatus === 'PAID')
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      const pendingOrders = ordersList.filter((o: any) => o.status === 'PENDING').length;
      const deliveredOrders = ordersList.filter((o: any) => o.status === 'DELIVERED').length;

      const activeProducts = prodList.filter((p: any) => p.status === 'ACTIVE' && !p.isDeleted).length;
      const blockedProducts = prodList.filter((p: any) => p.status === 'INACTIVE' || p.isDeleted).length;

      const customersCount = usersList.filter((u: any) => u.role === 'customer').length;
      const adminsCount = usersList.filter((u: any) => u.role === 'admin').length;

      setStats({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        activeProducts,
        blockedProducts,
        customersCount,
        adminsCount
      });

      // Compute order status breakdown
      setStatusCounts({
        PENDING: ordersList.filter((o: any) => o.status === 'PENDING').length,
        CONFIRMED: ordersList.filter((o: any) => o.status === 'CONFIRMED').length,
        PROCESSING: ordersList.filter((o: any) => o.status === 'PROCESSING').length,
        SHIPPED: ordersList.filter((o: any) => o.status === 'SHIPPED').length,
        DELIVERED: ordersList.filter((o: any) => o.status === 'DELIVERED').length,
        CANCELLED: ordersList.filter((o: any) => o.status === 'CANCELLED').length,
      });

      // Compute top selling products
      const salesMap: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
      ordersList.forEach((order: any) => {
        if (order.items) {
          order.items.forEach((item: any) => {
            if (!salesMap[item.productId]) {
              salesMap[item.productId] = {
                name: item.productName || 'Unknown Product',
                quantity: 0,
                revenue: 0
              };
            }
            salesMap[item.productId].quantity += item.quantity;
            salesMap[item.productId].revenue += item.subtotal;
          });
        }
      });

      const sortedTop = Object.entries(salesMap)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopProducts(sortedTop);
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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto text-zinc-700">
      
      {/* 1. GROWTH MARKETING BANNER (Premium light-gradient visual) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-indigo-500/10">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none select-none">
          <svg className="h-full w-auto" viewBox="0 0 200 200" fill="currentColor">
            <path d="M0 0h200v200H0z" />
          </svg>
        </div>
        
        <div className="z-10 flex flex-col gap-1.5 max-w-xl">
          <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
            Grow Your Store
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">Discover sales opportunities and improve your store performance.</h3>
          <p className="text-xs text-blue-100/90 font-medium">Optimize catalog options, track customer transactions, and launch targeted promotional coupons.</p>
        </div>
        
        <Link 
          href="/admin/products"
          className="z-10 bg-white hover:bg-zinc-50 text-indigo-700 font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>Quick Start</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 2. SIX SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Total Users</span>
            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">{stats.totalUsers}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              {stats.customersCount} Cust / {stats.adminsCount} Adm
            </p>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Total Products</span>
            <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">{stats.totalProducts}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              {stats.activeProducts} Act / {stats.blockedProducts} Blk
            </p>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Total Orders</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">{stats.totalOrders}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              Overall Placed
            </p>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Total Revenue</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">৳{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              Paid Transactions
            </p>
          </div>
        </div>

        {/* Card 5: Pending Orders */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Pending Orders</span>
            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">{stats.pendingOrders}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              Awaiting Action
            </p>
          </div>
        </div>

        {/* Card 6: Delivered Orders */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Delivered Orders</span>
            <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-650 flex items-center justify-center border border-sky-100 shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-zinc-950 truncate">{stats.deliveredOrders}</p>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider truncate">
              Completed Shipments
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHART AND STATISTICS LAYOUT */}
      <SalesOverviewChart revenue={stats.totalRevenue} orders={stats.totalOrders} />

      {/* 3.5 ADDITIONAL CHARTS: ORDERS BY STATUS & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Orders by Status Breakdown */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Orders by Status</span>
            <h4 className="text-lg font-bold text-zinc-950 mt-1">Real-time status breakdown</h4>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {[
              { label: 'Pending', count: statusCounts.PENDING, color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Confirmed', count: statusCounts.CONFIRMED, color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Processing', count: statusCounts.PROCESSING, color: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Shipped', count: statusCounts.SHIPPED, color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Delivered', count: statusCounts.DELIVERED, color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Cancelled', count: statusCounts.CANCELLED, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((status) => {
              const percentage = stats.totalOrders > 0 
                ? Math.round((status.count / stats.totalOrders) * 100) 
                : 0;
              return (
                <div key={status.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-zinc-700">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${status.color}`}></span>
                      <span className="text-zinc-600">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${status.bg} ${status.text}`}>{status.count} orders</span>
                      <span className="text-zinc-450 text-[10px]">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${status.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Top Selling Products */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Top Products</span>
            <h4 className="text-lg font-bold text-zinc-950 mt-1">Best performing items by quantity sold</h4>
          </div>

          <div className="flex flex-col gap-4 mt-2 justify-center h-full">
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
                <Package className="h-10 w-10 text-zinc-300" />
                <p className="text-xs font-black uppercase tracking-wider">No products sold yet</p>
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.id} className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center text-xs font-black border border-indigo-100">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">
                        ৳{prod.revenue.toLocaleString()} in revenue
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded-full bg-zinc-50 border border-zinc-200 px-3 py-1 text-xs font-black text-zinc-700">
                      {prod.quantity} sold
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. QUICK ADD PRODUCT FORM SECTION */}
      <QuickAddProduct token={token} categories={categories} onSuccess={loadStatsAndProducts} />

      {/* 5. PRODUCT LISTING CATALOG OVERVIEW TABLE */}
      <AdminProductsTable productList={productList} loading={loading} />
      
    </div>
  );
}
