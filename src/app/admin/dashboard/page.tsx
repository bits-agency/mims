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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricRes, payRes] = await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/bursar/payments'),
        ]);

        const metricData = await metricRes.json();
        const payData = await payRes.json();

        if (metricData.success) {
          setMetrics({
            students: metricData.students ?? 0,
            staff: metricData.staff ?? 0,
            revenue: metricData.revenue ?? 0,
            attendanceRate: metricData.attendanceRate ?? 0,
          });
        }

        if (payData.success && payData.payments) {
          setRecentPayments(payData.payments.slice(0, 5));
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
            href="/admin/students"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            Admit Student
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-white">Recent Transactions & Events</h3>
            <Link
              href="/bursar/payments"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              View all transactions <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading database transactions...
            </div>
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
