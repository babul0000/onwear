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
  AlertCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Move,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  parentId?: string | null;
  displayOrder?: number;
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

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

  // Drag & drop & reordering state
  const [draggedParentId, setDraggedParentId] = useState<string | null>(null);
  const [dragOverParentId, setDragOverParentId] = useState<string | null>(null);
  const [draggedSubId, setDraggedSubId] = useState<{ parentId: string; subId: string } | null>(null);
  const [dragOverSubId, setDragOverSubId] = useState<{ parentId: string; subId: string } | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const saveCategoryOrder = async (updatedCategories: CategoryItem[]) => {
    const payload: { id: string; displayOrder: number }[] = [];
    const parents = updatedCategories.filter((c) => !c.parentId);
    parents.forEach((parent, pIdx) => {
      payload.push({ id: parent.id, displayOrder: pIdx });
      if (parent.subcategories && parent.subcategories.length > 0) {
        parent.subcategories.forEach((sub, sIdx) => {
          payload.push({ id: sub.id, displayOrder: sIdx });
        });
      }
    });

    setIsSavingOrder(true);
    try {
      const res = await fetch(`${API_URL}/categories/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: payload })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Category sequence updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save category order:', err);
      setError('Failed to update category order.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleMoveParent = (parentIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? parentIdx - 1 : parentIdx + 1;
    if (targetIdx < 0 || targetIdx >= parentCategories.length) return;
    
    const parentA = parentCategories[parentIdx];
    const parentB = parentCategories[targetIdx];
    const idxA = categories.findIndex((c) => c.id === parentA.id);
    const idxB = categories.findIndex((c) => c.id === parentB.id);
    if (idxA === -1 || idxB === -1) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(idxA, 1);
    newCats.splice(idxB, 0, moved);
    setCategories(newCats);
    saveCategoryOrder(newCats);
  };

  const handleMoveSub = (parentCatId: string, subIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? subIdx - 1 : subIdx + 1;
    const parent = categories.find((c) => c.id === parentCatId);
    if (!parent || !parent.subcategories || targetIdx < 0 || targetIdx >= parent.subcategories.length) return;

    const newCats = categories.map((cat) => {
      if (cat.id !== parentCatId || !cat.subcategories) return cat;
      const subs = [...cat.subcategories];
      const [moved] = subs.splice(subIdx, 1);
      subs.splice(targetIdx, 0, moved);
      return { ...cat, subcategories: subs };
    });
    setCategories(newCats);
    saveCategoryOrder(newCats);
  };

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
  const activeCount = parentCategories.filter(c => c.status === 'ACTIVE').length + allSubcategories.filter(s => s.status === 'ACTIVE').length;
  const hiddenCount = totalCategoriesCount - activeCount;

  // Selected parent category object
  const selectedParent = useMemo(() => {
    return parentCategories.find((p) => p.id === parentId);
  }, [parentCategories, parentId]);

  // 1-Click Toggle Category Visibility Status (Show / Hide)
  const handleToggleStatus = async (cat: CategoryItem) => {
    const newStatus: 'ACTIVE' | 'INACTIVE' = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Optimistic UI update
    const updateList = (list: CategoryItem[]): CategoryItem[] => {
      return list.map((item) => {
        if (item.id === cat.id) {
          return { ...item, status: newStatus };
        }
        if (item.subcategories && item.subcategories.length > 0) {
          return { ...item, subcategories: updateList(item.subcategories) };
        }
        return item;
      });
    };

    setCategories((prev) => updateList(prev));

    try {
      const res = await fetch(`${API_URL}/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`"${cat.name}" is now ${newStatus === 'ACTIVE' ? 'Visible (Active)' : 'Hidden (Inactive)'} on the storefront.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update visibility');
        fetchCategories(); // revert
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('An error occurred while updating category status.');
      fetchCategories();
    }
  };

  // Image Upload Handler (Cloudinary with ImgBB fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        setImage(data.data.url);
        setSuccess('Image uploaded to Cloudinary CDN successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Fallback to ImgBB
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        });
        const imgbbData = await imgbbRes.json();
        if (imgbbData.success && imgbbData.data?.url) {
          setImage(imgbbData.data.url);
        } else {
          alert(data.message || 'Image upload failed.');
        }
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

  // Filtered categories according to search query and statusFilter
  const filteredParents = useMemo(() => {
    let list = parentCategories;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((p) => {
        if (p.status === statusFilter) return true;
        // If parent is not of status, check if any sub matches
        return p.subcategories?.some((s) => s.status === statusFilter);
      });
    }

    // Apply search filter
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((p) => {
      const matchParent = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchChild = p.subcategories?.some((s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
      return matchParent || matchChild;
    });
  }, [parentCategories, searchQuery, statusFilter]);

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
                Manage top-level departments, hide/show categories in 1-click, and assign subcategories.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 font-mono self-start sm:self-auto">
          <div className="bg-white border border-zinc-200/80 rounded-2xl px-3 py-2 text-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">Visible</span>
            <span className="text-base font-black text-emerald-600">{activeCount}</span>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl px-3 py-2 text-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-bold">Hidden</span>
            <span className="text-base font-black text-amber-600">{hiddenCount}</span>
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
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
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
                            loading="lazy"
                            decoding="async"
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
                    loading="lazy"
                    decoding="async"
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
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-700">Upload to Cloudinary CDN</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. VISIBILITY (SHOW / HIDE) SELECTOR */}
            <div className="flex flex-col gap-2 font-sans">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                Storefront Visibility (Show / Hide)
              </label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200/60 font-sans">
                <button
                  type="button"
                  onClick={() => setStatus('ACTIVE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Visible (Active)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('INACTIVE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === 'INACTIVE'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Hidden (Inactive)</span>
                </button>
              </div>
            </div>

            {/* 7. DESCRIPTION */}
            <div className="flex flex-col gap-1.5 font-sans">
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

            {/* 8. SUBMIT & RESET BUTTONS */}
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
          
          {/* Controls Bar: Search, Status Filter & View Toggle */}
          <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl font-mono text-[11px] font-bold self-end sm:self-auto">
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

            {/* Visibility Quick Filters (All / Visible / Hidden) */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 font-sans text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filter:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  All ({totalCategoriesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Visible ({activeCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    statusFilter === 'INACTIVE'
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <EyeOff className="h-3 w-3" />
                  <span>Hidden ({hiddenCount})</span>
                </button>
              </div>
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
              <p className="text-sm font-bold text-zinc-800">No categories found matching filter</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Try switching the filter to &quot;All&quot; or create a new category using the form on the left.
              </p>
            </div>
          ) : viewMode === 'hierarchy' ? (
            
            /* 1. HIERARCHY TREE VIEW WITH DRAG & DROP REORDERING */
            <div className="flex flex-col gap-4">
              {/* Informational tip banner */}
              <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-2.5 rounded-2xl text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Click 👁️ to instantly Hide/Show on store, or drag to reorder.</span>
                </div>
                {isSavingOrder && (
                  <span className="text-teal-400 font-bold animate-pulse text-[11px]">Saving sequence...</span>
                )}
              </div>

              {filteredParents.map((parent, pIdx) => {
                const subs = (parent.subcategories || []).filter((s) => {
                  if (statusFilter === 'ALL') return true;
                  return s.status === statusFilter;
                });
                const isFirst = pIdx === 0;
                const isLast = pIdx === filteredParents.length - 1;
                const isBeingDragged = draggedParentId === parent.id;
                const isDragOver = dragOverParentId === parent.id;
                const isParentInactive = parent.status === 'INACTIVE';

                return (
                  <div
                    key={parent.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedParentId(parent.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverParentId !== parent.id) {
                        setDragOverParentId(parent.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverParentId === parent.id) {
                        setDragOverParentId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedParentId && draggedParentId !== parent.id) {
                        const fromIdx = categories.findIndex((c) => c.id === draggedParentId);
                        const toIdx = categories.findIndex((c) => c.id === parent.id);
                        if (fromIdx !== -1 && toIdx !== -1) {
                          const newCats = [...categories];
                          const [moved] = newCats.splice(fromIdx, 1);
                          newCats.splice(toIdx, 0, moved);
                          setCategories(newCats);
                          saveCategoryOrder(newCats);
                        }
                      }
                      setDraggedParentId(null);
                      setDragOverParentId(null);
                    }}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                      isDragOver
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg scale-[1.01]'
                        : isBeingDragged
                        ? 'opacity-40 border-dashed border-zinc-400'
                        : isParentInactive
                        ? 'border-zinc-200/60 bg-zinc-50/60 opacity-80'
                        : 'border-zinc-200/90 shadow-xs hover:border-zinc-300'
                    }`}
                  >
                    {/* Parent Category Header Card */}
                    <div className={`p-4 sm:p-5 border-b border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isParentInactive ? 'bg-zinc-100/70' : 'bg-zinc-50/70'
                    }`}>
                      <div className="flex items-center gap-3">
                        
                        {/* Drag Handle & Up/Down Sequence Controls */}
                        <div className="flex items-center gap-1 bg-white border border-zinc-200/90 rounded-xl p-1 shadow-2xs">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="font-mono text-[10px] font-black bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md">
                            #{pIdx + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveParent(pIdx, 'up')}
                              className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveParent(pIdx, 'down')}
                              className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Thumbnail Image */}
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white border border-zinc-200 shrink-0 shadow-xs relative">
                          <img
                            src={parent.image || '/placeholder.svg'}
                            alt={parent.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                          {isParentInactive && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <EyeOff className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-zinc-950 font-sans tracking-tight uppercase">
                              {parent.name}
                            </h4>
                            
                            {/* 1-Click Visibility Toggle Badge */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(parent)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase font-mono border transition-all cursor-pointer ${
                                parent.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-zinc-200 text-zinc-700 border-zinc-300 hover:bg-zinc-300'
                              }`}
                              title={parent.status === 'ACTIVE' ? 'Click to HIDE from storefront' : 'Click to SHOW on storefront'}
                            >
                              {parent.status === 'ACTIVE' ? (
                                <>
                                  <Eye className="h-3 w-3 text-emerald-600" />
                                  <span>Visible</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 text-zinc-600" />
                                  <span>Hidden</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono">
                            <span>/{parent.slug}</span>
                            <span>•</span>
                            <span className="text-teal-650 font-bold">{parent.subcategories?.length || 0} sub-categories</span>
                            {isParentInactive && (
                              <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-1.5 py-0.2 rounded">
                                (Hidden from store)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Parent Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Quick Hide/Show button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(parent)}
                          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold font-mono ${
                            parent.status === 'ACTIVE'
                              ? 'text-zinc-600 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title={parent.status === 'ACTIVE' ? 'Hide Category' : 'Unhide Category'}
                        >
                          {parent.status === 'ACTIVE' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <>
                              <Eye className="h-4 w-4 text-emerald-600" />
                              <span className="text-[10px]">Show</span>
                            </>
                          )}
                        </button>

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

                    {/* Subcategories Nested List with Reordering */}
                    <div className="p-3 sm:p-4 bg-white flex flex-col gap-2">
                      {subs.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-zinc-50/50 border border-dashed border-zinc-200 text-center flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-medium font-sans">
                            {parent.subcategories?.length === 0 ? `No subcategories under ${parent.name} yet.` : 'No subcategories match the current filter.'}
                          </span>
                          <button
                            onClick={() => handleAddSubcategoryUnderParent(parent)}
                            className="text-xs font-bold text-teal-650 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Plus className="h-3 w-3" /> Create first subcategory
                          </button>
                        </div>
                      ) : (
                        subs.map((sub, sIdx) => {
                          const isSubFirst = sIdx === 0;
                          const isSubLast = sIdx === subs.length - 1;
                          const isSubBeingDragged = draggedSubId?.parentId === parent.id && draggedSubId?.subId === sub.id;
                          const isSubDragOver = dragOverSubId?.parentId === parent.id && dragOverSubId?.subId === sub.id;
                          const isSubInactive = sub.status === 'INACTIVE';

                          return (
                            <div
                              key={sub.id}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggedSubId({ parentId: parent.id, subId: sub.id });
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverSubId?.subId !== sub.id) {
                                  setDragOverSubId({ parentId: parent.id, subId: sub.id });
                                }
                              }}
                              onDragLeave={(e) => {
                                e.stopPropagation();
                                if (dragOverSubId?.subId === sub.id) {
                                  setDragOverSubId(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedSubId && draggedSubId.parentId === parent.id && draggedSubId.subId !== sub.id) {
                                  const fromSubIdx = subs.findIndex((s) => s.id === draggedSubId.subId);
                                  const toSubIdx = sIdx;
                                  if (fromSubIdx !== -1 && toSubIdx !== -1) {
                                    const newCats = categories.map((cat) => {
                                      if (cat.id !== parent.id || !cat.subcategories) return cat;
                                      const newSubs = [...cat.subcategories];
                                      const [moved] = newSubs.splice(fromSubIdx, 1);
                                      newSubs.splice(toSubIdx, 0, moved);
                                      return { ...cat, subcategories: newSubs };
                                    });
                                    setCategories(newCats);
                                    saveCategoryOrder(newCats);
                                  }
                                }
                                setDraggedSubId(null);
                                setDragOverSubId(null);
                              }}
                              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                                isSubDragOver
                                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/30'
                                  : isSubBeingDragged
                                  ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-50'
                                  : isSubInactive
                                  ? 'border-zinc-200/60 bg-zinc-50/50 opacity-75'
                                  : 'border-zinc-150 hover:border-zinc-250 bg-white hover:bg-zinc-50/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Subcategory Sequence Controls */}
                                <div className="flex items-center gap-0.5 bg-zinc-50 border border-zinc-200/80 rounded-lg p-0.5">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-400 hover:text-zinc-800"
                                    title="Drag to reorder subcategory"
                                  >
                                    <GripVertical className="h-3 w-3" />
                                  </div>
                                  <span className="font-mono text-[9px] font-bold text-zinc-500 px-1">
                                    {sIdx + 1}
                                  </span>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      disabled={isSubFirst}
                                      onClick={() => handleMoveSub(parent.id, sIdx, 'up')}
                                      className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                                      title="Move Subcategory Up"
                                    >
                                      <ArrowUp className="h-2.5 w-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSubLast}
                                      onClick={() => handleMoveSub(parent.id, sIdx, 'down')}
                                      className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                                      title="Move Subcategory Down"
                                    >
                                      <ArrowDown className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="h-8 w-8 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 relative">
                                  <img
                                    src={sub.image || '/placeholder.svg'}
                                    alt={sub.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                  />
                                  {isSubInactive && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <EyeOff className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-zinc-900 truncate font-sans">
                                    {sub.name}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                                    /{sub.slug} {isSubInactive && <span className="text-amber-600 font-bold">(Hidden)</span>}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* 1-Click Subcategory Visibility Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(sub)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border transition-all cursor-pointer ${
                                    sub.status === 'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-zinc-200 text-zinc-600 border-zinc-300 hover:bg-zinc-300'
                                  }`}
                                  title={sub.status === 'ACTIVE' ? 'Click to HIDE from store' : 'Click to SHOW on store'}
                                >
                                  {sub.status === 'ACTIVE' ? (
                                    <>
                                      <Eye className="h-2.5 w-2.5" />
                                      <span>Visible</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-2.5 w-2.5" />
                                      <span>Hidden</span>
                                    </>
                                  )}
                                </button>

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
                          );
                        })
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
                          loading="lazy"
                          decoding="async"
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
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                            cat.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                          title={cat.status === 'ACTIVE' ? 'Click to Hide' : 'Click to Show'}
                        >
                          {cat.status === 'ACTIVE' ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
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
