'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { API_URL } from '../../../config';
import { Star, ShoppingBag, Heart, Trash2, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../../../utils/format';
import ProductImageZoom from '../../../components/ProductImageZoom';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const { user, token } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchProductDetails = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/products/${productId}`);
      const reviewsRes = await fetch(`${API_URL}/reviews/product/${productId}`);
      const prodData = await prodRes.json();
      const reviewsData = await reviewsRes.json();

      if (prodData.success) {
        setProduct(prodData.data);
        setSelectedImage(prodData.data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600');
      }
      if (reviewsData.success) setReviews(reviewsData.data);
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!token) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }

    try {
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
        fetchProductDetails(); // reload product and reviews
      } else {
        setReviewError(data.message);
      }
    } catch (err) {
      console.error('Error adding review:', err);
      setReviewError('Failed to submit review. Try again.');
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

  const handleBuyNow = async () => {
    const res = await addToCart(productId, quantity);
    if (res.success) {
      router.push('/cart');
    }
  };

  const handleClearSelection = () => {
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex justify-center items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Product not found</h2>
        <button onClick={() => router.push('/products')} className="mt-4 rounded-full bg-zinc-950 px-6 py-2 text-white">
          Back to Shop
        </button>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const discount = product.discountPrice !== null;
  const currentPrice = discount ? product.discountPrice : product.price;

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  // Check if current user already submitted a review
  const hasReviewed = user && reviews.some((r) => r.userId === user.id);

  // Generate 4 mock image angles for the gallery
  const galleryImages = [
    product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-20 text-zinc-800">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        
        {/* Left Side: Images Gallery */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Large Main Display Image */}
          <ProductImageZoom
            src={selectedImage}
            alt={product.name}
            className="rounded-2xl"
          />

          {/* Small Thumbnails Row */}
          <div className="grid grid-cols-4 gap-4">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-zinc-50 transition-all hover:border-zinc-400 ${
                  selectedImage === imgUrl ? 'border-zinc-950 shadow-sm' : 'border-zinc-200/60'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} Angle ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details info */}
        <div className="lg:col-span-6 flex flex-col gap-6 lg:pl-4">
          
          {/* Category Breadcrumb */}
          <div>
            <Link 
              href="/products" 
              className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-650 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Shop</span>
            </Link>
          </div>

          {/* Product Title and Header info */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight leading-none uppercase">
              {product.name}
            </h1>

            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2 mt-1">
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
              <span className="text-xs font-bold text-zinc-400 tracking-wider">
                ({reviews.length} reviews) | <a href="#reviews" className="underline text-zinc-500 hover:text-zinc-700 transition-colors uppercase">Add Review</a>
              </span>
            </div>

            {/* Product Pricing */}
            <div className="text-3xl font-black text-zinc-950 mt-2">
              {discount ? (
                <div className="flex items-baseline gap-2">
                  <span>{formatPrice(product.discountPrice)}</span>
                  <span className="text-sm text-zinc-400 line-through font-bold">{formatPrice(product.price)}</span>
                </div>
              ) : (
                <span>{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          {/* Availability, SKU & Tags */}
          <div className="flex flex-col gap-2 border-y border-zinc-100 py-5 text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest w-24">Availability:</span>
              <span className={product.stock > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest w-24">Product Code:</span>
              <span className="font-mono text-zinc-900 font-bold">{product.sku}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest w-24">Category:</span>
              <span className="text-zinc-900 font-bold uppercase tracking-wider text-[10px] bg-zinc-100 px-2 py-0.5 rounded">
                {product.category?.name}
              </span>
            </div>
          </div>

          {/* Description Paragraph and Bullets */}
          <div className="flex flex-col gap-4 text-sm text-zinc-500 leading-relaxed font-medium">
            <p>{product.description || 'Elevate your seasonal catalog with this organic cotton tailored product, styled to maximize durability and standard fitting comfort.'}</p>
            <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2 text-zinc-400">
              <li><span className="text-zinc-500 font-bold">Material:</span> 100% Premium Organic Fabrics</li>
              <li><span className="text-zinc-500 font-bold">Fit:</span> Slim Fit Regular sizing</li>
              <li><span className="text-zinc-500 font-bold">Delivery:</span> Fast Home shipping within 3-4 days</li>
            </ul>
          </div>

          {/* Select Options Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-100 pt-6">
            
            {/* Color Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Color</label>
              <select 
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-800 font-bold focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="">Select Color</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="beige">Beige</option>
                <option value="grey">Grey</option>
              </select>
            </div>

            {/* Size Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Size</label>
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 text-zinc-800 font-bold focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="">Select Size</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>

            {/* Quantity Selector increment/decrement */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Qty</label>
              <div className="flex items-center rounded-xl border border-zinc-200 p-1 bg-zinc-50 h-10 select-none">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-950 font-bold text-center outline-none transition-colors"
                  type="button"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-bold text-zinc-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-950 font-bold text-center outline-none transition-colors"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Clear selections */}
          {(selectedColor || selectedSize || quantity > 1) && (
            <div className="text-right">
              <button 
                onClick={handleClearSelection}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-700 transition-colors uppercase tracking-wider underline"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Action Row Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-100 pt-6">
            <button
              onClick={async () => {
                if (!token) {
                  router.push('/login');
                  return;
                }
                const res = await addToCart(product.id, quantity);
                if (res.success) {
                  router.push('/checkout');
                }
              }}
              disabled={product.stock === 0}
              className="flex-1 rounded-xl bg-zinc-950 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 hover:bg-zinc-800 transition-colors shadow-md disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Order Now</span>
            </button>

            <button
              onClick={() => addToWishlist(product.id)}
              className={`rounded-xl border border-zinc-200 py-3.5 px-6 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider ${
                isWished ? 'text-red-500 border-red-200 bg-red-50' : 'text-zinc-650'
              }`}
            >
              <Heart className="h-4 w-4" fill={isWished ? 'currentColor' : 'none'} />
              <span>Add to Wishlist</span>
            </button>
          </div>

          {/* Share links */}
          <div className="flex items-center gap-4 mt-2 text-xs border-t border-zinc-100 pt-5">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Share this:</span>
            <div className="flex gap-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-3.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-colors">Facebook</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-3.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-colors">Twitter</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-3.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-colors">Pinterest</a>
            </div>
          </div>

        </div>
      </div>

      {/* Review Section */}
      <div id="reviews" className="grid grid-cols-1 gap-12 lg:grid-cols-3 border-t border-zinc-100 pt-16">
        
        {/* Write a Review Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wider">Customer Reviews</h2>
          {user ? (
            hasReviewed ? (
              <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                You have already reviewed this product.
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-6 bg-white shadow-sm">
                <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Write a Review</h3>

                {reviewError && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 font-medium">
                    {reviewError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:outline-none focus:border-zinc-400 font-bold text-amber-500 cursor-pointer"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Good)</option>
                    <option value="2">⭐⭐ (2 - Fair)</option>
                    <option value="1">⭐ (1 - Poor)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Review details</label>
                  <textarea
                    rows={4}
                    placeholder="Tell others what you think about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-3 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-450 resize-none font-medium"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-md uppercase tracking-wider"
                >
                  Submit Review
                </button>
              </form>
            )
          ) : (
            <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Please <a href="/login" className="font-extrabold text-indigo-600 underline">login</a> to write a review.
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-black text-zinc-950 uppercase tracking-wider">Review List ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
              No reviews for this product yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{rev.user?.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-bold">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {/* Trash review if it's the customer's review */}
                    {user && (user.id === rev.userId || user.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5"
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>

                  <p className="text-zinc-650 text-sm leading-relaxed font-medium">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
