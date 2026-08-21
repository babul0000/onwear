'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Loader2 } from 'lucide-react';

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

  // Language state
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

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
    { name: 'নেভি ব্লু', code: '#1B2A4A' },
    { name: 'ম্যাজেন্টา', code: '#E63970' }
  ]);
  const [variantEdits, setVariantEdits] = useState<Record<string, { sku: string; price: string; stock: string }>>({});

  // Image Gallery states
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [gallery, setGallery] = useState<string[]>([
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=60'
  ]);
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

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['COD', 'BKASH', 'NAGAD']);

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['ঈদ কালেকশন', 'বেস্ট সেলার']);

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

  // Auto-generate slug and SEO titles
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-') // Support bangla chars in replace if needed, or strip
        .replace(/[^a-z0-9]+/g, '-') // URL friendly alphanumeric slug
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
    setMetaTitle(val + (lang === 'bn' ? ' - সেরা দামে অনলাইন কিনুন' : ' - Buy Online at Best Price'));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  // Helper to resolve nice colors from typing
  const getColorHex = (colorName: string): string => {
    const lowercase = colorName.toLowerCase();
    if (lowercase.includes('navy') || lowercase.includes('নীল') || lowercase.includes('নেভি')) return '#1B2A4A';
    if (lowercase.includes('magenta') || lowercase.includes('ম্যাজেন্টা')) return '#E63970';
    if (lowercase.includes('red') || lowercase.includes('লাল')) return '#D3402F';
    if (lowercase.includes('green') || lowercase.includes('সবুজ')) return '#1B8A5A';
    if (lowercase.includes('black') || lowercase.includes('কালো')) return '#000000';
    if (lowercase.includes('white') || lowercase.includes('সাদা')) return '#FFFFFF';
    if (lowercase.includes('yellow') || lowercase.includes('হলুদ')) return '#D4A017';
    if (lowercase.includes('orange') || lowercase.includes('কমলা')) return '#F76B1C';
    // Generates a hash color from string
    let hash = 0;
    for (let i = 0; i < colorName.length; i++) {
      hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ((hash & 0x00FFFFFF).toString(16) + '000000').substring(0, 6);
    return color;
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

  // Dynamic variants matrix generation
  const getVariantsList = () => {
    const list = [];
    for (const c of colors) {
      for (const s of sizes) {
        const key = `${c.name}-${s}`;
        const defaultSku = `${sku ? sku : 'PROD'}-${c.name.substring(0, 3).toUpperCase()}-${s.toUpperCase()}`;
        const defaultPrice = price || '0';
        const defaultStock = '10';

        const edit = variantEdits[key] || {};

        list.push({
          key,
          color: c.name,
          colorCode: c.code,
          size: s,
          sku: edit.sku !== undefined ? edit.sku : defaultSku,
          price: edit.price !== undefined ? edit.price : defaultPrice,
          stock: edit.stock !== undefined ? edit.stock : defaultStock,
        });
      }
    }
    return list;
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
    // We can simulate removal by filtering or simply not showing it,
    // let's do soft exclusion by removing its combination size/color or custom handling.
    // For simplicity, we can let user delete it from edits or hide it
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
        setErrorMsg(lang === 'bn' ? 'সর্বোচ্চ ৮টি ছবি যোগ করা যাবে।' : 'Maximum of 8 images can be added.');
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
      setErrorMsg(lang === 'bn' ? 'সর্বোচ্চ ৮টি ছবি যোগ করা যাবে।' : 'Maximum of 8 images can be added.');
      return;
    }

    setErrorMsg('');
    setIsUploadingImage(true);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      setErrorMsg(
        lang === 'bn' 
          ? 'ImgBB API Key সেট করা নেই! অনুগ্রহ করে আপনার .env ফাইলে NEXT_PUBLIC_IMGBB_API_KEY যোগ করুন।' 
          : 'ImgBB API Key is not set. Please add NEXT_PUBLIC_IMGBB_API_KEY to your environment variables.'
      );
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
        setSuccessMsg(lang === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে!' : 'Image uploaded successfully to ImgBB!');
      } else {
        setErrorMsg(data.error?.message || 'ImgBB upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image to ImgBB:', err);
      setErrorMsg('An error occurred during image upload. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Payment methods toggle
  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter(m => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  // Potential Profit Calculator
  const regPriceNum = parseFloat(price) || 0;
  const discPriceNum = parseFloat(discountPrice) || 0;
  const costPriceNum = parseFloat(costPrice) || 0;
  const sellPrice = discPriceNum > 0 && discPriceNum < regPriceNum ? discPriceNum : regPriceNum;
  const potentialProfit = sellPrice - costPriceNum;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend Validations
    if (!name.trim()) {
      setErrorMsg(lang === 'bn' ? 'পণ্যের নাম আবশ্যক।' : 'Product Name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg(lang === 'bn' ? 'পণ্যের স্লাগ আবশ্যক।' : 'Product Slug is required.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg(lang === 'bn' ? 'SKU কোড আবশ্যক।' : 'SKU code is required.');
      return;
    }
    if (!categoryId) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে একটি ক্যাটাগরি বাছাই করুন।' : 'Please select a Category.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMsg(lang === 'bn' ? 'নিয়মিত মূল্য অবশ্যই ০ এর বেশি হতে হবে।' : 'Regular Price must be a valid number greater than 0.');
      return;
    }

    let numericDiscountPrice: number | null = null;
    if (discountPrice !== '') {
      numericDiscountPrice = parseFloat(discountPrice);
      if (isNaN(numericDiscountPrice) || numericDiscountPrice < 0) {
        setErrorMsg(lang === 'bn' ? 'ছাড়ের মূল্য ঋণাত্মক হতে পারে না।' : 'Discount Price cannot be negative.');
        return;
      }
      if (numericDiscountPrice >= numericPrice) {
        setErrorMsg(lang === 'bn' ? 'ছাড়ের মূল্য নিয়মিত মূল্য থেকে কম হতে হবে।' : 'Discount Price must be less than the regular price.');
        return;
      }
    }

    const numericStock = parseInt(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      setErrorMsg(lang === 'bn' ? 'মোট স্টক সংখ্যা সঠিক হতে হবে।' : 'Stock quantity must be a non-negative integer.');
      return;
    }

    setIsSubmitting(true);

    // Primary image is the first one in the gallery, or null
    const primaryImage = gallery.length > 0 ? gallery[0] : null;

    // We can save other metadata in description or submit standard payload
    const finalDescription = `
${description}

---
Brand: ${brand}
Short Description: ${shortDescription}
Sizes: ${sizes.join(', ')}
Colors: ${colors.map(c => c.name).join(', ')}
Tags: ${tags.join(', ')}
Weight: ${weight} kg
Dimensions: ${dimensions}
Shipping Inside: ৳${shippingInside}
Shipping Outside: ৳${shippingOutside}
Free Shipping: ${freeShipping ? 'Yes' : 'No'}
Payment Methods: ${paymentMethods.join(', ')}
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
        setSuccessMsg(lang === 'bn' ? 'পণ্যটি সফলভাবে সংরক্ষিত হয়েছে!' : 'Product added successfully!');
        
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
      setErrorMsg(lang === 'bn' ? 'সার্ভারের সাথে সংযোগ করতে ব্যর্থ হয়েছে।' : 'An error occurred while connecting to the server.');
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
    <div className="add-product-theme">
      {/* Scoped CSS styling based directly on the provided HTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        .add-product-theme {
          --ink: #1B2A4A;
          --ink-soft: #4A5578;
          --paper: #FFF8F0;
          --card: #FFFFFF;
          --line: #EDE2D3;
          --marigold: #F76B1C;
          --marigold-dark: #D9550E;
          --rickshaw-pink: #E63970;
          --gold: #D4A017;
          --green: #1B8A5A;
          --green-soft: #E7F6EE;
          --red: #D3402F;
          --red-soft: #FBEAE7;
          --field-bg: #FBF7F0;
          --shadow: 0 1px 2px rgba(27,42,74,.04), 0 8px 24px -12px rgba(27,42,74,.12);
          --radius: 14px;
          
          background: radial-gradient(1200px 500px at 100% -10%, rgba(247,107,28,.07), transparent 60%), var(--paper);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          padding-bottom: 120px;
        }

        .add-product-theme * {
          box-sizing: border-box;
        }

        .add-product-theme .bn {
          font-family: 'Hind Siliguri', 'Inter', sans-serif;
        }

        .add-product-theme .stripe {
          height: 6px;
          background: repeating-linear-gradient(90deg,
            var(--marigold) 0 40px,
            var(--rickshaw-pink) 40px 80px,
            var(--gold) 80px 120px,
            var(--ink) 120px 160px);
        }

        .add-product-theme header {
          background: var(--card);
          border-bottom: 1px solid var(--line);
          padding: 22px 32px 20px;
        }

        .add-product-theme .backlink {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-soft);
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 10px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
        }

        .add-product-theme .backlink:hover {
          color: var(--marigold-dark);
        }

        .add-product-theme .titlerow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .add-product-theme h1 {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -.01em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .add-product-theme h1 .taka {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--marigold), var(--rickshaw-pink));
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          font-family: 'Hind Siliguri', sans-serif;
          box-shadow: var(--shadow);
        }

        .add-product-theme .sub {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin: 4px 0 0 48px;
        }

        .add-product-theme .lang-toggle {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--field-bg);
          border: 1px solid var(--line);
          padding: 7px 12px;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          user-select: none;
        }

        .add-product-theme .wrap {
          max-width: 1180px;
          margin: 26px auto 0;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 22px;
        }

        @media (max-width: 920px) {
          .add-product-theme .wrap {
            grid-template-columns: 1fr;
            padding: 0 18px;
          }
          .add-product-theme header {
            padding: 18px;
          }
        }

        .add-product-theme .col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .add-product-theme .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .add-product-theme .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--line);
          background: linear-gradient(180deg, #FFFBF5, #FFFFFF);
        }

        .add-product-theme .card-head-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .add-product-theme .icon-badge {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #fff;
        }

        .add-product-theme .card-title {
          font-family: 'Hind Siliguri', sans-serif;
          font-weight: 600;
          font-size: 15.5px;
        }

        .add-product-theme .card-note {
          font-size: 11px;
          color: var(--ink-soft);
          background: var(--field-bg);
          padding: 3px 9px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid var(--line);
        }

        .add-product-theme .card-body {
          padding: 18px 20px 22px;
        }

        .add-product-theme label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .03em;
          color: var(--ink-soft);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .add-product-theme label .bn-label {
          text-transform: none;
          font-family: 'Hind Siliguri', sans-serif;
          font-weight: 600;
          color: var(--ink);
          font-size: 13px;
          display: block;
          letter-spacing: 0;
          margin-bottom: 2px;
        }

        .add-product-theme .field {
          margin-bottom: 16px;
        }

        .add-product-theme .row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .add-product-theme .row3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
        }

        .add-product-theme input[type=text],
        .add-product-theme input[type=number],
        .add-product-theme input[type=url],
        .add-product-theme textarea,
        .add-product-theme select {
          width: 100%;
          border: 1.5px solid var(--line);
          background: var(--field-bg);
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 13.5px;
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          transition: border-color .15s, box-shadow .15s;
          outline: none;
        }

        .add-product-theme textarea {
          resize: vertical;
          min-height: 90px;
          font-family: 'Hind Siliguri', 'Inter', sans-serif;
        }

        .add-product-theme input:focus,
        .add-product-theme textarea:focus,
        .add-product-theme select:focus {
          border-color: var(--marigold);
          box-shadow: 0 0 0 3px rgba(247,107,28,.14);
          background: #fff;
        }

        .add-product-theme input::placeholder,
        .add-product-theme textarea::placeholder {
          color: #B8AC98;
        }

        .add-product-theme .taka-input {
          position: relative;
        }

        .add-product-theme .taka-input span {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 700;
          color: var(--marigold-dark);
          font-family: 'Hind Siliguri', sans-serif;
        }

        .add-product-theme .taka-input input {
          padding-left: 30px;
        }

        .add-product-theme .hint {
          font-size: 11.5px;
          color: #A79C86;
          margin-top: 5px;
        }

        .add-product-theme .gal-add {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .add-product-theme .gal-add input {
          flex: 1;
        }

        .add-product-theme .btn-sm {
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
        }

        .add-product-theme .btn-sm:hover {
          background: #0f1a33;
        }

        .add-product-theme .gallery {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .add-product-theme .gal-slot {
          aspect-ratio: 1;
          border-radius: 10px;
          border: 1.5px dashed var(--line);
          background: var(--field-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #B8AC98;
          position: relative;
          overflow: hidden;
        }

        .add-product-theme .gal-slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .add-product-theme .gal-slot.filled {
          border-style: solid;
          border-color: var(--line);
        }

        .add-product-theme .gal-slot .main-tag {
          position: absolute;
          top: 5px;
          left: 5px;
          background: var(--marigold);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .add-product-theme .gal-slot .rm {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(27, 42, 74, .75);
          color: #fff;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
          line-height: 1;
        }

        .add-product-theme .chip-input {
          border: 1.5px solid var(--line);
          background: var(--field-bg);
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          min-height: 46px;
          align-items: center;
        }

        .add-product-theme .chip {
          background: #fff;
          border: 1.3px solid var(--marigold);
          color: var(--marigold-dark);
          font-size: 12.5px;
          font-weight: 600;
          padding: 5px 8px 5px 11px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .add-product-theme .chip.color-chip {
          border-color: var(--rickshaw-pink);
          color: var(--rickshaw-pink);
        }

        .add-product-theme .chip .x {
          cursor: pointer;
          opacity: .7;
          font-weight: 700;
        }

        .add-product-theme .chip .x:hover {
          opacity: 1;
        }

        .add-product-theme .chip-input input {
          border: none !important;
          background: transparent !important;
          flex: 1;
          min-width: 90px;
          padding: 6px 2px !important;
          font-size: 13px;
          outline: none;
          box-shadow: none !important;
        }

        .add-product-theme .variant-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          margin-top: 14px;
        }

        .add-product-theme .variant-table th {
          text-align: left;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: .03em;
          color: var(--ink-soft);
          padding: 8px 8px;
          border-bottom: 2px solid var(--line);
        }

        .add-product-theme .variant-table td {
          padding: 6px 8px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }

        .add-product-theme .variant-table input {
          padding: 7px 9px;
          font-size: 12.5px;
        }

        .add-product-theme .variant-swatch {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-family: 'Hind Siliguri', sans-serif;
        }

        .add-product-theme .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          border: 1px solid rgba(0,0,0,.15);
        }

        .add-product-theme .empty-variants {
          text-align: center;
          padding: 20px;
          color: #B8AC98;
          font-size: 12.5px;
          border: 1.5px dashed var(--line);
          border-radius: 10px;
          margin-top: 10px;
        }

        .add-product-theme .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid var(--line);
        }

        .add-product-theme .toggle-row:last-child {
          border-bottom: none;
        }

        .add-product-theme .toggle-text .bn-label {
          margin-bottom: 1px;
        }

        .add-product-theme .toggle-text .d {
          font-size: 11.5px;
          color: var(--ink-soft);
        }

        .add-product-theme .switch {
          width: 40px;
          height: 23px;
          background: var(--line);
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          flex: none;
          transition: background-color 0.15s ease;
        }

        .add-product-theme .switch.on {
          background: var(--marigold);
        }

        .add-product-theme .switch .knob {
          position: absolute;
          top: 2.5px;
          left: 2.5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: left .15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,.25);
        }

        .add-product-theme .switch.on .knob {
          left: 19.5px;
        }

        .add-product-theme .zone-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .add-product-theme .zone-row label.bn-label {
          margin: 0;
          min-width: 110px;
        }

        .add-product-theme .pay-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .add-product-theme .pay-opt {
          border: 1.5px solid var(--line);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          background: var(--field-bg);
          user-select: none;
        }

        .add-product-theme .pay-opt.active {
          border-color: var(--marigold);
          background: #FFF3E9;
        }

        .add-product-theme .pay-opt .box {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid var(--ink-soft);
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
        }

        .add-product-theme .pay-opt.active .box {
          background: var(--marigold);
          border-color: var(--marigold);
        }

        .add-product-theme .pay-opt .label-txt {
          font-size: 13px;
          font-weight: 600;
          font-family: 'Hind Siliguri', sans-serif;
        }

        .add-product-theme .pay-opt .badge {
          font-size: 9.5px;
          background: var(--green-soft);
          color: var(--green);
          padding: 1px 6px;
          border-radius: 8px;
          font-weight: 700;
          margin-left: auto;
        }

        .add-product-theme select {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' stroke='%234A5578' stroke-width='1.6' fill='none' stroke-linecap='round'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .add-product-theme .profit-box {
          margin-top: 14px;
          background: var(--green-soft);
          border: 1px solid #CDE9D8;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .add-product-theme .profit-box .l {
          font-size: 12px;
          color: var(--green);
          font-weight: 700;
          font-family: 'Hind Siliguri', sans-serif;
        }

        .add-product-theme .profit-box .v {
          font-size: 17px;
          font-weight: 800;
          color: var(--green);
          font-family: 'Inter', sans-serif;
        }

        .add-product-theme .seo-preview {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px 14px;
          background: var(--field-bg);
          word-break: break-word;
        }

        .add-product-theme .seo-preview .u {
          font-size: 11.5px;
          color: var(--green);
          margin-bottom: 3px;
        }

        .add-product-theme .seo-preview .t {
          font-size: 14.5px;
          color: #1a0dab;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .add-product-theme .seo-preview .d {
          font-size: 12px;
          color: var(--ink-soft);
          line-height: 1.4;
        }

        .add-product-theme .footer-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: var(--card);
          border-top: 1px solid var(--line);
          padding: 16px 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          align-items: center;
          box-shadow: 0 -8px 24px -12px rgba(27,42,74,.12);
        }

        .add-product-theme .status-pill {
          margin-right: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--ink-soft);
        }

        .add-product-theme .status-pill .dot2 {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
        }

        .add-product-theme .btn-ghost {
          background: transparent;
          border: 1.5px solid var(--line);
          color: var(--ink);
          padding: 11px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .add-product-theme .btn-ghost:hover {
          background: var(--field-bg);
        }

        .add-product-theme .btn-primary {
          background: linear-gradient(135deg, var(--marigold), var(--rickshaw-pink));
          color: #fff;
          border: none;
          padding: 11px 24px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 6px 16px -4px rgba(247,107,28,.5);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Hind Siliguri', sans-serif;
          transition: filter 0.15s;
        }

        .add-product-theme .btn-primary:hover {
          filter: brightness(1.04);
        }
        
        .add-product-theme .btn-primary:disabled {
          filter: grayscale(0.5);
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}} />

      <div className="stripe"></div>
      <header>
        <button className="backlink" onClick={onCancel ? onCancel : () => router.push('/admin/products')}>
          {lang === 'bn' ? '← পণ্য তালিকায় ফিরে যান' : '← Back to Product Inventory'}
        </button>
        <div className="titlerow">
          <div>
            <h1>
              <span className="taka">৳</span> 
              <span className="bn">{lang === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}</span>
            </h1>
            <div className="sub">
              {lang === 'bn' 
                ? 'যেকোনো ক্যাটাগরির জন্য ইউনিভার্সাল প্রোডাক্ট লিস্টিং তৈরি করুন' 
                : 'Create a universal product catalog listing across any category'}
            </div>
          </div>
          <div className="lang-toggle" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}>
            {lang === 'bn' ? 'বাং / EN 🇧🇩' : 'EN / বাং 🇧🇩'}
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-[1180px] mx-auto px-8 mt-6">
        {successMsg && (
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-sm font-semibold text-green-800 animate-fadeIn">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-800 animate-fadeIn">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      <div className="wrap">
        {/* LEFT COLUMN */}
        <div className="col">

          {/* General Info */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--marigold)' }}>📦</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'সাধারণ তথ্য' : 'General Info'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — General Info</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</span>
                  Product Name
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder={lang === 'bn' ? 'যেমনঃ প্রিমিয়াম কটন পাঞ্জাবি' : 'e.g. Premium Cotton Polo Shirt'}
                />
              </div>
              <div className="row2">
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'ব্র্যান্ড' : 'Brand'}</span>
                    Brand
                  </label>
                  <input 
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমনঃ Aarong, Yellow, Ecstasy' : 'e.g. Aarong, Yellow'}
                  />
                </div>
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'স্লাগ (URL)' : 'Slug'}</span>
                    Slug
                  </label>
                  <input 
                    type="text"
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="premium-cotton-panjabi" 
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px' }}
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'বিবরণ' : 'Description'}</span>
                  Description
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (!metaDescription) setMetaDescription(e.target.value.substring(0, 150));
                  }}
                  placeholder={lang === 'bn' ? 'পণ্যের বিস্তারিত, উপাদান, ব্যবহারবিধি লিখুন... (কাপড়ঃ কটন, ওয়াশ ইন্সট্রাকশনঃ ঠান্ডা পানিতে ধুবেন)' : 'Describe your product details, materials, care instructions...'}
                ></textarea>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ (কার্ডে দেখাবে)' : 'Short Description'}</span>
                  Short Description
                </label>
                <input 
                  type="text" 
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder={lang === 'bn' ? 'প্রোডাক্ট কার্ডে দেখানোর জন্য এক লাইনে লিখুন' : 'Write a short description to display on cards'}
                />
              </div>
            </div>
          </div>

          {/* Media & Image */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--rickshaw-pink)' }}>🖼️</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'মিডিয়া ও ছবি' : 'Media & Images'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Media & Images</span>
                </div>
              </div>
              <div className="card-note">{lang === 'bn' ? 'সর্বোচ্চ ৮টি' : 'Max 8'}</div>
            </div>
            <div className="card-body">
              <form className="gal-add" onSubmit={handleAddGalleryUrl}>
                <input 
                  type="url" 
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন https://images.unsplash.com/... অথবা ছবির লিংক' : 'e.g. https://images.unsplash.com/... or image link'}
                />
                <button type="submit" className="btn-sm">{lang === 'bn' ? '+ যোগ করুন' : '+ Add Url'}</button>
              </form>
              <div className="gallery">
                {gallery.map((imgUrl, idx) => (
                  <div key={idx} className="gal-slot filled">
                    <img src={imgUrl} alt="preview" onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300';
                    }}/>
                    {idx === 0 && <span className="main-tag">{lang === 'bn' ? 'প্রধান' : 'Main'}</span>}
                    <span className="rm" onClick={() => handleRemoveGalleryImage(idx)}>✕</span>
                  </div>
                ))}
                {gallery.length < 8 && (
                  <label className="gal-slot cursor-pointer">
                    {isUploadingImage ? (
                      <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
                    ) : (
                      <>
                        <span className="font-semibold text-xs text-zinc-500">{lang === 'bn' ? '+ ছবি আপলোড' : '+ Upload'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </>
                    )}
                  </label>
                )}
              </div>
              <div className="hint">
                {lang === 'bn' 
                  ? 'প্রথম ছবিটি স্বয়ংক্রিয়ভাবে "প্রধান ছবি (Main Image)" হিসেবে সেট হবে — গ্রাহকরা এটি লিস্টিং-এ প্রথমে দেখবে।' 
                  : 'The first image is automatically set as the "Main Image" — customers will see this first in listings.'}
              </div>
            </div>
          </div>

          {/* Options & Variants */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--ink)' }}>🎛️</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'সাইজ, রঙ ও ভ্যারিয়েন্ট' : 'Options & Variants'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Options & Variants</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row2">
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'সাইজ' : 'Sizes'}</span>
                    Sizes
                  </label>
                  <div className="chip-input">
                    {sizes.map((s, idx) => (
                      <span key={idx} className="chip">
                        {s} <span className="x" onClick={() => handleRemoveSize(s)}>✕</span>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={handleAddSize}
                      placeholder={lang === 'bn' ? 'সাইজ লিখে Enter চাপুন' : 'Type size and press Enter'}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'রঙ' : 'Colors'}</span>
                    Colors
                  </label>
                  <div className="chip-input">
                    {colors.map((c, idx) => (
                      <span key={idx} className="chip color-chip">
                        <span className="dot" style={{ background: c.code }}></span>
                        {c.name} 
                        <span className="x" onClick={() => handleRemoveColor(c.name)}>✕</span>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={handleAddColor}
                      placeholder={lang === 'bn' ? 'রঙ লিখে Enter চাপুন' : 'Type color and press Enter'}
                    />
                  </div>
                </div>
              </div>

              <label style={{ marginTop: '4px' }}>
                <span className="bn-label">{lang === 'bn' ? 'ভ্যারিয়েন্ট প্রাইস ও স্টক' : 'Variant Matrix (per size+color)'}</span>
                Variant Matrix (per size+color)
              </label>

              {getVariantsList().length > 0 ? (
                <table className="variant-table">
                  <thead>
                    <tr>
                      <th>{lang === 'bn' ? 'ভ্যারিয়েন্ট' : 'Variant'}</th>
                      <th>SKU</th>
                      <th>{lang === 'bn' ? 'মূল্য (৳)' : 'Price ($)'}</th>
                      <th>{lang === 'bn' ? 'স্টক' : 'Stock'}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getVariantsList().map((v) => {
                      if (v.sku === 'EXCLUDED') return null;
                      return (
                        <tr key={v.key}>
                          <td className="variant-swatch">
                            <span className="dot" style={{ background: v.colorCode }}></span>
                            {v.color} / {v.size}
                          </td>
                          <td>
                            <input 
                              type="text" 
                              value={v.sku} 
                              onChange={(e) => handleVariantChange(v.key, 'sku', e.target.value)}
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              value={v.price} 
                              onChange={(e) => handleVariantChange(v.key, 'price', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              value={v.stock} 
                              onChange={(e) => handleVariantChange(v.key, 'stock', e.target.value)}
                            />
                          </td>
                          <td>
                            <span 
                              className="chip" 
                              style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)', cursor: 'pointer', padding: '2px 6px' }}
                              onClick={() => handleRemoveVariant(v.key)}
                            >
                              ✕
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-variants">
                  {lang === 'bn' ? 'কোনো সাইজ বা রঙ যোগ করা হয়নি।' : 'No sizes or colors added yet.'}
                </div>
              )}
              
              <div className="hint">
                {lang === 'bn' 
                  ? 'সাইজ ও রঙের প্রতিটি সংমিশ্রণের জন্য আলাদা SKU, দাম ও স্টক এখানে সেট করুন।' 
                  : 'Set unique SKU, price, and stock for each combination of size and color.'}
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--gold)' }}>🔍</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'সার্চ ইঞ্জিন অপ্টিমাইজেশন' : 'SEO'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — SEO</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'মেটা টাইটেল' : 'Meta Title'}</span>
                  Meta Title
                </label>
                <input 
                  type="text" 
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={lang === 'bn' ? 'প্রিমিয়াম কটন পাঞ্জাবি - সেরা দামে অনলাইন কিনুন' : 'Premium Panjabi - Buy Online'}
                />
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'মেটা বিবরণ' : 'Meta Description'}</span>
                  Meta Description
                </label>
                <textarea 
                  style={{ minHeight: '60px' }} 
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={lang === 'bn' ? 'খাঁটি কটন কাপড়ে তৈরি আরামদায়ক পাঞ্জাবি, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি পাবেন।' : 'Comfortable product made with premium materials.'}
                ></textarea>
              </div>
              <div className="seo-preview">
                <div className="u">yourstore.com.bd › products › {slug || 'product-slug'}</div>
                <div className="t">{metaTitle || (lang === 'bn' ? 'পণ্যের মেটা টাইটেল' : 'Product Meta Title')}</div>
                <div className="d">{metaDescription || (lang === 'bn' ? 'পণ্যের বিবরণ এখানে সার্চ রেজাল্টে দেখাবে।' : 'Product search description goes here.')}</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="col">

          {/* Pricing */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--green)' }}>৳</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'মূল্য' : 'Pricing'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Pricing</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'নিয়মিত মূল্য' : 'Regular Price'}</span>
                  Regular Price
                </label>
                <div className="taka-input">
                  <span>৳</span>
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1290"
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'ছাড়ের মূল্য (ঐচ্ছিক)' : 'Discount Price (Optional)'}</span>
                  Discount Price
                </label>
                <div className="taka-input">
                  <span>৳</span>
                  <input 
                    type="number" 
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="e.g. 1090"
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'ক্রয় মূল্য (কস্ট প্রাইস)' : 'Cost Price'}</span>
                  Cost Price
                </label>
                <div className="taka-input">
                  <span>৳</span>
                  <input 
                    type="number" 
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="e.g. 650"
                  />
                </div>
              </div>
              <div className="profit-box">
                <span className="l bn">{lang === 'bn' ? 'সম্ভাব্য লাভ (প্রতি ইউনিট)' : 'Potential Profit (per unit)'}</span>
                <span className="v">৳ {potentialProfit > 0 ? potentialProfit : 0}</span>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--ink)' }}>📊</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'ইনভেন্টরি ও SKU' : 'Inventory'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Inventory</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row2">
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'মোট স্টক' : 'Stock Qty'}</span>
                    Stock Qty
                  </label>
                  <input 
                    type="number" 
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'লো-স্টক এলার্ট' : 'Low Stock'}</span>
                    Low Stock Alert
                  </label>
                  <input 
                    type="number" 
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                  />
                </div>
              </div>
              <div className="field" style={{ marginBottom: '14px' }}>
                <label>
                  <span className="bn-label">SKU</span>
                  Stock Keeping Unit
                </label>
                <input 
                  type="text" 
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PJB-COTTON-M"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-text">
                  <div className="bn-label">{lang === 'bn' ? 'প্রি-অর্ডার/ব্যাকঅর্ডার চালু' : 'Allow Backorders'}</div>
                  <div className="d">{lang === 'bn' ? 'স্টক শেষ হলেও অর্ডার গ্রহণ করুন' : 'Allow orders when out of stock'}</div>
                </div>
                <div className={`switch ${preOrder ? 'on' : ''}`} onClick={() => setPreOrder(!preOrder)}>
                  <div className="knob"></div>
                </div>
              </div>
              <div className="toggle-row">
                <div className="toggle-text">
                  <div className="bn-label">{lang === 'bn' ? 'স্টক ট্র্যাকিং' : 'Track Inventory'}</div>
                  <div className="d">{lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে স্টক হিসাব করুন' : 'Track inventory automatically'}</div>
                </div>
                <div className={`switch ${trackInventory ? 'on' : ''}`} onClick={() => setTrackInventory(!trackInventory)}>
                  <div className="knob"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--marigold-dark)' }}>🚚</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'ডেলিভারি ও শিপিং' : 'Shipping'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Shipping</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row2">
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}</span>
                    Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>
                    <span className="bn-label">{lang === 'bn' ? 'প্যাকেজ সাইজ (সেমি)' : 'Dimensions (cm)'}</span>
                    Dimensions (cm)
                  </label>
                  <input 
                    type="text" 
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="L × W × H"
                  />
                </div>
              </div>
              <label style={{ marginTop: '2px' }}>
                <span className="bn-label">{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge by Zone'}</span>
                Delivery Charge by Zone
              </label>
              <div className="field">
                <div className="zone-row" style={{ marginBottom: '9px' }}>
                  <label className="bn-label">{lang === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}</label>
                  <div className="taka-input" style={{ flex: 1 }}>
                    <span>৳</span>
                    <input 
                      type="number" 
                      value={shippingInside}
                      onChange={(e) => setShippingInside(e.target.value)}
                    />
                  </div>
                </div>
                <div className="zone-row">
                  <label className="bn-label">{lang === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</label>
                  <div className="taka-input" style={{ flex: 1 }}>
                    <span>৳</span>
                    <input 
                      type="number" 
                      value={shippingOutside}
                      onChange={(e) => setShippingOutside(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="toggle-row" style={{ marginTop: '4px' }}>
                <div className="toggle-text">
                  <div className="bn-label">{lang === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Shipping'}</div>
                  <div className="d">{lang === 'bn' ? 'এই পণ্যের জন্য ডেলিভারি ফ্রি' : 'Free shipping on this product'}</div>
                </div>
                <div className={`switch ${freeShipping ? 'on' : ''}`} onClick={() => setFreeShipping(!freeShipping)}>
                  <div className="knob"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--rickshaw-pink)' }}>💳</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Payment</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="pay-grid">
                <div className={`pay-opt ${paymentMethods.includes('COD') ? 'active' : ''}`} onClick={() => togglePaymentMethod('COD')}>
                  <div className="box">{paymentMethods.includes('COD') ? '✓' : ''}</div>
                  <span className="label-txt">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                  <span className="badge">COD</span>
                </div>
                <div className={`pay-opt ${paymentMethods.includes('BKASH') ? 'active' : ''}`} onClick={() => togglePaymentMethod('BKASH')}>
                  <div className="box">{paymentMethods.includes('BKASH') ? '✓' : ''}</div>
                  <span className="label-txt">{lang === 'bn' ? 'বিকাশ' : 'bKash'}</span>
                </div>
                <div className={`pay-opt ${paymentMethods.includes('NAGAD') ? 'active' : ''}`} onClick={() => togglePaymentMethod('NAGAD')}>
                  <div className="box">{paymentMethods.includes('NAGAD') ? '✓' : ''}</div>
                  <span className="label-txt">{lang === 'bn' ? 'নগদ' : 'Nagad'}</span>
                </div>
                <div className={`pay-opt ${paymentMethods.includes('CARD') ? 'active' : ''}`} onClick={() => togglePaymentMethod('CARD')}>
                  <div className="box">{paymentMethods.includes('CARD') ? '✓' : ''}</div>
                  <span className="label-txt">{lang === 'bn' ? 'কার্ড / ব্যাংক' : 'Card / Bank'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="icon-badge" style={{ background: 'var(--gold)' }}>🏷️</div>
                <div className="card-title bn">
                  {lang === 'bn' ? 'অর্গানাইজেশন' : 'Organization'} 
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> — Organization</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</span>
                  Category
                </label>
                {loadingCategories ? (
                  <div className="hint animate-pulse">{lang === 'bn' ? 'ক্যাটাগরি লোড হচ্ছে...' : 'Loading categories...'}</div>
                ) : (
                  <select 
                    required 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">{lang === 'bn' ? 'ক্যাটাগরি বাছাই করুন' : 'Select Category'}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'সাব-ক্যাটাগরি' : 'Sub-category'}</span>
                  Sub-category
                </label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                  <option value="">{lang === 'bn' ? 'সাব-ক্যাটাগরি বাছাই করুন' : 'Select Sub-category'}</option>
                  <option value="panjabi">{lang === 'bn' ? 'পাঞ্জাবি' : 'Panjabi'}</option>
                  <option value="sari">{lang === 'bn' ? 'শাড়ি' : 'Sari'}</option>
                  <option value="three-piece">{lang === 'bn' ? 'থ্রি-পিস' : 'Three Piece'}</option>
                </select>
              </div>
              <div className="field">
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'ট্যাগ' : 'Tags'}</span>
                  Tags
                </label>
                <div className="chip-input">
                  {tags.map((t, idx) => (
                    <span key={idx} className="chip">
                      {t} <span className="x" onClick={() => handleRemoveTag(t)}>✕</span>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={lang === 'bn' ? 'ট্যাগ লিখে Enter চাপুন' : 'Type tag and press Enter'}
                  />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>
                  <span className="bn-label">{lang === 'bn' ? 'পণ্যের অবস্থা' : 'Product Status'}</span>
                  Product Status
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ACTIVE">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="INACTIVE">{lang === 'bn' ? 'খসড়া (Draft/Inactive)' : 'Draft/Inactive'}</option>
                  <option value="OUT_OF_STOCK">{lang === 'bn' ? 'স্টক আউট (Out of Stock)' : 'Out of Stock'}</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bar animate-slideUp">
        <div className="status-pill">
          <span className="dot2"></span> 
          {lang === 'bn' 
            ? 'খসড়া হিসেবে সংরক্ষিত হয়েছে · Draft saved' 
            : 'Saved as draft'}
        </div>
        <button className="btn-ghost bn" type="button" onClick={onCancel ? onCancel : () => router.push('/admin/products')}>
          {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
        </button>
        <button 
          className="btn-primary bn" 
          type="button" 
          disabled={isSubmitting || isUploadingImage} 
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>{lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <span>✓ {lang === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
