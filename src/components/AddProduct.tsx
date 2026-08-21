'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Package, 
  Check, 
  Sliders,
  Palette,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

export default function AddProduct({ onSuccess, onCancel, isInline = false }: AddProductProps) {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Categories list state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Field States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Frontend-only fields (size/color)
  const [sizeInput, setSizeInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);

  // Flag to check if slug has been manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!token || !user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [token, user, authLoading, router]);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setErrorMsg(data.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setErrorMsg('An error occurred while loading categories.');
      } finally {
        setLoadingCategories(false);
      }
    }

    if (token) {
      loadCategories();
    }
  }, [token]);

  // Auto-generate slug from product name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  // Sizes handlers
  const handleAddSize = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sizeInput.trim()) {
      e.preventDefault();
      if (!sizes.includes(sizeInput.trim())) {
        setSizes([...sizes, sizeInput.trim()]);
      }
      setSizeInput('');
    }
  };

  const handleRemoveSize = (indexToRemove: number) => {
    setSizes(sizes.filter((_, idx) => idx !== indexToRemove));
  };

  // Colors handlers
  const handleAddColor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && colorInput.trim()) {
      e.preventDefault();
      if (!colors.includes(colorInput.trim())) {
        setColors([...colors, colorInput.trim()]);
      }
      setColorInput('');
    }
  };

  const handleRemoveColor = (indexToRemove: number) => {
    setColors(colors.filter((_, idx) => idx !== indexToRemove));
  };

  // ImgBB Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsUploadingImage(true);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      setErrorMsg('ImgBB API Key is not set. Please add NEXT_PUBLIC_IMGBB_API_KEY to your environment variables.');
      setIsUploadingImage(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setImage(data.data.url);
        setSuccessMsg('Image uploaded successfully to ImgBB!');
      } else {
        setErrorMsg(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      setErrorMsg('An error occurred during image upload. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend Validations
    if (!name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Product Slug is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('SKU code is required.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a Category.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Regular Price must be a valid number greater than 0.');
      return;
    }

    let numericDiscountPrice: number | null = null;
    if (discountPrice !== '') {
      numericDiscountPrice = parseFloat(discountPrice);
      if (isNaN(numericDiscountPrice) || numericDiscountPrice < 0) {
        setErrorMsg('Discount Price cannot be negative.');
        return;
      }
      if (numericDiscountPrice >= numericPrice) {
        setErrorMsg('Discount Price must be less than the regular price.');
        return;
      }
    }

    const numericStock = parseInt(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      setErrorMsg('Stock quantity must be a non-negative integer.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: numericPrice,
      discountPrice: numericDiscountPrice,
      stock: numericStock,
      sku: sku.trim(),
      image: image.trim() || null,
      status,
      categoryId
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(isInline ? 'Product added successfully!' : 'Product added successfully! Redirecting to products list...');
        // Clear form
        setName('');
        setSlug('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setStock('');
        setSku('');
        setImage('');
        setCategoryId('');
        setSizes([]);
        setColors([]);
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
        
        if (!isInline) {
          setTimeout(() => {
            router.push('/admin/products');
          }, 2000);
        }
      } else {
        setErrorMsg(data.message || 'Failed to create product.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrorMsg('An error occurred while connecting to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render until authorized
  if (authLoading || !token || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 animate-fadeIn">
      {/* Top Navigation */}
      {!isInline && (
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products Inventory</span>
          </Link>
        </div>
      )}

      {/* Header Title */}
      <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Add New Product</h1>
          <p className="text-sm text-zinc-500 mt-1">Create a universal product catalog listing across any category</p>
        </div>
      </div>

      {/* Notification Toasts */}
      {successMsg && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800 flex items-center gap-3 animate-slideIn">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 flex items-center gap-3 animate-slideIn">
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Detailed Info (2/3 width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card: Basic Information */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span>General Info</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Cotton Polo Shirt"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. premium-cotton-polo-shirt"
                  value={slug}
                  onChange={handleSlugChange}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all font-mono disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
              <textarea
                rows={5}
                placeholder="Describe your product details, materials, care instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Card: Images & Media */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              <span>Media & Image</span>
            </h2>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image URL Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Image URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Local Upload Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Upload Local Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isSubmitting || isUploadingImage}
                      className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition-all disabled:opacity-50"
                    />
                  </div>
                  {isUploadingImage && (
                    <span className="text-[11px] text-indigo-600 animate-pulse flex items-center gap-1 font-semibold mt-1">
                      <Loader2 className="animate-spin h-3.5 w-3.5" /> Uploading image to ImgBB...
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              <div className="border border-dashed border-zinc-200 rounded-2xl p-4 bg-zinc-50 flex items-center justify-center min-h-[160px] relative overflow-hidden">
                {image.trim() ? (
                  <div className="flex flex-col items-center gap-2 w-full h-full">
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="max-h-36 object-contain rounded-xl border border-zinc-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300';
                      }}
                    />
                    <span className="text-[10px] text-zinc-400 font-mono break-all px-4 text-center">{image}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 gap-1 text-center p-6">
                    <ImageIcon className="h-10 w-10 text-zinc-300 stroke-[1.5]" />
                    <span className="text-sm font-semibold mt-1">No Image Loaded</span>
                    <span className="text-xs text-zinc-400">Enter a URL or upload a local image to preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Size & Color Options */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-500" />
                <span>Product Options</span>
              </h2>
              <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase">UI Only</span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Sizes Options */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Product Sizes</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 border border-zinc-200 rounded-xl bg-zinc-50 min-h-[44px] items-center font-sans">
                  {sizes.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-xs font-bold px-2.5 py-1 rounded-lg text-zinc-800 shadow-sm">
                      <span>{s}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSize(idx)}
                        className="text-zinc-400 hover:text-red-500 font-bold ml-0.5 text-[10px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {sizes.length === 0 && <span className="text-xs text-zinc-400 px-1">No sizes added yet</span>}
                </div>
                <input
                  type="text"
                  placeholder="Type a size (e.g. M, L, XL) & press Enter"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={handleAddSize}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                />
              </div>

              {/* Colors Options */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Product Colors</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 border border-zinc-200 rounded-xl bg-zinc-50 min-h-[44px] items-center font-sans">
                  {colors.map((c, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-xs font-bold px-2.5 py-1 rounded-lg text-zinc-800 shadow-sm">
                      <span>{c}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveColor(idx)}
                        className="text-zinc-400 hover:text-red-500 font-bold ml-0.5 text-[10px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {colors.length === 0 && <span className="text-xs text-zinc-400 px-1">No colors added yet</span>}
                </div>
                <input
                  type="text"
                  placeholder="Type a color (e.g. Black, Navy) & press Enter"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={handleAddColor}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Attributes & Action Buttons (1/3 width on desktop) */}
        <div className="flex flex-col gap-6">
          {/* Card: Pricing */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" />
              <span>Pricing</span>
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Regular Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-zinc-400 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-zinc-200 p-3 pl-8 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discount Price ($ - Optional)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-zinc-400 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="24.99"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-zinc-200 p-3 pl-8 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Stock & SKU */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" />
              <span>Inventory & SKU</span>
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Stock Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLOTH-SHIRT-M"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all font-mono uppercase disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Card: Category & Status */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-500" />
              <span>Organization</span>
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Category</label>
                {loadingCategories ? (
                  <div className="text-xs text-zinc-400 p-3 border border-zinc-200 rounded-xl bg-zinc-50 animate-pulse">
                    Loading category options...
                  </div>
                ) : (
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Status</label>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full rounded-full bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <Check className="h-4.5 w-4.5" />
                  <span>Save Catalog Product</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel ? onCancel : () => router.push('/admin/products')}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-center py-3 text-sm font-semibold text-zinc-700 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
