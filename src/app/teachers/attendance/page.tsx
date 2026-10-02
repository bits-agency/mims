'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Send,
  Calendar,
  Layers,
  Inbox,
  Loader2
} from 'lucide-react';

interface StudentAttendanceRow {
  id: string;
  admissionNo: string;
  name: string;
  avatar?: string;
  totalHeld: number;
  totalAttended: number;
  status: 'present' | 'absent' | 'late';
  remark: string;
}

export default function TeacherAttendancePage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAllocations() {
      try {
        const res = await fetch('/api/teachers/allocations');
        const data = await res.json();
        if (data.success && Array.isArray(data.allocations) && data.allocations.length > 0) {
          const mapped = data.allocations.map((a: any) => ({
            id: a.id,
            classId: a.class_id,
            label: `${a.subject_name} — ${a.classes?.class_name || ''} ${a.classes?.section ? '(' + a.classes.section + ')' : ''}`.trim(),
            subjectName: a.subject_name,
            className: a.classes?.class_name || '',
          }));
          setAllocations(mapped);
          setSelectedAllocationId(mapped[0].id);
        } else {
          setAllocations([
            { id: '55555555-5555-5555-5555-555555555503', classId: '22222222-2222-2222-2222-222222222206', label: 'Physics — SSS 2 Science (Gold)' }
          ]);
          setSelectedAllocationId('55555555-5555-5555-5555-555555555503');
        }
      } catch (err) {
        console.error('Failed to load allocations:', err);
      }
    }
    loadAllocations();
  }, []);

  const currentAllocation = allocations.find((a) => a.id === selectedAllocationId) || allocations[0];

  useEffect(() => {
    async function loadAttendanceData() {
      if (!currentAllocation) return;
      setLoading(true);
      try {
        const [studRes, attRes] = await Promise.all([
          fetch(`/api/teachers/students?classId=${currentAllocation.classId || ''}`).then((r) => r.json()).catch(() => null),
          fetch(`/api/teachers/attendance?classId=${currentAllocation.classId || ''}&subjectId=${currentAllocation.id || ''}&date=${date}`).then((r) => r.json()).catch(() => null),
        ]);

        const attMap: Record<string, any> = {};
        if (attRes?.records) {
          attRes.records.forEach((rec: any) => {
            attMap[rec.student_id] = rec;
          });
        }

        if (studRes?.success && studRes.students) {
          setStudents(
            studRes.students.map((s: any) => ({
              id: s.id,
              admissionNo: s.admission_no || 'MIMS/2026/0000',
              name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Student',
              totalHeld: 0,
              totalAttended: 0,
              status: (attMap[s.id]?.status as 'present' | 'absent' | 'late') || ('present' as const),
              remark: attMap[s.id]?.remark || '',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendanceData();
  }, [selectedAllocationId, date]);

  const handleStatusChange = (id: string, newStatus: 'present' | 'absent' | 'late') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarkChange = (id: string, newRemark: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remark: newRemark } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const handleSubmit = async () => {
    if (!currentAllocation || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: s.status,
        remark: s.remark,
      }));

      const res = await fetch('/api/teachers/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceRecords: records,
          classId: currentAllocation.classId,
          subjectId: currentAllocation.id,
          date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setSubmitMessage(data.message || 'Daily roll call synchronized to database.');
      } else {
        setSubmitMessage(data.error || 'Failed to save attendance.');
      }
    } catch (err: any) {
      setSubmitMessage(err?.message || 'Network error saving attendance.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSubmitted(false);
        setSubmitMessage(null);
      }, 4000);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl w-full mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Class Attendance Register
          </h1>
          <p className="text-xs text-slate-500">
            Daily roll call & period register. Absences automatically calculate terminal percentage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mark All Present
          </button>
          <button
            onClick={handleSubmit}
            disabled={students.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Transmit Register
          </button>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Attendance register submitted to the database and principal record. Parents of absent students are notified via SMS/WhatsApp.
        </div>
      )}

      {/* Control Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Teaching Allocation
            </label>
            <select
              value={selectedAllocationId}
              onChange={(e) => setSelectedAllocationId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              {allocations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Roll Call Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
            Total in Class: {students.length}
          </div>
          <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Present: {presentCount}
          </div>
          <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
            Late: {lateCount}
          </div>
          <div className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
            Absent: {absentCount}
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading class attendance from database...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center p-6">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-sm">No Students Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently zero students enrolled in this class arm in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 text-center">Cumulative</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Absence / Late Excuse Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const pct = student.totalHeld > 0 ? Math.round((student.totalAttended / student.totalHeld) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.admissionNo}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-slate-800">{pct}%</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student.totalAttended} / {student.totalHeld}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              student.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              student.status === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              student.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={student.remark}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          placeholder="Optional reason for late / absent..."
                          className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
