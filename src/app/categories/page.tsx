'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '../../config';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-[0.06em] text-[#232323] uppercase">Categories</h1>
        <p className="text-[11px] font-medium text-[#969696] tracking-[0.04em] uppercase mt-1">Browse products grouped by department</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-zinc-200 bg-white">
              <div className="aspect-[4/3] w-full bg-zinc-200"></div>
              <div className="h-4 w-1/2 rounded bg-zinc-200"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative flex flex-col border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] w-full bg-zinc-50 overflow-hidden relative">
                <img
                  src={cat.image || '/placeholder.svg'}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-[#232323] group-hover:text-zinc-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#969696] leading-relaxed line-clamp-2">
                    {cat.description || 'Quality selection of products from trusted manufacturers.'}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#232323] group-hover:text-zinc-600 flex items-center gap-1.5">
                  <span>Explore Items</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
