'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bell,
  Search,
  Plus,
  Send,
  Pin,
  Clock,
  ShieldAlert,
  FileText,
  CheckCircle2
} from 'lucide-react';

export default function TeacherMessagesPage() {
  const [filter, setFilter] = useState<'all' | 'admin' | 'exam'>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [targetClass, setTargetClass] = useState('SS 2 Science (Gold)');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [circulars, setCirculars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCirculars = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        const mapped = data.announcements.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category?.toLowerCase() === 'exam' ? 'exam' : 'admin',
          author: a.sender || 'Office of the Principal',
          date: a.date,
          isPinned: !!a.pinned,
          content: a.message,
        }));
        setCirculars(mapped);
      }
    } catch (err) {
      console.error('Failed to load announcements for teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCirculars();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle || !messageBody) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[${targetClass}] ${subjectTitle.trim()}`,
          message: messageBody.trim(),
          category: 'Academic',
          pinned: false,
          audience: 'students',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastSent(true);
        setComposeOpen(false);
        setSubjectTitle('');
        setMessageBody('');
        loadCirculars();
        setTimeout(() => setBroadcastSent(false), 4000);
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  const filteredCirculars = circulars.filter((c) => {
    if (filter === 'all') return true;
    return c.category === filter;
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Broadcasts &amp; Circulars
          </h1>
          <p className="text-xs text-slate-500">
            Internal school communications, moderation directives, and student class notices.
          </p>
        </div>

        <button
          onClick={() => setComposeOpen(!composeOpen)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Send Class Announcement
        </button>
      </div>

      {/* Broadcast Sent Notification */}
      {broadcastSent && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Class announcement successfully dispatched to student portals!
        </div>
      )}

      {/* Compose Announcement Drawer / Form */}
      {composeOpen && (
        <form
          onSubmit={handleSendBroadcast}
          className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Compose Class Announcement
            </h3>
            <span className="text-[11px] text-slate-400">Sent directly to student dashboards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Target Class Arm
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="SS 2 Science (Gold)">SS 2 Science (Gold)</option>
                <option value="SS 3 Science (Diamond)">SS 3 Science (Diamond)</option>
                <option value="JSS 2 (Silver)">JSS 2 (Silver)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Notice Title / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Physics Lab Practical Preparation..."
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
              Announcement Message
            </label>
            <textarea
              rows={3}
              placeholder="Type homework instructions, materials to bring, or assignment notes..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setComposeOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Notice
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notices ({circulars.length})
        </button>
        <button
          onClick={() => setFilter('exam')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
            filter === 'exam'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Exam Board &amp; CA
        </button>
        <button
          onClick={() => setFilter('admin')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
            filter === 'admin'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Principal Directives
        </button>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-2xl border transition bg-white ${
              item.isPinned
                ? 'border-emerald-200 shadow-sm bg-gradient-to-r from-white via-white to-emerald-50/20'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    <Pin className="w-3 h-3 text-emerald-700" /> Pinned
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.category === 'exam' ? 'Examinations & Grading' : 'Administrative Circular'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                {item.date}
              </div>
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              {item.title}
            </h3>

            <p className="text-[11px] font-bold text-emerald-700 mb-3">
              From: {item.author}
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
