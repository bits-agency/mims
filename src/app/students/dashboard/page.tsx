'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  TrendingUp,
  BookOpen,
  Clock,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
  CreditCard,
  Inbox,
  Loader2
} from 'lucide-react';

interface ResultItem {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isCleared, setIsCleared] = useState(true);
  const [balance, setBalance] = useState(0);
  const [isReleased, setIsReleased] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [meRes, resRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/students/results?session=2025/2026&term=first'),
        ]);

        const meData = await meRes.json();
        const resData = await resRes.json();

        if (meData.authenticated && meData.user) {
          setStudent({
            name: meData.user.fullName || meData.user.username || 'Student',
            role: meData.user.role,
            profile: meData.user.profile,
          });
        }

        if (resData.success) {
          setIsCleared(resData.isCleared ?? true);
          setBalance(resData.balance ?? 0);
          setIsReleased(resData.isReleased ?? true);
          if (resData.results && resData.results.length > 0) {
            setResults(
              resData.results.map((r: any) => ({
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
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const studentFirstName = student?.name ? student.name.split(' ')[0] : 'Student';
  const className = student?.profile?.classes?.class_name
    ? `${student.profile.classes.class_name} ${student.profile.classes.section ? `(${student.profile.classes.section})` : ''}`
    : 'Senior Secondary';

  const totalScore = results.reduce((acc, r) => acc + r.total, 0);
  const termAverage = results.length > 0 ? (totalScore / results.length).toFixed(1) : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            As-salamu alaykum wa rahmatullah
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {studentFirstName}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-md">
            Enrolled in <strong className="text-white font-bold">{className}</strong> for the 2025/2026 Academic Session.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/students/results"
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition"
          >
            Terminal Results
          </Link>
          <Link
            href="/students/profile"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-xs border border-emerald-400/30 transition"
          >
            Student ID Card
          </Link>
        </div>
      </div>

      {/* 4 Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Attendance */}
        <Link href="/students/attendance" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              TERM ATTENDANCE
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">Enrolled</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Active Roll Call Standing
          </p>
        </Link>

        {/* Card 2: Term Average */}
        <Link href="/students/results" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              TERM AVERAGE
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {termAverage ? `${termAverage}%` : 'Pending'}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {termAverage ? 'Continuous Assessment' : 'Awaiting Faculty Moderation'}
          </p>
        </Link>

        {/* Card 3: Class Arm */}
        <Link href="/students/courses" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              ENROLLED CLASS
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {className}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Official Matriculation
          </p>
        </Link>

        {/* Card 4: Fee Clearance Status */}
        <Link href="/students/fees" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              BURSARY STATUS
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black ${isCleared ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isCleared ? 'CLEARED' : `₦${Number(balance).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {isCleared ? 'Zero Balance (₦0.00)' : 'Outstanding Balance'}
          </p>
        </Link>
      </div>

      {/* Middle Row: Performance Trend & Academic Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Performance Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Academic Performance Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">Terminal Continuous Assessment Scores</p>
            </div>
            <Link href="/students/results" className="text-xs font-bold text-emerald-600 hover:underline">
              View Broadsheet
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading scores...
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 border border-slate-100 rounded-xl p-6">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-800 font-bold text-xs">No Terminal Scores Recorded Yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Continuous assessment scores will display here once submitted by subject teachers and moderated by administration.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      {r.grade}
                    </span>
                    <div>
                      <strong className="block text-slate-900 text-xs font-bold">{r.subject}</strong>
                      <span className="text-[10px] text-slate-400">{r.remark}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 font-mono">{r.total}</span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments & Academic Notices (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">Academic Tasks &amp; Notices</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Term 1 Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-xs text-slate-900">Term 1 Continuous Assessment</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  CA1 (15%) and CA2 (15%) scores have been compiled. Verify scores on the broadsheet.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-xs text-slate-900">Bursary Clearance Requirement</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Only students with zero outstanding balances are permitted to access official report cards.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/students/messages"
            className="w-full mt-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition text-center block"
          >
            School Circulars &amp; Calendar
          </Link>
        </div>
      </div>

      {/* Bottom Row: Campus Daily Schedule */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Official Daily Schedule</h3>
            <p className="text-[11px] text-slate-400">MSSN Islamic Model Schools Akure Campus Timetable</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">07:45 - 08:15 AM</span>
            <strong className="text-slate-900 font-bold block mt-0.5">Assembly &amp; Morning Du&apos;a</strong>
            <span className="text-[11px] text-slate-500">Central Quadrangle</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">08:15 - 10:15 AM</span>
            <strong className="text-emerald-950 font-bold block mt-0.5">Core Sciences &amp; Humanities</strong>
            <span className="text-[11px] text-emerald-800">Classroom Blocks</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">01:30 - 02:15 PM</span>
            <strong className="text-slate-900 font-bold block mt-0.5">Salat Az-Zuhr &amp; Recess</strong>
            <span className="text-[11px] text-slate-500">Campus Central Masjid</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">03:30 PM</span>
            <strong className="text-slate-900 font-bold block mt-0.5">Daily School Dismissal</strong>
            <span className="text-[11px] text-slate-500">Main Campus Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
