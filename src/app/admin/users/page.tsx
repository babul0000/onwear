'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config';
import { ArrowLeft, User as UserIcon, ShieldCheck, Users, Loader2, Trash2 } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: 'admin' | 'customer';
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [targetUser, setTargetUser] = useState<{ user: UserRecord; nextRole: 'admin' | 'customer' } | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handlePromptRoleChange = (u: UserRecord) => {
    const nextRole = u.role === 'admin' ? 'customer' : 'admin';
    setTargetUser({ user: u, nextRole });
  };

  const handleConfirmRoleChange = async () => {
    if (!token || !targetUser) return;
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/users/${targetUser.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: targetUser.nextRole })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `User "${targetUser.user.name}" role updated to ${targetUser.nextRole}!`
        });
        setTargetUser(null);
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update user role' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An error occurred while updating user role' });
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!token || !deleteUserTarget) return;
    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/users/${deleteUserTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `User "${deleteUserTarget.name}" has been deleted successfully.`
        });
        setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
        setDeleteUserTarget(null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An error occurred while deleting user' });
    } finally {
      setDeleting(false);
    }
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6 text-zinc-700">
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
            <Users className="h-6 w-6 text-zinc-900" />
            User Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage customer profiles and assign administrative access permissions.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-900" />
            <span className="text-xs font-semibold">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4.5">User</th>
                  <th className="px-6 py-4.5">Email</th>
                  <th className="px-6 py-4.5">Phone</th>
                  <th className="px-6 py-4.5">Address</th>
                  <th className="px-6 py-4.5">Role</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-semibold">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 font-black">
                        {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-zinc-950 text-sm block">{u.name}</span>
                        {user.id === u.id && (
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">(Current User)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-zinc-600">{u.email}</td>
                    <td className="px-6 py-4 text-zinc-600 text-[11px]">{u.phone || '—'}</td>
                    <td className="px-6 py-4 text-zinc-500 text-[11px] max-w-xs truncate">{u.address || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== u.id && (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePromptRoleChange(u)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:text-zinc-950 px-3 py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer shadow-xs"
                            title="Change Role"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
                            <span className="hidden sm:inline">Switch to {u.role === 'admin' ? 'Customer' : 'Admin'}</span>
                          </button>

                          <button
                            onClick={() => setDeleteUserTarget(u)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM ROLE CHANGE MODAL */}
      <ConfirmModal
        isOpen={!!targetUser}
        onClose={() => setTargetUser(null)}
        onConfirm={handleConfirmRoleChange}
        title={`Change Role to ${targetUser?.nextRole?.toUpperCase()}`}
        description={
          targetUser?.nextRole === 'admin'
            ? `Are you sure you want to grant Admin access to "${targetUser?.user.name}"? They will gain access to the admin dashboard, inventory management, and store orders.`
            : `Are you sure you want to demote "${targetUser?.user.name}" to Customer? They will lose access to the administrative dashboard.`
        }
        confirmText={`Confirm Role Switch`}
        cancelText="Cancel"
        variant={targetUser?.nextRole === 'admin' ? 'warning' : 'info'}
        loading={updating}
        itemPreview={
          targetUser
            ? {
                title: targetUser.user.name,
                subtitle: targetUser.user.email,
                badge: `Current Role: ${targetUser.user.role.toUpperCase()}`
              }
            : undefined
        }
      />

      {/* CONFIRM DELETE USER MODAL */}
      <ConfirmModal
        isOpen={!!deleteUserTarget}
        onClose={() => !deleting && setDeleteUserTarget(null)}
        onConfirm={handleConfirmDeleteUser}
        title={`Delete User "${deleteUserTarget?.name}"?`}
        description={`Are you sure you want to delete user account "${deleteUserTarget?.name}" (${deleteUserTarget?.email})? This user will be permanently removed from the user directory.`}
        confirmText="Delete User"
        cancelText="Keep User"
        variant="danger"
        loading={deleting}
        itemPreview={
          deleteUserTarget
            ? {
                title: deleteUserTarget.name,
                subtitle: deleteUserTarget.email,
                badge: `Role: ${deleteUserTarget.role.toUpperCase()}`
              }
            : undefined
        }
      />
    </div>
  );
}
