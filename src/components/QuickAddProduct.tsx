'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

interface QuickAddProductProps {
  token: string;
  categories: any[];
  onSuccess: () => Promise<void>;
}

export default function QuickAddProduct({ token, categories, onSuccess }: QuickAddProductProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
        
        await onSuccess();
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

  return (
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
  );
}
