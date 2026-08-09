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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Categories</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse products grouped by department</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3 p-4 border border-zinc-200 bg-white rounded-2xl">
              <div className="aspect-[4/3] w-full rounded-xl bg-zinc-200"></div>
              <div className="h-4 w-1/2 rounded bg-zinc-200"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] w-full bg-zinc-50 overflow-hidden relative">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400'}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                    {cat.description || 'Quality selection of products from trusted manufacturers.'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  <span>Explore Items</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
