'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Calendar,
  FileCheck,
  Inbox,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface AttendanceRecord {
  subject: string;
  teacher: string;
  totalPeriods: number;
  attendedPeriods: number;
  rate: number;
  status: 'Compliant' | 'Warning';
}

export default function StudentAttendancePage() {
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setStudentInfo({
            name: data.user.fullName || data.user.username || 'Student',
            admissionNo: data.user.profile?.admission_no || 'Pending Matriculation',
            className: data.user.profile?.classes?.class_name
              ? `${data.user.profile.classes.class_name} ${data.user.profile.classes.section ? `(${data.user.profile.classes.section})` : ''}`
              : 'Enrolled Class',
          });
        }
      } catch (err) {
        console.error('Failed to load student info for attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl w-full mx-auto font-sans">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/students/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Official Attendance Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {studentInfo?.name || 'Student Account'} • Admission No:{' '}
            <strong className="text-emerald-700 font-mono">
              {studentInfo?.admissionNo || 'MIMS/---'}
            </strong>{' '}
            • {studentInfo?.className || 'Enrolled Class'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 shadow-xs focus:outline-none"
          >
            <option value="first">First Term (2025/2026)</option>
            <option value="second">Second Term (2025/2026)</option>
            <option value="third">Third Term (2025/2026)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading attendance records...</p>
        </div>
      ) : attendanceRecords.length === 0 ? (
        /* Clean Zero-Mock Empty State */
        <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              No Attendance Roll Call Submissions Recorded Yet
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Daily morning roll calls and subject-by-subject attendance will display here once recorded and synchronized by your Form Master and assigned subject teachers for this term.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Attendance Policy: Minimum 75% attendance required for terminal exam clearance</span>
          </div>
        </div>
      ) : (
        /* Synchronized Table if Records Exist */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Subject Attendance Distribution
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {attendanceRecords.length} Subjects Moderated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Assigned Instructor</th>
                  <th className="py-3 px-6 text-center">Periods Held</th>
                  <th className="py-3 px-6 text-center">Periods Attended</th>
                  <th className="py-3 px-6 text-center">Percentage</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attendanceRecords.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{item.subject}</td>
                    <td className="py-4 px-6 text-slate-600">{item.teacher}</td>
                    <td className="py-4 px-6 text-center font-mono text-slate-500">{item.totalPeriods}</td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-slate-900">{item.attendedPeriods}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-black text-xs text-emerald-700">{item.rate}%</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
