'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  AlertCircle,
  FileText,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  School,
  Lock
} from 'lucide-react';
import { LevelFeeStructure, BankAccountConfig, FeeLevy } from '@/app/api/bursar/fee-structures/route';
import { allocatePaymentToLevies } from '@/lib/bursary';

export default function StudentFeesPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [clearance, setClearance] = useState<{ isCleared: boolean; balance: number } | null>(null);
  const [feeStructures, setFeeStructures] = useState<LevelFeeStructure[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Record<string, BankAccountConfig>>({});

  useEffect(() => {
    async function loadFeeData() {
      setLoading(true);
      try {
        const [meRes, resRes, feeRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/students/results?session=2025/2026&term=first'),
          fetch('/api/bursar/fee-structures'),
        ]);

        const meData = await meRes.json();
        const resData = await resRes.json();
        const feeData = await feeRes.json();

        if (meData.authenticated && meData.user) {
          const profile = meData.user.profile;
          setStudent({
            fullName: meData.user.fullName || meData.user.username || 'Student Account',
            admissionNo: profile?.admission_no || 'MIMS/---',
            className: profile?.classes?.class_name
              ? `${profile.classes.class_name} ${profile.classes.section ? `(${profile.classes.section})` : ''}`
              : 'Senior Secondary',
            rawClass: profile?.classes?.class_name || 'Senior Secondary',
          });
        }

        if (resData.success) {
          setClearance({
            isCleared: resData.isCleared ?? true,
            balance: resData.balance ?? 0,
          });
        }

        if (feeData.success) {
          if (feeData.structures) setFeeStructures(feeData.structures);
          if (feeData.bankAccounts) setBankAccounts(feeData.bankAccounts);
        }
      } catch (err) {
        console.error('Failed to load student fee ledger:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeeData();
  }, []);

  // Determine Wing: Primary vs Secondary
  const classNameLower = (student?.className || '').toLowerCase();
  const isPrimaryWing =
    classNameLower.includes('primary') ||
    classNameLower.includes('nursery') ||
    classNameLower.includes('creche') ||
    classNameLower.includes('basic') ||
    classNameLower.includes('kg');

  const designatedAccountKey = isPrimaryWing ? 'primary' : 'secondary';
  const designatedAccount = bankAccounts[designatedAccountKey] || {
    sectionName: isPrimaryWing ? 'Nursery & Primary School Account' : 'Secondary School Account',
    bankName: 'Official Commercial Bank',
    accountName: isPrimaryWing
      ? 'MSSN Islamic Model Primary School'
      : 'MSSN Islamic Model College - Secondary Operations',
    accountNumber: 'To Be Stated by School Management',
    status: 'Official Designated School Account',
  };

  // Find fee structure for student's level (distinguishing candidate classes like SSS 3 & JSS 3)
  const matchedStructure =
    feeStructures.find((s) => {
      // SSS 3 Candidate Class (WAEC / NECO / NBAIS)
      if (classNameLower.includes('sss 3') || classNameLower.includes('sss3') || classNameLower.includes('ss 3') || classNameLower.includes('ss3')) {
        return s.levelId === 'sss-3-candidate' || s.levelName.includes('SSS 3');
      }
      // Continuing Senior Secondary (SSS 1 & SSS 2)
      if (classNameLower.includes('sss') || classNameLower.includes('senior')) {
        return s.levelId === 'senior-sec' || (s.wing === 'Senior Secondary' && !s.levelName.includes('SSS 3'));
      }
      // JSS 3 Candidate Class (BECE)
      if (classNameLower.includes('jss 3') || classNameLower.includes('jss3') || classNameLower.includes('js 3') || classNameLower.includes('js3')) {
        return s.levelId === 'jss-3-candidate' || s.levelName.includes('JSS 3');
      }
      // Continuing Junior Secondary (JSS 1 & JSS 2)
      if (classNameLower.includes('jss') || classNameLower.includes('junior')) {
        return s.levelId === 'junior-sec' || (s.wing === 'Junior Secondary' && !s.levelName.includes('JSS 3'));
      }
      // Primary 5 Exit Class (Common Entrance)
      if (classNameLower.includes('primary 5') || classNameLower.includes('basic 5') || classNameLower.includes('pri 5')) {
        return s.levelId === 'primary-5-exit' || s.levelName.includes('Primary 5');
      }
      // Continuing Primary (Primary 1 - 4)
      if (classNameLower.includes('primary') || classNameLower.includes('basic')) {
        return s.levelId === 'primary' || (s.wing === 'Primary' && !s.levelName.includes('Primary 5'));
      }
      // Nursery & Early Years
      if (classNameLower.includes('nursery') || classNameLower.includes('creche') || classNameLower.includes('kg')) {
        return s.wing === 'Early Years';
      }
      return false;
    }) ||
    feeStructures[0] || {
      levelId: 'default',
      levelName: student?.className || 'Senior Secondary',
      wing: 'Senior Secondary',
      levies: [],
      totalFee: 0,
      description: 'Standard session fees',
    };

  const totalLevyFee = matchedStructure.totalFee || 0;
  const currentBalance = clearance?.balance ?? 0;
  const isFullyCleared = clearance?.isCleared ?? (currentBalance <= 0);
  const totalPaid = Math.max(0, totalLevyFee - currentBalance);

  // Allocate payment to levies according to institutional priority
  const allocation = allocatePaymentToLevies(matchedStructure.levies || [], totalPaid);
  const allocatedLevies = allocation.allocated;

  const copyToClipboard = () => {
    if (designatedAccount.accountNumber) {
      navigator.clipboard.writeText(designatedAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl w-full mx-auto font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/students/dashboard"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-bold text-slate-500">2025/2026 Academic Session</span>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading student financial ledger...</p>
        </div>
      ) : (
        <>
          {/* Status Clearance Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  OFFICIAL BURSARY CLEARANCE
                </span>
                <h1 className="text-2xl font-black text-slate-900">
                  {isFullyCleared ? 'Financial Clearance Approved' : 'Outstanding Balance Pending'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {student?.fullName} • Admission No:{' '}
                  <strong className="font-mono text-emerald-700">{student?.admissionNo}</strong> •{' '}
                  {student?.className}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    isFullyCleared
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isFullyCleared ? 'CLEARED (₦0.00)' : `OWING ₦${Number(currentBalance).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Clearance Standing</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {isFullyCleared
                    ? 'All academic tuition fees, examination levies, and school dues for the active academic term have been fully cleared by the Bursary department.'
                    : `You have an unsettled balance of ₦${Number(currentBalance).toLocaleString()}. Kindly finalize payment to unlock terminal examination broadsheets and report cards.`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Institutional Bank Policy</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  MSSN Islamic Model Schools operates separate dedicated bank accounts for Primary and Secondary sections. Please deposit fees strictly into your designated section account shown below.
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Levies & Clearance Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Itemized Fee Levies &amp; Clearance Breakdown
                </h2>
                <p className="text-xs text-slate-500">
                  Official tariff schedule for <strong className="text-slate-800">{matchedStructure.levelName}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Tariff</span>
                <span className="text-base font-black font-mono text-emerald-700">
                  ₦{totalLevyFee.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3 pl-1">Priority</th>
                    <th className="pb-3">Levy / Item</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Tariff (₦)</th>
                    <th className="pb-3 text-right">Paid (₦)</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocatedLevies.map((levy) => {
                    const isCleared = levy.status === 'CLEARED';
                    const isPartial = levy.status === 'PARTIAL';
                    return (
                      <tr key={levy.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 pl-1">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center text-slate-600">
                            {levy.priority}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-900">
                          {levy.name}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            levy.category === 'essential'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : levy.category === 'academic'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : levy.category === 'facility'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {levy.category}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-700">
                          ₦{levy.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-700">
                          ₦{levy.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCleared
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {levy.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50">
                    <td colSpan={3} className="py-3 pl-2 uppercase text-[10px] text-slate-500">
                      Total Reconciliation
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      ₦{totalLevyFee.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono font-black text-emerald-700">
                      ₦{totalPaid.toLocaleString()}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-rose-600">
                      {currentBalance > 0 ? `Owing ₦${currentBalance.toLocaleString()}` : 'Cleared'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Note: Priority 1 (Medicals &amp; Healthcare) and Priority 2 (Examinations) are cleared first during partial payments before school development and tuition balances.
            </p>
          </div>

          {/* Official Bank Account Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                    {isPrimaryWing ? 'Nursery & Primary Wing' : 'Secondary College Wing'}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Designated School Payment Account
                </h2>
                <p className="text-xs text-slate-500">
                  Please deposit fees strictly into the official account assigned to your school section.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                Verified Account
              </span>
            </div>

            {/* Bank Card Graphic */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Designated Section
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {designatedAccount.sectionName}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Bank Name
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {designatedAccount.bankName}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Account Name
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {designatedAccount.accountName}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Account Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-emerald-700">
                      {designatedAccount.accountNumber}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy Account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Confirmation Steps */}
            <div className="space-y-3 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 text-sm">How to Validate Payment:</h4>
              <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                <li>
                  When initiating your bank transfer or teller deposit, use your full name and admission number as the transfer narration (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900 font-bold">{student?.fullName || 'Student Name'} {student?.admissionNo || 'MIMS/---'}</code>).
                </li>
                <li>
                  Present the physical bank teller or transfer screenshot to the Bursary desk on campus.
                </li>
                <li>
                  An official printed receipt will be issued immediately, and your portal status will automatically switch to <strong className="text-emerald-700 font-bold">CLEARED</strong>.
                </li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
