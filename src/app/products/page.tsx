'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Search, SlidersHorizontal, ShoppingBag, Heart } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const { addToCart, addToWishlist, isInWishlist } = useCart();

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          search,
          category: selectedCategory,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder
        });

        const res = await fetch(`${API_URL}/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          setMeta(data.meta);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // debounce typing

    return () => clearTimeout(timer);
  }, [search, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Catalog Products</h1>
        <p className="text-sm text-zinc-500 mt-1">Explore our range of premium quality items</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Panel */}
        <aside className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-zinc-900">Filters & Sorting</h2>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, desc..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-full border border-zinc-200 py-2 pl-10 pr-4 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Price Range ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:outline-indigo-600 text-center"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="rounded-xl border border-zinc-200 p-2 text-sm bg-zinc-50 focus:outline-indigo-600 text-center"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
            >
              <option value="createdAt">Date added</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Panel */}
        <main className="lg:col-span-3 flex flex-col gap-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-zinc-200 bg-white rounded-2xl">
                  <div className="aspect-[4/3] w-full rounded-xl bg-zinc-200"></div>
                  <div className="h-4 w-3/4 rounded bg-zinc-200"></div>
                  <div className="h-4 w-1/3 rounded bg-zinc-200"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
              <span className="text-zinc-400 text-lg">No products found matching filters</span>
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {products.map((prod) => {
                 const discount = prod.discountPrice !== null;
                 const isWished = isInWishlist(prod.id);
                 return (
                   <div
                     key={prod.id}
                     className="group relative flex flex-col transition-all duration-300"
                   >
                     {/* Wishlist Button */}
                     <button
                       onClick={() => isWished ? addToCart(prod.id, 1) /* placeholder fallback or remove */ : addToWishlist(prod.id)}
                       className={`absolute right-2.5 top-2.5 z-10 p-2 rounded-full shadow-sm border border-zinc-100 bg-white hover:scale-105 transition-transform ${
                         isWished ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
                       }`}
                     >
                       <Heart className="h-4 w-4" fill={isWished ? 'currentColor' : 'none'} />
                     </button>

                     <a href={`/products/${prod.id}`} className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-50 relative block">
                       <img
                         src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                         alt={prod.name}
                         className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                       />
                       
                       {/* Add to Cart Overlay */}
                       <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                         <button
                           onClick={async (e) => {
                             e.preventDefault();
                             if (!token) {
                               router.push('/login');
                               return;
                             }
                             const res = await addToCart(prod.id, 1);
                             if (res.success) {
                               router.push('/checkout');
                             }
                           }}
                           disabled={prod.stock === 0}
                           className="w-full flex items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-sm py-2.5 text-xs font-bold text-zinc-950 hover:bg-white transition-all shadow-md uppercase tracking-wider disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed"
                         >
                           <ShoppingBag className="h-4 w-4" />
                           <span>{prod.stock > 0 ? 'Order Now' : 'Out of Stock'}</span>
                         </button>
                       </div>
                     </a>
                     <div className="mt-3 flex flex-col flex-1 px-0.5">
                       <span className="text-xs font-medium text-zinc-400">{prod.category?.name}</span>
                       <a href={`/products/${prod.id}`} className="font-semibold text-zinc-900 group-hover:text-teal-600 transition-colors mt-1 block line-clamp-1">
                         {prod.name}
                       </a>

                       <div className="mt-2 flex items-baseline gap-2">
                         {discount ? (
                           <>
                             <span className="text-lg font-bold text-zinc-900">${prod.discountPrice}</span>
                             <span className="text-sm text-zinc-400 line-through">${prod.price}</span>
                           </>
                         ) : (
                           <span className="text-lg font-bold text-zinc-900">${prod.price}</span>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 pt-6 mt-4">
              <span className="text-sm text-zinc-500">
                Page {meta.page} of {meta.totalPages} (Total {meta.total} products)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
