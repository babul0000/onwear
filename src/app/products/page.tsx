'use client';

import React, { useEffect, useState, Suspense } from 'react';
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

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState(''); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Dynamic filter lists from API metadata
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const PRICE_PRESETS = [
    { label: 'All Prices', value: '', min: '', max: '' },
    { label: 'Tk 100 – 1,000', value: '100-1000', min: '100', max: '1000' },
    { label: 'Tk 1,000 – 3,000', value: '1000-3000', min: '1000', max: '3000' },
    { label: 'Tk 3,000 – 10,000', value: '3000-10000', min: '3000', max: '10000' },
    { label: 'Tk 10,000 – 50,000', value: '10000-50000', min: '10000', max: '50000' },
    { label: 'Tk 50,000 – 4,00,000', value: '50000-400000', min: '50000', max: '400000' }
  ];

  // Parse initial query params on mount/change
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    setSelectedCategory(categoryQuery || '');
    setSearch(searchQuery || '');
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
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          search,
          category: selectedCategory,
          minPrice: minPrice || '',
          maxPrice: maxPrice || '',
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
  }, [search, selectedCategory, minPrice, maxPrice, selectedSizes, selectedColors, sortBy, sortOrder, page]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('');
    setMinPrice('');
    setMaxPrice('');
    setCustomMin('');
    setCustomMax('');
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
    setMinPrice('');
    setMaxPrice('');
    setCustomMin('');
    setCustomMax('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPage(1);
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-8 text-zinc-800">
      
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

        {(selectedCategory || search || minPrice || maxPrice || selectedSizes.length > 0 || selectedColors.length > 0) && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-zinc-400 hover:text-zinc-950 underline uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="flex items-center justify-between lg:hidden bg-zinc-50 border border-zinc-200 p-3">
        <button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-zinc-800 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{showMobileFilters ? 'Hide Filters & Sorting' : 'Filter & Sort Products'}</span>
        </button>
        <span className="text-xs font-bold text-zinc-500 font-mono">
          {!loading && `${meta.total} Item${meta.total !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 xl:grid-cols-5 items-start">
        {/* Filters Sidebar */}
        <aside className={`${showMobileFilters ? 'flex' : 'hidden lg:flex'} lg:col-span-1 xl:col-span-1 flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit`}>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-zinc-950" />
              <h2 className="font-extrabold text-zinc-950 text-sm uppercase tracking-wider">Filters & Sorting</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="lg:hidden text-zinc-400 hover:text-zinc-950 text-xs font-bold uppercase cursor-pointer"
            >
              Close
            </button>
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Price Range (Tk 100 – 4,00,000)
              </label>
              {(minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceRange('');
                    setMinPrice('');
                    setMaxPrice('');
                    setCustomMin('');
                    setCustomMax('');
                    setPage(1);
                  }}
                  className="text-[10px] font-bold text-teal-650 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Presets List */}
            <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-600">
              {PRICE_PRESETS.map((bucket) => (
                <label key={bucket.value} className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-950 transition-colors">
                  <input
                    type="radio"
                    name="priceBucket"
                    value={bucket.value}
                    checked={priceRange === bucket.value}
                    onChange={() => {
                      setPriceRange(bucket.value);
                      setMinPrice(bucket.min);
                      setMaxPrice(bucket.max);
                      setCustomMin(bucket.min);
                      setCustomMax(bucket.max);
                      setPage(1);
                    }}
                    className="text-zinc-950 focus:ring-zinc-950 cursor-pointer"
                  />
                  <span>{bucket.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Range Typing Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPriceRange('custom');
                setMinPrice(customMin);
                setMaxPrice(customMax);
                setPage(1);
              }}
              className="pt-3 border-t border-zinc-100 flex flex-col gap-2"
            >
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Custom Price (Tk)</span>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[11px] font-bold text-zinc-400">৳</span>
                  <input
                    type="number"
                    min="100"
                    max="400000"
                    placeholder="100"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-1.5 pl-6 pr-1.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-mono font-bold text-zinc-900"
                  />
                </div>
                <span className="text-zinc-400 text-xs font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[11px] font-bold text-zinc-400">৳</span>
                  <input
                    type="number"
                    min="100"
                    max="400000"
                    placeholder="400,000"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 py-1.5 pl-6 pr-1.5 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-mono font-bold text-zinc-900"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider shrink-0"
                >
                  Apply
                </button>
              </div>
              {priceRange === 'custom' && (minPrice || maxPrice) && (
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded-lg flex items-center justify-between mt-0.5 font-mono">
                  <span>Active: ৳{minPrice || '100'} – ৳{maxPrice || '4,00,000'}</span>
                </div>
              )}
            </form>
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
        <main className="lg:col-span-3 xl:col-span-4 flex flex-col gap-6 sm:gap-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-2.5 bg-white border border-zinc-100 p-2">
                  <div className="aspect-[3/4] w-full bg-zinc-100"></div>
                  <div className="h-4 w-3/4 bg-zinc-100"></div>
                  <div className="h-4 w-1/4 bg-zinc-100"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 bg-white p-8">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">No products found matching filters</span>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
             <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
               {products.map((prod) => {
                 const discount = prod.discountPrice !== null && prod.discountPrice !== undefined;
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
                       onClick={() => addToWishlist(prod.id, prod)}
                       className={`absolute right-2.5 top-2.5 z-10 p-2 shadow-xs border border-zinc-100 bg-white/90 backdrop-blur-xs hover:scale-105 transition-transform cursor-pointer ${
                         isWished ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
                       }`}
                       title="Wishlist"
                     >
                       <Heart className="h-4 w-4" fill={isWished ? 'currentColor' : 'none'} />
                     </button>

                     {/* Aspect 3/4 Image Container */}
                      <a href={`/products/${prod.id}`} className="aspect-[3/4] w-full overflow-hidden bg-zinc-50 border border-zinc-100 shadow-xs relative block">
                        {/* Primary Image */}
                        <img
                          src={prod.image || '/placeholder.svg'}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                            isSoldOut ? 'opacity-50' : prod.image2 ? 'group-hover:opacity-0' : ''
                          }`}
                        />

                        {/* Secondary Image */}
                        {!isSoldOut && prod.image2 && (
                          <img
                            src={prod.image2}
                            alt={`${prod.name} Alternate`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover opacity-0 scale-100 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
                          />
                        )}
                       
                       {/* Sold Out Badge overlay */}
                       {isSoldOut ? (
                         <span className="absolute left-2.5 top-2.5 z-10 bg-zinc-950 px-2 py-0.5 text-[8px] font-bold text-white tracking-widest uppercase shadow-xs">
                           Sold Out
                         </span>
                       ) : discount ? (
                         <span className="absolute top-2.5 left-2.5 bg-teal-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-xs">
                           Sale
                         </span>
                       ) : null}

                       {/* Add to Cart Floating Button (Visible on mobile, animated hover on desktop) */}
                       {!isSoldOut && (
                         <button
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             addToCart(prod.id, 1);
                           }}
                           className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-zinc-950/90 hover:bg-zinc-950 text-white p-2.5 shadow-md opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 active:scale-90 transition-all duration-200 z-10 cursor-pointer"
                           title="Add to Bag"
                         >
                           <ShoppingBag className="h-3.5 w-3.5" />
                         </button>
                       )}
                     </a>

                     {/* Info Block */}
                     <div className="mt-2.5 flex flex-col flex-1 px-0.5">
                       <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 font-mono truncate">{prod.category?.name || 'ONWEAR'}</span>
                         {reviewCount > 0 && (
                           <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold">
                             <Star className="h-3 w-3 fill-current" />
                             <span>{averageRating}</span>
                           </div>
                         )}
                       </div>
                       
                       <a href={`/products/${prod.id}`} className="font-bold text-xs uppercase tracking-tight text-zinc-900 group-hover:text-teal-650 transition-colors mt-0.5 block line-clamp-1">
                         {prod.name}
                       </a>

                       <div className="mt-1 flex items-baseline gap-1.5">
                         {discount ? (
                           <>
                             <span className={`text-xs sm:text-sm font-black font-mono ${isSoldOut ? 'text-zinc-400' : 'text-zinc-950'}`}>
                               {formatPrice(prod.discountPrice)}
                             </span>
                             <span className="text-[10px] text-zinc-400 line-through font-semibold font-mono">
                               {formatPrice(prod.price)}
                             </span>
                           </>
                         ) : (
                           <span className={`text-xs sm:text-sm font-black font-mono ${isSoldOut ? 'text-zinc-400 font-medium' : 'text-zinc-950'}`}>
                             {formatPrice(prod.price)}
                           </span>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="text-zinc-500 font-bold">Loading products...</div></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
