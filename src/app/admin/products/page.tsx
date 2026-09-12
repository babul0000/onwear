'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Flame,
  CheckCircle2,
  Save,
  Loader2,
  Image as ImageIcon,
  Tag,
  Layers,
  Package
} from 'lucide-react';
import AddProduct from '../../../components/AddProduct';
import ConfirmModal from '../../../components/ConfirmModal';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  image?: string | null;
  image2?: string | null;
  images?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  categoryId: string;
  category?: { id: string; name: string };
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; subcategories?: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  // Modals State
  const [editModalProduct, setEditModalProduct] = useState<any | null>(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState<any | null>(null);
  const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Form states for Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [image2, setImage2] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'>('ACTIVE');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products?limit=9999&includeDeleted=true`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
    }
  }, [token]);

  const activeProducts = products.filter(p => !p.isDeleted);
  const trashedProducts = products.filter(p => p.isDeleted);

  const handleEdit = (prod: any) => {
    setError('');
    setSuccess('');
    setEditingId(prod.id);
    setName(prod.name || '');
    setSlug(prod.slug || '');
    setPrice(prod.price !== undefined && prod.price !== null ? prod.price.toString() : '');
    setDiscountPrice(prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice.toString() : '');
    setStock(prod.stock !== undefined && prod.stock !== null ? prod.stock.toString() : '0');
    setSku(prod.sku || '');
    setImage(prod.image || '');
    setImage2(prod.image2 || '');
    setCategoryId(prod.categoryId || '');
    setStatus(prod.status || 'ACTIVE');
    setEditModalProduct(prod);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    const body: any = {
      name,
      slug,
      price: parseFloat(price),
      discountPrice: discountPrice !== '' ? parseFloat(discountPrice) : null,
      stock: parseInt(stock),
      sku,
      image: image || null,
      image2: image2 || null,
      categoryId,
      status
    };

    try {
      const res = await fetch(`${API_URL}/products/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Product updated successfully!');
        resetForm();
        fetchProducts();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating the product');
    } finally {
      setIsSaving(false);
    }
  };

  // Perform Soft Delete (5-day trash)
  const handleSoftDelete = async (id: string) => {
    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Product moved to Trash. It will auto-delete in 5 days.');
        setDeleteModalProduct(null);
        fetchProducts();
      } else {
        setError(data.message || 'Failed to soft delete product');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Perform Hard Delete (Permanent Wipe)
  const handleHardDelete = async (id: string) => {
    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${id}?permanent=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Product permanently removed from database.');
        setDeleteModalProduct(null);
        fetchProducts();
      } else {
        setError(data.message || 'Failed to permanently delete product');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Product from Trash
  const handleRestore = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Product restored to active catalog successfully!');
        fetchProducts();
      } else {
        setError(data.message || 'Failed to restore product');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while restoring product');
    }
  };

  // Purge All Trashed Products
  const handlePurgeAllTrash = async () => {
    setIsPurging(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/purge-deleted`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('All trashed products permanently purged from database!');
        fetchProducts();
        setShowPurgeAllModal(false);
      } else {
        setError(data.message || 'Failed to purge trash');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while purging trash');
    } finally {
      setIsPurging(false);
    }
  };

  // Helper: calculate remaining days in 5-day trash
  const getDaysRemaining = (deletedAt: string | null | undefined, updatedAt: string | undefined) => {
    const deletedDate = deletedAt ? new Date(deletedAt) : (updatedAt ? new Date(updatedAt) : new Date());
    const expiryDate = new Date(deletedDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setPrice('');
    setDiscountPrice('');
    setStock('');
    setSku('');
    setImage('');
    setImage2('');
    setCategoryId('');
    setStatus('ACTIVE');
    setEditModalProduct(null);
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  if (showAddProduct) {
    return (
      <AddProduct
        isInline={true}
        onSuccess={() => {
          setShowAddProduct(false);
          fetchProducts();
        }}
        onCancel={() => setShowAddProduct(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight">Product Inventory</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Manage active catalog items, prices, and automated trash purge</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProduct(true)}
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* TABS: Active vs Trash */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-2">
        <div className="flex items-center gap-2 bg-zinc-100/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Active Products</span>
            <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-black font-mono">
              {activeProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-red-50 text-red-700 border border-red-200/60 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Trash (5-Day Purge)</span>
            {trashedProducts.length > 0 && (
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse font-mono">
                {trashedProducts.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'trash' && trashedProducts.length > 0 && (
          <button
            onClick={() => setShowPurgeAllModal(true)}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-4 py-2 rounded-xl transition-all border border-red-200/60 flex items-center gap-1.5 cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Empty All Trash Now</span>
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !editModalProduct && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PRODUCTS TAB: ACTIVE INVENTORY */}
      {activeTab === 'active' && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-zinc-400">Loading active catalog...</div>
          ) : activeProducts.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-zinc-400">
              No active products found. Click "Add Product" to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {activeProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={prod.image || '/placeholder.svg'}
                          alt={prod.name}
                          className="h-11 w-11 rounded-xl object-cover border border-zinc-200 bg-zinc-50"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        {prod.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-zinc-500">{prod.sku}</td>
                      <td className="px-6 py-4 font-black text-zinc-900 font-mono">
                        {prod.discountPrice !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span>Tk {prod.discountPrice}</span>
                            <span className="text-[10px] text-zinc-400 line-through font-normal">Tk {prod.price}</span>
                          </div>
                        ) : (
                          <span>Tk {prod.price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-800 font-mono">{prod.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                          prod.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prod.status === 'OUT_OF_STOCK'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModalProduct(prod)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Product (Choose Soft or Hard)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB: TRASH / AUTO-PURGE */}
      {activeTab === 'trash' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span><strong>5-Day Auto-Purge Policy:</strong> Items moved to Trash stay protected for 5 days. You can restore them anytime before they expire. After 5 days, the system permanently removes them automatically.</span>
              </div>
            </div>

            {trashedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPurgeAllModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer shrink-0"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Empty All Trash Now</span>
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400">Loading trash...</div>
            ) : trashedProducts.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400">
                Trash is empty! No soft-deleted products found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Auto-Purge In</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {trashedProducts.map((prod) => {
                      const daysLeft = getDaysRemaining(prod.deletedAt, prod.updatedAt);
                      return (
                        <tr key={prod.id} className="hover:bg-zinc-50/60 bg-red-50/10 transition-colors">
                          <td className="px-6 py-4 opacity-75">
                            <img
                              src={prod.image || '/placeholder.svg'}
                              alt={prod.name}
                              className="h-11 w-11 rounded-xl object-cover border border-zinc-200 bg-zinc-50"
                            />
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-900">
                            <div className="flex items-center gap-2">
                              <span>{prod.name}</span>
                              <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                Trashed
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-zinc-500">{prod.sku}</td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[11px] font-bold">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>{daysLeft} days left</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleRestore(prod.id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Restore Product"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Restore</span>
                              </button>

                              <button
                                onClick={() => handleHardDelete(prod.id)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100/80 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Permanently Delete Now"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Forever</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editModalProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col gap-6 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto my-auto">
            
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold mb-2 border border-indigo-200/60 font-mono">
                <Edit2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Edit Product</span>
              </div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                {name || 'Edit Product Details'}
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                SKU: {sku || 'N/A'} • ID: {editingId}
              </p>
            </div>

            {/* Error in modal if any */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleUpdateProduct} className="flex flex-col gap-5">
              
              {/* Image Preview & URLs */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border border-zinc-200 shrink-0 flex items-center justify-center shadow-xs">
                  {image ? (
                    <img
                      src={image}
                      alt={name || 'Preview'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-600 flex items-center gap-1">
                      <ImageIcon className="h-3 w-3 text-zinc-400" />
                      <span>Primary Image URL</span>
                    </label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-white focus:outline-indigo-600 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-600 flex items-center gap-1">
                      <ImageIcon className="h-3 w-3 text-zinc-400" />
                      <span>Secondary Image URL (Hover - Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      placeholder="https://..."
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-white focus:outline-indigo-600 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-600">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-semibold"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* SKU */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600">SKU (Unique Identifier)</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-mono"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-zinc-400" />
                    <span>Category</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <React.Fragment key={cat.id}>
                        <option value={cat.id} className="font-bold text-zinc-900">{cat.name}</option>
                        {cat.subcategories?.map((sub: any) => (
                          <option key={sub.id} value={sub.id} className="text-zinc-600">
                            &nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.name}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-zinc-400" />
                    <span>Status</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (In Store)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK (Sold Out)</option>
                  </select>
                </div>

                {/* Base Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600">Base Regular Price (Tk)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-mono font-bold"
                  />
                </div>

                {/* Discount Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zinc-600">Discount Offer Price (Tk - Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Leave blank for regular price"
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-mono font-bold"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                    <Package className="h-3 w-3 text-zinc-400" />
                    <span>Inventory Stock Quantity</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DUAL DELETE CONFIRMATION MODAL */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 text-zinc-850">
            
            <button
              onClick={() => setDeleteModalProduct(null)}
              className="absolute right-5 top-5 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold mb-2.5 border border-red-200/60 font-mono">
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                <span>Delete Product Options</span>
              </div>
              <h2 className="text-lg font-black text-zinc-950 font-sans tracking-tight">How would you like to delete this product?</h2>
            </div>

            {/* Product Item Preview */}
            <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              <div className="h-13 w-13 rounded-xl overflow-hidden bg-white border border-zinc-200 shrink-0">
                <img
                  src={deleteModalProduct.image || '/placeholder.svg'}
                  alt={deleteModalProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 truncate font-sans">
                  {deleteModalProduct.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-zinc-500">
                  <span>SKU: <strong>{deleteModalProduct.sku}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-zinc-950">৳{deleteModalProduct.price}</strong></span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5 font-sans">
              
              {/* Option 1: Soft Delete (Trash - 5 Days) */}
              <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 transition-all flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                    <Clock className="h-4.5 w-4.5 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-zinc-900">Move to Trash (5-Day Auto-Purge)</h4>
                      <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded font-mono">Recommended</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                      Hides product from storefront immediately. Protected in your <strong>Trash</strong> for 5 days with 1-click restore.
                    </p>
                  </div>
                </div>
                <button
                  disabled={isDeleting}
                  onClick={() => handleSoftDelete(deleteModalProduct.id)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Move to Trash (5 Days Recovery)</span>
                </button>
              </div>

              {/* Option 2: Hard Delete (Permanent Wipe) */}
              <div className="p-4 rounded-2xl border-2 border-red-300/80 bg-red-50/40 hover:bg-red-50/80 transition-all flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-100 text-red-800 rounded-xl flex-shrink-0">
                    <Flame className="h-4.5 w-4.5 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-zinc-900">Permanent Delete (Hard Delete)</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1 font-medium">
                      Instantly purges this product record from database and Cloudinary storage. <strong>Cannot be recovered.</strong>
                    </p>
                  </div>
                </div>
                <button
                  disabled={isDeleting}
                  onClick={() => handleHardDelete(deleteModalProduct.id)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Permanent Hard Delete</span>
                </button>
              </div>

            </div>

            <div className="flex justify-end pt-1 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-800 px-5 py-2 rounded-full hover:bg-zinc-100 transition-colors uppercase tracking-wider cursor-pointer font-sans"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EMPTY ALL TRASH CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={showPurgeAllModal}
        onClose={() => setShowPurgeAllModal(false)}
        onConfirm={handlePurgeAllTrash}
        title="Empty All Trashed Products?"
        description={`This will permanently wipe all ${trashedProducts.length} soft-deleted items from the database immediately. This action cannot be undone.`}
        confirmText="Yes, Empty Trash Now"
        cancelText="Keep in Trash"
        variant="danger"
        loading={isPurging}
      />

    </div>
  );
}
