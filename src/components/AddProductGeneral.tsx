'use client';

import React from 'react';
import { Sparkles, Image as ImageIcon, Search, Loader2 } from 'lucide-react';

interface AddProductGeneralProps {
  name: string;
  setName: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  gallery: string[];
  isUploadingImage: boolean;
  galleryUrlInput: string;
  setGalleryUrlInput: (val: string) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddGalleryUrl: (e: React.FormEvent) => void;
  onRemoveGalleryImage: (idx: number) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddProductGeneral({
  name,
  brand,
  slug,
  description,
  setDescription,
  shortDescription,
  setShortDescription,
  gallery,
  isUploadingImage,
  galleryUrlInput,
  setGalleryUrlInput,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  onImageUpload,
  onAddGalleryUrl,
  onRemoveGalleryImage,
  handleNameChange
}: AddProductGeneralProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* General Info Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span>General Info</span>
        </h2>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Cotton Polo Shirt"
              value={name}
              onChange={handleNameChange}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Brand</label>
              <input
                type="text"
                placeholder="e.g. Aarong, Yellow"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Slug</label>
              <input
                type="text"
                required
                placeholder="e.g. premium-cotton-polo-shirt"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              rows={4}
              placeholder="Describe your product details, materials, care instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all resize-none outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Short Description</label>
            <input
              type="text"
              placeholder="Write a brief line to display on catalog product cards"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media & Images Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-500" />
            <span>Media & Images</span>
          </h2>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase">Max 8 Images</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter Image URL directly"
              value={galleryUrlInput}
              onChange={(e) => setGalleryUrlInput(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
            />
            <button
              type="button"
              onClick={onAddGalleryUrl}
              className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-4 text-xs font-bold transition-colors cursor-pointer"
            >
              Add URL
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {gallery.map((imgUrl, idx) => (
              <div key={idx} className="aspect-square rounded-xl border border-zinc-200 bg-zinc-50 relative overflow-hidden group">
                <img
                  src={imgUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300';
                  }}
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveGalleryImage(idx)}
                  className="absolute top-2 right-2 bg-zinc-950/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-zinc-950"
                >
                  ✕
                </button>
              </div>
            ))}
            {gallery.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 hover:border-indigo-500 bg-zinc-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative">
                {isUploadingImage ? (
                  <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
                ) : (
                  <>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Upload</span>
                    <span className="text-[9px] text-zinc-400">Local Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageUpload}
                      className="hidden"
                    />
                  </>
                )}
              </label>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">
            The first image is set as the main display catalog cover.
          </p>
        </div>
      </div>

      {/* SEO Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-500" />
          <span>Search Engine Optimization</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Meta Title</label>
            <input
              type="text"
              placeholder="Google search listing title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Meta Description</label>
            <textarea
              rows={2}
              placeholder="Google search listing snippet text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all resize-none outline-none"
            />
          </div>

          <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50 flex flex-col gap-1 word-break shadow-inner">
            <span className="text-xs text-green-700 font-medium">yourstore.com/products/{slug || 'product-slug'}</span>
            <span className="text-sm font-semibold text-blue-800 line-clamp-1">{metaTitle || 'Product Meta Search Title'}</span>
            <span className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
              {metaDescription || 'Add description details to see how search engines show your product details snippet.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
