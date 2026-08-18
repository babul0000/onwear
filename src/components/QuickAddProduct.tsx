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

    // Validations
    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }
    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError('Stock cannot be negative.');
      return;
    }
    if (!sku.trim()) {
      setFormError('SKU (Unique Code) is required.');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a Category.');
      return;
    }

    setFormLoading(true);

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const body = {
      name: name.trim(),
      slug,
      price: parsedPrice,
      discountPrice: null,
      stock: parsedStock,
      sku: sku.trim(),
      image: image.trim() || undefined,
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
        setFormSuccess(`✓ Product "${name}" published successfully.`);
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
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-zinc-700">
      <div>
        <h4 className="font-black text-zinc-950 text-sm tracking-wider flex items-center gap-2 uppercase">
          <Plus className="h-4.5 w-4.5 text-indigo-600" />
          <span>Quick Add Product</span>
        </h4>
        <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">Instantly publish new catalog items directly to your categories</p>
      </div>

      {formSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-600 flex items-center gap-2 shadow-sm">
          <Sparkles className="h-4.5 w-4.5 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600 flex items-center gap-2 shadow-sm">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Oversized T-Shirt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition-all font-semibold outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</label>
          <select 
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-700 focus:bg-white focus:border-indigo-600 outline-none transition-all font-semibold cursor-pointer"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* SKU */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SKU (Unique Code)</label>
          <input 
            type="text" 
            required
            placeholder="e.g. ON-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition-all font-semibold outline-none"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Price (৳)</label>
          <input 
            type="number" 
            required
            step="0.01"
            placeholder="e.g. 850"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition-all font-semibold outline-none"
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stock Quantity</label>
          <input 
            type="number" 
            required
            placeholder="e.g. 24"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition-all font-semibold outline-none"
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit"
          disabled={formLoading}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer h-9.5"
        >
          {formLoading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
