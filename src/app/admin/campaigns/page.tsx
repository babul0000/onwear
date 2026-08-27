'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, Save, Loader2, Calendar, Sparkles, X, Edit, Trash2 } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
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

  // Submit new campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
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
      const res = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Campaign created successfully!' });
        setIsModalOpen(false);
        // Reset Form
        setName('');
        setSlug('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setIsActive(true);
        // Reload list
        loadCampaigns();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create campaign' });
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setMessage({ type: 'error', text: 'An error occurred while creating the campaign' });
    } finally {
      setSaving(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const res = await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Campaign deleted successfully!' });
        loadCampaigns();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete campaign' });
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setMessage({ type: 'error', text: 'An error occurred while deleting the campaign' });
    }
  };

  if (!token || !user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-zinc-700">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-indigo-600" />
            Flash Campaigns
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Configure and manage store homepage flash sales, seasonal events, and time-limited deals.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-5 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="py-4.5 px-6">Campaign Info</th>
                <th className="py-4.5 px-6">Slug</th>
                <th className="py-4.5 px-6">Start Date</th>
                <th className="py-4.5 px-6">End Date</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-bold text-zinc-700">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-semibold">
                    No campaigns have been created yet. Click "New Campaign" to start.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => {
                  const now = new Date();
                  const start = new Date(camp.startDate);
                  const end = new Date(camp.endDate);
                  let statusText = 'Inactive';
                  let statusColor = 'bg-zinc-50 text-zinc-600 border-zinc-200';

                  if (camp.isActive) {
                    if (now < start) {
                      statusText = 'Scheduled';
                      statusColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                    } else if (now >= start && now <= end) {
                      statusText = 'Running';
                      statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse';
                    } else {
                      statusText = 'Ended';
                      statusColor = 'bg-red-50 text-red-700 border border-red-100';
                    }
                  }

                  return (
                    <tr key={camp.id} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-950 text-[13px]">{camp.name}</span>
                          {camp.description && (
                            <span className="text-[10px] text-zinc-400 font-semibold mt-0.5 max-w-xs truncate">{camp.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-zinc-500">{camp.slug}</td>
                      <td className="py-4 px-6 text-zinc-500 font-semibold">
                        {start.toLocaleDateString('en-BD', { dateStyle: 'medium' })} {start.toLocaleTimeString('en-BD', { timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6 text-zinc-500 font-semibold">
                        {end.toLocaleDateString('en-BD', { dateStyle: 'medium' })} {end.toLocaleTimeString('en-BD', { timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer inline-flex items-center"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                <Sparkles className="h-5.5 w-5.5 text-indigo-600" />
                Create Flash Campaign
              </h2>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">Configure name, URL slug, description details, and duration date timelines.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Black Friday Special"
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">URL Slug (Generated)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. black-friday-special"
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe campaign details or discount rates..."
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold resize-none"
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
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Active immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-extrabold px-5 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-indigo-400" />
                      Create Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
