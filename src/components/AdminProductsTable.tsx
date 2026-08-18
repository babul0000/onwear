'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Eye } from 'lucide-react';

interface AdminProductsTableProps {
  productList: any[];
  loading: boolean;
}

export default function AdminProductsTable({ productList, loading }: AdminProductsTableProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 text-zinc-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="font-black text-white text-sm tracking-wider uppercase">Active Products Overview</h4>
          <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">Recent active items currently published in the catalog</p>
        </div>
        <Link 
          href="/admin/products"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 self-start"
        >
          <span>Manage Catalog</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-zinc-600 font-bold uppercase tracking-wider">Loading catalog...</div>
      ) : productList.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-600 font-bold uppercase tracking-wider">No products found. Add products to get started!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-zinc-400">
            <thead className="bg-zinc-950/40 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-900">
              <tr>
                <th className="px-6 py-3.5">Image</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs font-semibold">
              {productList.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-3.5">
                    {prod.image ? (
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="h-10 w-10 rounded-2xl object-cover border border-zinc-800/80 shadow-md"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-2xl bg-zinc-950/50 flex items-center justify-center text-zinc-600 border border-zinc-850">
                        <ShoppingBag className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-white truncate max-w-[200px]">{prod.name}</td>
                  <td className="px-6 py-3.5 font-mono text-zinc-500 font-bold">{prod.sku}</td>
                  <td className="px-6 py-3.5 font-black text-white">৳{prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-3.5 font-bold">
                    <span className={prod.stock === 0 ? 'text-red-500' : 'text-zinc-400'}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                      prod.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Link 
                      href={`/products/${prod.id}`}
                      target="_blank"
                      className="h-7 w-7 rounded-xl border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors mx-auto"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
