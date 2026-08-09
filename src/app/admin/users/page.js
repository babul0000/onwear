'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
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
      fetchUsers();
    }
  }, [token]);

  const handleToggleRole = async (userId, currentRole) => {
    setError('');
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

    if (!confirm(`Are you sure you want to change this user role to ${newRole}?`)) return;

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();

      if (data.success) {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to update user role');
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
        <h1 className="text-3xl font-bold text-zinc-950">User Directory</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage platform users and account access rights</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm h-fit">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4 text-zinc-600">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-zinc-500 max-w-xs truncate">{u.address || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== u.id && (
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 p-1.5 border border-indigo-200 hover:bg-indigo-50/50 rounded-full px-3 py-1 transition-all"
                          title="Toggle Role"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Change Role</span>
                        </button>
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
