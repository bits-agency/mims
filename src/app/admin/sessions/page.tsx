'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Clock,
  Archive,
  Inbox,
  Loader2,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface TermItem {
  id?: string;
  termNumber: 1 | 2 | 3;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  resultsReleased: boolean;
  status: 'Completed' | 'Active' | 'Upcoming';
}

interface SessionItem {
  id: string;
  sessionName: string; // e.g. 2025/2026
  isCurrentSession: boolean;
  terms: TermItem[];
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Term Edit Modal State
  const [editingTerm, setEditingTerm] = useState<{
    term: TermItem;
    sessionName: string;
  } | null>(null);
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');
  const [termIsCurrent, setTermIsCurrent] = useState(false);
  const [savingTerm, setSavingTerm] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSetActiveSession = async (session: SessionItem) => {
    if (session.isCurrentSession) return;
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, makeActive: true }),
      });
      if (res.ok) {
        showNotification(`${session.sessionName} is now the primary active academic session!`);
        fetchSessions();
      }
    } catch (err) {
      alert('Error updating active session');
    }
  };

  const handleDeleteSession = async (session: SessionItem) => {
    if (!confirm(`Are you sure you want to delete session ${session.sessionName}? All terms associated with this session will also be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/sessions?id=${session.id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Session ${session.sessionName} deleted.`);
        fetchSessions();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete session');
      }
    } catch (err) {
      alert('Network error deleting session');
    }
  };

  const handleRenameSession = async (session: SessionItem) => {
    const newName = prompt(`Rename session "${session.sessionName}" to:`, session.sessionName);
    if (!newName || newName.trim() === session.sessionName) return;

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, sessionName: newName.trim() }),
      });
      if (res.ok) {
        showNotification(`Session renamed to ${newName.trim()}`);
        fetchSessions();
      }
    } catch (err) {
      alert('Error renaming session');
    }
  };

  const openEditTerm = (term: TermItem, sessionName: string) => {
    setEditingTerm({ term, sessionName });
    setTermStartDate(term.startDate);
    setTermEndDate(term.endDate);
    setTermIsCurrent(term.isCurrent);
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm?.term.id) return;

    setSavingTerm(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termId: editingTerm.term.id,
          startDate: termStartDate,
          endDate: termEndDate,
          isCurrentTerm: termIsCurrent,
        }),
      });

      if (res.ok) {
        showNotification(`${editingTerm.term.name} calendar dates updated!`);
        setEditingTerm(null);
        fetchSessions();
      }
    } catch (err) {
      alert('Error saving term updates');
    } finally {
      setSavingTerm(false);
    }
  };

  const toggleResultRelease = async (sessionId: string, termNumber: number, termId?: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    const targetTerm = targetSession?.terms.find((t) => t.termNumber === termNumber);
    if (!targetTerm) return;

    const nextState = !targetTerm.resultsReleased;

    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          terms: s.terms.map((t) => (t.termNumber === termNumber ? { ...t, resultsReleased: nextState } : t)),
        };
      })
    );

    showNotification(
      `${targetTerm.name} (${targetSession?.sessionName}) results are now ${
        nextState ? 'RELEASED to all student portals' : 'WITHHELD / LOCKED from student view'
      }!`
    );

    try {
      await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termId: termId || targetTerm.id, resultsReleased: nextState }),
      });
    } catch (err) {
      console.warn('Persist error:', err);
    }
  };

  const handleCreateNewSession = async () => {
    const sessionYear = prompt('Enter New Academic Session (e.g. 2026/2027):', '2026/2027');
    if (!sessionYear) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName: sessionYear, isCurrentSession: true }),
      });
      if (res.ok) {
        showNotification(`Academic Session ${sessionYear} initialized in database!`);
        fetchSessions();
      }
    } catch (err) {
      alert('Error creating session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Session &amp; Results Governor
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Academic Sessions &amp; Terminal Release Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish or withhold terminal report cards across the student and parent portal. Locked terms cannot be viewed by students.
          </p>
        </div>

        <button
          onClick={handleCreateNewSession}
          disabled={creating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{creating ? 'Initializing...' : 'Add Academic Session'}</span>
        </button>
      </div>

      {/* Loading & Sessions list */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading academic sessions from database...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center bg-[#111C33] border border-[#1E2E50] rounded-2xl p-8">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-white font-bold text-sm">No Academic Sessions in Database</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Initialize an academic session to manage terms, release examination broadsheets, and lock results.
          </p>
          <button
            onClick={handleCreateNewSession}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            <Plus className="w-4 h-4" /> Create First Session
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`rounded-2xl border p-6 transition ${
                sess.isCurrentSession
                  ? 'bg-[#111C33] border-emerald-500/40 shadow-lg'
                  : 'bg-[#0D1527] border-[#1E2E50]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#1E2E50] gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      sess.isCurrentSession
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white">
                        {sess.sessionName} Academic Session
                      </h2>
                      {sess.isCurrentSession && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          CURRENT ACTIVE SESSION
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      3 Institutional Terms: First, Second, and Promotional Third Term
                    </p>
                  </div>
                </div>

                {/* Session Level Actions */}
                <div className="flex items-center gap-2">
                  {!sess.isCurrentSession ? (
                    <button
                      onClick={() => handleSetActiveSession(sess)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Set as Active Session</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleRenameSession(sess)}
                    title="Rename Session"
                    className="p-1.5 rounded-lg bg-[#182645] hover:bg-[#21355E] text-slate-300 hover:text-white border border-[#273B66] text-xs transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSession(sess)}
                    title="Delete Session"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sess.terms.map((t) => (
                  <div
                    key={t.termNumber}
                    className={`rounded-xl border p-4.5 flex flex-col justify-between ${
                      t.isCurrent
                        ? 'bg-[#152342] border-emerald-500/40 shadow-sm'
                        : 'bg-[#0A101D] border-[#1B2945]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.isCurrent
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : t.status === 'Completed'
                              ? 'bg-slate-700/50 text-slate-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {t.isCurrent ? 'ACTIVE TERM' : t.status.toUpperCase()}
                        </span>

                        {t.resultsReleased ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <Unlock className="w-3 h-3" /> Released
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white">{t.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {t.startDate ? `${t.startDate} — ${t.endDate}` : 'Dates not set yet'}
                          </p>
                        </div>
                        <button
                          onClick={() => openEditTerm(t, sess.sessionName)}
                          title="Edit Term Calendar Dates & Status"
                          className="p-1 rounded-md bg-[#162544] hover:bg-[#203660] text-slate-300 hover:text-emerald-400 transition border border-[#23355A]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1E2E50] space-y-2">
                      <button
                        onClick={() => toggleResultRelease(sess.id, t.termNumber, t.id)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          t.resultsReleased
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
                        }`}
                      >
                        {t.resultsReleased ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Lock / Withhold Results</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Publish Results to Students</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Term Modal */}
      {editingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingTerm(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Configure {editingTerm.term.name}
                </h3>
                <p className="text-xs text-slate-400">{editingTerm.sessionName} Academic Calendar</p>
              </div>
            </div>

            <form onSubmit={handleSaveTerm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Resumption / Start Date
                </label>
                <input
                  type="date"
                  required
                  value={termStartDate}
                  onChange={(e) => setTermStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vacation / End Date
                </label>
                <input
                  type="date"
                  required
                  value={termEndDate}
                  onChange={(e) => setTermEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-[#0D1527] p-3 rounded-xl border border-[#213357]">
                  <input
                    type="checkbox"
                    checked={termIsCurrent}
                    onChange={(e) => setTermIsCurrent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded bg-[#111C33] border-slate-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Mark as Currently Active Term</span>
                    <span className="text-[10px] text-slate-400 block">
                      Enables CA score entries and attendance roll calls for this term.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTerm(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTerm}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingTerm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Term Dates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
