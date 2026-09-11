'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, Save, Loader2, Calendar, Sparkles, X, Edit, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../../components/ConfirmModal';

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Helper to format ISO to datetime-local value
  const toLocalISO = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setName('');
    setSlug('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (camp: Campaign) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setSlug(camp.slug);
    setDescription(camp.description || '');
    setStartDate(toLocalISO(camp.startDate));
    setEndDate(toLocalISO(camp.endDate));
    setIsActive(camp.isActive);
    setIsModalOpen(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCampaign) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Load campaigns list
  const loadCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/campaigns`);
      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns(data.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Submit Create or Edit campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim() || !slug.trim() || !startDate || !endDate) {
      setMessage({ type: 'error', text: 'All fields except description are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive
    };

    try {
      const isEdit = !!editingCampaign;
      const url = isEdit ? `${API_URL}/campaigns/${editingCampaign.id}` : `${API_URL}/campaigns`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: isEdit ? 'Campaign updated successfully!' : 'Campaign created successfully!'
        });
        setIsModalOpen(false);
        loadCampaigns();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save campaign' });
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
      setMessage({ type: 'error', text: 'An error occurred while saving the campaign' });
    } finally {
      setSaving(false);
    }
  };

  // Delete campaign
  const handleConfirmDelete = async () => {
    if (!token || !campaignToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/campaigns/${campaignToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Campaign "${campaignToDelete.name}" deleted successfully!` });
        setCampaignToDelete(null);
        loadCampaigns();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete campaign' });
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setMessage({ type: 'error', text: 'An error occurred while deleting the campaign' });
    } finally {
      setDeleting(false);
    }
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-zinc-700">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2 tracking-tight">
            <Megaphone className="h-6 w-6 text-zinc-900" />
            Flash Campaigns
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Configure and manage store homepage flash sales, seasonal events, and time-limited deals.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-5 py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4.5 px-6">Campaign Info</th>
                <th className="py-4.5 px-6">Slug</th>
                <th className="py-4.5 px-6">Start Date</th>
                <th className="py-4.5 px-6">End Date</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-medium">
                    No campaigns have been created yet. Click "New Campaign" to start.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => {
                  const now = new Date();
                  const start = new Date(camp.startDate);
                  const end = new Date(camp.endDate);
                  let statusText = 'Inactive';
                  let statusColor = 'bg-zinc-100 text-zinc-600 border-zinc-200';

                  if (camp.isActive) {
                    if (now < start) {
                      statusText = 'Scheduled';
                      statusColor = 'bg-blue-50 text-blue-700 border border-blue-200';
                    } else if (now >= start && now <= end) {
                      statusText = 'Running Now';
                      statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse';
                    } else {
                      statusText = 'Ended';
                      statusColor = 'bg-amber-50 text-amber-700 border border-amber-200';
                    }
                  }

                  return (
                    <tr key={camp.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-950 text-sm">{camp.name}</span>
                          {camp.description && (
                            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 max-w-xs truncate">{camp.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-mono font-medium">
                          {camp.slug}
                        </code>
                      </td>
                      <td className="py-4 px-6 text-zinc-600 text-[11px]">
                        {start.toLocaleDateString('en-BD', { dateStyle: 'medium' })} {start.toLocaleTimeString('en-BD', { timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 text-[11px]">
                        {end.toLocaleDateString('en-BD', { dateStyle: 'medium' })} {end.toLocaleTimeString('en-BD', { timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(camp)}
                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCampaignToDelete(camp)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-zinc-900" />
                  {editingCampaign ? 'Edit Flash Campaign' : 'Create Flash Campaign'}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Configure name, URL slug, description details, and duration timelines.</p>
              </div>

              {/* Live Preview Card */}
              {name && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    <span className="flex items-center gap-1"><Megaphone className="h-3.5 w-3.5 text-amber-400" /> Flash Promo</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white">{isActive ? 'Active' : 'Draft'}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">{name}</h4>
                  {description && <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">{description}</p>}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                    <span>Slug: /{slug || 'slug'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Timed Event</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Eid Mega Flash Sale"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. eid-mega-flash-sale"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe campaign details or discount rates..."
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950/20"
                    />
                    <span>Active campaign status</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-extrabold px-5 py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-6 py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Flash Campaign"
        message="Are you sure you want to permanently delete this flash campaign? This will remove all promotion banners associated with it."
        confirmText="Yes, Delete Campaign"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        itemPreview={
          campaignToDelete
            ? {
                title: campaignToDelete.name,
                subtitle: `Slug: /${campaignToDelete.slug}`,
                badge: campaignToDelete.isActive ? 'Active' : 'Inactive'
              }
            : undefined
        }
      />
    </div>
  );
}
