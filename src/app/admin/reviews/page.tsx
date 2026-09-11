'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { ArrowLeft, Star, Trash2, ShieldAlert, MessageSquare, Loader2 } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  isDeleted?: boolean;
  product?: {
    id: string;
    name: string;
    sku?: string;
    images?: { url: string }[];
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews?includeDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  const handleConfirmDelete = async () => {
    if (!token || !reviewToDelete) return;
    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Review removed successfully!' });
        setReviewToDelete(null);
        fetchReviews();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete review' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An error occurred while deleting the review' });
    } finally {
      setDeleting(false);
    }
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5 tracking-tight">
            <MessageSquare className="h-6 w-6 text-zinc-900" />
            Review Moderation
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Review customer feedback, verify product ratings, and moderate harmful or spam comments.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Reviews list */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-900" />
            <span className="text-xs font-semibold">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-semibold">No reviews posted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4.5">Product</th>
                  <th className="px-6 py-4.5">Reviewer</th>
                  <th className="px-6 py-4.5">Rating</th>
                  <th className="px-6 py-4.5">Comment</th>
                  <th className="px-6 py-4.5">Date</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold">
                {reviews.map((rev) => (
                  <tr key={rev.id} className={`hover:bg-zinc-50/60 transition-colors ${rev.isDeleted ? 'bg-red-50/30 opacity-70' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-zinc-900">{rev.product?.name || 'Unknown Product'}</div>
                      {rev.product?.sku && (
                        <div className="text-[10px] text-zinc-400 font-mono">SKU: {rev.product?.sku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{rev.user?.name || 'Customer'}</div>
                      <div className="text-[11px] text-zinc-400">{rev.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5"
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-zinc-700 ml-1">({rev.rating}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-sm">
                      <p className="line-clamp-2 text-xs">{rev.comment || 'No comment text provided'}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!rev.isDeleted ? (
                        <button
                          onClick={() => setReviewToDelete(rev)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center justify-end gap-1 select-none pr-2">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Removed</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE REVIEW MODAL */}
      <ConfirmModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Customer Review"
        message="Are you sure you want to remove this customer review? It will no longer be visible on the product page and will be excluded from the product's overall rating."
        confirmText="Yes, Remove Review"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        itemPreview={
          reviewToDelete
            ? {
                image: reviewToDelete.product?.images?.[0]?.url,
                title: reviewToDelete.product?.name || 'Product Review',
                subtitle: `By ${reviewToDelete.user?.name || 'Customer'}: "${reviewToDelete.comment || 'No comment text'}"`,
                badge: `Rating: ${reviewToDelete.rating} / 5 Stars`
              }
            : undefined
        }
      />
    </div>
  );
}
