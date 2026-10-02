'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  Building,
  CheckCircle2,
  Copy,
  AlertCircle,
  FileText,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function StudentFeesPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [clearance, setClearance] = useState<{ isCleared: boolean; balance: number } | null>(null);

  const bankDetails = {
    bankName: 'Jaiz Bank Plc',
    accountName: 'MSSN ISLAMIC MODEL SCHOOLS AKURE',
    accountNumber: '0012345678',
    sortCode: '301001',
    bursaryHotline: '08036268724',
  };

  useEffect(() => {
    async function loadFeeData() {
      setLoading(true);
      try {
        const [meRes, resRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/students/results?session=2025/2026&term=first'),
        ]);

        const meData = await meRes.json();
        const resData = await resRes.json();

        if (meData.authenticated && meData.user) {
          const profile = meData.user.profile;
          setStudent({
            fullName: meData.user.fullName || meData.user.username || 'Student Account',
            admissionNo: profile?.admission_no || 'MIMS/---',
            className: profile?.classes?.class_name
              ? `${profile.classes.class_name} ${profile.classes.section ? `(${profile.classes.section})` : ''}`
              : 'Senior Secondary',
          });
        }

        if (resData.success) {
          setClearance({
            isCleared: resData.isCleared ?? true,
            balance: resData.balance ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load student fee clearance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeeData();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
                  {clearance?.isCleared ? 'Financial Clearance Approved' : 'Outstanding Balance Pending'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {student?.fullName} • Admission No: <strong className="font-mono text-emerald-700">{student?.admissionNo}</strong> • {student?.className}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    clearance?.isCleared
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {clearance?.isCleared ? 'CLEARED (₦0.00)' : `OWING ₦${Number(clearance?.balance || 0).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Current Term Clearance</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {clearance?.isCleared
                    ? 'All academic tuition fees and school development levies for the active academic term have been fully cleared by the Bursary department.'
                    : `You have an unsettled tuition balance of ₦${Number(clearance?.balance || 0).toLocaleString()}. Kindly finalize payment to unlock terminal examination broadsheets and report cards.`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">Online Payment Gateway</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Direct automated card and USSD checkouts are currently in configuration. Please utilize the verified institutional Jaiz Bank account details below for instant teller processing.
                </p>
              </div>
            </div>
          </div>

          {/* Official Bank Account Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Official School Bank Account Details
                </h2>
                <p className="text-xs text-slate-500">
                  Kindly use the verified institutional details below for tuition and boarding deposits.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                Verified School Account
              </span>
            </div>

            {/* Bank Card Graphic */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Bank Name
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {bankDetails.bankName}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Account Name
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {bankDetails.accountName}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Account Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-emerald-700">
                      {bankDetails.accountNumber}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Assigned Class Arm
                  </span>
                  <strong className="text-sm font-black text-slate-900 block">
                    {student?.className}
                  </strong>
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
                  Send a clear screenshot or photograph of the bank receipt via WhatsApp to the School Bursary on <strong className="text-slate-900 font-bold">{bankDetails.bursaryHotline}</strong> or submit the physical teller at the campus bursary desk.
                </li>
                <li>
                  An official signed school receipt and fee clearance badge will be issued in the portal within 24 hours of bursary verification.
                </li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
