'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
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

    // Auto slug generation (lowercase, replacing non-alphanumeric with dashes)
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''); // Trim leading/trailing dashes

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
    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5 text-zinc-300">
      <div>
        <h4 className="font-black text-white text-sm tracking-wider flex items-center gap-2 uppercase">
          <Plus className="h-4.5 w-4.5 text-indigo-400" />
          <span>Quick Add Product</span>
        </h4>
        <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">Instantly publish new catalog items directly to your categories</p>
      </div>

      {formSuccess && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <Sparkles className="h-4.5 w-4.5 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-bold text-red-400 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-end">
        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Oversized T-Shirt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-800/80 p-2.5 text-xs bg-zinc-950/40 text-white placeholder-zinc-600 focus:bg-zinc-950 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
          <select 
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-zinc-800/80 p-2.5 text-xs bg-zinc-950/40 text-zinc-400 focus:bg-zinc-950 focus:border-indigo-500/80 outline-none transition-all font-semibold cursor-pointer"
          >
            <option value="" className="bg-zinc-950">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-zinc-950 text-white">{cat.name}</option>
            ))}
          </select>
        </div>

        {/* SKU */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SKU (Unique Code)</label>
          <input 
            type="text" 
            required
            placeholder="e.g. ON-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="rounded-xl border border-zinc-800/80 p-2.5 text-xs bg-zinc-950/40 text-white placeholder-zinc-600 focus:bg-zinc-950 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold outline-none"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price (৳)</label>
          <input 
            type="number" 
            required
            step="0.01"
            placeholder="e.g. 850"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl border border-zinc-800/80 p-2.5 text-xs bg-zinc-950/40 text-white placeholder-zinc-600 focus:bg-zinc-950 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold outline-none"
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stock Quantity</label>
          <input 
            type="number" 
            required
            placeholder="e.g. 24"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="rounded-xl border border-zinc-800/80 p-2.5 text-xs bg-zinc-950/40 text-white placeholder-zinc-600 focus:bg-zinc-950 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold outline-none"
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit"
          disabled={formLoading}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold py-2.5 text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:bg-zinc-800 disabled:text-zinc-600 h-9.5 cursor-pointer"
        >
          {formLoading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
