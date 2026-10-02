'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  UserCheck,
  CreditCard,
  BookOpen,
  UserPlus,
  CalendarCheck,
  Briefcase,
  Settings,
  Search,
  Bell,
  TrendingUp,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Loader2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    students: 0,
    staff: 0,
    revenue: 0,
    attendanceRate: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [pendingApplicants, setPendingApplicants] = useState<any[]>([]);
  const [activityTab, setActivityTab] = useState<'applications' | 'payments'>('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricRes, payRes, appRes] = await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/bursar/payments'),
          fetch('/api/admissions/applicants'),
        ]);

        const metricData = await metricRes.json().catch(() => ({}));
        const payData = await payRes.json().catch(() => ({}));
        const appData = await appRes.json().catch(() => ({}));

        if (metricData?.success) {
          setMetrics({
            students: metricData.students ?? 0,
            staff: metricData.staff ?? 0,
            revenue: metricData.revenue ?? 0,
            attendanceRate: metricData.attendanceRate ?? 0,
          });
        }

        if (payData?.success && payData.payments) {
          setRecentPayments(payData.payments.slice(0, 5));
        }

        if (appData?.success && appData.applicants) {
          setPendingApplicants(appData.applicants);
        }
      } catch (err) {
        console.error('Error fetching dashboard live data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Students */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.students.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            Active enrolled in database
          </div>
        </div>

        {/* Card 2: Active Staff */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Active Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.staff.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            Teaching & non-teaching faculty
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Tuition Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              ₦
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₦{metrics.revenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Verified deposits in Supabase
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Attendance Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.attendanceRate > 0 ? `${metrics.attendanceRate}%` : '0%'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            Active tracking sessions
          </div>
        </div>
      </div>

      {/* Pending Applicants Alert Banner */}
      {pendingApplicants.length > 0 && (
        <div className="bg-gradient-to-r from-[#0E2822] via-[#111C33] to-[#0D1527] border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm">
                  {pendingApplicants.length} Online Admission {pendingApplicants.length === 1 ? 'Application' : 'Applications'} Received
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wide">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                New candidate dossiers submitted via the public admissions portal are awaiting entrance exam scheduling and enrollment review.
              </p>
            </div>
          </div>
          <Link
            href="/admin/admissions"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shrink-0 text-center flex items-center justify-center gap-1.5"
          >
            <span>Open Admissions Desk ({pendingApplicants.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Action Banner */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Institutional Control Desk</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage academic sessions, provision staff accounts, configure tuition structures, or publish live announcements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/admissions"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admissions Desk</span>
            {pendingApplicants.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-950 font-black text-[10px]">
                {pendingApplicants.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/students"
            className="px-3.5 py-2 rounded-xl bg-[#182645] hover:bg-[#1E3056] text-slate-200 font-bold text-xs border border-[#23355A] transition"
          >
            Student Registry
          </Link>
          <Link
            href="/admin/staff"
            className="px-3.5 py-2 rounded-xl bg-[#182645] hover:bg-[#1E3056] text-slate-200 font-bold text-xs border border-[#23355A] transition"
          >
            Provision Staff
          </Link>
          <Link
            href="/bursar/fee-structures"
            className="px-3.5 py-2 rounded-xl bg-[#182645] hover:bg-[#1E3056] text-slate-200 font-bold text-xs border border-[#23355A] transition"
          >
            Fee Schedules
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#1E2E50] pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivityTab('applications')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activityTab === 'applications'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-[#182645]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Online Applications ({pendingApplicants.length})</span>
              </button>

              <button
                onClick={() => setActivityTab('payments')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activityTab === 'payments'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-[#182645]'
                }`}
              >
                <span>Fee Transactions</span>
              </button>
            </div>

            {activityTab === 'applications' ? (
              <Link
                href="/admin/admissions"
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Open Admissions Desk <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/bursar/payments"
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                View all transactions <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading database live records...
            </div>
          ) : activityTab === 'applications' ? (
            pendingApplicants.length === 0 ? (
              <div className="py-12 text-center bg-[#0D1527] border border-[#1E2E50] rounded-xl p-6">
                <Inbox className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-white font-bold text-xs">No Pending Online Applications</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  When parents submit applications on the portal, candidate biodata will stream here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2E50] text-slate-400 text-[11px] uppercase font-bold">
                      <th className="pb-3 font-semibold">Ref No.</th>
                      <th className="pb-3 font-semibold">Applicant Name</th>
                      <th className="pb-3 font-semibold">Parent / Phone</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2E50]/60">
                    {pendingApplicants.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td className="py-3.5 font-mono text-emerald-400 font-bold">{app.admission_no}</td>
                        <td className="py-3.5 text-white font-medium">
                          {app.firstname} {app.lastname}
                        </td>
                        <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                          {app.guardian_phone || app.guardian_email || 'N/A'}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            app.exam_status === 'scheduled'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {(app.exam_status || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href="/admin/admissions"
                            className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : recentPayments.length === 0 ? (
            <div className="py-12 text-center bg-[#0D1527] border border-[#1E2E50] rounded-xl p-6">
              <Inbox className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-white font-bold text-xs">No Recent Transactions</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                No fee payments have been logged yet in the database. Verified bank receipts and online payments will stream here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2E50] text-slate-400 text-[11px] uppercase font-bold">
                    <th className="pb-3 font-semibold">Receipt / Ref</th>
                    <th className="pb-3 font-semibold">Student / Payer</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2E50]/60">
                  {recentPayments.map((p) => {
                    const studentName = p.students
                      ? `${p.students.firstname || ''} ${p.students.lastname || ''}`.trim()
                      : p.channel_reference || 'Student';
                    return (
                      <tr key={p.id}>
                        <td className="py-3.5 font-mono text-emerald-400 font-bold">{p.receipt_no}</td>
                        <td className="py-3.5 text-white font-medium">{studentName}</td>
                        <td className="py-3.5 text-slate-200 font-mono">₦{Number(p.amount_paid).toLocaleString()}</td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.status ? p.status.toUpperCase() : 'VERIFIED'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400 text-right font-mono text-[11px]">
                          {p.payment_date || 'Today'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Institutional Calendar (1 col) */}
        <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white">Academic Calendar</h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0D1527] border border-[#1E2E50]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">First Term</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">2025/2026 Academic Session</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1527] border border-[#1E2E50]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Second Term</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 font-bold">
                    Upcoming
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Scheduled for Jan 2026</p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/sessions"
            className="w-full mt-5 py-2.5 rounded-xl bg-[#182645] hover:bg-[#1E3056] text-slate-200 text-xs font-bold text-center transition border border-[#23355A]"
          >
            Manage Sessions & Term Locks
          </Link>
        </div>
      </div>
    </div>
  );
}
