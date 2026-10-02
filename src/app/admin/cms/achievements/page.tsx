'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Trash2,
  Search,
  Star,
  Trophy,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  category: 'Academic' | 'Quran & Tahfeez' | 'STEM & Olympiads' | 'Sports & Debate';
  year: string;
  recipient: string;
  description: string;
  is_featured?: boolean;
  isFeatured?: boolean;
  badge_text?: string;
  badgeText?: string;
}

export default function AdminCmsAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Achievement['category']>('Academic');
  const [year, setYear] = useState('2025/2026');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('Distinction');
  const [isFeatured, setIsFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/achievements');
      const data = await res.json();
      if (data.achievements) {
        setAchievements(
          data.achievements.map((a: any) => ({
            ...a,
            isFeatured: a.is_featured ?? a.isFeatured ?? true,
            badgeText: a.badge_text ?? a.badgeText ?? 'Honour',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !recipient.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        year,
        recipient,
        description,
        is_featured: isFeatured,
        badge_text: badgeText || 'Honour',
      };

      const res = await fetch('/api/cms/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Achievement "${title}" saved to database!`);
        setIsModalOpen(false);
        setTitle('');
        setRecipient('');
        setDescription('');
        fetchAchievements();
      } else {
        showToast('Failed to save achievement.');
      }
    } catch (err) {
      showToast('Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this achievement from public display?')) return;

    try {
      const res = await fetch(`/api/cms/achievements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
        showToast('Achievement record deleted from database.');
      } else {
        showToast('Failed to delete achievement.');
      }
    } catch (err) {
      showToast('Error connecting to database.');
    }
  };

  const filtered = achievements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Honours & Accolades CMS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Achievements & Institutional Honors
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showcase academic milestones, WAEC examination laurels, Quran memorization triumphs, and Olympiad medals directly in the live database.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Achievement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search honours by title, awardee or description..."
            className="w-full pl-10 pr-4 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic (WAEC/NECO)</option>
            <option value="Quran & Tahfeez">Quran & Tahfeez</option>
            <option value="STEM & Olympiads">STEM & Olympiads</option>
            <option value="Sports & Debate">Sports & Debate</option>
          </select>
        </div>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading achievements from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#111C33] border border-[#1E2E50] rounded-2xl p-8">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-white font-bold text-sm">No Achievements Recorded Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently zero achievements in the database. Click the button above to publish an official accolade.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            <Plus className="w-4 h-4" /> Post First Achievement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 flex flex-col justify-between hover:border-[#2C416E] transition relative group"
            >
              <div>
                {/* Top row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.category === 'Academic'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : item.category === 'Quran & Tahfeez'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.category === 'STEM & Olympiads'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 bg-[#0D1527] px-2 py-0.5 rounded border border-[#1E2E50]">
                      {item.year}
                    </span>
                    {item.isFeatured && (
                      <span className="p-1 rounded-md text-amber-400 bg-amber-500/10" title="Featured">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                  {item.title}
                </h3>

                {/* Recipient */}
                <div className="text-[11px] font-semibold text-emerald-400 mt-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.recipient}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-[#1E2E50] flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 bg-[#0D1527] px-2 py-0.5 rounded">
                  Badge: {item.badgeText}
                </span>

                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete Achievement"
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Achievement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Post New Achievement</h3>
                <p className="text-xs text-slate-400">
                  Broadcast accolades and records across the public website and live database.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Achievement Title & Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Position – State Inter-Schools Hifz Championship"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Achievement['category'])}
                    className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Academic">Academic (WAEC / NECO)</option>
                    <option value="Quran & Tahfeez">Quran & Tahfeez</option>
                    <option value="STEM & Olympiads">STEM & Olympiads</option>
                    <option value="Sports & Debate">Sports & Debate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Academic Year / Session
                  </label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recipient / Awardee(s)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah Yusuf (SSS 2) or Class of 2025"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the milestone, competition details, and significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold Medalists"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-[#213357] bg-[#0D1527]"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-medium text-slate-300">
                    Feature on Homepage Hero
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Achievement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
