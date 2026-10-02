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
  Inbox
} from 'lucide-react';

interface BursarStats {
  totalCollected: number;
  totalBilled: number;
  totalOutstanding: number;
  clearanceRate: number;
  clearedCount: number;
  defaulterCount: number;
  paymentsCount: number;
}

export default function BursarDashboardPage() {
  const [stats, setStats] = useState<BursarStats>({
    totalCollected: 0,
    totalBilled: 0,
    totalOutstanding: 0,
    clearanceRate: 0,
    clearedCount: 0,
    defaulterCount: 0,
    paymentsCount: 0,
  });

  const [recentTellers, setRecentTellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBursarData() {
      try {
        const [statsRes, paymentsRes] = await Promise.all([
          fetch('/api/bursar/stats').then((r) => r.json()).catch(() => null),
          fetch('/api/bursar/payments').then((r) => r.json()).catch(() => null),
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
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Bursary Financial Operations
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Revenue &amp; Fee Clearance Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live database dashboard: Track tuition collections, log incoming tellers, and issue stamped clearance receipts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/bursar/payments"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Record New Payment
          </Link>
          <Link
            href="/bursar/defaulters"
            className="px-4 py-2.5 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-300 font-bold text-xs border border-[#23375E] transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Defaulters ({stats.defaulterCount})
          </Link>
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
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Name</span>
                <span className="text-xs font-bold text-white mt-0.5 block">Jaiz Bank Plc</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Name</span>
                <span className="text-xs font-bold text-white mt-0.5 block">MSSN Islamic Model Schools Akure</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">0012345678</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2E50] text-[10px] text-slate-400">
            NIP instant settlement auto-credits student fee ledger upon receipt verification.
          </div>
        </div>
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
