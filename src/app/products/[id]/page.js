'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { API_URL } from '../../../config';
import { Star, ShoppingBag, Heart, Trash2, Edit } from 'lucide-react';

export default function ProductDetailsPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const { user, token } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/products/${productId}`);
      const reviewsRes = await fetch(`${API_URL}/reviews/product/${productId}`);
      const prodData = await prodRes.json();
      const reviewsData = await reviewsRes.json();

      if (prodData.success) setProduct(prodData.data);
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

  const handleAddReview = async (e) => {
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

  const handleDeleteReview = async (reviewId) => {
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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 flex justify-center items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-800">Product not found</h2>
        <button onClick={() => router.push('/products')} className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white">
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-16">
      {/* Product Top Detail */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">
              {product.category?.name}
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-950 sm:text-4xl">{product.name}</h1>
            <p className="text-xs text-zinc-400">SKU: {product.sku}</p>
          </div>

          {/* Rating Summary */}
          {averageRating && (
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5"
                    fill={i < Math.round(Number(averageRating)) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-zinc-700">{averageRating} out of 5</span>
              <span className="text-sm text-zinc-400">({reviews.length} reviews)</span>
            </div>
          )}

          {/* Prices */}
          <div className="flex items-baseline gap-4">
            {discount ? (
              <>
                <span className="text-3xl font-bold text-indigo-600">${product.discountPrice}</span>
                <span className="text-lg text-zinc-400 line-through">${product.price}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-indigo-600">${product.price}</span>
            )}
          </div>

          <p className="text-zinc-600 text-base leading-7">{product.description || 'No description available for this product.'}</p>

          {/* Stock and Status */}
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              product.stock > 0
                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
            }`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-zinc-700">Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                className="w-16 rounded-xl border border-zinc-200 p-2 text-center text-sm font-semibold focus:outline-indigo-600 bg-zinc-50"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-100">
            <button
              onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock === 0}
              className="flex-1 rounded-full bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 rounded-full bg-zinc-950 py-3 text-base font-semibold text-white hover:bg-zinc-800 transition-colors disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button
              onClick={() => addToWishlist(product.id)}
              className={`rounded-full border border-zinc-200 p-3 hover:bg-zinc-50 transition-colors ${
                isWished ? 'text-red-500 bg-red-50 border-red-200' : 'text-zinc-400'
              }`}
            >
              <Heart className="h-5 w-5" fill={isWished ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 border-t border-zinc-200 pt-16">
        {/* Write a Review */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-zinc-950">Customer Reviews</h2>
          {user ? (
            hasReviewed ? (
              <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-150 text-sm text-zinc-500">
                You have already reviewed this product.
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-6 bg-white shadow-sm">
                <h3 className="font-bold text-zinc-900">Write a Review</h3>

                {reviewError && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 font-medium">
                    {reviewError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="rounded-xl border border-zinc-200 p-2.5 text-sm bg-zinc-50 focus:outline-indigo-600 font-semibold text-amber-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Good)</option>
                    <option value="2">⭐⭐ (2 - Fair)</option>
                    <option value="1">⭐ (1 - Poor)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Review details:</label>
                  <textarea
                    rows="4"
                    placeholder="Tell others what you think about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Submit Review
                </button>
              </form>
            )
          ) : (
            <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-150 text-sm text-zinc-500">
              Please <a href="/login" className="font-bold text-indigo-600 underline">login</a> to write a review.
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-zinc-950">Review List ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-400">
              No reviews for this product yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900">{rev.user?.name}</h4>
                      <span className="text-xs text-zinc-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {/* Trash review if it's the customer's review */}
                    {user && (user.id === rev.userId || user.role === 'ADMIN') && (
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
                        className="h-4 w-4"
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>

                  <p className="text-zinc-600 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
