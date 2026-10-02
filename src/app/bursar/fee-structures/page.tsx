'use client';

import { useState } from 'react';
import {
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Copy,
  Plus,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface FeeStructure {
  level: string;
  category: string;
  tuitionFee: number;
  developmentLevy: number;
  totalStandardFee: number;
  description: string;
}

import { useEffect } from 'react';

export default function BursarFeeStructuresPage() {
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: 'Jaiz Bank Plc',
    accountName: 'MSSN Islamic Model Schools Akure - Operations',
    accountNumber: '0012345678',
  });

  useEffect(() => {
    fetch('/api/cms/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setBankDetails({
            bankName: data.settings.bank_name || 'Jaiz Bank Plc',
            accountName: data.settings.account_name || 'MSSN Islamic Model Schools Akure - Operations',
            accountNumber: data.settings.account_number || '0012345678',
          });
        }
      })
      .catch((err) => console.warn('Bank details load error:', err));
  }, []);

  const structures: FeeStructure[] = [
    {
      level: 'Senior Secondary Science (SS 1 - SS 3)',
      category: 'Secondary',
      tuitionFee: 50000,
      developmentLevy: 5000,
      totalStandardFee: 55000,
      description: 'Includes biology, chemistry, and physics laboratory consumables and technical materials.',
    },
    {
      level: 'Senior Secondary Arts & Humanities (SS 1 - SS 3)',
      category: 'Secondary',
      tuitionFee: 45000,
      developmentLevy: 5000,
      totalStandardFee: 50000,
      description: 'Includes Islamic studies literature, Arabic materials, and humanities library access.',
    },
    {
      level: 'Junior Secondary (JSS 1 - JSS 3)',
      category: 'Secondary',
      tuitionFee: 43000,
      developmentLevy: 5000,
      totalStandardFee: 48000,
      description: 'Covers Basic Science & Tech practicals, introductory Arabic, and computer lab access.',
    },
    {
      level: 'Primary Education (Basic 1 - Basic 6)',
      category: 'Primary',
      tuitionFee: 38000,
      developmentLevy: 4000,
      totalStandardFee: 42000,
      description: 'Includes literacy, numeracy, foundation Quran memorization, and continuous assessment.',
    },
    {
      level: 'Nursery & Early Years (Creche, KG 1 - KG 2)',
      category: 'Early Years',
      tuitionFee: 35000,
      developmentLevy: 3500,
      totalStandardFee: 38500,
      description: 'Includes early childhood sensory equipment, activity kits, and specialized care supervision.',
    },
  ];

  const copyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Official School Fee Structures &amp; Tariffs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Approved 2025/2026 academic session fee tariffs across Senior, Junior, Primary, and Early Years.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Governing Board Approved
        </div>
      </div>

      {/* Official School Account Card */}
      <div className="bg-[#111C33] border border-[#1E2E50] text-white p-6 sm:p-7 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Official Central Deposit Account
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {bankDetails.bankName} • {bankDetails.accountName}
            </h2>
            <p className="text-xs text-slate-400">
              Account Narration Format: <code className="bg-[#0D1527] px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px] border border-[#203258]">[Student Name] [Admission Number]</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-xl bg-[#0D1527] border border-[#203258] text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{bankDetails.accountNumber}</span>
            </div>
            <button
              onClick={copyAccount}
              className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-900/30"
              title="Copy Account Number"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
        {copied && (
          <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Account number copied to clipboard!
          </div>
        )}
      </div>

      {/* Main Standard Fee Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#1E2E50] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Termly Tuition &amp; Compulsory Academic Levies
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Regular term rates invoiced to enrolled students</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            5 Academic Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0E172A] border-b border-[#1E2E50] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">Academic Grade / Level</th>
                <th className="py-3.5 px-4 text-right">Tuition Fee (₦)</th>
                <th className="py-3.5 px-4 text-right">Dev &amp; PTA (₦)</th>
                <th className="py-3.5 px-4 text-right">Total Per Term (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A284A]">
              {structures.map((s, idx) => (
                <tr key={idx} className="hover:bg-[#152340] transition">
                  <td className="py-4 px-4">
                    <strong className="block text-white text-xs font-bold">{s.level}</strong>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{s.description}</span>
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-slate-300">
                    ₦{s.tuitionFee.toLocaleString()}.00
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-slate-300">
                    ₦{s.developmentLevy.toLocaleString()}.00
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-black text-sm text-emerald-400">
                    ₦{s.totalStandardFee.toLocaleString()}.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
