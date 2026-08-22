'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [parentId, setParentId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?includeInactive=true`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const body = { name, slug, description, image, status, parentId: parentId || null };
    const url = editingId ? `${API_URL}/categories/${editingId}` : `${API_URL}/categories`;
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
        setSuccess(editingId ? 'Category updated successfully!' : 'Category created successfully!');
        resetForm();
        fetchCategories();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setStatus(cat.status);
    setParentId(cat.parentId || '');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? Associated products will also be soft-deleted.')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Category soft-deleted successfully!');
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete category');
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
    setDescription('');
    setImage('');
    setStatus('ACTIVE');
    setParentId('');
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Category Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage e-commerce shopping categories</p>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Editor Form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
          <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-4 text-lg">
            {editingId ? 'Edit Category' : 'Create Category'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Name</label>
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
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter((cat: any) => cat.id !== editingId)
                  .map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm h-fit">
          {loading ? (
            <div className="p-8 text-center">Loading categories...</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {categories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=50'}
                        alt={cat.name}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{cat.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-600">
                      {cat.parentId ? (
                        categories.find((c: any) => c.id === cat.parentId)?.name || 'Unknown'
                      ) : (
                        <span className="text-zinc-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        cat.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-zinc-500 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
