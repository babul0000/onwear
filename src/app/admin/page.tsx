'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import Link from 'next/link';
import { 
  Users, ShoppingBag, Receipt, DollarSign, Clock, CheckCircle2, 
  ChevronRight, Plus, AlertCircle, Sparkles, FolderTree, Tag, Eye, Percent, ArrowUpRight
} from 'lucide-react';

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

  // Quick Add Product Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const body = {
      name,
      slug,
      price: parseFloat(price),
      discountPrice: null,
      stock: parseInt(stock),
      sku,
      image: image || undefined,
      categoryId,
      status: 'ACTIVE'
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess('Product successfully added!');
        setName('');
        setPrice('');
        setStock('');
        setSku('');
        setImage('');
        setCategoryId('');
        
        // Reload all stats and the product table
        await loadStatsAndProducts();
      } else {
        setFormError(data.message || 'Failed to add product.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Server error while adding product.');
    } finally {
      setFormLoading(false);
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Selling Chart Area */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Selling Overview</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-zinc-950">${stats.revenue.toFixed(2)}</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+25.02%</span>
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">(Current session calculated)</span>
          </div>

          <div className="w-full relative h-48 bg-zinc-50/50 rounded-2xl overflow-hidden mt-2 border border-zinc-100 p-2">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path 
                d="M0,120 Q50,70 100,100 T200,50 T300,110 T400,40 T500,90 L500,150 L0,150 Z" 
                fill="url(#chartGrad)" 
              />
              <path 
                d="M0,120 Q50,70 100,100 T200,50 T300,110 T400,40 T500,90" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-1.5 flex justify-between px-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {/* Right Side: Four Statistics Blocks */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Visitor</p>
            <div>
              <p className="text-2xl font-black text-zinc-950 mt-2">1,240</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
              <span className="text-[10px] font-extrabold text-red-500">-0.05%</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Seen</p>
            <div>
              <p className="text-2xl font-black text-zinc-950 mt-2">8,250</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
              <span className="text-[10px] font-extrabold text-red-500">-5.27%</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Order</p>
            <div>
              <p className="text-2xl font-black text-zinc-950 mt-2">{stats.orders}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
              <span className="text-[10px] font-extrabold text-emerald-600">+12.05%</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversion</p>
            <div>
              <p className="text-2xl font-black text-zinc-950 mt-2">4.50%</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
              <span className="text-[10px] font-extrabold text-emerald-600">+3.26%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ADD PRODUCT FORM SECTION */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h4 className="font-extrabold text-zinc-950 text-base flex items-center gap-1.5">
            <Plus className="h-5 w-5 text-indigo-600" />
            <span>Quick Add Product</span>
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">Instantly publish new catalog items directly to your categories</p>
        </div>

        {formSuccess && (
          <div className="rounded-2xl bg-green-50 p-4 text-xs font-semibold text-green-600 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500">Product Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Vintage Denim Jacket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-zinc-200/80 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500">Category</label>
            <select 
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-zinc-200/80 p-2.5 text-xs bg-zinc-50 focus:outline-indigo-600 font-medium cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500">SKU (Unique Code)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. DENIM-JKT-01"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="rounded-xl border border-zinc-200/80 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-medium"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500">Price ($)</label>
            <input 
              type="number" 
              required
              step="0.01"
              placeholder="e.g. 89.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border border-zinc-200/80 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-medium"
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500">Stock Quantity</label>
            <input 
              type="number" 
              required
              placeholder="e.g. 50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="rounded-xl border border-zinc-200/80 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-medium"
            />
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            disabled={formLoading}
            className="rounded-xl bg-indigo-600 text-white font-extrabold py-2.5 text-xs tracking-wider uppercase transition-all shadow-md hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 h-9.5 cursor-pointer"
          >
            {formLoading ? 'Publishing...' : 'Publish Product'}
          </button>
        </form>
      </div>

      {/* 5. PRODUCT LISTING CATALOG OVERVIEW TABLE */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-zinc-950 text-base">Active Products Overview</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Recent active items currently published in the catalog</p>
          </div>
          <Link 
            href="/admin/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 self-start"
          >
            <span>Manage Catalog</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading catalog...</div>
        ) : productList.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No products found. Add products to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {productList.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="h-9 w-9 rounded-xl object-cover border border-zinc-100 shadow-sm"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-100">
                          <ShoppingBag className="h-4.5 w-4.5" />
                        </div>
                      )}
                      <span className="truncate max-w-xs">{prod.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500 font-bold">{prod.sku}</td>
                    <td className="px-6 py-4 font-extrabold text-zinc-900">${prod.price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className={prod.stock === 0 ? 'text-red-500' : 'text-zinc-600'}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${
                        prod.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
