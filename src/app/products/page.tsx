'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Search, SlidersHorizontal, ShoppingBag, Heart, Star, Check } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const COLOR_MAP: Record<string, string> = {
  black: 'bg-zinc-950 border-zinc-950',
  white: 'bg-white border-zinc-300',
  beige: 'bg-[#f5f5dc] border-zinc-300',
  grey: 'bg-zinc-400 border-zinc-400',
  gray: 'bg-zinc-400 border-zinc-400',
  blue: 'bg-blue-600 border-blue-600',
  navy: 'bg-blue-900 border-blue-900',
  red: 'bg-red-600 border-red-600',
  green: 'bg-emerald-600 border-emerald-600',
  yellow: 'bg-amber-400 border-amber-400',
  brown: 'bg-amber-800 border-amber-800',
  cream: 'bg-[#fffdd0] border-zinc-300',
  denim: 'bg-[#1560bd] border-[#1560bd]',
  chino: 'bg-[#d2b48c] border-[#d2b48c]',
  cargo: 'bg-[#4b5320] border-[#4b5320]',
  khaki: 'bg-[#c3b091] border-[#c3b091]',
  olive: 'bg-[#808000] border-[#808000]'
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState(''); // '', 'under-999', '999-1499', '1499-1999', '1999-plus'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Dynamic filter lists from API metadata
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Parse initial query params on mount
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    if (categoryQuery) setSelectedCategory(categoryQuery);
    if (searchQuery) setSearch(searchQuery);
  }, [searchParams]);

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
        let minPrice = '';
        let maxPrice = '';
        if (priceRange === 'under-999') {
          maxPrice = '999';
        } else if (priceRange === '999-1499') {
          minPrice = '999';
          maxPrice = '1499';
        } else if (priceRange === '1499-1999') {
          minPrice = '1499';
          maxPrice = '1999';
        } else if (priceRange === '1999-plus') {
          minPrice = '1999';
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          search,
          category: selectedCategory,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
          sizes: selectedSizes.join(','),
          colors: selectedColors.join(',')
        });

        const res = await fetch(`${API_URL}/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          setMeta(data.meta);
          // Pull available sizes/colors from backend filters metadata
          if (data.meta.filters) {
            setAvailableSizes(data.meta.filters.sizes || []);
            setAvailableColors(data.meta.filters.colors || []);
          }
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
  }, [search, selectedCategory, priceRange, selectedSizes, selectedColors, sortBy, sortOrder, page]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('');
    setPage(1);
  };

  const handleSizeToggle = (size: string) => {
    setPage(1);
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setPage(1);
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setPriceRange('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 text-zinc-800">
      
      {/* Header and Live Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase">
            {selectedCategory ? `${selectedCategory} Collection` : 'Catalog Products'}
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {!loading && `${meta.total} product${meta.total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {(selectedCategory || search || priceRange || selectedSizes.length > 0 || selectedColors.length > 0) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-zinc-400 hover:text-zinc-950 underline uppercase tracking-wider transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
        {/* Filters Sidebar */}
        <aside className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
            <SlidersHorizontal className="h-4.5 w-4.5 text-zinc-950" />
            <h2 className="font-extrabold text-zinc-950 text-sm uppercase tracking-wider">Filters & Sorting</h2>
          </div>

          {/* Search Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-full border border-zinc-200 py-2 pl-9 pr-4 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 font-medium"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Category Dropdown Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:outline-none focus:border-zinc-450 font-bold text-zinc-800 cursor-pointer"
            >
              <option value="">All Collections</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Price Range Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Price Range</label>
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
              {[
                { label: 'All Prices', value: '' },
                { label: 'Under Tk 999', value: 'under-999' },
                { label: 'Tk 999 – 1,499', value: '999-1499' },
                { label: 'Tk 1,499 – 1,999', value: '1499-1999' },
                { label: 'Tk 1,999+', value: '1999-plus' }
              ].map((bucket) => (
                <label key={bucket.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="priceBucket"
                    value={bucket.value}
                    checked={priceRange === bucket.value}
                    onChange={() => { setPriceRange(bucket.value); setPage(1); }}
                    className="text-zinc-950 focus:ring-zinc-950"
                  />
                  <span>{bucket.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic Sizes Checkbox Filter */}
          {availableSizes.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sizes</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-zinc-700">
                {availableSizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`flex items-center justify-center p-2 rounded-xl border text-xs font-black transition-all ${
                        active 
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm' 
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Colors Checkbox Filter with Swatch circles */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Colors</label>
              <div className="flex flex-col gap-2 text-xs font-bold text-zinc-700">
                {availableColors.map((color) => {
                  const active = selectedColors.includes(color);
                  const swatchClass = COLOR_MAP[color.toLowerCase()] || 'bg-zinc-100 border-zinc-300';
                  return (
                    <label key={color} className="flex items-center justify-between cursor-pointer select-none">
                      <div className="flex items-center gap-2">
                        {/* Swatch circle */}
                        <div className={`h-4.5 w-4.5 rounded-full border shadow-sm ${swatchClass}`} />
                        <span className="capitalize font-semibold text-zinc-800">{color}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => handleColorToggle(color)}
                        className="rounded text-zinc-950 focus:ring-zinc-950 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sorting controls */}
          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:outline-none focus:border-zinc-450 font-bold text-zinc-800 cursor-pointer"
            >
              <option value="createdAt">New Arrivals</option>
              <option value="price">Price</option>
              <option value="name">Product Name</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Direction</label>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:outline-none focus:border-zinc-450 font-bold text-zinc-800 cursor-pointer"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Panel */}
        <main className="lg:col-span-3 flex flex-col gap-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3 rounded-2xl bg-white border border-zinc-100 p-1">
                  <div className="aspect-[3/4] w-full rounded-xl bg-zinc-200"></div>
                  <div className="h-4 w-3/4 rounded bg-zinc-200"></div>
                  <div className="h-4 w-1/4 rounded bg-zinc-200"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white p-8">
              <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">No products found matching filters</span>
            </div>
          ) : (
             <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
               {products.map((prod) => {
                 const discount = prod.discountPrice !== null;
                 const isWished = isInWishlist(prod.id);
                 const isSoldOut = prod.stock === 0;

                 // Calculate dynamic review averages
                 const reviewCount = prod.reviews?.length || 0;
                 const averageRating = reviewCount > 0
                   ? (prod.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1)
                   : null;

                 return (
                   <div
                     key={prod.id}
                     className="group relative flex flex-col transition-all duration-300"
                   >
                     {/* Wishlist Button */}
                     <button
                       onClick={() => isWished ? addToCart(prod.id, 1) : addToWishlist(prod.id)}
                       className={`absolute right-2.5 top-2.5 z-10 p-2 rounded-full shadow-sm border border-zinc-105 bg-white hover:scale-105 transition-transform ${
                         isWished ? 'text-red-500' : 'text-zinc-450 hover:text-red-500'
                       }`}
                     >
                       <Heart className="h-4 w-4" fill={isWished ? 'currentColor' : 'none'} />
                     </button>

                     {/* Aspect 3/4 Image Container */}
                     <a href={`/products/${prod.id}`} className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-50 relative block">
                       <img
                         src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'}
                         alt={prod.name}
                         className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110 ${
                           isSoldOut ? 'opacity-50 group-hover:scale-100' : ''
                         }`}
                       />
                       
                       {/* Sold Out Badge overlay */}
                       {isSoldOut && (
                         <span className="absolute left-2.5 top-2.5 z-10 rounded bg-zinc-950 px-2 py-0.5 text-[8px] font-bold text-white tracking-widest uppercase shadow">
                           Sold Out
                         </span>
                       )}

                       {/* Add to Cart Overlay */}
                       <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                         <button
                           onClick={(e) => {
                             e.preventDefault();
                             if (!token) {
                               router.push('/login');
                               return;
                             }
                             addToCart(prod.id, 1);
                           }}
                           disabled={isSoldOut}
                           className="w-full flex items-center justify-center gap-2 rounded-full bg-white/90 backdrop-blur-sm py-2.5 text-xs font-bold text-zinc-950 hover:bg-white transition-all shadow-md uppercase tracking-wider disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed"
                         >
                           <ShoppingBag className="h-4 w-4" />
                           <span>{!isSoldOut ? 'Order Now' : 'Out of Stock'}</span>
                         </button>
                       </div>
                     </a>

                     {/* Info Block */}
                     <div className="mt-3 flex flex-col flex-1 px-0.5">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{prod.category?.name}</span>
                         {/* Rating stars display (hidden if 0 reviews) */}
                         {reviewCount > 0 && (
                           <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold">
                             <Star className="h-3 w-3 fill-current" />
                             <span>{averageRating}</span>
                           </div>
                         )}
                       </div>
                       
                       <a href={`/products/${prod.id}`} className="font-semibold text-zinc-900 group-hover:text-teal-600 transition-colors mt-1 block line-clamp-1">
                         {prod.name}
                       </a>

                       <div className="mt-2 flex items-baseline gap-2">
                         {discount ? (
                           <>
                             <span className={`text-lg font-bold ${isSoldOut ? 'text-zinc-400' : 'text-zinc-900'}`}>{formatPrice(prod.discountPrice)}</span>
                             <span className="text-sm text-zinc-400 line-through">{formatPrice(prod.price)}</span>
                           </>
                         ) : (
                           <span className={`text-lg font-bold ${isSoldOut ? 'text-zinc-400 font-medium' : 'text-zinc-900'}`}>{formatPrice(prod.price)}</span>
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
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-xs font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-zinc-500">
                Page {page} of {meta.totalPages}
              </span>
              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-xs font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
