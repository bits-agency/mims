'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Users,
  GraduationCap,
  Sparkles,
  Send,
  Eye
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  sender: string;
  date: string;
  category: 'Academic' | 'Spiritual' | 'Events' | 'Administrative';
  message: string;
  pinned: boolean;
  audience: string;
}

export default function AdminBroadcastsPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Spiritual' | 'Events' | 'Administrative'>('Academic');
  const [audience, setAudience] = useState('students');
  const [pinned, setPinned] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (res.ok && data.success) {
        setNotices(data.announcements || []);
        if (data.announcements?.length > 0 && !selectedNotice) {
          setSelectedNotice(data.announcements[0]);
        }
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load notices from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setToast({ type: 'error', message: 'Notice title and message content are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          audience,
          pinned,
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ type: 'success', message: 'Notice published to student portal notice board!' });
        setTitle('');
        setMessage('');
        setPinned(false);
        fetchNotices();
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to publish announcement.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error publishing announcement.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string, noticeTitle: string) => {
    if (!window.confirm(`Delete notice "${noticeTitle}" from the student board?`)) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ type: 'success', message: 'Notice removed successfully.' });
        setNotices((prev) => prev.filter((n) => n.id !== id));
        if (selectedNotice?.id === id) {
          setSelectedNotice(null);
        }
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to delete notice.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error communicating with server.' });
    }
  };

  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1527] to-[#131F38] border border-[#1E2E50] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Student Broadcasts &amp; Notice Board
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Live Broadcast
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dispatch official circulars, examination timetables, and administrative bulletins directly to the student portal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/students/messages"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#15223E] hover:bg-[#1E2E50] text-slate-200 text-xs font-bold border border-[#273B66] transition"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>View Student Board</span>
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            toast.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: 2 Columns (Compose Notice + Published Roster) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D1527] border border-[#1E2E50] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E2E50]">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Compose Student Announcement
            </h2>
          </div>

          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Notice Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. First Term Examination Timetable Released"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Academic">Academic</option>
                  <option value="Spiritual">Spiritual / Tahfeez</option>
                  <option value="Events">School Events</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Audience Scope</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="students">All Enrolled Students</option>
                  <option value="all">Everyone (Students &amp; Staff)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Announcement Body <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Type the full circular or notice details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pinNotice"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-[#131F38] border-[#1E2E50] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="pinNotice" className="text-slate-300 font-semibold cursor-pointer select-none">
                Pin this notice to top of student board
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Publish to Student Platform</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Published Notices Roster (7 cols) */}
        <div className="lg:col-span-7 bg-[#0D1527] border border-[#1E2E50] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2E50]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Published Notices ({notices.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="text-xs">Loading notice board...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No announcements published yet.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#131F38]/70 border border-[#1E2E50] hover:border-[#273B66] transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'Academic'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : item.category === 'Spiritual'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.category === 'Events'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {item.category}
                      </span>
                      {item.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Pin className="w-3 h-3 rotate-45" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.message}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#1E2E50]/60 text-[11px]">
                    <span className="text-emerald-400 font-medium">Issued by: {item.sender}</span>
                    <button
                      onClick={() => handleDeleteNotice(item.id, item.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
