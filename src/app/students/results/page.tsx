'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  CreditCard,
  Printer,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Download,
  ArrowRight,
  Award,
  Inbox,
  Loader2
} from 'lucide-react';

interface ResultRow {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export default function StudentResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState('2025/2026');
  const [term, setTerm] = useState('first');
  const [loading, setLoading] = useState(true);
  const [isCleared, setIsCleared] = useState(true);
  const [balance, setBalance] = useState(0);
  const [isReleased, setIsReleased] = useState(true);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/results?session=${session}&term=${term}`);
        const data = await res.json();
        if (data.success) {
          setIsCleared(data.isCleared ?? true);
          setBalance(data.balance ?? 0);
          setIsReleased(data.isReleased ?? true);
          setStudent(data.student);
          if (data.results) {
            setResults(
              data.results.map((r: any) => ({
                subject: r.subjects?.subject_name || r.subject || 'Subject',
                ca1: r.ca1 ?? 0,
                ca2: r.ca2 ?? 0,
                exam: r.exam ?? 0,
                total: r.total ?? (r.ca1 || 0) + (r.ca2 || 0) + (r.exam || 0),
                grade: r.grade || 'A',
                remark: r.remark || 'Good',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load student results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [session, term]);

  const totalObtained = results.reduce((acc, curr) => acc + curr.total, 0);
  const averageScore = results.length > 0 ? (totalObtained / results.length).toFixed(1) : '0';

  const studentName = student
    ? `${student.firstname || ''} ${student.lastname || ''}`.trim()
    : 'Student Account';
  const admissionNo = student?.admission_no || 'MIMS/2026/0000';
  const className = student?.classes?.class_name || 'Senior Secondary';

  return (
    <div className="p-6 space-y-6 max-w-4xl w-full mx-auto font-sans">
      <div>
        {/* Navigation & Controls */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Link
            href="/students/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 focus:outline-none shadow-xs"
            >
              <option value="2025/2026">2025/2026 Session (Current)</option>
              <option value="2024/2025">2024/2025 Session (Archived)</option>
            </select>

            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 focus:outline-none shadow-xs"
            >
              <option value="first">First Term</option>
              <option value="second">Second Term</option>
              <option value="third">Third Term</option>
            </select>

            {isReleased && isCleared && results.length > 0 && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <Printer className="w-4 h-4" /> Print Report Card
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Checking clearance & loading terminal results...</p>
          </div>
        ) : !isCleared ? (
          /* Check 1: Financial Lockout Gate (Bursary Clearance) */
          <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wider">
                BURSARY CLEARANCE REQUIRED
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Official Report Card Withheld — Outstanding Fee Balance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your academic report card for <strong>{session} ({term} Term)</strong> is currently withheld due to an outstanding fee balance of <strong className="text-red-600 font-mono font-bold">₦{Number(balance).toLocaleString()}.00</strong> in the bursary ledger.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2 text-red-600">
                <span>Remaining Balance:</span>
                <span className="font-mono">₦{Number(balance).toLocaleString()}.00</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/students/fees"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center gap-2"
              >
                View Official Payment Account &amp; Validate Teller <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : !isReleased ? (
          /* Check 2: Administrative Moderation Hold */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Results Withheld — Administrative Moderation in Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Examination scores for <strong>{term} Term ({session})</strong> have been entered by subject teachers and are currently undergoing administrative moderation by the Vice Principal (Academics) and Examination Board.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <span>Official Release Date: Subject to School Management clearance</span>
            </div>
          </div>
        ) : results.length === 0 ? (
          /* Check 3: Clean Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Terminal Results Uploaded Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently zero scores published for {session} ({term} Term). Once subject teachers submit marks and administration approves them, your official broadsheet will display here.
            </p>
          </div>
        ) : (
          /* Printable Official Terminal Report Card Sheet */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden">
            {/* Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    MSSN ISLAMIC MODEL SCHOOLS (MIMS)
                  </h1>
                  <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">
                    Akure, Ondo State, Nigeria
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Motto: Knowledge, Faith and Excellent Morals • Al-Birr
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Official Terminal Broadsheet
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {session} Academic Session
                </p>
              </div>
            </div>

            {/* Student Metadata Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Student Name
                </span>
                <span className="font-bold text-slate-900 text-sm">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Admission No
                </span>
                <span className="font-bold font-mono text-emerald-700 text-sm">
                  {admissionNo}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Class Arm
                </span>
                <span className="font-bold text-slate-900">{className}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Academic Term
                </span>
                <span className="font-bold text-slate-900 capitalize">{term} Term</span>
              </div>
            </div>

            {/* Score Broadsheet Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-2.5 px-3 rounded-l-lg">Subject</th>
                    <th className="py-2.5 px-3 text-center">CA 1 (15)</th>
                    <th className="py-2.5 px-3 text-center">CA 2 (15)</th>
                    <th className="py-2.5 px-3 text-center">Exam (70)</th>
                    <th className="py-2.5 px-3 text-center">Total (100)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.subject}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{r.ca1}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{r.ca2}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{r.exam}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{r.total}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-50 text-emerald-700">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-500 font-medium">Total Subjects:</span>{' '}
                  <strong className="text-slate-900 font-bold">{results.length}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Cumulative Score:</span>{' '}
                  <strong className="text-slate-900 font-bold">{totalObtained}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Term Average:</span>{' '}
                  <strong className="text-emerald-700 font-black text-sm">{averageScore}%</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cleared & Moderated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
