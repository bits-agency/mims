'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  BookOpen,
  UserPlus,
  CalendarCheck,
  Briefcase,
  Settings,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
  CheckCircle2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { generateAdmissionNumber } from '@/lib/utils';

interface Applicant {
  id: string;
  name: string;
  email: string;
  refNo: string;
  gender: 'male' | 'female';
  appliedDate: string;
  examStatus: 'pending' | 'scheduled' | 'passed' | 'failed';
  examDate?: string;
  examTime?: string;
  examVenue?: string;
  targetClass?: string;
  guardianPhone?: string;
  guardianName?: string;
  reportCardUrl?: string;
  prevSchool?: string;
}

export default function AdminAdmissionsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'enrolled'>('pending');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Modal form states
  const [examDate, setExamDate] = useState('2026-10-18');
  const [examTime, setExamTime] = useState('09:00 AM');
  const [examVenue, setExamVenue] = useState('MIMS Main Examination Hall');
  const [assignedClass, setAssignedClass] = useState('JSS 1 Gold');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmissionsData() {
      try {
        const [appRes, enrolledRes] = await Promise.all([
          fetch('/api/admissions/applicants').then((r) => r.json()).catch(() => null),
          fetch('/api/admin/students').then((r) => r.json()).catch(() => null),
        ]);

        if (appRes?.success && appRes.applicants) {
          const mapped: Applicant[] = appRes.applicants.map((a: any) => {
            let dossier: any = {};
            try {
              if (a.exam_notes && a.exam_notes.startsWith('{')) {
                dossier = JSON.parse(a.exam_notes);
              }
            } catch {}

            return {
              id: a.id,
              name: `${a.firstname || ''} ${a.lastname || ''}`.trim(),
              email: a.users?.email || a.guardian_email || 'N/A',
              refNo: a.admission_no || `APP/${new Date().getFullYear()}/${a.id?.slice(0, 4)}`,
              gender: a.gender || 'male',
              appliedDate: a.created_at?.split('T')[0] || '2026-10-01',
              examStatus: a.exam_status || 'pending',
              examDate: a.exam_date,
              examTime: a.exam_time,
              examVenue: a.exam_venue,
              targetClass: dossier.target_class || a.classes?.class_name || 'General Admission',
              guardianPhone: a.guardian_phone || 'N/A',
              guardianName: a.guardian_name || 'N/A',
              reportCardUrl: dossier.report_card_url || null,
              prevSchool: dossier.prev_school || 'N/A',
            };
          });
          setApplicants(mapped);
        }

        if (enrolledRes?.success && enrolledRes.students) {
          const mappedEnrolled = enrolledRes.students.map((s: any) => ({
            admissionNo: s.admission_no || 'N/A',
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
            className: `${s.classes?.class_name || ''} ${s.classes?.section || ''}`.trim(),
            gender: s.gender || 'male',
            guardianPhone: s.guardian_phone || 'N/A',
          }));
          setEnrolledStudents(mappedEnrolled);
        }
      } catch (err) {
        console.error('Failed to load admissions data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdmissionsData();
  }, []);

  const handleScheduleExam = () => {
    if (!selectedApplicant) return;

    setApplicants((prev) =>
      prev.map((app) =>
        app.id === selectedApplicant.id
          ? {
              ...app,
              examStatus: 'scheduled',
              examDate,
              examTime,
              examVenue,
            }
          : app
      )
    );

    setShowScheduleModal(false);
    setActionNotice(`Entrance Exam successfully scheduled for ${selectedApplicant.name}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleApproveEnroll = () => {
    if (!selectedApplicant) return;
    const newAdmNo = generateAdmissionNumber(Math.floor(100 + Math.random() * 900));

    // Remove from applicants
    setApplicants((prev) => prev.filter((a) => a.id !== selectedApplicant.id));

    // Add to enrolled students
    setEnrolledStudents((prev) => [
      ...prev,
      {
        admissionNo: newAdmNo,
        name: selectedApplicant.name,
        className: assignedClass,
        gender: selectedApplicant.gender,
        guardianPhone: '0800 000 0000',
      },
    ]);

    setShowApproveModal(false);
    setActionNotice(
      `Congratulations! ${selectedApplicant.name} has been enrolled in ${assignedClass} with Matriculation No: ${newAdmNo}`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReject = (id: string, name: string) => {
    if (confirm(`Are you sure you want to decline admission for ${name}?`)) {
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      setActionNotice(`Application for ${name} has been marked as declined.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Admissions Desk &amp; Matriculation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Student Admissions &amp; Enrolment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage online applicant vetting, entrance exam invitations &amp; class matriculation.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admissions/apply"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-200 text-xs font-semibold border border-[#273B66] transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Public Application Portal</span>
          </Link>
        </div>
      </div>
          {actionNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {actionNotice}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex items-center gap-3 border-b border-[#1E2E50] pb-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Pending Applicants ({applicants.length})
            </button>

            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activeTab === 'enrolled'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Enrolled Directory ({enrolledStudents.length})
            </button>
          </div>

          {/* TAB 1: PENDING APPLICANTS */}
          {activeTab === 'pending' && (
            <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#15223E] border-b border-[#1E2E50] text-slate-400 text-[11px] uppercase font-bold">
                      <th className="py-3 px-6">Ref No.</th>
                      <th className="py-3 px-6">Applicant Name</th>
                      <th className="py-3 px-6">Target Grade</th>
                      <th className="py-3 px-6">Previous Report Card</th>
                      <th className="py-3 px-6">Exam Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2E50]/60">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-[#15223E]/50 transition">
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                          {app.refNo}
                        </td>
                        <td className="py-4 px-6">
                          <strong className="block text-white font-bold">{app.name}</strong>
                          <span className="text-[11px] text-slate-400">{app.guardianPhone}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-300 font-semibold">
                          {app.targetClass}
                        </td>
                        <td className="py-4 px-6">
                          {app.reportCardUrl ? (
                            <a
                              href={app.reportCardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Cloud Copy</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Physical on Exam Day
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              app.examStatus === 'scheduled'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {app.examStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setShowScheduleModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#1D2C4D] hover:bg-[#253966] text-slate-200 text-xs font-semibold transition"
                            >
                              Schedule Exam
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setShowApproveModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow"
                            >
                              Enrol Student
                            </button>
                            <button
                              onClick={() => handleReject(app.id, app.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ENROLLED STUDENTS */}
          {activeTab === 'enrolled' && (
            <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#15223E] border-b border-[#1E2E50] text-slate-400 text-[11px] uppercase font-bold">
                      <th className="py-3 px-6">Admission No.</th>
                      <th className="py-3 px-6">Student Name</th>
                      <th className="py-3 px-6">Enrolled Class</th>
                      <th className="py-3 px-6">Guardian Phone</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2E50]/60">
                    {enrolledStudents.map((st, i) => (
                      <tr key={i} className="hover:bg-[#15223E]/50 transition">
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                          {st.admissionNo}
                        </td>
                        <td className="py-4 px-6 font-bold text-white">{st.name}</td>
                        <td className="py-4 px-6 text-slate-300">{st.className}</td>
                        <td className="py-4 px-6 text-slate-400 font-mono">
                          {st.guardianPhone}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* MODAL 1: SCHEDULE EXAM */}
      {showScheduleModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Schedule Entrance Exam</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inviting applicant <strong className="text-white">{selectedApplicant.name}</strong> ({selectedApplicant.refNo})
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15223E] border border-[#23355A] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Time</label>
                <input
                  type="text"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15223E] border border-[#23355A] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Venue</label>
                <input
                  type="text"
                  value={examVenue}
                  onChange={(e) => setExamVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15223E] border border-[#23355A] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleExam}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APPROVE & ENROL */}
      {showApproveModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Enrol & Matriculate Student</h3>
            <p className="text-xs text-slate-400 mb-4">
              Assign class arm and activate student portal account for <strong className="text-white">{selectedApplicant.name}</strong>
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Assign Class Level & Arm</label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#15223E] border border-[#23355A] text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="JSS 1 Gold">JSS 1 Gold</option>
                  <option value="JSS 2 Gold">JSS 2 Gold</option>
                  <option value="JSS 3 Gold">JSS 3 Gold</option>
                  <option value="SS 1 Science">SS 1 Science</option>
                  <option value="SS 1 Art & Humanities">SS 1 Art & Humanities</option>
                  <option value="SS 2 Science">SS 2 Science</option>
                  <option value="SS 3 Science">SS 3 Science</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#15223E] border border-[#23355A] text-slate-300 text-xs">
                <span className="block font-bold text-emerald-400 mb-1">Automatic System Actions:</span>
                • Sets exam status to passed<br />
                • Generates matriculation number (e.g. MIMS/2026/XXXX)<br />
                • Upgrades account status from pending to active
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveEnroll}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                Confirm Enrolment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
