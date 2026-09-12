'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { API_URL } from '../../../config';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Trash2, 
  ChevronRight, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Share2,
  Sparkles
} from 'lucide-react';
import { formatPrice } from '../../../utils/format';
import { getOptimizedImageUrl } from '../../../utils/image';
import ProductImageZoom from '../../../components/ProductImageZoom';
import SizeGuideModal from '../../../components/SizeGuideModal';

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
  olive: 'bg-[#808000] border-[#808000]',
  maroon: 'bg-[#800000] border-[#800000]',
  pink: 'bg-pink-300 border-pink-400',
  purple: 'bg-purple-600 border-purple-600',
  teal: 'bg-teal-600 border-teal-600'
};

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const { user, token } = useAuth();
  const { addToCart, addToWishlist, isInWishlist, openCartDrawer } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Accordion open/close states
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  // Selector states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Notification toast for actions
  const [copiedLink, setCopiedLink] = useState(false);

  // Extract genuine uploaded images without duplicates
  const extractGalleryImages = (prod: any): string[] => {
    if (!prod) return [];
    const images: string[] = [];

    // 1. Primary image
    if (prod.image && typeof prod.image === 'string' && prod.image.trim()) {
      images.push(prod.image.trim());
    }

    // 2. Secondary image
    if (prod.image2 && typeof prod.image2 === 'string' && prod.image2.trim() && !images.includes(prod.image2.trim())) {
      images.push(prod.image2.trim());
    }

    // 3. Check prod.images array
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      prod.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim() && !images.includes(img.trim())) {
          images.push(img.trim());
        }
      });
    }

    // 4. Check serialized Images: in description
    if (images.length === 0 && prod.description) {
      const match = prod.description.match(/Images:\s*([^\n\r]+)/i);
      if (match && match[1]) {
        match[1].split(',').forEach((url: string) => {
          const trimmed = url.trim();
          if (trimmed && !images.includes(trimmed)) {
            images.push(trimmed);
          }
        });
      }
    }

    return images;
  };

  // Helper to parse description metadata
  const parseProductMetadata = (desc: string | null) => {
    if (!desc) return { cleanDesc: '', brand: '', sizes: [], colors: [], fabric: '', care: '' };
    const parts = desc.split('---');
    const cleanDesc = parts[0]?.trim() || '';
    
    let brand = '';
    let sizes: string[] = [];
    let colors: string[] = [];
    let fabric = '';
    let care = '';

    if (parts.length > 1) {
      const meta = parts[1];
      const brandMatch = meta.match(/Brand:\s*([^\n\r]+)/i);
      if (brandMatch && brandMatch[1]) brand = brandMatch[1].trim();

      const sizesMatch = meta.match(/Sizes:\s*([^\n\r]+)/i);
      if (sizesMatch && sizesMatch[1]) {
        sizes = sizesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      }

      const colorsMatch = meta.match(/Colors:\s*([^\n\r]+)/i);
      if (colorsMatch && colorsMatch[1]) {
        colors = colorsMatch[1].split(',').map(c => c.trim()).filter(Boolean);
      }

      const fabricMatch = meta.match(/Fabric:\s*([^\n\r]+)/i);
      if (fabricMatch && fabricMatch[1]) fabric = fabricMatch[1].trim();

      const careMatch = meta.match(/Care:\s*([^\n\r]+)/i);
      if (careMatch && careMatch[1]) care = careMatch[1].trim();
    }

    return { cleanDesc, brand, sizes, colors, fabric, care };
  };

  const fetchProductDetails = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/products/${productId}`);
      const reviewsRes = await fetch(`${API_URL}/reviews/product/${productId}`);
      const prodData = await prodRes.json();
      const reviewsData = await reviewsRes.json();

      if (prodData.success) {
        setProduct(prodData.data);
        const imgs = extractGalleryImages(prodData.data);
        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        } else if (prodData.data.image) {
          setSelectedImage(prodData.data.image);
        }

        // Real-time Analytics: Track product page view
        try {
          const sessionId = typeof window !== 'undefined' ? localStorage.getItem('onwear_visitor_session') : '';
          fetch(`${API_URL}/analytics/track-view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: prodData.data.id, sessionId })
          }).catch(() => {});
        } catch {}

        // Fetch Related Products from same category
        fetchRelatedProducts(prodData.data);
      }
      if (reviewsData.success) setReviews(reviewsData.data);
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentProd: any) => {
    try {
      setRelatedLoading(true);
      const categoryParam = currentProd.category?.slug || currentProd.categoryId;
      if (!categoryParam) return;

      const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(categoryParam)}&limit=10`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter out current product
        const filtered = data.data.filter((p: any) => p.id !== currentProd.id).slice(0, 8);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!token) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment, productId })
      });
      const data = await res.json();
      if (data.success) {
        setComment('');
        setRating(5);
        fetchProductDetails();
      } else {
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Error adding review:', err);
      setReviewError('Failed to submit review. Try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchProductDetails();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, quantity, selectedSize, selectedColor, product);
    if (res.success) {
      openCartDrawer();
    }
  };

  const handleBuyNow = async () => {
    const res = await addToCart(product.id, quantity, selectedSize, selectedColor, product);
    if (res.success) {
      router.push('/checkout');
    }
  };

  const handleClearSelection = () => {
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-24 flex justify-center items-center font-['Poppins',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">Loading Product...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 py-24 text-center font-['Poppins',sans-serif]">
        <h2 className="text-xl font-medium tracking-wide text-zinc-900 uppercase">Product Not Found</h2>
        <p className="mt-2 text-xs text-zinc-500 tracking-wide">The product you are looking for might have been moved or removed.</p>
        <Link href="/products" className="mt-6 inline-block rounded-none bg-zinc-950 px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-zinc-800 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const isSoldOut = product.stock === 0;
  const discount = product.discountPrice !== null && product.discountPrice !== undefined;
  const currentPrice = discount ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const discountPercent = discount && originalPrice > 0 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const hasReviewed = user && reviews.some((r) => r.userId === user.id);

  // Extract gallery images
  const galleryImages = extractGalleryImages(product);
  const displayImage = selectedImage || (galleryImages.length > 0 ? galleryImages[0] : (product.image || '/placeholder.svg'));

  const meta = parseProductMetadata(product.description);
  const availableColors = meta.colors.length > 0 ? meta.colors : ['Black', 'White', 'Beige', 'Navy'];
  const availableSizes = meta.sizes.length > 0 ? meta.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="bg-white min-h-screen text-[#232323] font-['Poppins',sans-serif] tracking-[0.02em] selection:bg-zinc-950 selection:text-white">
      
      {/* 1. BREADCRUMBS ROW (Yellow Minimalist Style) */}
      <div className="border-b border-[#e6e6e6] bg-[#fafafa]">
        <div className="w-full px-4 py-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <nav className="flex items-center gap-2 text-[11px] font-medium tracking-[0.05em] uppercase text-[#969696] overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-black transition-colors shrink-0">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
            <Link href="/products" className="hover:text-black transition-colors shrink-0">Shop</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
                <Link 
                  href={`/products?category=${product.category.slug || product.category.id}`} 
                  className="hover:text-black transition-colors shrink-0"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="text-[#232323] truncate font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. MAIN PRODUCT DETAILS SECTION */}
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          
          {/* LEFT SIDE: PRODUCT GALLERY (Yellow Clean Image Display) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnail Rail (Desktop) / Horizontal Rail (Mobile) */}
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[560px] no-scrollbar shrink-0 sm:w-20">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = selectedImage === imgUrl || (!selectedImage && idx === 0);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative aspect-[3/4] w-16 sm:w-full shrink-0 overflow-hidden bg-zinc-50 border transition-all cursor-pointer ${
                        isActive
                          ? 'border-black ring-1 ring-black' 
                          : 'border-[#e6e6e6] opacity-75 hover:opacity-100 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={getOptimizedImageUrl(imgUrl, 160)}
                        alt={`${product.name} thumb ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Stage Image Zoom */}
            <div className="relative flex-1 bg-zinc-50 border border-[#e6e6e6] overflow-hidden">
              {/* Product Badges */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                {isSoldOut ? (
                  <span className="bg-[#232323] text-white text-[10px] font-medium tracking-[0.08em] uppercase px-2.5 py-1">
                    Sold Out
                  </span>
                ) : discount ? (
                  <span className="bg-[#e95144] text-white text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1">
                    -{discountPercent}% OFF
                  </span>
                ) : (
                  <span className="bg-[#232323] text-white text-[10px] font-medium tracking-[0.08em] uppercase px-2.5 py-1">
                    New
                  </span>
                )}
              </div>

              {/* Wishlist Icon in top right of image */}
              <button
                type="button"
                onClick={() => addToWishlist(product.id, product)}
                className={`absolute top-3 right-3 z-20 h-9 w-9 bg-white/90 backdrop-blur-xs border border-[#e6e6e6] rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-xs ${
                  isWished ? 'text-red-500 border-red-200' : 'text-[#727272] hover:text-red-500'
                }`}
                title="Add to Wishlist"
              >
                <Heart className="h-4 w-4" fill={isWished ? 'currentColor' : 'none'} />
              </button>

              <ProductImageZoom
                src={displayImage}
                alt={product.name}
              />
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCT DETAILS & BUY BOX (Yellow Typography & Style) */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:pl-2">
            
            {/* Brand / Category Subtitle */}
            {product.category && (
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#969696]">
                {meta.brand || product.category.name}
              </span>
            )}

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-semibold tracking-[0.03em] uppercase text-[#232323] leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Review Count */}
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    fill={i < Math.round(Number(averageRating || 5)) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-[#727272] tracking-[0.02em]">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
              <span className="text-zinc-300">|</span>
              <a href="#customer-reviews" className="text-[11px] font-medium underline text-[#232323] hover:text-zinc-600 uppercase tracking-wider">
                Write a Review
              </a>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1 border-b border-[#e6e6e6] pb-4">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232323]">
                {formatPrice(currentPrice)}
              </span>
              {discount && (
                <>
                  <span className="text-sm sm:text-base font-normal text-[#969696] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#e95144] tracking-wider uppercase">
                    Save {formatPrice(originalPrice - currentPrice)} ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>

            {/* Stock & SKU Meta Row */}
            <div className="flex items-center justify-between text-[11px] tracking-[0.04em] text-[#727272] py-1 border-b border-[#e6e6e6]">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase text-[#232323]">SKU:</span>
                <span className="font-mono text-[#232323] font-medium">{product.sku}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase text-[#232323]">Availability:</span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-[#e95144]'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} items)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* VARIANT SELECTORS (Color & Size) */}
            <div className="flex flex-col gap-4 pt-1">
              
              {/* Color Swatches */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#232323]">
                    Color: <span className="font-normal text-[#727272] capitalize">{selectedColor || availableColors[0] || 'Default'}</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color, idx) => {
                    const isSelected = selectedColor.toLowerCase() === color.toLowerCase() || (!selectedColor && idx === 0);
                    const swatchBg = COLOR_MAP[color.toLowerCase()] || 'bg-zinc-200 border-zinc-300';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`group relative h-7 w-7 rounded-full transition-all cursor-pointer flex items-center justify-center p-0.5 border ${
                          isSelected ? 'ring-2 ring-black ring-offset-2 border-black' : 'border-zinc-300 hover:border-black'
                        }`}
                      >
                        <span className={`h-full w-full rounded-full ${swatchBg}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selectors (Yellow Minimalist Rectangular Pills) */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#232323]">
                    Size: <span className="font-normal text-[#727272]">{selectedSize || 'Select Size'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] font-medium text-[#232323] hover:underline flex items-center gap-1 uppercase tracking-[0.04em] cursor-pointer"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz, idx) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(isSelected ? '' : sz)}
                        className={`min-w-[48px] h-10 px-3 text-xs font-semibold uppercase tracking-[0.05em] transition-all cursor-pointer border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#232323] text-white border-[#232323]'
                            : 'bg-white text-[#232323] border-[#e6e6e6] hover:border-[#232323]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-2">
                <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#232323]">Quantity:</label>
                <div className="flex items-center border border-[#e6e6e6] h-10 w-32 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-[#232323] hover:bg-zinc-100 font-bold transition-colors cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-bold text-[#232323]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-full flex items-center justify-center text-[#232323] hover:bg-zinc-100 font-bold transition-colors cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {(selectedColor || selectedSize || quantity > 1) && (
                  <button 
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[10px] font-medium text-[#969696] hover:text-[#232323] underline uppercase tracking-wider cursor-pointer ml-auto"
                  >
                    Clear Choice
                  </button>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS (Yellow High-Contrast Row) */}
            <div className="flex flex-col gap-3 pt-3">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="w-full bg-[#232323] text-white py-3.5 px-6 text-xs font-semibold tracking-[0.08em] uppercase hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              {/* Buy Now Button (Instant Checkout) */}
              {!isSoldOut && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full bg-white text-[#232323] border border-[#232323] py-3.5 px-6 text-xs font-semibold tracking-[0.08em] uppercase hover:bg-[#232323] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Buy It Now</span>
                </button>
              )}
            </div>

            {/* VALUE PROPOSITIONS & TRUST (Yellow Clean Badges) */}
            <div className="grid grid-cols-3 gap-2 border-y border-[#e6e6e6] py-4 mt-2 text-[10px] tracking-[0.02em] text-[#727272]">
              <div className="flex flex-col items-center text-center gap-1.5 px-1">
                <Truck className="h-4 w-4 text-[#232323]" />
                <span className="font-medium">Fast Shipping in BD</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 px-1 border-x border-[#e6e6e6]">
                <ShieldCheck className="h-4 w-4 text-[#232323]" />
                <span className="font-medium">100% Authentic Quality</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 px-1">
                <RotateCcw className="h-4 w-4 text-[#232323]" />
                <span className="font-medium">Easy 7-Day Exchange</span>
              </div>
            </div>

            {/* COLLAPSIBLE ACCORDIONS (Yellow Clothing Product Tabs) */}
            <div className="flex flex-col border-b border-[#e6e6e6]">
              
              {/* Tab 1: Product Details */}
              <div className="border-t border-[#e6e6e6]">
                <button
                  type="button"
                  onClick={() => toggleAccordion('desc')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs font-semibold tracking-[0.06em] uppercase text-[#232323] hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <span>Product Details & Specifications</span>
                  {openAccordion === 'desc' ? <ChevronUp className="h-4 w-4 text-[#727272]" /> : <ChevronDown className="h-4 w-4 text-[#727272]" />}
                </button>
                {openAccordion === 'desc' && (
                  <div className="pb-4 text-xs text-[#727272] leading-relaxed flex flex-col gap-2.5">
                    <p>{meta.cleanDesc || product.description || 'Crafted with premium selected textiles designed for maximum comfort, durability, and standard modern fitting.'}</p>
                    <ul className="list-disc list-inside flex flex-col gap-1 text-[11px] text-[#555]">
                      {meta.brand && <li><strong className="text-[#232323]">Brand:</strong> {meta.brand}</li>}
                      <li><strong className="text-[#232323]">Category:</strong> {product.category?.name || 'Apparel'}</li>
                      <li><strong className="text-[#232323]">Fit:</strong> Regular Comfort Standard Fit</li>
                      <li><strong className="text-[#232323]">Country of Origin:</strong> Bangladesh</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Tab 2: Material & Wash Care */}
              <div className="border-t border-[#e6e6e6]">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs font-semibold tracking-[0.06em] uppercase text-[#232323] hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <span>Material & Wash Care</span>
                  {openAccordion === 'care' ? <ChevronUp className="h-4 w-4 text-[#727272]" /> : <ChevronDown className="h-4 w-4 text-[#727272]" />}
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-4 text-xs text-[#727272] leading-relaxed flex flex-col gap-2">
                    <p>{meta.fabric || '100% Premium Combed Cotton / Georgette blend with breathable weave structure.'}</p>
                    <ul className="list-disc list-inside flex flex-col gap-1 text-[11px] text-[#555]">
                      <li>Machine wash cold with like colors</li>
                      <li>Do not bleach or tumble dry</li>
                      <li>Medium iron inside out if needed</li>
                      <li>Dry in shade to preserve genuine color vibrancy</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Tab 3: Shipping & Returns */}
              <div className="border-t border-[#e6e6e6]">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-3.5 flex items-center justify-between text-left text-xs font-semibold tracking-[0.06em] uppercase text-[#232323] hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <span>Shipping & Return Policy</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="h-4 w-4 text-[#727272]" /> : <ChevronDown className="h-4 w-4 text-[#727272]" />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-xs text-[#727272] leading-relaxed flex flex-col gap-2">
                    <p>Inside Dhaka: 24-48 hours delivery time.</p>
                    <p>Outside Dhaka: 2-4 business days nationwide doorstep delivery via trusted courier.</p>
                    <p className="text-[11px] text-[#555]">Hassle-free exchange available within 7 days of receiving the item provided tags are intact.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Share link button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#969696]">Share Product:</span>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-[#232323] hover:text-zinc-600 font-medium cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 text-[11px]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="text-[11px] uppercase tracking-wider">Copy Link</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. RELATED PRODUCTS SECTION (Yellow Clothing Style Grid) */}
      <section className="border-t border-[#e6e6e6] bg-[#fafafa] py-14 sm:py-18">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#969696]">
              Explore More from {product.category?.name || 'Collection'}
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[0.06em] uppercase text-[#232323] mt-1.5">
              Related Products
            </h2>
            <div className="w-12 h-0.5 bg-[#232323] mt-3" />
          </div>

          {/* Related Products Grid */}
          {relatedLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse flex flex-col gap-3 bg-white p-3 border border-[#e6e6e6]">
                  <div className="aspect-[3/4] w-full bg-zinc-200"></div>
                  <div className="h-3 w-2/3 bg-zinc-200"></div>
                  <div className="h-3 w-1/3 bg-zinc-200"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-10 text-xs font-medium uppercase tracking-widest text-[#969696]">
              No other products currently available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relProd) => {
                const relDiscount = relProd.discountPrice !== null && relProd.discountPrice !== undefined;
                const relCurrentPrice = relDiscount ? relProd.discountPrice : relProd.price;
                const relIsWished = isInWishlist(relProd.id);
                const relSoldOut = relProd.stock === 0;

                return (
                  <div
                    key={relProd.id}
                    className="group relative flex flex-col bg-white border border-[#e6e6e6] transition-all duration-300 hover:shadow-md"
                  >
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => addToWishlist(relProd.id, relProd)}
                      className={`absolute right-2.5 top-2.5 z-10 p-1.5 border border-[#e6e6e6] bg-white/90 backdrop-blur-xs hover:scale-105 transition-transform cursor-pointer shadow-xs ${
                        relIsWished ? 'text-red-500' : 'text-[#727272] hover:text-red-500'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className="h-3.5 w-3.5" fill={relIsWished ? 'currentColor' : 'none'} />
                    </button>

                    {/* Image Container with 3:4 aspect ratio and hover image swap */}
                    <Link href={`/products/${relProd.id}`} className="aspect-[3/4] w-full overflow-hidden bg-zinc-50 relative block">
                      {/* Primary Image */}
                      <img
                        src={getOptimizedImageUrl(relProd.image, 450)}
                        alt={relProd.name}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                          relSoldOut ? 'opacity-50' : relProd.image2 ? 'group-hover:opacity-0' : ''
                        }`}
                      />

                      {/* Secondary Image */}
                      {!relSoldOut && relProd.image2 && (
                        <img
                          src={getOptimizedImageUrl(relProd.image2, 450)}
                          alt={`${relProd.name} Alternate`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 scale-100 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
                        />
                      )}

                      {/* Sale / Sold Out Badge */}
                      {relSoldOut ? (
                        <span className="absolute left-2.5 top-2.5 z-10 bg-[#232323] px-2 py-0.5 text-[8px] font-medium text-white tracking-widest uppercase">
                          Sold Out
                        </span>
                      ) : relDiscount ? (
                        <span className="absolute left-2.5 top-2.5 z-10 bg-[#e95144] text-white text-[8px] font-semibold tracking-wider uppercase px-2 py-0.5">
                          Sale
                        </span>
                      ) : null}
                    </Link>

                    {/* Product Details info in Poppins */}
                    <div className="p-3.5 flex flex-col gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#969696]">
                        {relProd.category?.name || 'OnWear'}
                      </span>
                      
                      <Link 
                        href={`/products/${relProd.id}`}
                        className="text-xs font-semibold tracking-[0.02em] uppercase text-[#232323] hover:text-zinc-600 transition-colors line-clamp-1"
                        title={relProd.name}
                      >
                        {relProd.name}
                      </Link>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xs sm:text-sm font-bold text-[#232323]">
                          {formatPrice(relCurrentPrice)}
                        </span>
                        {relDiscount && (
                          <span className="text-[11px] font-normal text-[#969696] line-through">
                            {formatPrice(relProd.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 4. CUSTOMER REVIEWS SECTION */}
      <section id="customer-reviews" className="border-t border-[#e6e6e6] bg-white py-14 sm:py-18">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            
            {/* Left: Write a Review Form */}
            <div className="lg:col-span-1 flex flex-col gap-5">
              <h3 className="text-base sm:text-lg font-semibold uppercase tracking-[0.05em] text-[#232323]">
                Customer Reviews
              </h3>

              {user ? (
                hasReviewed ? (
                  <div className="border border-[#e6e6e6] bg-[#fafafa] p-5 text-xs font-medium text-[#727272] uppercase tracking-wider">
                    You have already reviewed this product.
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="flex flex-col gap-4 border border-[#e6e6e6] p-5 bg-[#fafafa]">
                    <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#232323]">
                      Write a Review
                    </span>

                    {reviewError && (
                      <div className="bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
                        {reviewError}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#727272]">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border border-[#e6e6e6] p-2.5 text-xs bg-white font-semibold text-amber-500 cursor-pointer focus:outline-none focus:border-[#232323]"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value="3">⭐⭐⭐ (3 - Good)</option>
                        <option value="2">⭐⭐ (2 - Fair)</option>
                        <option value="1">⭐ (1 - Poor)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#727272]">Review Details</label>
                      <textarea
                        rows={4}
                        placeholder="Tell others what you think about this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border border-[#e6e6e6] p-3 text-xs bg-white resize-none font-normal focus:outline-none focus:border-[#232323]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="bg-[#232323] text-white py-2.5 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )
              ) : (
                <div className="border border-[#e6e6e6] bg-[#fafafa] p-5 text-xs font-medium text-[#727272]">
                  Please <Link href="/login" className="font-semibold text-[#232323] underline">login</Link> to leave a review.
                </div>
              )}
            </div>

            {/* Right: Review List */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <h3 className="text-base sm:text-lg font-semibold uppercase tracking-[0.05em] text-[#232323]">
                Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="border border-dashed border-[#e6e6e6] bg-[#fafafa] p-10 text-center text-xs font-medium uppercase tracking-widest text-[#969696]">
                  No reviews for this product yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border border-[#e6e6e6] bg-white p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-xs text-[#232323] uppercase">{rev.user?.name || 'Customer'}</h4>
                          <span className="text-[10px] text-[#969696] font-medium">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {user && (user.id === rev.userId || user.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-[#969696] hover:text-red-500 transition-colors p-1"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3"
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[#555] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE SIZE GUIDE MODAL */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        categoryName={product.category?.name || ''}
        productId={product.id}
        productName={product.name}
        sizeChartUrl={(product as any).sizeChartUrl || null}
      />

      {/* 6. HIGH-CONVERSION STICKY MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e6e6e6] p-3 flex items-center justify-between gap-3 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#969696]">Total Price</span>
          <span className="text-sm font-bold text-[#232323] leading-tight truncate">
            {formatPrice(currentPrice * quantity)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[260px]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 py-2.5 px-3 bg-[#232323] text-white font-semibold text-[11px] uppercase tracking-[0.06em] flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:bg-zinc-200 disabled:text-zinc-400 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Bag</span>
          </button>

          {!isSoldOut && (
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-2.5 px-3 bg-white text-[#232323] border border-[#232323] font-semibold text-[11px] uppercase tracking-[0.06em] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
