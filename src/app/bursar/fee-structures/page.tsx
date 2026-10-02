'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Tag,
  CreditCard,
  School,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';
import { LevelFeeStructure, BankAccountConfig, FeeLevy } from '@/app/api/bursar/fee-structures/route';

export default function BursarFeeStructuresPage() {
  const [structures, setStructures] = useState<LevelFeeStructure[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Record<string, BankAccountConfig>>({});
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/bursar/fee-structures');
      const data = await res.json();
      if (data.success) {
        if (data.structures) setStructures(data.structures);
        if (data.bankAccounts) setBankAccounts(data.bankAccounts);
      }
    } catch (err) {
      console.error('Failed to load fee structures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyAccount = (key: string, accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Approved School Fee Tariffs &amp; Designated Bank Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official financial schedules and payment accounts for Early Years, Primary, and Secondary wings.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Governing Board Approved • Locked
        </div>
      </div>

      {/* Internal Control & Anti-Tampering Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-0.5">Internal Financial Control Policy (Read-Only Access for Bursary)</p>
          <p className="text-amber-200/90 leading-relaxed">
            School bank accounts and approved fee tariffs are configured and strictly locked by the Super Administrator / Governing Board. Bursars have read-only access to verify official rates and copy designated payment details for parents and students.
          </p>
        </div>
      </div>

      {/* Separate Bank Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Official Collection Accounts (Separate Primary &amp; Secondary)
          </h2>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" /> Locked by Super Admin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(bankAccounts).map(([key, acc]) => {
            const isPrimary = key === 'primary';
            return (
              <div
                key={key}
                className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPrimary
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isPrimary ? 'PRI' : 'SEC'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.sectionName}</h3>
                      <p className="text-[10px] text-slate-400">{acc.status}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[9px] font-bold border border-slate-700 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Board Locked
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1E2E50] text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Bank Name</span>
                    <span className="text-white font-semibold">{acc.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Account Name</span>
                    <span className="text-slate-200 font-medium text-right truncate max-w-[200px]">
                      {acc.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-[#0D1527] p-2.5 rounded-xl border border-[#1B2945]">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">
                        Account Number
                      </span>
                      <span className="text-emerald-400 font-mono font-black text-sm tracking-wider">
                        {acc.accountNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => copyAccount(key, acc.accountNumber)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#15223E] hover:bg-[#1E2E50] text-slate-300 hover:text-white font-bold text-[11px] transition shadow-xs"
                      title="Copy account number for parent"
                    >
                      {copiedKey === key ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Levy Structures Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Approved Academic Tariffs &amp; Priority Clearance Schedule
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              During partial payments, system clears levies in ascending priority order (Priority 1 clears first).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {structures.map((s) => (
            <div
              key={s.levelId}
              className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Structure Header */}
              <div className="p-5 bg-[#0D1527] border-b border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        {s.levelName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                        {s.wing}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total Session Tariff
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    ₦{s.totalFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Levies Breakdown Table */}
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E2E50] text-[10px] uppercase font-bold text-slate-400">
                        <th className="pb-3 pl-1">Priority Order</th>
                        <th className="pb-3">Levy / Fee Description</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3 text-right">Official Tariff (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2E50]/60">
                      {s.levies.map((levy, index) => (
                        <tr key={levy.id} className="hover:bg-[#15223E]/50 transition">
                          <td className="py-3 pl-1">
                            <span className="w-5 h-5 rounded-full bg-[#15223E] border border-[#223356] text-[10px] font-mono font-bold flex items-center justify-center text-slate-300">
                              {levy.priority || index + 1}
                            </span>
                          </td>

                          <td className="py-3 font-semibold text-white">
                            <span>{levy.name}</span>
                          </td>

                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              levy.category === 'essential'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : levy.category === 'academic'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                                : levy.category === 'facility'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            }`}>
                              {levy.category}
                            </span>
                          </td>

                          <td className="py-3 text-right font-mono font-bold text-slate-200">
                            <span>₦{Number(levy.amount || 0).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#1E2E50] text-xs font-bold text-white bg-[#0D1527]/50">
                        <td colSpan={3} className="py-3 pl-2 text-slate-300 font-bold uppercase text-[10px]">
                          Grand Total Tariff per Student
                        </td>
                        <td className="py-3 text-right font-mono font-black text-emerald-400 text-sm">
                          ₦{s.totalFee.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
