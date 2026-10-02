'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Award,
  CalendarCheck,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState({
    name: 'Faculty Master',
    department: 'Academics & Subject Coordination',
  });
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((res) => res.json()).catch(() => null),
      fetch('/api/teachers/allocations').then((res) => res.json()).catch(() => null),
    ]).then(([authData, allocData]) => {
      if (authData?.authenticated && authData.user) {
        setTeacher({
          name: authData.user.fullName || authData.user.username || 'Faculty Master',
          department: authData.user.profile?.department || 'Senior Academic Master',
        });
      }

      if (allocData?.success && Array.isArray(allocData.allocations) && allocData.allocations.length > 0) {
        const mapped = allocData.allocations.map((item: any) => {
          const className = `${item.classes?.class_name || ''} ${item.classes?.section ? '(' + item.classes.section + ')' : ''}`.trim() || 'General Class';
          const subCode = item.subject_name.slice(0, 3).toUpperCase() + '-' + (item.classes?.class_name || 'CLS').replace(/\s+/g, '');
          return {
            id: item.id,
            classId: item.class_id,
            subject: item.subject_name,
            classArm: className,
            totalStudents: 35,
            gradingStatus: 'Continuous Assessment',
            attendanceRate: '98%',
            code: subCode,
          };
        });
        setAllocations(mapped);
      } else {
        // Fallback demo allocation
        setAllocations([
          {
            id: 'demo-1',
            classId: '22222222-2222-2222-2222-222222222206',
            subject: 'Physics',
            classArm: 'SSS 2 (Science Gold)',
            totalStudents: 42,
            gradingStatus: 'Draft Saved',
            attendanceRate: '98.5%',
            code: 'PHY-SS2',
          },
          {
            id: 'demo-2',
            classId: '22222222-2222-2222-2222-222222222206',
            subject: 'Further Mathematics',
            classArm: 'SSS 2 (Science Gold)',
            totalStudents: 28,
            gradingStatus: 'In Progress',
            attendanceRate: '97.2%',
            code: 'FMTH-SS2',
          }
        ]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto">
      {/* Welcome & Role Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-emerald-950 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-500/20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            As-salamu alaykum, Faculty Master
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {teacher.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            {teacher.department}. Access continuous assessment scoring sheets, class attendance registers, and academic broadsheets.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/teachers/grading"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" /> Enter CA Scores
          </Link>
          <Link
            href="/teachers/attendance"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" /> Take Roll Call
          </Link>
        </div>
      </div>

      {/* Result Release Policy Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold text-amber-950 mb-0.5">
            Institutional Exam Policy: Results are Moderated &amp; Released by Admin
          </strong>
          <span>
            Grades entered into the portal remain in <strong>Draft / Submitted</strong> status and are <strong>withheld from students</strong> until the Vice Principal (Academics) and School Admin officially authorize the term result release.
          </span>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              TEACHING ARMS
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">4 Allocations</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            SS 2, SS 3 &amp; JSS 2
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              STUDENTS UNDER CARE
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">143 Students</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Across enrolled subjects
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              CA &amp; EXAM SUBMISSION
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1 / 4 Submitted</div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            3 Drafts in progress
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              RESULT RELEASE STATUS
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">Withheld</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Awaiting Admin Release
          </p>
        </div>
      </div>

      {/* Assigned Subjects & Classes Allocations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900">
              My Assigned Subject &amp; Class Allocations
            </h2>
            <p className="text-xs text-slate-400">
              Select any subject to manage student subject rosters, enter continuous assessment scores, or record attendance.
            </p>
          </div>

          <Link
            href="/teachers/roster"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            Manage Student Enrollment Roster <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allocations.map((alloc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {alloc.code}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {alloc.subject}
                  </h3>
                  <p className="text-xs font-bold text-emerald-700">
                    {alloc.classArm}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-700 text-xs font-extrabold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {alloc.totalStudents}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Grading</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{alloc.gradingStatus}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Attendance</span>
                  <span className="font-semibold text-emerald-600 text-[11px]">{alloc.attendanceRate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/teachers/grading?subjectId=${alloc.id}&classId=${alloc.classId}&subject=${encodeURIComponent(alloc.subject)}&class=${encodeURIComponent(alloc.classArm)}`}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-xs font-bold text-center transition"
                >
                  Enter Scores
                </Link>
                <Link
                  href={`/teachers/attendance?subjectId=${alloc.id}&classId=${alloc.classId}&subject=${encodeURIComponent(alloc.subject)}&class=${encodeURIComponent(alloc.classArm)}`}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-xs font-bold text-center transition"
                >
                  Take Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
