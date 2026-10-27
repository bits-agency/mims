'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Building,
  ShieldCheck,
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  Inbox,
  Layers,
  PieChart,
  Printer,
  BookOpen,
  Laptop,
  Stethoscope
} from 'lucide-react';

interface LevyCategoryStat {
  name: string;
  billed: number;
  collected: number;
  outstanding: number;
  percentage: number;
}

interface ItemizedLevy {
  id: string;
  name: string;
  category: string;
  billed: number;
  collected: number;
  outstanding: number;
  percentage: number;
}

interface BursarStats {
  totalCollected: number;
  totalBilled: number;
  totalOutstanding: number;
  clearanceRate: number;
  clearedCount: number;
  defaulterCount: number;
  paymentsCount: number;
  categoryBreakdown?: Record<string, LevyCategoryStat>;
  itemizedLevies?: ItemizedLevy[];
}

export default function BursarDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeWing, setActiveWing] = useState<'all' | 'primary' | 'secondary'>('all');
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState<'first' | 'second' | 'third' | 'all'>('first');
  const [stats, setStats] = useState<BursarStats>({
    totalCollected: 0,
    totalBilled: 0,
    totalOutstanding: 0,
    clearanceRate: 0,
    clearedCount: 0,
    defaulterCount: 0,
    paymentsCount: 0,
    categoryBreakdown: undefined,
    itemizedLevies: [],
  });

  const [recentTellers, setRecentTellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load user profile to detect assigned wing
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

  // 2. Load stats & tellers filtered by active wing, session, and term
  useEffect(() => {
    async function loadBursarData() {
      setLoading(true);
      try {
        const wingParam = activeWing !== 'all' ? `wing=${activeWing}` : '';
        const sessionParam = `session=${selectedSession}`;
        const termParam = selectedTerm !== 'all' ? `term=${selectedTerm}` : '';
        const query = [wingParam, sessionParam, termParam].filter(Boolean).join('&');
        const qStr = query ? `?${query}` : '';

        const [statsRes, paymentsRes] = await Promise.all([
          fetch(`/api/bursar/stats${qStr}`).then((r) => r.json()).catch(() => null),
          fetch(`/api/bursar/payments${qStr}`).then((r) => r.json()).catch(() => null),
        ]);

        if (statsRes?.success) {
          setStats({
            totalCollected: statsRes.totalCollected || 0,
            totalBilled: statsRes.totalBilled || 0,
            totalOutstanding: statsRes.totalOutstanding || 0,
            clearanceRate: statsRes.clearanceRate || 0,
            clearedCount: statsRes.clearedCount || 0,
            defaulterCount: statsRes.defaulterCount || 0,
            paymentsCount: statsRes.paymentsCount || 0,
            categoryBreakdown: statsRes.categoryBreakdown,
            itemizedLevies: statsRes.itemizedLevies || [],
          });
        }

        if (paymentsRes?.success && paymentsRes.payments) {
          setRecentTellers(paymentsRes.payments);
        }
      } catch (err) {
        console.error('Error loading bursar dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBursarData();
  }, [activeWing, selectedSession, selectedTerm]);

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {activeWing === 'primary'
              ? 'Nursery & Primary Bursary Desk'
              : activeWing === 'secondary'
              ? 'Secondary College & Boarding Bursary Desk'
              : 'Consolidated Bursary Desk (All Campuses)'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Revenue &amp; Fee Clearance Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live database dashboard: Track tuition collections, log incoming tellers, and issue stamped clearance receipts for{' '}
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
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

          {/* Interactive Wing Switcher for Chief Bursar / All-Wings Admin */}
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
              href="/bursar/payments"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Record Payment
            </Link>
            <Link
              href="/bursar/defaulters"
              className="px-4 py-2.5 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-300 font-bold text-xs border border-[#23375E] transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Defaulters ({stats.defaulterCount})
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Term Revenue Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
              ₦
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₦{stats.totalCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {stats.clearanceRate}% of Term Target
          </p>
        </div>

        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Outstanding Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">
            ₦{stats.totalOutstanding.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {stats.defaulterCount} Defaulters pending clearance
          </p>
        </div>

        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Verified Tellers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
              ₦
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats.paymentsCount}</div>
          <p className="text-[11px] text-blue-400 font-medium mt-1">
            Reconciled payments this session
          </p>
        </div>

        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Clearance Ratio
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {stats.clearedCount} Cleared
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {stats.clearanceRate}% Permitted to view results
          </p>
        </div>
      </div>

      {/* Middle Row: Grand Collection Analytics Bar & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comprehensive Collection Analytics (2 cols) */}
        <div className="lg:col-span-2 bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-white">
                Revenue Collection Progress
              </h3>
              <p className="text-xs text-slate-400">
                Target: ₦{stats.totalBilled.toLocaleString()} • Invoiced Across Enrolled Students
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold self-start sm:self-auto">
              {stats.clearanceRate}% Realized
            </span>
          </div>

          {/* Master Unified Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Overall Realization</span>
              <span className="font-mono text-emerald-400">
                ₦{stats.totalCollected.toLocaleString()} / ₦{stats.totalBilled.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-[#0D1527] rounded-xl h-4 overflow-hidden p-0.5 border border-[#1E2E50]">
              <div
                style={{ width: `${Math.min(100, stats.clearanceRate)}%` }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg h-full transition-all duration-700"
              />
            </div>

            {/* Clean Breakdown Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Billed</div>
                <div className="font-bold text-white mt-1">₦{stats.totalBilled.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">100% Invoiced</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Collected</div>
                <div className="font-bold text-white mt-1">₦{stats.totalCollected.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400">{stats.clearanceRate}% Cleared</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</div>
                <div className="font-bold text-white mt-1">₦{stats.totalOutstanding.toLocaleString()}</div>
                <div className="text-[10px] text-rose-400">{stats.defaulterCount} Defaulters</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                <div className="font-bold text-emerald-400 mt-1">Live Database</div>
                <div className="text-[10px] text-slate-400">Synced with Supabase</div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Banking Card (1 col) */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white">Central Deposit Particulars</h3>
              <Building className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">Nursery &amp; Primary Wing</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">PRI</span>
                </div>
                <span className="text-xs font-bold text-white block">MSSN Islamic Model Primary School</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5 block">Official Commercial Bank</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Secondary College Wing</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">SEC</span>
                </div>
                <span className="text-xs font-bold text-white block">MSSN Islamic Model College - Secondary</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5 block">Official Commercial Bank</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2E50] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Board-locked operational accounts</span>
            <Link href="/bursar/fee-structures" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
              View Tariffs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Itemized Revenue Breakdown by Tariff & Levies (Tuition alone, Medicals alone, Exams alone, etc.) */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2E50] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <PieChart className="w-3.5 h-3.5" />
              Itemized Revenue Breakdown &amp; Sub-Account Ledger
            </div>
            <h3 className="font-bold text-base text-white">
              Revenue Realization by Fee &amp; Tariff Classification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact Naira allocation across Tuition alone, Medicals alone, External/Internal Exam levies, ICT Labs, Campus Maintenance, and Islamic instruction.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-[#0D1527] hover:bg-[#15223E] text-slate-300 hover:text-white border border-[#203258] text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Breakdown</span>
            </button>
            <Link
              href="/bursar/fee-structures"
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View Tariffs</span>
            </Link>
          </div>
        </div>

        {/* 7 Key Account Cards */}
        {stats.categoryBreakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 1. Tuition alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Tuition Fees Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {stats.categoryBreakdown.tuition.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.tuition.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.tuition.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.tuition.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.tuition.percentage)}%` }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 2. Medicals alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Medical Screening Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {stats.categoryBreakdown.medical.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.medical.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.medical.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.medical.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.medical.percentage)}%` }}
                  className="bg-rose-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 3. Examination & Assessment alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1">
                    <Receipt className="w-3 h-3" /> Exams (WAEC/NECO/BECE) Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {stats.categoryBreakdown.exams.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.exams.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.exams.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.exams.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.exams.percentage)}%` }}
                  className="bg-blue-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 4. ICT & Science Labs alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                    <Laptop className="w-3 h-3" /> ICT &amp; Science Labs Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {stats.categoryBreakdown.ict_lab.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.ict_lab.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.ict_lab.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.ict_lab.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.ict_lab.percentage)}%` }}
                  className="bg-cyan-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 5. Campus Development & Maintenance alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Campus Development Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {stats.categoryBreakdown.development.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.development.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.development.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.development.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.development.percentage)}%` }}
                  className="bg-amber-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 6. Tahfeez & Quranic Studies alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Tahfeez &amp; Quran Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {stats.categoryBreakdown.tahfeez.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.tahfeez.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.tahfeez.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.tahfeez.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.tahfeez.percentage)}%` }}
                  className="bg-teal-500 h-full rounded-full"
                />
              </div>
            </div>

            {/* 7. Montessori & Valedictory alone */}
            <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Montessori &amp; Exit Alone
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {stats.categoryBreakdown.activities.percentage}%
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  ₦{stats.categoryBreakdown.activities.collected.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Invoiced:</span>
                  <span className="font-mono text-slate-300">₦{stats.categoryBreakdown.activities.billed.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono text-rose-400">₦{stats.categoryBreakdown.activities.outstanding.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full bg-[#111C33] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  style={{ width: `${Math.min(100, stats.categoryBreakdown.activities.percentage)}%` }}
                  className="bg-purple-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Itemized Ledger Table */}
        {stats.itemizedLevies && stats.itemizedLevies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1E2E50]">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>Item-by-Item Fee Realization Ledger</span>
              <span className="text-[10px] text-slate-400 font-normal font-mono">
                {stats.itemizedLevies.length} fee items defined
              </span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Levy Name</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                    <th className="py-2.5 px-3 text-right">Total Collected</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-right">Realization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A284A]">
                  {stats.itemizedLevies.map((item) => (
                    <tr key={item.id} className="hover:bg-[#152340] transition">
                      <td className="py-2.5 px-3 font-semibold text-white">{item.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        ₦{item.billed.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                        ₦{item.collected.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        ₦{item.outstanding.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid: Recent Tellers & Receipts */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-white">Recent Payment Receipts</h3>
            <p className="text-xs text-slate-400">Live electronic teller stream from database</p>
          </div>
          <Link
            href="/bursar/payments"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Record Payment <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-3">Receipt No</th>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Channel / Method</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A284A]">
                {recentTellers.map((item) => (
                  <tr key={item.id} className="hover:bg-[#152340] transition">
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{item.receipt_no}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {item.students?.firstname} {item.students?.lastname}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      ₦{Number(item.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.method}</td>
                    <td className="py-3 px-3 text-slate-400">{item.payment_date}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="text-xs font-bold text-white">No Payment Records Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Payments logged through the Bursar Payment Desk will appear here in real-time.
            </p>
            <Link
              href="/bursar/payments"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              Record First Payment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
