'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

interface StudentAccount {
  id?: string;
  admissionNo: string;
  name: string;
  classArm: string;
  totalFee: number;
  previouslyPaid: number;
}

export default function BursarPaymentPage() {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
  const [amountPaying, setAmountPaying] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('Jaiz Bank Direct Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        if (data?.success && data.students && data.students.length > 0) {
          const mapped: StudentAccount[] = data.students.map((s: any) => {
            const clr = s.student_fee_clearance?.[0];
            const billed = Number(clr?.total_billed || 55000);
            const paid = Number(clr?.total_paid || 0);
            return {
              id: s.id,
              admissionNo: s.admission_no || 'N/A',
              name: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
              classArm: `${s.classes?.class_name || ''} ${s.classes?.section || ''}`.trim(),
              totalFee: billed,
              previouslyPaid: paid,
            };
          });
          setStudents(mapped);
          if (mapped.length > 0) {
            setSelectedStudent(mapped[0]);
            const bal = Math.max(0, mapped[0].totalFee - mapped[0].previouslyPaid);
            setAmountPaying(bal > 0 ? bal : 0);
          }
        }
      } catch (err) {
        console.error('Failed to load students for payment entry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const found = students.find(
      (s) =>
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedStudent(found);
      const balance = Math.max(0, found.totalFee - found.previouslyPaid);
      setAmountPaying(balance > 0 ? balance : 0);
    } else {
      setErrorMessage(`No student matching "${searchQuery}" found in the database.`);
    }
  };

  const currentBalance = selectedStudent
    ? Math.max(0, selectedStudent.totalFee - selectedStudent.previouslyPaid)
    : 0;
  const numericAmount = typeof amountPaying === 'number' ? amountPaying : 0;
  const simulatedRemaining = Math.max(0, currentBalance - numericAmount);
  const willBeCleared = simulatedRemaining === 0 && numericAmount > 0;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amountPaying || amountPaying <= 0) return;

    try {
      const res = await fetch('/api/bursar/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          admissionNo: selectedStudent.admissionNo,
          studentName: selectedStudent.name,
          amountPaid: Number(amountPaying),
          paymentMethod,
          channelRef: referenceNo || `NIP-${Date.now()}`,
          term: 'first',
          session: '2025/2026',
        }),
      });

      const data = await res.json();
      if (data?.success && data.receipt) {
        setRecentReceipt({
          ...data.receipt,
          previousPaid: selectedStudent.previouslyPaid,
          totalFee: selectedStudent.totalFee,
          balanceAfter: Math.max(0, selectedStudent.totalFee - (selectedStudent.previouslyPaid + Number(amountPaying))),
          cleared: Math.max(0, selectedStudent.totalFee - (selectedStudent.previouslyPaid + Number(amountPaying))) === 0,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        });
        setReceiptGenerated(true);

        setSelectedStudent((prev) =>
          prev ? { ...prev, previouslyPaid: prev.previouslyPaid + Number(amountPaying) } : null
        );
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Record Fee Payment &amp; Issue Receipt
          </h1>
          <p className="text-xs text-slate-400">
            Validate bank transfer tellers, auto-reconcile student balances, and issue official stamped receipts.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Automatic Academic Result Unlock Active
        </div>
      </div>

      {/* Search Student Box */}
      <form
        onSubmit={handleSearch}
        className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-3"
      >
        <label className="block text-xs font-bold text-slate-300">
          Find Student by Admission Number or Name
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. MIMS/2026/0001 or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1527] border border-[#213357] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/30"
          >
            Locate Student
          </button>
        </div>

        {errorMessage && (
          <div className="text-xs text-rose-400 font-semibold">{errorMessage}</div>
        )}

        {/* Quick Picks from Real Students */}
        {students.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Registered Students:</span>
            {students.slice(0, 5).map((s) => (
              <button
                key={s.admissionNo}
                type="button"
                onClick={() => {
                  setSelectedStudent(s);
                  setSearchQuery(s.admissionNo);
                  const bal = s.totalFee - s.previouslyPaid;
                  setAmountPaying(bal > 0 ? bal : 0);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0D1527] border border-[#213357] hover:border-emerald-500/50 font-mono text-slate-300 transition"
              >
                {s.name} ({s.admissionNo})
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Main 2-Column Workflow: Payment Form & Real-time Balance Engine */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Entry Form (2 cols) */}
          <div className="lg:col-span-2 bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-[#1E2E50] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment Transaction Details
            </h2>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              {/* Student Info Readout Card */}
              <div className="p-4 rounded-xl bg-[#0D1527] border border-[#203258] grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                  <strong className="text-white text-xs font-bold block">{selectedStudent.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
                  <strong className="text-emerald-400 font-mono text-xs font-bold block">{selectedStudent.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Level</span>
                  <strong className="text-slate-200 text-xs font-bold block">{selectedStudent.classArm}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                    Amount Paying Now (₦)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedStudent.totalFee}
                    value={amountPaying}
                    onChange={(e) => setAmountPaying(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0D1527] border border-[#213357] rounded-xl px-4 py-2.5 text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                    Payment Channel / Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#0D1527] border border-[#213357] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Jaiz Bank Direct Transfer">Jaiz Bank Direct Transfer (NIP)</option>
                    <option value="Bursary POS Terminal">Bursary POS Terminal (Debit Card)</option>
                    <option value="Bank Teller Cash Deposit">Physical Branch Cash Deposit</option>
                    <option value="Online Portal Webpay">Online Payment Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Bank Transfer Session ID / POS Reference Number
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. 0000132409011244439002..."
                  className="w-full bg-[#0D1527] border border-[#213357] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/40 border border-emerald-400/20 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Confirm Payment &amp; Issue Stamped Receipt</span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Reconciliation Engine Preview (1 col) */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-[#1E2E50]">
                Live Fee Reconciliation
              </h3>

              <div className="space-y-3 bg-[#0D1527] p-4 rounded-xl border border-[#203258] text-xs">
                <div className="flex justify-between py-1 border-b border-[#1A284A]">
                  <span className="text-slate-400">Total Billed:</span>
                  <span className="font-mono font-bold text-white">₦{selectedStudent.totalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A284A]">
                  <span className="text-slate-400">Previously Paid:</span>
                  <span className="font-mono text-emerald-400">₦{selectedStudent.previouslyPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A284A]">
                  <span className="text-slate-400">Current Balance:</span>
                  <span className="font-mono font-bold text-rose-400">₦{currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A284A]">
                  <span className="text-slate-400">Amount to Credit:</span>
                  <span className="font-mono font-bold text-emerald-400">+₦{numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-slate-300 font-bold">Projected Balance:</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      willBeCleared ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ₦{simulatedRemaining.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Clearance Status Callout */}
              <div
                className={`mt-4 p-4 rounded-xl border text-xs ${
                  willBeCleared
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0D1527] border-[#203258] text-slate-300'
                }`}
              >
                {willBeCleared ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="block font-bold text-emerald-300">FULL CLEARANCE TRIGGERED</strong>
                      <span className="text-[11px] text-emerald-400/80">
                        Balance ₦0.00: Student portal will immediately unlock report card view.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <strong className="block font-bold text-white">Partial Payment</strong>
                      <span className="text-[11px] text-slate-400">
                        ₦{simulatedRemaining.toLocaleString()} remaining. Result remains locked until ₦0.00.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#111C33] border border-[#1E2E50] rounded-2xl text-slate-400 space-y-3">
          <Inbox className="w-10 h-10 mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-white">No Student Selected</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Search for a registered student by admission number above to log a fee payment.
          </p>
        </div>
      )}

      {/* Generated Receipt Stamped Modal */}
      {receiptGenerated && recentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E50]">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">MSSN ISLAMIC MODEL SCHOOLS</h3>
                  <p className="text-[10px] text-emerald-400">Official Electronic Bursary Receipt</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0D1527] px-2.5 py-1 rounded border border-[#203258]">
                {recentReceipt.receiptNo}
              </span>
            </div>

            <div className="my-5 p-4 rounded-xl bg-[#0D1527] border border-[#203258] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-white">{recentReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admission No:</span>
                <span className="font-mono font-bold text-emerald-400">{recentReceipt.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class Arm:</span>
                <span className="text-slate-200">{recentReceipt.classArm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-200">{recentReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="font-mono text-slate-300">{recentReceipt.channelRef || recentReceipt.referenceNo}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1A284A]">
                <span className="text-slate-300 font-bold">Amount Paid:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ₦{recentReceipt.amountPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Outstanding Balance:</span>
                <span className="font-mono font-bold text-white">
                  ₦{recentReceipt.balanceAfter.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Clearance Status:</span>
                <span
                  className={`font-bold ${
                    recentReceipt.cleared ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {recentReceipt.cleared ? 'FULL CLEARANCE ISSUED' : 'PARTIAL CLEARANCE'}
                </span>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-center text-xs text-emerald-300">
              <div className="font-black uppercase tracking-wider text-[11px]">
                BURSARY CLEARED &amp; DIGITALLY STAMPED
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">
                MIMS Akure • Jaiz Bank Verified • {recentReceipt.date || recentReceipt.paymentDate}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setReceiptGenerated(false)}
                className="px-4 py-2.5 rounded-xl bg-[#1E2E50] hover:bg-[#2A3E6B] text-slate-300 text-xs font-bold transition"
              >
                Done
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Stamped Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
