'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  FolderTree, 
  FolderPlus, 
  Layers, 
  Search, 
  Upload, 
  Check, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  Tag,
  AlertCircle
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  parentId?: string | null;
  subcategories?: CategoryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'table'>('hierarchy');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [parentId, setParentId] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?includeInactive=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
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

  // Extract all Top-Level Parent Categories
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentId);
  }, [categories]);

  // Extract all Subcategories as a flat list
  const allSubcategories = useMemo(() => {
    const subs: (CategoryItem & { parentName?: string })[] = [];
    categories.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((sub) => {
          subs.push({ ...sub, parentName: cat.name });
        });
      }
    });
    return subs;
  }, [categories]);

  // Total count
  const totalCategoriesCount = parentCategories.length + allSubcategories.length;

  // Selected parent category object
  const selectedParent = useMemo(() => {
    return parentCategories.find((p) => p.id === parentId);
  }, [parentCategories, parentId]);

  // ImgBB Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    setUploadingImage(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data && data.data.url) {
        setImage(data.data.url);
      } else {
        alert(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSubcategoryMode && !parentId) {
      setError('Please select a Parent Category for this subcategory.');
      return;
    }

    const body = {
      name,
      slug,
      description: description || null,
      image: image || null,
      status,
      parentId: isSubcategoryMode && parentId ? parentId : null
    };

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

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setStatus(cat.status);
    
    if (cat.parentId) {
      setIsSubcategoryMode(true);
      setParentId(cat.parentId);
    } else {
      setIsSubcategoryMode(false);
      setParentId('');
    }

    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubcategoryUnderParent = (parent: CategoryItem) => {
    resetForm();
    setIsSubcategoryMode(true);
    setParentId(parent.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Associated products and subcategories will be updated.`)) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(`Category "${name}" deleted successfully!`);
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
    setIsSubcategoryMode(false);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setStatus('ACTIVE');
    setParentId('');
  };

  // Filtered categories according to search query
  const filteredParents = useMemo(() => {
    if (!searchQuery.trim()) return parentCategories;
    const q = searchQuery.toLowerCase();
    return parentCategories.filter((p) => {
      const matchParent = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchChild = p.subcategories?.some((s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
      return matchParent || matchChild;
    });
  }, [parentCategories, searchQuery]);

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
        <div>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors mb-2 font-mono cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900 text-white shadow-sm">
              <FolderTree className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 font-sans">
                Category & Taxonomy Studio
              </h1>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Manage top-level departments and assign subcategories with 1-click hierarchical controls.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
          <div className="bg-white border border-zinc-200/80 rounded-2xl px-3.5 py-2 text-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">Main</span>
            <span className="text-base font-black text-zinc-900">{parentCategories.length}</span>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl px-3.5 py-2 text-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">Subs</span>
            <span className="text-base font-black text-teal-650">{allSubcategories.length}</span>
          </div>
          <div className="bg-zinc-900 text-white rounded-2xl px-3.5 py-2 text-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">Total</span>
            <span className="text-base font-black text-white">{totalCategoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Hierarchy List on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Smart Creation / Edit Form (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm sticky top-6">
          
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-zinc-800" />
              <h3 className="font-bold text-zinc-950 text-base font-sans">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h3>
            </div>
            {editingId && (
              <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                Editing #{editingId.slice(0, 6)}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
            
            {/* 1. SMART CATEGORY TYPE SELECTOR (2-Pill Mode) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                Category Type / Structure
              </label>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubcategoryMode(false);
                    setParentId('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isSubcategoryMode
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Main Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubcategoryMode(true);
                    if (!parentId && parentCategories.length > 0) {
                      setParentId(parentCategories[0].id);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubcategoryMode
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  <span>Sub-Category</span>
                </button>
              </div>
            </div>

            {/* 2. PARENT CATEGORY SELECTOR (VISIBLE ONLY IN SUBCATEGORY MODE) */}
            {isSubcategoryMode && (
              <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Select Parent Department
                  </label>
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">
                    {parentCategories.length} Parents available
                  </span>
                </div>

                {/* Visual Pill Selection Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {parentCategories.map((p) => {
                    const isSelected = parentId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setParentId(p.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-zinc-950 shadow-xs ring-1 ring-zinc-950'
                            : 'bg-white/70 border-zinc-200 hover:border-zinc-300 hover:bg-white'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                          <img
                            src={p.image || '/placeholder.svg'}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-900 truncate">{p.name}</p>
                          <p className="text-[9px] text-zinc-400 font-mono">
                            {p.subcategories?.length || 0} subs
                          </p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-zinc-950 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Alternative Dropdown selector */}
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="rounded-xl border border-zinc-200 p-2 text-xs bg-white text-zinc-850 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- Choose Parent Category --</option>
                  {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.subcategories?.length || 0} subcategories)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. LIVE HIERARCHY BREADCRUMB PREVIEW */}
            <div className="p-3 bg-zinc-100/60 rounded-xl border border-zinc-200/40 text-[11px] font-mono flex items-center gap-1.5 text-zinc-600 truncate">
              <span className="text-zinc-400 font-bold">Structure:</span>
              <span>Home</span>
              <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" />
              {isSubcategoryMode && selectedParent ? (
                <>
                  <span className="font-bold text-zinc-900">{selectedParent.name}</span>
                  <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" />
                </>
              ) : null}
              <span className="font-black text-teal-650 truncate">
                {name || (isSubcategoryMode ? 'New Subcategory' : 'New Main Category')}
              </span>
            </div>

            {/* 4. NAME & SLUG INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                    }
                  }}
                  placeholder={isSubcategoryMode ? 'e.g. Formal Chino' : 'e.g. Shirts'}
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all font-medium text-zinc-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. formal-chino"
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all font-mono text-zinc-800"
                />
              </div>
            </div>

            {/* 5. IMAGE UPLOAD & URL */}
            <div className="flex flex-col gap-2 font-sans">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                Category Image / Icon Thumbnail
              </label>

              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Image Preview Box */}
                <div className="col-span-3 aspect-square rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden relative shrink-0">
                  <img
                    src={image || '/placeholder.svg'}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="col-span-9 flex flex-col gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Direct Image URL or upload below..."
                    className="rounded-xl border border-zinc-200 p-2 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 font-mono"
                  />

                  {/* 1-Click File Upload Button */}
                  <div className="relative border border-dashed border-zinc-300 hover:border-zinc-500 bg-zinc-50/50 hover:bg-zinc-100/60 transition-all rounded-xl p-2 flex items-center justify-center gap-1.5 cursor-pointer text-center h-[34px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-700">
                        <span className="h-3 w-3 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin"></span>
                        <span>Uploading to cloud...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-700">Upload Photo from Computer</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. STATUS & DESCRIPTION */}
            <div className="grid grid-cols-1 gap-3 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                  Visibility Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Storefront)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for SEO & collection headers..."
                  className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 resize-none"
                />
              </div>
            </div>

            {/* 7. SUBMIT & RESET BUTTONS */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <button
                type="submit"
                disabled={uploadingImage}
                className="flex-1 rounded-full bg-zinc-950 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-850 transition-all shadow-md cursor-pointer disabled:bg-zinc-300"
              >
                {editingId ? 'Save & Update Category' : isSubcategoryMode ? 'Create Sub-Category' : 'Create Main Category'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-650 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Hierarchy & Grouped Category Tree (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Controls Bar: Search & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories & subcategories..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 font-sans"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl font-mono text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('hierarchy')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'hierarchy' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Grouped Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Flat Table
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400 text-xs font-mono animate-pulse">
              Loading categories & hierarchy tree...
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 flex flex-col items-center gap-3 text-zinc-500">
              <FolderTree className="h-10 w-10 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-800">No categories found</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Create your first parent category using the form on the left to start organizing your clothing catalog.
              </p>
            </div>
          ) : viewMode === 'hierarchy' ? (
            
            /* 1. HIERARCHY TREE VIEW */
            <div className="flex flex-col gap-4">
              {filteredParents.map((parent) => {
                const subs = parent.subcategories || [];

                return (
                  <div
                    key={parent.id}
                    className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden transition-all hover:border-zinc-300"
                  >
                    {/* Parent Category Header Card */}
                    <div className="p-4 sm:p-5 bg-zinc-50/70 border-b border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white border border-zinc-200 shrink-0 shadow-xs">
                          <img
                            src={parent.image || '/placeholder.svg'}
                            alt={parent.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-zinc-950 font-sans tracking-tight uppercase">
                              {parent.name}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono border ${
                              parent.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}>
                              {parent.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono">
                            <span>/{parent.slug}</span>
                            <span>•</span>
                            <span className="text-teal-650 font-bold">{subs.length} sub-categories</span>
                          </div>
                        </div>
                      </div>

                      {/* Parent Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* 1-Click "+ Add Subcategory" Button */}
                        <button
                          onClick={() => handleAddSubcategoryUnderParent(parent)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          title={`Add a new subcategory under ${parent.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Sub-category</span>
                        </button>

                        <button
                          onClick={() => handleEdit(parent)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 rounded-xl hover:bg-zinc-200/60 transition-colors cursor-pointer"
                          title="Edit Parent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(parent.id, parent.name)}
                          className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Parent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories Nested List */}
                    <div className="p-3 sm:p-4 bg-white flex flex-col gap-2">
                      {subs.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-zinc-50/50 border border-dashed border-zinc-200 text-center flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-medium font-sans">
                            No subcategories under {parent.name} yet.
                          </span>
                          <button
                            onClick={() => handleAddSubcategoryUnderParent(parent)}
                            className="text-xs font-bold text-teal-650 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Plus className="h-3 w-3" /> Create first subcategory
                          </button>
                        </div>
                      ) : (
                        subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 sm:p-3 rounded-2xl border border-zinc-150 hover:border-zinc-250 bg-white hover:bg-zinc-50/60 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Subcategory connector icon */}
                              <div className="text-zinc-300 font-mono text-xs pl-1">└─</div>

                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                                <img
                                  src={sub.image || '/placeholder.svg'}
                                  alt={sub.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-xs text-zinc-900 truncate font-sans">
                                  {sub.name}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono truncate">
                                  /{sub.slug}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {sub.status}
                              </span>

                              <button
                                onClick={() => handleEdit(sub)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                                title="Edit Subcategory"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(sub.id, sub.name)}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          ) : (

            /* 2. FLAT TABLE VIEW */
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs">
              <table className="w-full border-collapse text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-200 font-mono text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Image</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Parent Level</th>
                    <th className="px-5 py-3.5">Slug</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {categories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <img
                          src={cat.image || '/placeholder.svg'}
                          alt={cat.name}
                          className="h-9 w-9 rounded-xl object-cover border border-zinc-200 bg-zinc-50"
                        />
                      </td>
                      <td className="px-5 py-3 font-bold text-zinc-950 font-sans">{cat.name}</td>
                      <td className="px-5 py-3">
                        {cat.parentId ? (
                          <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            └ {categories.find((c: any) => c.id === cat.parentId)?.name || 'Parent'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-zinc-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            👑 Top Level
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-zinc-500">/{cat.slug}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          cat.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete"
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

      </div>
    </div>
  );
}

