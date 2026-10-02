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
  Inbox
} from 'lucide-react';

export default function BursarDefaultersPage() {
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDefaulters() {
      try {
        const res = await fetch('/api/bursar/defaulters');
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
  }, []);

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

    const notice = `Dear ${parentName}, this is a gentle reminder from MSSN Islamic Model Schools Akure Bursary. Your child, ${name} (${admNo}), has an outstanding balance of ₦${balance}.00. Please settle this balance to allow academic report card access. Bank: Jaiz Bank Plc | Acct: 0012345678. Jazakallahu Khairan.`;

    navigator.clipboard.writeText(notice);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Debtors &amp; Fee Defaulters Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live database view of students with outstanding balances whose academic results remain locked.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-200 font-bold text-xs transition border border-[#23355A] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" /> Print Debtors Broadsheet
        </button>
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
                  <th className="py-3.5 px-4">Billed</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4 text-right">Dispatch Notice</th>
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
                      <button
                        onClick={() => handleCopyNotice(row)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto border ${
                          copiedId === row.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-[#182645] hover:bg-[#203259] text-slate-200 border-[#23355A]'
                        }`}
                      >
                        {copiedId === row.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Notice
                          </>
                        )}
                      </button>
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
