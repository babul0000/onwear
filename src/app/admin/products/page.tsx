'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { Edit2, Trash2, Plus, ArrowLeft, X } from 'lucide-react';
import AddProduct from '../../../components/AddProduct';

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products?limit=9999&includeDeleted=true`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
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
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const body = {
      name,
      slug,
      price: parseFloat(price),
      discountPrice: discountPrice !== '' ? parseFloat(discountPrice) : null,
      stock: parseInt(stock),
      sku,
      image,
      categoryId,
      status
    };

    const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editingId ? 'Product updated successfully!' : 'Product created successfully!');
        resetForm();
        fetchProducts();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setSlug(prod.slug);
    setPrice(prod.price.toString());
    setDiscountPrice(prod.discountPrice !== null ? prod.discountPrice.toString() : '');
    setStock(prod.stock.toString());
    setSku(prod.sku);
    setImage(prod.image || '');
    setCategoryId(prod.categoryId);
    setStatus(prod.status);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to soft delete this product?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
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
    setCategoryId('');
    setStatus('ACTIVE');
    setShowForm(false);
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
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="flex justify-between items-center border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950">Product Inventory</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage catalog items, stocks, and pricing information</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowAddProduct(true)}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Editor Block */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6 relative animate-fadeIn">
          <button onClick={resetForm} className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-700">
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">
            {editingId ? 'Edit Product Details' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">SKU (Unique ID)</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Base Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Discount Price ($ - Optional)</label>
              <input
                type="number"
                step="0.01"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-3">
              <button
                type="submit"
                className="w-full sm:max-w-max rounded-full bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md mt-4 self-end"
              >
                {editingId ? 'Save Updates' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
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
              <tbody className="divide-y divide-zinc-200">
                {products.map((prod) => (
                  <tr key={prod.id} className={`hover:bg-zinc-50 transition-colors ${prod.isDeleted ? 'bg-red-50/20 opacity-70' : ''}`}>
                    <td className="px-6 py-4">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=50'}
                        alt={prod.name}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200 bg-zinc-50"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      <div>
                        {prod.name}
                        {prod.isDeleted && (
                          <span className="ml-2 text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                            Deleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{prod.sku}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {prod.discountPrice !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span>${prod.discountPrice}</span>
                          <span className="text-xs text-zinc-400 line-through">${prod.price}</span>
                        </div>
                      ) : (
                        <span>${prod.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{prod.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        prod.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : prod.status === 'OUT_OF_STOCK'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!prod.isDeleted && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-zinc-500 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      )}
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
