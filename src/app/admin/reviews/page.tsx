'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { ArrowLeft, Star, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminReviewsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Review deleted successfully!');
        fetchReviews();
      } else {
        setError(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  if (!token || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Review Moderation</h1>
        <p className="text-sm text-zinc-500 mt-1">Moderate customer reviews and ratings</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Reviews list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm h-fit">
        {loading ? (
          <div className="p-8 text-center">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">No reviews posted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {reviews.map((rev) => (
                  <tr key={rev.id} className={`hover:bg-zinc-50 transition-colors ${rev.isDeleted ? 'bg-red-50/20 opacity-70' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{rev.product?.name}</div>
                      <div className="text-xs text-zinc-400 font-mono">SKU: {rev.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-800">{rev.user?.name}</div>
                      <div className="text-xs text-zinc-400">{rev.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4"
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-sm truncate">{rev.comment || 'N/A'}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!rev.isDeleted ? (
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold flex items-center justify-end gap-1 select-none pr-2">
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
    </div>
  );
}
