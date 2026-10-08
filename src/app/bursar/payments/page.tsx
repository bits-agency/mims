'use client';

import { useState, useEffect, useRef } from 'react';
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
  Inbox,
  Check,
  Clock,
  X
} from 'lucide-react';
import {
  allocatePaymentToLevies,
  STANDARD_LEVIES_BY_WING,
  getBankAccountForWing,
  getLeviesForStudentClass,
  BankAccountDetails,
  AllocatedLevyItem,
  FeeLevy
} from '@/lib/bursary';

interface StudentAccount {
  id: string;
  admissionNo: string;
  name: string;
  classArm: string;
  wing: string;
  totalFee: number;
  previouslyPaid: number;
  levies: FeeLevy[];
}

export default function BursarPaymentPage() {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
  const [amountPaying, setAmountPaying] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('Official Direct Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        if (data?.success && data.students && data.students.length > 0) {
          const mapped: StudentAccount[] = data.students.map((s: any) => {
            const clr = s.student_fee_clearance?.[0];
            const wing = s.classes?.wing || (s.classes?.class_name?.toLowerCase().includes('primary') ? 'Primary' : 'Senior Secondary');
            const levies = getLeviesForStudentClass(s.classes?.class_name);
            const calculatedTotal = levies.reduce((sum, l) => sum + Number(l.amount || 0), 0);
            const billed = Number(clr?.total_billed || calculatedTotal);
            const paid = Number(clr?.total_paid || 0);

            return {
              id: s.id,
              admissionNo: s.admission_no || 'N/A',
              name: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
              classArm: `${s.classes?.class_name || ''} ${s.classes?.section ? '(' + s.classes.section + ')' : ''}`.trim(),
              wing: wing,
              totalFee: billed,
              previouslyPaid: paid,
              levies: levies,
            };
          });
          setStudents(mapped);
          // Do not auto-select anyone so the page loads cleanly with the search bar ready
        }
      } catch (err) {
        console.error('Failed to load students for payment entry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleSelectStudent = (student: StudentAccount) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.name} (${student.admissionNo})`);
    const balance = Math.max(0, student.totalFee - student.previouslyPaid);
    setAmountPaying(balance > 0 ? balance : 0);
    setErrorMessage(null);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowSuggestions(false);
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setErrorMessage('Please enter an admission number or student name.');
      return;
    }
    const found = students.find(
      (s) =>
        s.admissionNo.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    );
    if (found) {
      handleSelectStudent(found);
    } else {
      setErrorMessage(`No student matching "${searchQuery}" found in the database.`);
    }
  };

  const matchingSuggestions = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentBalance = selectedStudent
    ? Math.max(0, selectedStudent.totalFee - selectedStudent.previouslyPaid)
    : 0;
  const numericAmount = typeof amountPaying === 'number' ? amountPaying : 0;
  const simulatedRemaining = Math.max(0, currentBalance - numericAmount);
  const willBeCleared = simulatedRemaining === 0 && numericAmount > 0;

  // Live preview of levy clearing
  const previewLevies = selectedStudent
    ? allocatePaymentToLevies(selectedStudent.levies, selectedStudent.previouslyPaid + numericAmount)
    : null;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amountPaying || amountPaying <= 0) return;

    setProcessing(true);
    try {
      const bankDetails = getBankAccountForWing(selectedStudent.wing);
      const cumPaid = selectedStudent.previouslyPaid + Number(amountPaying);
      const allocationResult = allocatePaymentToLevies(selectedStudent.levies, cumPaid);

      const res = await fetch('/api/bursar/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          admissionNo: selectedStudent.admissionNo,
          studentName: selectedStudent.name,
          amountPaid: Number(amountPaying),
          paymentMethod,
          channelRef: referenceNo || `REF-${Date.now().toString().slice(-6)}`,
          term: 'first',
          session: '2025/2026',
        }),
      });

      const data = await res.json();
      if (data?.success && data.receipt) {
        setRecentReceipt({
          ...data.receipt,
          admissionNo: selectedStudent.admissionNo,
          studentName: selectedStudent.name,
          classArm: selectedStudent.classArm,
          wing: selectedStudent.wing,
          bankAccount: bankDetails,
          previousPaid: selectedStudent.previouslyPaid,
          amountThisPayment: Number(amountPaying),
          cumulativePaid: cumPaid,
          totalFee: selectedStudent.totalFee,
          balanceAfter: Math.max(0, selectedStudent.totalFee - cumPaid),
          cleared: Math.max(0, selectedStudent.totalFee - cumPaid) === 0,
          allocatedLevies: allocationResult.allocated,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          dateFormatted: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        });
        setReceiptGenerated(true);

        setSelectedStudent((prev) =>
          prev ? { ...prev, previouslyPaid: cumPaid } : null
        );
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintOnlyReceipt = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
      {/* CSS snippet to guarantee ONLY the official receipt is printed when window.print() is called */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-school-receipt,
          #official-school-receipt * {
            visibility: visible !important;
          }
          #official-school-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
            box-shadow: none !important;
            border: 2px solid #064e3b !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Record Fee Payment &amp; Issue Official Receipt
          </h1>
          <p className="text-xs text-slate-400">
            Automated levy prioritization: Partial payments automatically cover medicals, examination, and development levies first.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Automatic Academic Result Unlock Active
        </div>
      </div>

      {/* Search Student Box */}
      <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-2xl shadow-sm relative">
        <form onSubmit={handleSearch}>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Search Registered Student (Admission Number or Full Name)
            </label>
            {students.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold">
                {students.length} student{students.length > 1 ? 's' : ''} registered
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. MIMS/2026/784 or Ahmad Bello"
                className="w-full bg-[#0D1527] border border-[#203258] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Locate Dossier
            </button>
          </div>
        </form>

        {/* Live Auto-Suggest Dropdown */}
        {showSuggestions && matchingSuggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-[84px] z-30 bg-[#0D1527] border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            <div className="p-2 text-[10px] uppercase font-bold text-slate-400 border-b border-[#1E2E50] bg-[#111C33] flex items-center justify-between">
              <span>Matching Registered Students</span>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-slate-500 hover:text-white text-[10px]"
              >
                Close ✕
              </button>
            </div>
            {matchingSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStudent(s)}
                className="w-full px-4 py-2.5 text-left hover:bg-emerald-500/10 flex items-center justify-between border-b border-[#1E2E50]/50 last:border-none transition group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.classArm} • {s.admissionNo}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-400">
                    ₦{Math.max(0, s.totalFee - s.previouslyPaid).toLocaleString()} due
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Pick Pills for Active Students */}
        {students.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#1E2E50] flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Quick Select:</span>
            {students.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStudent(s)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium flex items-center gap-1.5 ${
                  selectedStudent?.id === s.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-[#0D1527] text-slate-300 border-[#203258] hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                <User className="w-3 h-3 text-emerald-400" />
                <span>{s.name}</span>
                <span className="text-[10px] text-slate-500">({s.admissionNo})</span>
              </button>
            ))}
          </div>
        )}

        {errorMessage && (
          <p className="text-xs text-rose-400 mt-2 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {errorMessage}
          </p>
        )}
      </div>

      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Student Financial Ledger & Priority Allocation Preview */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#1E2E50]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono font-bold text-emerald-400">
                    {selectedStudent.admissionNo}
                  </p>
                  <span className="text-[10px] text-slate-400">{selectedStudent.classArm}</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Total Billed Fee:</span>
                  <span className="font-mono font-bold text-white">
                    ₦{selectedStudent.totalFee.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Previously Paid:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₦{selectedStudent.previouslyPaid.toLocaleString()}.00
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-[#1E2E50]">
                  <span className="text-slate-400 font-bold">Outstanding Balance:</span>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    ₦{currentBalance.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Designated School Account */}
              <div className="p-3 rounded-xl bg-[#0D1527] border border-[#1E2E50] text-[11px] space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Designated Deposit Account:
                </span>
                <span className="font-bold text-emerald-400 block">
                  {getBankAccountForWing(selectedStudent.wing).sectionName}
                </span>
                <p className="text-[10px] text-slate-400">
                  {getBankAccountForWing(selectedStudent.wing).accountName}
                </p>
              </div>
            </div>

            {/* Live Levy Allocation Priority Card */}
            {previewLevies && (
              <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                    Levy Clearing Priority
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold">Simulated Outcome</span>
                </div>

                <div className="space-y-2">
                  {previewLevies.allocated.map((l) => (
                    <div
                      key={l.id}
                      className="p-2.5 rounded-xl bg-[#0D1527] border border-[#1A284A] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block text-[11px]">{l.name}</span>
                        <span className="text-[10px] text-slate-400">Tariff: ₦{l.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                            l.status === 'CLEARED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : l.status === 'PARTIAL'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {l.status}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-300 mt-0.5">
                          Paid: ₦{l.amountPaid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Payment Entry Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2E50]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Enter Payment &amp; Bank Teller Specifics
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Term 1 • 2025/2026</span>
              </div>

              <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Amount Paying Now (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="1000"
                        max={currentBalance || 999999}
                        required
                        value={amountPaying}
                        onChange={(e) => setAmountPaying(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-[#0D1527] border border-[#203258] rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. 20000"
                      />
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setAmountPaying(currentBalance)}
                        className="text-[10px] text-emerald-400 hover:underline font-bold"
                      >
                        Fill Full Balance (₦{currentBalance.toLocaleString()})
                      </button>
                      {currentBalance > 10000 && (
                        <button
                          type="button"
                          onClick={() => setAmountPaying(Math.round(currentBalance / 2))}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          50% Instalment
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Payment Channel / Instrument
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#0D1527] border border-[#203258] rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Official Direct Bank Transfer">Direct Bank Transfer (NIP / Mobile)</option>
                      <option value="Official Bank Teller Deposit">Bank Teller Deposit Slip</option>
                      <option value="Point of Sale (POS) Terminal">School Bursary POS Terminal</option>
                      <option value="Cash at Bursary Counter">Direct Cash Receipt at Bursary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bank Teller Number / Transaction Reference / NIP Session ID
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. TEL/2026/89412 or NIP-TX-987654"
                    className="w-full bg-[#0D1527] border border-[#203258] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Leave blank to auto-generate verified electronic channel reference.
                  </p>
                </div>

                {/* Outcome Simulation Bar */}
                <div
                  className={`p-4 rounded-xl border transition ${
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
                        <strong className="block font-bold text-white">Partial Payment Logged</strong>
                        <span className="text-[11px] text-slate-400">
                          ₦{simulatedRemaining.toLocaleString()}.00 remaining. Essential levies will be cleared first.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={processing || !amountPaying || Number(amountPaying) <= 0}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Receipt className="w-4 h-4" />
                    {processing ? 'Processing Receipt...' : 'Record Payment & Generate Official Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-[#111C33] border border-[#1E2E50] rounded-2xl text-slate-400 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1527] border border-[#203258] flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Student Dossier Loaded</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Search by admission number (e.g. MIMS/2026/784) or name above, or click any student in the Quick Select list to view their ledger and post payments.
            </p>
          </div>
          {students.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStudent(s)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition flex items-center gap-2 group"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                  <span>Load {s.name} ({s.admissionNo})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Parchment Printable Receipt Modal (Clean, Dedicated Paper Layout) */}
      {receiptGenerated && recentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 relative my-8 border border-slate-200">
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Electronic Financial Slip
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOnlyReceipt}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" /> Print Official Slip
                </button>
                <button
                  onClick={() => setReceiptGenerated(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTENT (Targeted by #official-school-receipt) */}
            <div id="official-school-receipt" className="space-y-5 bg-white text-slate-900 font-sans">
              {/* Receipt Top Header */}
              <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/logo.png"
                    alt="MSSN Logo"
                    className="w-14 h-14 object-contain rounded-xl p-0.5 border border-slate-200"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 uppercase leading-tight">
                      MSSN ISLAMIC MODEL SCHOOLS, AKURE
                    </h2>
                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                      Formerly Al-Birr Islamic Model College • Motto: Knowledge is Light
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5">
                      KM 4 Oba-Ile Express Road • Omi Eja Campus • Madinah Campus, Akure, Ondo State
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">OFFICIAL RECEIPT NO</span>
                  <span className="font-mono font-black text-sm sm:text-base text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {recentReceipt.receiptNo}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">{recentReceipt.dateFormatted}</span>
                </div>
              </div>

              {/* Student & Account Dossier Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Name</span>
                  <strong className="text-slate-900 font-black">{recentReceipt.studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Admission Number</span>
                  <strong className="font-mono font-bold text-emerald-900">{recentReceipt.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Class &amp; Wing</span>
                  <span className="text-slate-800 font-bold">{recentReceipt.classArm}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Channel Reference</span>
                  <span className="font-mono text-slate-700 text-[11px] truncate block">{recentReceipt.channelRef}</span>
                </div>
              </div>

              {/* Bank Account Used */}
              <div className="p-2.5 rounded-lg bg-emerald-950/5 border border-emerald-900/10 text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">School Beneficiary Account:</span>
                  <strong className="text-emerald-950 font-bold">{recentReceipt.bankAccount?.accountName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Payment Instrument:</span>
                  <span className="text-slate-700 font-medium">{recentReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Itemized Levy Breakdown Table (Clearance Status per Levy) */}
              <div>
                <h4 className="text-[11px] uppercase font-black tracking-wider text-slate-800 mb-1.5">
                  Itemized Tariff &amp; Levy Breakdown
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">Tariff (₦)</th>
                        <th className="py-2 px-3 text-right">Allocated Paid (₦)</th>
                        <th className="py-2 px-3 text-right">Balance (₦)</th>
                        <th className="py-2 px-3 text-center">Levy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(recentReceipt.allocatedLevies || []).map((item: AllocatedLevyItem) => (
                        <tr key={item.id} className="text-[11px]">
                          <td className="py-2 px-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            ₦{item.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                            ₦{item.amountPaid.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            ₦{item.balance.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                item.status === 'CLEARED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Reconciliation Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-600">
                    Total Invoiced Term Fee: <strong className="text-slate-900 font-mono">₦{recentReceipt.totalFee.toLocaleString()}.00</strong>
                  </div>
                  <div className="text-slate-600">
                    Amount Paid This Slip: <strong className="text-emerald-800 font-mono">₦{recentReceipt.amountThisPayment.toLocaleString()}.00</strong>
                  </div>
                  <div className="text-slate-600">
                    Total Cumulative Paid: <strong className="text-slate-900 font-mono">₦{recentReceipt.cumulativePaid.toLocaleString()}.00</strong>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining Balance Due</span>
                  <div className="text-lg font-black font-mono text-slate-900">
                    ₦{recentReceipt.balanceAfter.toLocaleString()}.00
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mt-1 ${
                      recentReceipt.cleared
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {recentReceipt.cleared ? '✓ FULL CLEARANCE - REPORT CARD UNLOCKED' : '⚠ PARTIAL PAYMENT - BALANCE DUE'}
                  </span>
                </div>
              </div>

              {/* Circular Official Stamp & Signature Block */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-900 flex items-center justify-center p-1 text-center text-[7px] font-black uppercase text-emerald-950 leading-tight">
                    MIMS AKURE<br />BURSARY<br />AUDITED
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-[11px] block">Verified Electronic Stamp</span>
                    <span className="text-[10px] text-slate-500">Official Computerized Record • Valid Without Alteration</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-signature text-base text-emerald-950 font-bold italic tracking-wider">
                    Alhaji Yusuf Adeyemi (FCA)
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase">School Bursar &amp; Accounts Officer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
