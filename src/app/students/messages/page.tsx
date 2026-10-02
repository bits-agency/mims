'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Bell,
  Calendar,
  Pin,
  CheckCircle2,
  Inbox
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  sender: string;
  date: string;
  category: 'Academic' | 'Spiritual' | 'Events' | 'Administrative';
  message: string;
  pinned?: boolean;
}

export default function StudentMessagesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const filteredNotices = notices.filter(
    (n) => activeCategory === 'all' || n.category === activeCategory
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notice Board &amp; Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements, academic circulars, and administrative bulletins
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {['all', 'Academic', 'Spiritual', 'Events', 'Administrative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Broadcasts' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No Notices or Circulars Available
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            There are currently no active administrative broadcasts or academic circulars published. When announcements, event notices, or circulars are released by school management, they will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notices Roster (1 col) */}
          <div className="space-y-3">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedNotice?.id === notice.id
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{notice.date}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 mb-1 leading-snug flex items-center gap-1.5">
                  {notice.pinned && <Pin className="w-3.5 h-3.5 text-emerald-600 shrink-0 rotate-45" />}
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {notice.message}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Notice Detail View (2 cols) */}
          {selectedNotice && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    {selectedNotice.category} Circular
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {selectedNotice.date}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  {selectedNotice.title}
                </h2>

                <p className="text-xs text-emerald-700 font-bold mb-6">
                  Issued by: {selectedNotice.sender}
                </p>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed space-y-4">
                  <p>{selectedNotice.message}</p>
                  <p className="italic text-xs text-slate-500 pt-2 border-t border-slate-200">
                    &ldquo;Knowledge is Light — MSSN Islamic Model Schools Akure&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Official Notice Verified</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Management Verified
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
