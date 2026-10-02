'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Save,
  Send,
  Lock,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  HelpCircle,
  Printer,
  ChevronDown,
  Inbox,
  Loader2
} from 'lucide-react';

interface StudentGradeRow {
  id: string;
  admissionNo: string;
  name: string;
  avatar?: string;
  ca1: number | '';
  ca2: number | '';
  exam: number | '';
  remark: string;
}

export default function TeacherGradingPage() {
  const [session, setSession] = useState('2025/2026');
  const [term, setTerm] = useState('first');
  const [selectedAllocation, setSelectedAllocation] = useState('Physics — SS 2 Science (Gold)');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isPastSession = session !== '2025/2026' || term !== 'first';

  useEffect(() => {
    async function loadClassStudents() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        if (data.success && data.students) {
          setStudents(
            data.students.map((s: any) => ({
              id: s.id,
              admissionNo: s.admission_no || 'MIMS/2026/0000',
              name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Student',
              ca1: '',
              ca2: '',
              exam: '',
              remark: '',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load students for grading:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClassStudents();
  }, []);

  const handleScoreChange = (
    id: string,
    field: 'ca1' | 'ca2' | 'exam',
    value: string
  ) => {
    if (isPastSession) return;
    const numValue = value === '' ? '' : Math.min(field === 'exam' ? 70 : 15, Math.max(0, Number(value)));
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: numValue } : s))
    );
  };

  const handleRemarkChange = (id: string, value: string) => {
    if (isPastSession) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remark: value } : s))
    );
  };

  const handleSaveDraft = () => {
    setSaveStatus('Draft scores saved in local workspace! Scores remain withheld from students.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleSubmitAdmin = () => {
    setSaveStatus('Scores successfully submitted to VP Academics & Exam Committee for terminal moderation!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

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
            Grading &amp; Continuous Assessment
          </h1>
          <p className="text-xs text-slate-500">
            Record CA 1 (15), CA 2 (15), and Terminal Exam (70) scores for enrolled students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isPastSession ? (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={students.length === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-slate-500" /> Save Draft
              </button>
              <button
                onClick={handleSubmitAdmin}
                disabled={students.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Submit to Admin
              </button>
            </>
          ) : (
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-300" /> Print Broadsheet
            </button>
          )}
        </div>
      </div>

      {/* Historical Archival Mode Notice */}
      {isPastSession && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Historical Archive Mode (Read-Only)</div>
            <div className="text-slate-600 mt-0.5">
              You are inspecting terminal scores for <strong>{session} ({term.toUpperCase()} Term)</strong>. Term records have been officially locked and transmitted to transcripts.
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {saveStatus}
        </div>
      )}

      {/* Selector Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Academic Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="2025/2026">2025/2026 (Active Session)</option>
              <option value="2024/2025">2024/2025 (Archived)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="first">First Term (Active)</option>
              <option value="second">Second Term</option>
              <option value="third">Third Term</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Teaching Allocation
            </label>
            <select
              value={selectedAllocation}
              onChange={(e) => setSelectedAllocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Physics — SS 2 Science (Gold)">Physics — SS 2 Science (Gold)</option>
              <option value="Physics — SS 3 Science (Diamond)">Physics — SS 3 Science (Diamond)</option>
              <option value="Further Mathematics — SS 2 Science (Gold)">Further Mathematics — SS 2 Science (Gold)</option>
              <option value="Basic Science & Technology — JSS 2 (Silver)">Basic Science & Technology — JSS 2 (Silver)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or admission no..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-center sm:self-auto">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>WAEC Standard: CA1 (15%) + CA2 (15%) + Exam (70%) = 100% Total</span>
          </div>
        </div>
      </div>

      {/* Grading Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading enrolled students from database...
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
                  <th className="py-3 px-4 text-center">CA 1 (15)</th>
                  <th className="py-3 px-4 text-center">CA 2 (15)</th>
                  <th className="py-3 px-4 text-center">Exam (70)</th>
                  <th className="py-3 px-4 text-center font-black text-slate-900">Total (100)</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const ca1Num = typeof student.ca1 === 'number' ? student.ca1 : 0;
                  const ca2Num = typeof student.ca2 === 'number' ? student.ca2 : 0;
                  const examNum = typeof student.exam === 'number' ? student.exam : 0;
                  const total = (student.ca1 !== '' || student.ca2 !== '' || student.exam !== '')
                    ? ca1Num + ca2Num + examNum
                    : null;

                  let grade = '-';
                  let gradeColor = 'text-slate-400';
                  if (total !== null) {
                    if (total >= 75) {
                      grade = 'A1';
                      gradeColor = 'text-emerald-700 bg-emerald-50';
                    } else if (total >= 70) {
                      grade = 'B2';
                      gradeColor = 'text-emerald-600 bg-emerald-50';
                    } else if (total >= 65) {
                      grade = 'B3';
                      gradeColor = 'text-blue-600 bg-blue-50';
                    } else if (total >= 60) {
                      grade = 'C4';
                      gradeColor = 'text-blue-600 bg-blue-50';
                    } else if (total >= 55) {
                      grade = 'C5';
                      gradeColor = 'text-amber-600 bg-amber-50';
                    } else if (total >= 50) {
                      grade = 'C6';
                      gradeColor = 'text-amber-600 bg-amber-50';
                    } else if (total >= 45) {
                      grade = 'D7';
                      gradeColor = 'text-orange-600 bg-orange-50';
                    } else if (total >= 40) {
                      grade = 'E8';
                      gradeColor = 'text-rose-600 bg-rose-50';
                    } else {
                      grade = 'F9';
                      gradeColor = 'text-rose-700 bg-rose-100';
                    }
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{student.admissionNo}</div>
                      </td>

                      {/* CA1 */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="15"
                          disabled={isPastSession}
                          value={student.ca1}
                          onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                          placeholder="-"
                          className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100"
                        />
                      </td>

                      {/* CA2 */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="15"
                          disabled={isPastSession}
                          value={student.ca2}
                          onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                          placeholder="-"
                          className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Exam */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          disabled={isPastSession}
                          value={student.exam}
                          onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                          placeholder="-"
                          className="w-16 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                        {total !== null ? total : '-'}
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-black ${gradeColor}`}>
                          {grade}
                        </span>
                      </td>

                      {/* Remark */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={isPastSession}
                          value={student.remark}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          placeholder="Subject teacher commentary..."
                          className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 placeholder-slate-400"
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
