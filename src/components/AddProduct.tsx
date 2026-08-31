'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import AddProductGeneral from './AddProductGeneral';
import AddProductVariants from './AddProductVariants';
import AddProductPricing from './AddProductPricing';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isInline?: boolean;
}

interface ColorOption {
  name: string;
  code: string;
}

export default function AddProduct({ onSuccess, onCancel, isInline = false }: AddProductProps) {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Categories list state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Field States
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [lowStockAlert, setLowStockAlert] = useState('5');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Frontend-only variant states
  const [sizeInput, setSizeInput] = useState('');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState<ColorOption[]>([
    { name: 'Navy Blue', code: '#1B2A4A' },
    { name: 'Magenta', code: '#E63970' }
  ]);
  const [variantEdits, setVariantEdits] = useState<Record<string, { sku: string; price: string; stock: string }>>({});

  // Image Gallery states
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Toggle switch states
  const [preOrder, setPreOrder] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [freeShipping, setFreeShipping] = useState(false);

  // Shipping details
  const [weight, setWeight] = useState('0.4');
  const [dimensions, setDimensions] = useState('');
  const [shippingInside, setShippingInside] = useState('60');
  const [shippingOutside, setShippingOutside] = useState('120');

  // Shipping details

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['New Collection', 'Best Seller']);

  // SEO details
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Flag to check if slug has been manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!token || !user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [token, user, authLoading, router]);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          setErrorMsg(data.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setErrorMsg('An error occurred while loading categories.');
      } finally {
        setLoadingCategories(false);
      }
    }

    if (token) {
      loadCategories();
    }
  }, [token]);

  // Reset subcategory when category selection changes
  useEffect(() => {
    setSubCategory('');
  }, [categoryId]);

  // Auto-generate slug and SEO titles
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
    setMetaTitle(val + ' - Buy Online at Best Price');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  // Sizes handlers
  const handleAddSize = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sizeInput.trim()) {
      e.preventDefault();
      const s = sizeInput.trim().toUpperCase();
      if (!sizes.includes(s)) {
        setSizes([...sizes, s]);
      }
      setSizeInput('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(s => s !== sizeToRemove));
  };

  // Helper to resolve nice colors from typing
  const getColorHex = (colorName: string): string => {
    const lowercase = colorName.toLowerCase();
    if (lowercase.includes('navy') || lowercase.includes('blue')) return '#1B2A4A';
    if (lowercase.includes('magenta') || lowercase.includes('pink')) return '#E63970';
    if (lowercase.includes('red')) return '#D3402F';
    if (lowercase.includes('green')) return '#1B8A5A';
    if (lowercase.includes('black')) return '#000000';
    if (lowercase.includes('white')) return '#FFFFFF';
    if (lowercase.includes('yellow')) return '#D4A017';
    if (lowercase.includes('orange')) return '#F76B1C';
    let hash = 0;
    for (let i = 0; i < colorName.length; i++) {
      hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return '#' + ((hash & 0x00FFFFFF).toString(16) + '000000').substring(0, 6);
  };

  // Colors handlers
  const handleAddColor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && colorInput.trim()) {
      e.preventDefault();
      const colName = colorInput.trim();
      if (!colors.some(c => c.name.toLowerCase() === colName.toLowerCase())) {
        setColors([...colors, { name: colName, code: getColorHex(colName) }]);
      }
      setColorInput('');
    }
  };

  const handleRemoveColor = (colorName: string) => {
    setColors(colors.filter(c => c.name !== colorName));
  };

  // Tags handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim();
      if (!tags.includes(t)) {
        setTags([...tags, t]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleVariantChange = (key: string, field: 'sku' | 'price' | 'stock', value: string) => {
    setVariantEdits(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        sku: field === 'sku' ? value : (prev[key]?.sku ?? ''),
        price: field === 'price' ? value : (prev[key]?.price ?? ''),
        stock: field === 'stock' ? value : (prev[key]?.stock ?? ''),
      }
    }));
  };

  const handleRemoveVariant = (key: string) => {
    setVariantEdits(prev => ({
      ...prev,
      [key]: {
        sku: 'EXCLUDED',
        price: '0',
        stock: '0'
      }
    }));
  };

  // Gallery handlers
  const handleAddGalleryUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryUrlInput.trim()) {
      if (gallery.length >= 8) {
        setErrorMsg('Maximum of 8 images can be added.');
        return;
      }
      setGallery([...gallery, galleryUrlInput.trim()]);
      setGalleryUrlInput('');
    }
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGallery(gallery.filter((_, idx) => idx !== idxToRemove));
  };

  // ImgBB Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (gallery.length >= 8) {
      setErrorMsg('Maximum of 8 images can be added.');
      return;
    }

    setErrorMsg('');
    setIsUploadingImage(true);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '42fdb6623317f99b22cc6bbb8ce01fc2';
    if (!apiKey) {
      setErrorMsg('ImgBB API Key is not set. Please add NEXT_PUBLIC_IMGBB_API_KEY to your environment variables.');
      setIsUploadingImage(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setGallery([...gallery, data.data.url]);
        setSuccessMsg('Image uploaded successfully!');
      } else {
        const msg = data.error?.message || 'ImgBB upload failed.';
        setErrorMsg(msg);
        alert(`Image upload failed: ${msg}`);
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      setErrorMsg('An error occurred during image upload. Please try again.');
      alert('An error occurred during image upload. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };



  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend Validations
    if (!name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Product Slug is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('SKU code is required.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a Category.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Regular Price must be a valid number greater than 0.');
      return;
    }

    let numericDiscountPrice: number | null = null;
    if (discountPrice !== '') {
      numericDiscountPrice = parseFloat(discountPrice);
      if (isNaN(numericDiscountPrice) || numericDiscountPrice < 0) {
        setErrorMsg('Discount Price cannot be negative.');
        return;
      }
      if (numericDiscountPrice >= numericPrice) {
        setErrorMsg('Discount Price must be less than the regular price.');
        return;
      }
    }

    const numericStock = parseInt(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      setErrorMsg('Stock quantity must be a non-negative integer.');
      return;
    }

    setIsSubmitting(true);

    // Primary image is the first one in the gallery, or null
    const primaryImage = gallery.length > 0 ? gallery[0] : null;
    const secondaryImage = gallery.length > 1 ? gallery[1] : null;

    // Serialize metadata details in product description
    const finalDescription = `
${description}

---
Brand: ${brand}
Short Description: ${shortDescription}
Sizes: ${sizes.join(', ')}
Colors: ${colors.map(c => c.name).join(', ')}
Images: ${gallery.join(', ')}
Tags: ${tags.join(', ')}
Weight: ${weight} kg
Dimensions: ${dimensions}
Shipping Inside: $${shippingInside}
Shipping Outside: $${shippingOutside}
Free Shipping: ${freeShipping ? 'Yes' : 'No'}
    `.trim();

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: finalDescription,
      price: numericPrice,
      discountPrice: numericDiscountPrice,
      stock: numericStock,
      sku: sku.trim(),
      image: primaryImage,
      image2: secondaryImage,
      images: gallery,
      status,
      categoryId
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Product added successfully!');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
        
        if (!isInline) {
          setTimeout(() => {
            router.push('/admin/products');
          }, 2000);
        }
      } else {
        setErrorMsg(data.message || 'Failed to create product.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrorMsg('An error occurred while connecting to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render until authorized
  if (authLoading || !token || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 animate-fadeIn bg-zinc-50 min-h-screen pb-32">
      {/* Top Header Row */}
      <div className="flex flex-col gap-2">
        {!isInline && (
          <button 
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600 self-start transition-colors outline-none cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Inventory</span>
          </button>
        )}
        <div className="flex justify-between items-start border-b border-zinc-200 pb-4 mt-2">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Add New Catalog Product</h1>
            <p className="text-xs text-zinc-500 mt-1">Publish new products inventory records directly inside custom categories</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl border border-green-200 bg-green-50 text-xs font-bold text-green-700 animate-slideIn">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 animate-slideIn">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AddProductGeneral
            name={name}
            setName={setName}
            brand={brand}
            setBrand={setBrand}
            slug={slug}
            setSlug={setSlug}
            description={description}
            setDescription={setDescription}
            shortDescription={shortDescription}
            setShortDescription={setShortDescription}
            gallery={gallery}
            isUploadingImage={isUploadingImage}
            galleryUrlInput={galleryUrlInput}
            setGalleryUrlInput={setGalleryUrlInput}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            onImageUpload={handleImageUpload}
            onAddGalleryUrl={handleAddGalleryUrl}
            onRemoveGalleryImage={handleRemoveGalleryImage}
            handleNameChange={handleNameChange}
          />

          <AddProductVariants
            sizes={sizes}
            sizeInput={sizeInput}
            setSizeInput={setSizeInput}
            onAddSize={handleAddSize}
            onRemoveSize={handleRemoveSize}
            colors={colors}
            colorInput={colorInput}
            setColorInput={setColorInput}
            onAddColor={handleAddColor}
            onRemoveColor={handleRemoveColor}
            baseSku={sku}
            basePrice={price}
            variantEdits={variantEdits}
            onVariantChange={handleVariantChange}
            onRemoveVariant={handleRemoveVariant}
          />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="flex flex-col gap-6">
          <AddProductPricing
            price={price}
            setPrice={setPrice}
            discountPrice={discountPrice}
            setDiscountPrice={setDiscountPrice}
            costPrice={costPrice}
            setCostPrice={setCostPrice}
            stock={stock}
            setStock={setStock}
            lowStockAlert={lowStockAlert}
            setLowStockAlert={setLowStockAlert}
            sku={sku}
            setSku={setSku}
            preOrder={preOrder}
            setPreOrder={setPreOrder}
            trackInventory={trackInventory}
            setTrackInventory={setTrackInventory}
            weight={weight}
            setWeight={setWeight}
            dimensions={dimensions}
            setDimensions={setDimensions}
            shippingInside={shippingInside}
            setShippingInside={setShippingInside}
            shippingOutside={shippingOutside}
            setShippingOutside={setShippingOutside}
            freeShipping={freeShipping}
            setFreeShipping={setFreeShipping}
            categories={categories}
            loadingCategories={loadingCategories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subCategory={subCategory}
            setSubCategory={setSubCategory}
            tags={tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            status={status}
            setStatus={setStatus}
          />
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
          <span>Status: Draft</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel ? onCancel : () => router.push('/admin/products')}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Check className="h-4.5 w-4.5" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
