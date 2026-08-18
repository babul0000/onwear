'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface AdminProductsTableProps {
  productList: any[];
  loading: boolean;
}

export default function AdminProductsTable({ productList, loading }: AdminProductsTableProps) {
  return (
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
  );
}
