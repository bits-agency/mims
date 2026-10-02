'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  Inbox,
  Key
} from 'lucide-react';

interface StudentRecord {
  id: string;
  admissionNo: string;
  name: string;
  gender: 'Male' | 'Female';
  classArm: string;
  category: 'Day' | 'Boarding';
  guardianName: string;
  guardianPhone: string;
  status: 'Enrolled' | 'Graduated' | 'Transferred';
  feeStatus: 'Cleared' | 'Owing';
  outstandingBalance: number;
}

export default function AdminStudentRegistryPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [pendingApplicantCount, setPendingApplicantCount] = useState<number>(0);

  useEffect(() => {
    async function loadStudents() {
      try {
        const [res, appRes] = await Promise.all([
          fetch('/api/admin/students'),
          fetch('/api/admissions/applicants'),
        ]);

        const data = await res.json().catch(() => ({}));
        const appData = await appRes.json().catch(() => ({}));

        if (appData?.success && appData.applicants) {
          setPendingApplicantCount(appData.applicants.length);
        }

        if (data?.success && data.students) {
          const mapped: StudentRecord[] = data.students.map((s: any) => {
            const clr = s.student_fee_clearance?.[0];
            const isCleared = clr?.is_cleared ?? false;
            const balance = Number(clr?.balance || 0);

            return {
              id: s.id,
              admissionNo: s.admission_no || 'N/A',
              name: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
              gender: s.gender === 'female' ? 'Female' : 'Male',
              classArm: `${s.classes?.class_name || ''} ${s.classes?.section || ''}`.trim(),
              category: s.category || 'Day',
              guardianName: s.guardian_name || 'N/A',
              guardianPhone: s.guardian_phone || 'N/A',
              status: 'Enrolled',
              feeStatus: isCleared ? 'Cleared' : 'Owing',
              outstandingBalance: balance,
            };
          });
          setStudents(mapped);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleResetStudentPassword = async (std: StudentRecord) => {
    const defaultPassword = 'Mimsakure27';
    const confirm = window.confirm(`Reset portal login password for student "${std.name}" (${std.admissionNo}) to default "${defaultPassword}"?`);
    if (!confirm) return;

    try {
      const res = await fetch('/api/admin/students/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: std.id, newPassword: defaultPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(defaultPassword).catch(() => {});
        }
        alert(`Success: Password for ${std.name} has been reset to "${defaultPassword}"! (Copied to clipboard)`);
      } else {
        alert(data.error || 'Failed to reset password');
      }
    } catch {
      alert('Network error resetting student password');
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === 'All' ||
      (classFilter === 'Senior' && s.classArm.startsWith('SSS')) ||
      (classFilter === 'Junior' && s.classArm.startsWith('JSS')) ||
      (classFilter === 'Primary' && s.classArm.startsWith('Primary')) ||
      (classFilter === 'Nursery' && s.classArm.startsWith('Nursery'));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesFee = feeFilter === 'All' || s.feeStatus === feeFilter;

    return matchesSearch && matchesClass && matchesCategory && matchesFee;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Central Master Records
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Student Master Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live database records across Nursery, Primary, Junior, and Senior Secondary campuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/admissions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20"
          >
            <span>Review New Applicants</span>
          </Link>
        </div>
      </div>

      {/* Pending Applicants Notice */}
      {pendingApplicantCount > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-300">
            <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white font-bold">Online Admission Applicants Awaiting Review</strong>
              <p className="text-[11px] text-slate-300 mt-0.5">
                You have {pendingApplicantCount} prospective candidate {pendingApplicantCount === 1 ? 'applicant' : 'applicants'} waiting for entrance screening &amp; class allocation.
              </p>
            </div>
          </div>
          <Link
            href="/admin/admissions"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shrink-0 text-center"
          >
            Go to Admissions Desk ({pendingApplicantCount}) →
          </Link>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Pupils</span>
          <div className="text-2xl font-black text-white mt-1">{students.length}</div>
          <span className="text-[10px] text-emerald-400 mt-1 inline-block">Active in Database</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Boarding Ward</span>
          <div className="text-2xl font-black text-white mt-1">
            {students.filter((s) => s.category === 'Boarding').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Resident Hostel</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day Students</span>
          <div className="text-2xl font-black text-white mt-1">
            {students.filter((s) => s.category === 'Day').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Commuters</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Cleared</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {students.filter((s) => s.feeStatus === 'Cleared').length}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 inline-block">Result Unlocked</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, admission number, or guardian..."
            className="w-full pl-10 pr-4 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Wing Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Wings</option>
            <option value="Senior">Senior Secondary (SSS)</option>
            <option value="Junior">Junior Secondary (JSS)</option>
            <option value="Primary">Primary School</option>
            <option value="Nursery">Nursery School</option>
          </select>

          {/* Boarding/Day Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Day &amp; Boarding</option>
            <option value="Boarding">Boarding Only</option>
            <option value="Day">Day Only</option>
          </select>

          {/* Fee Filter */}
          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Fee Status</option>
            <option value="Cleared">Cleared (₦0)</option>
            <option value="Owing">Defaulters / Owing</option>
          </select>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Student Profile</th>
                  <th className="py-3.5 px-4">Admission No</th>
                  <th className="py-3.5 px-4">Class Arm</th>
                  <th className="py-3.5 px-4">Residency</th>
                  <th className="py-3.5 px-4">Parent / Guardian Contact</th>
                  <th className="py-3.5 px-4">Fee Clearance</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A284A]">
                {filtered.map((std) => (
                  <tr key={std.id} className="hover:bg-[#152340] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{std.name}</div>
                      <div className="text-[11px] text-slate-400">{std.gender}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-emerald-400 font-bold text-xs bg-[#0D1527] px-2 py-0.5 rounded border border-[#213357]">
                        {std.admissionNo}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">{std.classArm}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          std.category === 'Boarding'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-700/40 text-slate-300 border border-slate-600/30'
                        }`}
                      >
                        {std.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{std.guardianName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {std.guardianPhone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {std.feeStatus === 'Cleared' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Owing
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="px-3 py-1.5 rounded-lg bg-[#182645] hover:bg-[#203259] text-slate-200 font-bold text-xs transition border border-[#253961]"
                        >
                          View Dossier
                        </button>
                        <button
                          onClick={() => handleResetStudentPassword(std)}
                          title="Reset Student Password to Default"
                          className="p-1.5 rounded-lg bg-[#182645] hover:bg-[#203259] text-amber-300 transition border border-[#253961]"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center text-slate-400 space-y-3">
            <Inbox className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="text-xs font-bold text-white">No Students Registered Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Admit applicants through the Admissions Desk to populate the master registry.
            </p>
          </div>
        )}
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/20">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-emerald-400">{selectedStudent.admissionNo}</p>
              </div>
            </div>

            <div className="space-y-3 bg-[#0D1527] p-4 rounded-xl border border-[#203258] text-xs">
              <div className="flex justify-between py-1 border-b border-[#1A284A]">
                <span className="text-slate-400">Class Arm:</span>
                <span className="font-bold text-white">{selectedStudent.classArm}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A284A]">
                <span className="text-slate-400">Gender &amp; Type:</span>
                <span className="font-bold text-white">
                  {selectedStudent.gender} • {selectedStudent.category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A284A]">
                <span className="text-slate-400">Guardian Name:</span>
                <span className="font-bold text-white">{selectedStudent.guardianName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A284A]">
                <span className="text-slate-400">Guardian Contact:</span>
                <span className="font-bold text-white">{selectedStudent.guardianPhone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bursary Clearance:</span>
                <span
                  className={`font-bold ${
                    selectedStudent.feeStatus === 'Cleared' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedStudent.feeStatus === 'Cleared' ? 'Cleared (Result Unlocked)' : 'Owing (Locked)'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
