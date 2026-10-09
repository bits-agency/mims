'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  Printer,
  Copy,
  CheckCircle2,
  Phone,
  Receipt,
  CheckCircle,
  Inbox,
  Sparkles
} from 'lucide-react';

export default function BursarDefaultersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeWing, setActiveWing] = useState<'all' | 'primary' | 'secondary'>('all');
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState<'first' | 'second' | 'third' | 'all'>('first');
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // 2. Load defaulters filtered by active wing, session, and term
  useEffect(() => {
    async function loadDefaulters() {
      setLoading(true);
      try {
        const wingParam = activeWing !== 'all' ? `wing=${activeWing}` : '';
        const sessionParam = `session=${selectedSession}`;
        const termParam = selectedTerm !== 'all' ? `term=${selectedTerm}` : '';
        const query = [wingParam, sessionParam, termParam].filter(Boolean).join('&');
        const res = await fetch(`/api/bursar/defaulters${query ? `?${query}` : ''}`);
        const data = await res.json();
        if (data?.success && data.defaulters) {
          setDefaulters(data.defaulters);
        }
      } catch (err) {
        console.error('Failed to load defaulters:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDefaulters();
  }, [activeWing, selectedSession, selectedTerm]);

  const filtered = defaulters.filter((d) => {
    const studentName = `${d.students?.firstname || ''} ${d.students?.lastname || ''}`.toLowerCase();
    const admNo = (d.students?.admission_no || '').toLowerCase();
    const guardian = (d.students?.guardian_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return studentName.includes(q) || admNo.includes(q) || guardian.includes(q);
  });

  const totalOutstanding = filtered.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

  const handleCopyNotice = (item: any) => {
    const name = `${item.students?.firstname || ''} ${item.students?.lastname || ''}`;
    const parentName = item.students?.guardian_name || 'Parent/Guardian';
    const admNo = item.students?.admission_no || '';
    const balance = Number(item.balance || 0).toLocaleString();
    const itemTerm = item.term || (selectedTerm !== 'all' ? selectedTerm : 'first');
    const termLabel =
      itemTerm === 'first'
        ? '1st Term'
        : itemTerm === 'second'
        ? '2nd Term'
        : '3rd Term';
    const sess = item.session || selectedSession;

    const notice = `Dear ${parentName}, this is a gentle reminder from MSSN Islamic Model Schools Akure Bursary. Your child, ${name} (${admNo}), has an outstanding balance of ₦${balance}.00 for ${termLabel} (${sess}). Please settle this balance to allow academic report card access. Remit directly to the official school bank account with the student's admission number as narration. Jazakallahu Khairan.`;

    navigator.clipboard.writeText(notice);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {activeWing === 'primary'
              ? 'Nursery & Primary Defaulters Desk'
              : activeWing === 'secondary'
              ? 'Secondary College & Boarding Defaulters'
              : 'Consolidated Defaulters Broadsheet (All Campuses)'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Debtors &amp; Fee Defaulters Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live database view of students with outstanding balances whose academic results remain locked for{' '}
            <strong className="text-white">
              {selectedTerm === 'all'
                ? 'All Terms'
                : selectedTerm === 'first'
                ? '1st Term'
                : selectedTerm === 'second'
                ? '2nd Term'
                : '3rd Term'}{' '}
              ({selectedSession})
            </strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Session Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1120] border border-[#1E2E50]">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="2025/2026" className="bg-[#0D1527] text-white">2025/2026</option>
              <option value="2024/2025" className="bg-[#0D1527] text-white">2024/2025</option>
            </select>
          </div>

          {/* Term Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A1120] border border-[#1E2E50]">
            <button
              type="button"
              onClick={() => setSelectedTerm('first')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedTerm === 'third'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3rd Term
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedTerm === 'all'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>

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

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-200 font-bold text-xs transition border border-[#23355A] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" /> Print Debtors Broadsheet
          </button>
        </div>
      </div>

      {/* Financial Warning Summary Card */}
      <div className="p-6 rounded-2xl bg-[#111C33] border border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
            Total Outstanding Balance in Database
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            ₦{totalOutstanding.toLocaleString()}.00
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across <strong className="text-white">{filtered.length} students</strong> with pending fee clearance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bursar/payments"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Record Settlement
          </Link>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, admission number, or guardian name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D1527] border border-[#213357] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4">Student Profile</th>
                  <th className="py-3.5 px-4">Parent / Guardian</th>
                  <th className="py-3.5 px-4">Class Arm</th>
                  <th className="py-3.5 px-4">Billing Term</th>
                  <th className="py-3.5 px-4">Billed</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A284A]">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#152340] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">
                        {row.students?.firstname} {row.students?.lastname}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-400">
                        {row.students?.admission_no}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {row.students?.guardian_name || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" /> {row.students?.guardian_phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {row.students?.classes?.class_name} {row.students?.classes?.section}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#101A2F] border border-[#1C2C4E] text-slate-300 font-mono">
                        {row.term === 'first' ? '1st Term' : row.term === 'second' ? '2nd Term' : row.term === 'third' ? '3rd Term' : selectedTerm !== 'all' ? selectedTerm : '1st Term'} ({row.session || selectedSession})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₦{Number(row.total_billed).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₦{Number(row.total_paid).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-rose-400">
                      ₦{Number(row.balance).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/bursar/payments?student=${row.students?.admission_no || ''}&session=${row.session || selectedSession}&term=${row.term || (selectedTerm !== 'all' ? selectedTerm : 'first')}`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-xs"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Clear
                        </Link>
                        <button
                          onClick={() => handleCopyNotice(row)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                            copiedId === row.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#182645] hover:bg-[#203259] text-slate-200 border-[#23355A]'
                          }`}
                        >
                          {copiedId === row.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Notice
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center text-slate-400 space-y-3">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-400" />
            <h4 className="text-xs font-bold text-white">All Clear — No Fee Defaulters</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              There are currently no students with outstanding balances in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
