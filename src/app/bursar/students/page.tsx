'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  CreditCard,
  Inbox
} from 'lucide-react';

export default function BursarStudentsLedgerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeWing, setActiveWing] = useState<'all' | 'primary' | 'secondary'>('all');
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState<'first' | 'second' | 'third'>('first');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Cleared' | 'Owing'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch current user to determine default wing
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          if (data.user.wing === 'primary') {
            setActiveWing('primary');
          } else if (data.user.wing === 'secondary') {
            setActiveWing('secondary');
          }
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load students filtered by active wing
  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const wingParam = activeWing !== 'all' ? `?wing=${activeWing}` : '';
        const res = await fetch(`/api/admin/students${wingParam}`);
        const data = await res.json();
        if (data?.success && data.students) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Failed to load students ledger:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [activeWing]);

  // Helper to extract clearance status for a student for the active session & term
  const getStudentClr = (std: any) => {
    const clrs = std.student_fee_clearance || [];
    const found = clrs.find(
      (c: any) => (c.session || '2025/2026') === selectedSession && (c.term || 'first') === selectedTerm
    );
    const billed = Number(found?.total_billed || 55000);
    const paid = Number(found?.total_paid || 0);
    const balance = Math.max(0, billed - paid);
    const isCleared = found?.is_cleared ?? (balance === 0 && billed > 0);
    return { billed, paid, balance, isCleared };
  };

  const filteredStudents = students.filter((student) => {
    const name = `${student.firstname || ''} ${student.lastname || ''}`.toLowerCase();
    const admNo = (student.admission_no || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || admNo.includes(q);

    const clr = getStudentClr(student);
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Cleared'
        ? clr.isCleared
        : !clr.isCleared;

    return matchesSearch && matchesStatus;
  });

  const clearedCount = students.filter((s) => getStudentClr(s).isCleared).length;
  const owingCount = students.length - clearedCount;

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            {activeWing === 'primary'
              ? 'Nursery & Primary Wing Ledger'
              : activeWing === 'secondary'
              ? 'Secondary College & Boarding Ledger'
              : 'Consolidated Fee Ledger (All Campuses)'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Master Student Fee Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live database records, debt tracking, and fee-gated academic clearance status for{' '}
            <strong className="text-white">
              {selectedTerm === 'first' ? '1st Term' : selectedTerm === 'second' ? '2nd Term' : '3rd Term'} ({selectedSession})
            </strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Wing Switcher for Chief Bursar */}
          {(currentUser?.wing === 'all' || !currentUser?.wing) && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A1120] border border-[#1E2E50]">
              <button
                type="button"
                onClick={() => setActiveWing('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeWing === 'all'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Wings
              </button>
              <button
                type="button"
                onClick={() => setActiveWing('primary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeWing === 'primary'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => setActiveWing('secondary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeWing === 'secondary'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Secondary
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/bursar/defaulters"
              className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Defaulters Broadsheet
            </Link>

            <Link
              href="/bursar/payments"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Log Payment
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-4">
        {/* Term & Session Switcher Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2E50] gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-[#0D1527] border border-[#213357] rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
            >
              <option value="2025/2026">2025/2026 Session</option>
              <option value="2024/2025">2024/2025 Session</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1120] border border-[#1E2E50]">
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Term:</span>
            <button
              type="button"
              onClick={() => setSelectedTerm('first')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedTerm === 'first'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1st Term
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('second')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedTerm === 'second'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2nd Term
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('third')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedTerm === 'third'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3rd Term
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1.5">
              Financial Status Filter ({selectedTerm === 'first' ? '1st Term' : selectedTerm === 'second' ? '2nd Term' : '3rd Term'})
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#0D1527] border border-[#213357] rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Student Accounts</option>
              <option value="Cleared">Fully Cleared (₦0.00 Balance)</option>
              <option value="Owing">Owing Balance / Defaulters</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D1527] border border-[#213357] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger Statistics summary pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2E50] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Displaying:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0D1527] text-slate-300 border border-[#213357] font-bold text-xs">
              {filteredStudents.length} Students
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {clearedCount} Cleared
            </span>
            <span className="flex items-center gap-1.5 font-bold text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> {owingCount} Owing
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Student Profile</th>
                  <th className="py-3.5 px-4">Class Arm</th>
                  <th className="py-3.5 px-4">Term Billed</th>
                  <th className="py-3.5 px-4">Total Paid</th>
                  <th className="py-3.5 px-4">Term Balance</th>
                  <th className="py-3.5 px-4">Clearance Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A284A]">
                {filteredStudents.map((std) => {
                  const clr = getStudentClr(std);

                  return (
                    <tr key={std.id} className="hover:bg-[#152340] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">
                          {std.firstname} {std.lastname}
                        </div>
                        <div className="font-mono text-[10px] text-emerald-400">
                          {std.admission_no}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {std.classes?.class_name} {std.classes?.section}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        ₦{clr.billed.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₦{clr.paid.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={clr.balance === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          ₦{clr.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {clr.isCleared ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Owing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/bursar/payments?student=${std.admission_no}&session=${selectedSession}&term=${selectedTerm}`}
                          className="px-3 py-1.5 rounded-lg bg-[#182645] hover:bg-[#203259] text-slate-200 text-xs font-bold transition border border-[#23355A]"
                        >
                          Credit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center text-slate-400 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="text-xs font-bold text-white">No Student Ledger Records for {selectedTerm === 'first' ? '1st Term' : selectedTerm === 'second' ? '2nd Term' : '3rd Term'}</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Students enrolled into classes will appear here with automated fee billing and clearance tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
