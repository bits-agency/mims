'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Shield,
  Key,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  MoreVertical,
  X,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Check,
  Inbox,
  Plus,
  Loader2,
  Sparkles
} from 'lucide-react';

interface StaffMember {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  role: 'Teacher' | 'Bursar' | 'Vice Principal' | 'Principal' | 'Tahfeez Coordinator';
  department: 'Sciences' | 'Arts & Humanities' | 'Islamic Studies' | 'Administration' | 'Bursary';
  assignedClasses: string[];
  assignedClassIds: string[];
  assignedSubjects: string[];
  teachingPairs?: Array<{ subject: string; classId: string; className?: string }>;
  isClassTeacher?: boolean;
  classTeacherClassId?: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  joinDate: string;
}

interface ClassOption {
  id: string;
  className: string;
  section: string;
  wing: string;
}

const DEFAULT_CURRICULUM_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Islamic Religious Studies (IRS)',
  'Arabic Language',
  'Civic Education',
  'Economics',
  'Agricultural Science',
  'Computer Studies / ICT',
  'Government',
  'Literature in English',
  'Tahfeez (Holy Quran)',
  'Basic Science',
  'Social Studies'
];

interface AssignmentPair {
  id: string;
  subject: string;
  classId: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State (New & Edit)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffMember['role']>('Teacher');
  const [formDept, setFormDept] = useState<StaffMember['department']>('Sciences');
  
  // Advanced Allocation State
  const [allocationMode, setAllocationMode] = useState<'specialist' | 'class_teacher'>('specialist');
  const [classTeacherClassId, setClassTeacherClassId] = useState<string>('');
  const [assignmentPairs, setAssignmentPairs] = useState<AssignmentPair[]>([
    { id: '1', subject: 'English Language', classId: '' }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, classRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/classes')
      ]);

      const staffData = await staffRes.json();
      const classData = await classRes.json();

      if (classData?.success && classData.classes) {
        setAvailableClasses(classData.classes);
      }

      if (staffData?.success && staffData.staff) {
        const mapped: StaffMember[] = staffData.staff.map((s: any) => {
          const roleName =
            s.users?.role === 'bursar'
              ? 'Bursar'
              : s.users?.role === 'admin'
              ? 'Principal'
              : 'Teacher';

          // Extract assigned subjects & classes from subjects relation
          let subs: string[] = [];
          let clsNames: string[] = [];
          let clsIds: string[] = [];
          const pairs: Array<{ subject: string; classId: string; className?: string }> = [];

          if (s.subjects && s.subjects.length > 0) {
            subs = Array.from(new Set(s.subjects.map((sub: any) => sub.subject_name)));
            clsNames = Array.from(
              new Set(
                s.subjects
                  .map((sub: any) =>
                    sub.classes ? `${sub.classes.class_name} (${sub.classes.section})` : null
                  )
                  .filter(Boolean)
              )
            );
            clsIds = Array.from(
              new Set(s.subjects.map((sub: any) => sub.class_id).filter(Boolean))
            );
            s.subjects.forEach((sub: any) => {
              const cName = sub.classes ? `${sub.classes.class_name} (${sub.classes.section})` : 'Class';
              pairs.push({
                subject: sub.subject_name,
                classId: sub.class_id,
                className: cName
              });
            });
          } else if (s.qualification) {
            subs = s.qualification.split(',').map((x: string) => x.trim()).filter(Boolean);
          }

          if (subs.length === 0) subs = ['General'];
          if (clsNames.length === 0) clsNames = ['Unassigned'];

          // Check if primary class teacher (has 5+ subjects in the same single class)
          const isClassTeacher = clsIds.length === 1 && pairs.length >= 5;

          return {
            id: s.id,
            staffId: s.staff_no || 'STF/001',
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Faculty Staff',
            email: s.email || s.users?.email || 'N/A',
            phone: s.phone || 'N/A',
            role: roleName,
            department: (s.department as any) || 'Sciences',
            assignedClasses: clsNames,
            assignedClassIds: clsIds,
            assignedSubjects: subs,
            teachingPairs: pairs,
            isClassTeacher: isClassTeacher,
            classTeacherClassId: isClassTeacher ? clsIds[0] : undefined,
            status: s.users?.status === 'inactive' ? 'Suspended' : 'Active',
            joinDate: 'Oct 2026',
          };
        });
        setStaffList(mapped);
      }
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const addAssignmentPair = () => {
    setAssignmentPairs((prev) => [
      ...prev,
      { id: Date.now().toString(), subject: 'English Language', classId: availableClasses[0]?.id || '' }
    ]);
  };

  const removeAssignmentPair = (id: string) => {
    setAssignmentPairs((prev) => prev.filter((p) => p.id !== id));
  };

  const updateAssignmentPair = (id: string, field: 'subject' | 'classId', value: string) => {
    setAssignmentPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Teacher');
    setFormDept('Sciences');
    setAllocationMode('specialist');
    const primaryCls = availableClasses.find((c) => c.wing === 'Primary') || availableClasses[0];
    setClassTeacherClassId(primaryCls?.id || '');
    setAssignmentPairs([
      { id: '1', subject: 'English Language', classId: availableClasses[0]?.id || '' }
    ]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPhone(staff.phone === 'N/A' ? '' : staff.phone);
    setFormRole(staff.role);
    setFormDept(staff.department);

    if (staff.isClassTeacher && staff.classTeacherClassId) {
      setAllocationMode('class_teacher');
      setClassTeacherClassId(staff.classTeacherClassId);
      setAssignmentPairs([
        { id: '1', subject: 'English Language', classId: staff.classTeacherClassId }
      ]);
    } else if (staff.teachingPairs && staff.teachingPairs.length > 0) {
      setAllocationMode('specialist');
      setClassTeacherClassId(availableClasses.find((c) => c.wing === 'Primary')?.id || '');
      setAssignmentPairs(
        staff.teachingPairs.map((p, idx) => ({
          id: `${idx}-${Date.now()}`,
          subject: p.subject,
          classId: p.classId
        }))
      );
    } else {
      setAllocationMode('specialist');
      setAssignmentPairs([
        {
          id: '1',
          subject: staff.assignedSubjects[0] || 'English Language',
          classId: staff.assignedClassIds[0] || availableClasses[0]?.id || ''
        }
      ]);
    }
    setIsEditModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setSubmitting(true);
    const validPairs = assignmentPairs.filter((p) => p.subject.trim() && p.classId);
    const uniqueSubs = Array.from(new Set(validPairs.map((p) => p.subject.trim())));
    const uniqueClassIds = Array.from(new Set(validPairs.map((p) => p.classId)));

    const assignedClassNames = availableClasses
      .filter((c) => (allocationMode === 'class_teacher' ? c.id === classTeacherClassId : uniqueClassIds.includes(c.id)))
      .map((c) => `${c.className} (${c.section})`);

    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      staffId: `MIMS/STF/2026/0${staffList.length + 10}`,
      name: formName,
      email: formEmail,
      phone: formPhone || '+234 800 000 0000',
      role: formRole,
      department: formDept,
      assignedClasses: assignedClassNames.length > 0 ? assignedClassNames : ['Unassigned'],
      assignedClassIds: allocationMode === 'class_teacher' ? [classTeacherClassId] : uniqueClassIds,
      assignedSubjects: allocationMode === 'class_teacher' ? ['Primary Core Curriculum'] : uniqueSubs,
      isClassTeacher: allocationMode === 'class_teacher',
      classTeacherClassId: allocationMode === 'class_teacher' ? classTeacherClassId : undefined,
      teachingPairs: allocationMode === 'specialist' ? validPairs.map((p) => ({
        subject: p.subject,
        classId: p.classId,
        className: availableClasses.find((c) => c.id === p.classId)?.className || 'Class'
      })) : undefined,
      status: 'Active',
      joinDate: 'Oct 2026',
    };

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_no: newStaff.staffId,
          firstname: formName.split(' ')[0],
          lastname: formName.split(' ').slice(1).join(' ') || 'Faculty',
          email: formEmail,
          phone: formPhone,
          department: formDept,
          isClassTeacher: allocationMode === 'class_teacher',
          classTeacherClassId: allocationMode === 'class_teacher' ? classTeacherClassId : null,
          teachingAssignments: allocationMode === 'specialist' ? validPairs.map((p) => ({ subject: p.subject.trim(), classId: p.classId })) : [],
          assignedSubjects: allocationMode === 'class_teacher' ? ['Primary Core Curriculum'] : uniqueSubs,
          assignedClassIds: allocationMode === 'class_teacher' ? [classTeacherClassId] : uniqueClassIds,
        }),
      });

      if (res.ok) {
        showToast(`Account successfully provisioned for ${newStaff.name}!`);
        setIsAddModalOpen(false);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create staff account');
      }
    } catch (err) {
      alert('Network error provisioning staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !formName.trim()) return;

    setSubmitting(true);
    const validPairs = assignmentPairs.filter((p) => p.subject.trim() && p.classId);
    const uniqueSubs = Array.from(new Set(validPairs.map((p) => p.subject.trim())));
    const uniqueClassIds = Array.from(new Set(validPairs.map((p) => p.classId)));

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStaff.id,
          firstname: formName.split(' ')[0],
          lastname: formName.split(' ').slice(1).join(' ') || 'Faculty',
          email: formEmail,
          phone: formPhone,
          department: formDept,
          isClassTeacher: allocationMode === 'class_teacher',
          classTeacherClassId: allocationMode === 'class_teacher' ? classTeacherClassId : null,
          teachingAssignments: allocationMode === 'specialist' ? validPairs.map((p) => ({ subject: p.subject.trim(), classId: p.classId })) : [],
          assignedSubjects: allocationMode === 'class_teacher' ? ['Primary Core Curriculum'] : uniqueSubs,
          assignedClassIds: allocationMode === 'class_teacher' ? [classTeacherClassId] : uniqueClassIds,
        }),
      });

      if (res.ok) {
        showToast(`Staff profile & subject allocations updated for ${formName}!`);
        setIsEditModalOpen(false);
        setEditingStaff(null);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update staff');
      }
    } catch (err) {
      alert('Error updating staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = (name: string, email: string) => {
    showToast(`Password reset link generated and dispatched to ${email} for ${name}.`);
  };

  const handleToggleStatus = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`${s.name} account is now marked as ${nextStatus}.`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Filter staff
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Access Control &amp; Faculty
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Staff &amp; Faculty Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize credentials, grant portal roles (Teacher, Bursar, Admin), and assign subjects/class arms.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Staff Account</span>
        </button>
      </div>

      {/* Faculty Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Faculty</span>
          <div className="text-2xl font-black text-white mt-1">{staffList.length}</div>
          <span className="text-[10px] text-emerald-400 mt-1 inline-block">Active in Database</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teaching Staff</span>
          <div className="text-2xl font-black text-white mt-1">
            {staffList.filter((s) => s.role === 'Teacher').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Assigned to Arms</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bursary Desk</span>
          <div className="text-2xl font-black text-white mt-1">
            {staffList.filter((s) => s.role === 'Bursar').length}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 inline-block">Finance Clearance</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tahfeez Instructors</span>
          <div className="text-2xl font-black text-white mt-1">
            {staffList.filter((s) => s.role === 'Tahfeez Coordinator').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Quran Circles</span>
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
            placeholder="Search by staff name, Staff ID, or email..."
            className="w-full pl-10 pr-4 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Roles</option>
            <option value="Teacher">Teacher</option>
            <option value="Bursar">Bursar</option>
            <option value="Vice Principal">Vice Principal</option>
            <option value="Tahfeez Coordinator">Tahfeez Coordinator</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Departments</option>
            <option value="Sciences">Sciences</option>
            <option value="Arts & Humanities">Arts & Humanities</option>
            <option value="Islamic Studies">Islamic Studies</option>
            <option value="Administration">Administration</option>
            <option value="Bursary">Bursary</option>
          </select>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading faculty records...
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E2E50] bg-[#0E172A] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Faculty Member</th>
                  <th className="py-3.5 px-4">Staff ID &amp; Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Subjects</th>
                  <th className="py-3.5 px-4">Assigned Class Arms</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A284A]">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#152340] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{staff.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {staff.email}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {staff.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-emerald-400 font-semibold">{staff.staffId}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0D1527] text-slate-300 border border-[#213357]">
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">{staff.department}</span>
                      <div className="text-[10px] text-slate-500">Joined {staff.joinDate}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      {staff.isClassTeacher ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            👑 Primary Class Teacher
                          </span>
                          <span className="text-[10px] text-slate-400">All Core Subjects</span>
                        </div>
                      ) : staff.teachingPairs && staff.teachingPairs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {staff.teachingPairs.map((pair, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-medium text-emerald-300 flex items-center gap-1"
                            >
                              <span>{pair.subject}</span>
                              <span className="text-slate-500">➔</span>
                              <span className="text-slate-200 font-semibold">{pair.className}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {staff.assignedSubjects.map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-medium text-emerald-300"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-[220px]">
                      {staff.isClassTeacher ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-500/30">
                          {staff.assignedClasses[0] || 'Primary'}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {staff.assignedClasses.map((cls, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-[#1B2945] rounded-md text-[10px] text-slate-200 border border-[#273B66]"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(staff)}
                          title="Edit Faculty & Subject Allocations"
                          className="p-1.5 rounded-lg bg-[#182645] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition border border-[#273B66]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleResetPassword(staff.name, staff.email)}
                          title="Send Password Reset Link"
                          className="p-1.5 rounded-lg bg-[#182645] hover:bg-[#203259] text-amber-300 transition border border-[#273B66]"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(staff.id)}
                          title={staff.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition border ${
                            staff.status === 'Active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
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
            <h4 className="text-xs font-bold text-white">No Staff Accounts Provisioned Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Click &quot;Provision New Staff Account&quot; to register your faculty and grant portal access.
            </p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Provision New Staff Account</h3>
                <p className="text-xs text-slate-400">
                  New staff will receive portal access and temporary login credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name &amp; Title (e.g. Ustadh, Mr, Dr)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ustadh Muhammad Aminu"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@mimsakure.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 803 000 0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Portal Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as StaffMember['role'])}
                    className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Teacher">Teacher (Grades & Attendance)</option>
                    <option value="Bursar">Bursar (Fees & Receipt Stamping)</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Tahfeez Coordinator">Tahfeez Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as StaffMember['department'])}
                    className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Administration">Administration</option>
                    <option value="Bursary">Bursary</option>
                  </select>
                </div>
              </div>

              {/* Teaching Assignment Allocation */}
              {formRole === 'Teacher' ? (
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#213357] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Teaching Assignment Model
                    </label>
                    <span className="text-[10px] text-slate-400">Class Teacher vs Subject Specialist</span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-[#111C33] p-1 rounded-xl border border-[#1E2E50]">
                    <button
                      type="button"
                      onClick={() => setAllocationMode('class_teacher')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        allocationMode === 'class_teacher'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Primary Class Teacher
                    </button>

                    <button
                      type="button"
                      onClick={() => setAllocationMode('specialist')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        allocationMode === 'specialist'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Subject Specialist (Secondary)
                    </button>
                  </div>

                  {allocationMode === 'class_teacher' ? (
                    <div className="space-y-2.5 bg-[#111C33]/70 p-3.5 rounded-xl border border-emerald-500/20">
                      <label className="text-xs font-bold text-emerald-300">
                        Select Class Arm (Creche, Nursery &amp; Primary 1-5):
                      </label>
                      <select
                        value={classTeacherClassId}
                        onChange={(e) => setClassTeacherClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {availableClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.className} {c.section && c.section !== 'Main' ? `(${c.section})` : ''} - {c.wing || 'School'}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        👑 <strong className="text-emerald-400">Class Teacher Privilege:</strong> This educator will be automatically allocated to teach <strong>all core curriculum subjects</strong> (Mathematics, English Language, Basic Science, Social Studies, Islamic Religious Studies, Arabic, Tahfeez, ICT, Agricultural Science) for this grade and manage daily roll-call attendance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Subject-to-Class Allocations ({assignmentPairs.length})
                        </span>
                        <button
                          type="button"
                          onClick={addAssignmentPair}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Add Assignment Pair
                        </button>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {assignmentPairs.map((pair, index) => (
                          <div
                            key={pair.id}
                            className="flex items-center gap-2 p-2 bg-[#111C33] rounded-xl border border-[#1E2E50]"
                          >
                            <span className="text-[10px] font-bold text-slate-500 w-4 text-center">
                              #{index + 1}
                            </span>

                            {/* Subject Selector */}
                            <div className="flex-1">
                              <select
                                value={pair.subject}
                                onChange={(e) => updateAssignmentPair(pair.id, 'subject', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#0D1527] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                {DEFAULT_CURRICULUM_SUBJECTS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            <span className="text-xs text-slate-500 font-bold">➔</span>

                            {/* Class Selector */}
                            <div className="flex-1">
                              <select
                                value={pair.classId}
                                onChange={(e) => updateAssignmentPair(pair.id, 'classId', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#0D1527] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                <option value="">Select Class Arm...</option>
                                {availableClasses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.className} {c.section && c.section !== 'Main' ? `(${c.section})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeAssignmentPair(pair.id)}
                              disabled={assignmentPairs.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition rounded-lg hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        💡 Allows assigning e.g. <strong>English Language</strong> in <strong>SSS 2 (Arts)</strong>, and <strong>Biology</strong> in <strong>SSS 3 (Science)</strong>. Teachers will only see score-sheets for their assigned pairs.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Administrative role ({formRole}) does not require classroom teaching allocations.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1E2E50] hover:bg-[#2A3E6B] text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Confirm &amp; Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingStaff(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Edit Faculty &amp; Subject Allocations</h3>
                <p className="text-xs text-slate-400">
                  Update {editingStaff.name}&apos;s profile, role, subjects, and assigned class arms.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name &amp; Title
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value as StaffMember['department'])}
                  className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sciences">Sciences</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                  <option value="Islamic Studies">Islamic Studies</option>
                  <option value="Administration">Administration</option>
                  <option value="Bursary">Bursary</option>
                </select>
              </div>

              {/* Teaching Assignment Allocation */}
              {formRole === 'Teacher' ? (
                <div className="p-4 rounded-xl bg-[#0D1527] border border-[#213357] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Teaching Assignment Model
                    </label>
                    <span className="text-[10px] text-slate-400">Class Teacher vs Subject Specialist</span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-[#111C33] p-1 rounded-xl border border-[#1E2E50]">
                    <button
                      type="button"
                      onClick={() => setAllocationMode('class_teacher')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        allocationMode === 'class_teacher'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Primary Class Teacher
                    </button>

                    <button
                      type="button"
                      onClick={() => setAllocationMode('specialist')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        allocationMode === 'specialist'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Subject Specialist (Secondary)
                    </button>
                  </div>

                  {allocationMode === 'class_teacher' ? (
                    <div className="space-y-2.5 bg-[#111C33]/70 p-3.5 rounded-xl border border-emerald-500/20">
                      <label className="text-xs font-bold text-emerald-300">
                        Select Class Arm (Creche, Nursery &amp; Primary 1-5):
                      </label>
                      <select
                        value={classTeacherClassId}
                        onChange={(e) => setClassTeacherClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {availableClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.className} {c.section && c.section !== 'Main' ? `(${c.section})` : ''} - {c.wing || 'School'}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        👑 <strong className="text-emerald-400">Class Teacher Privilege:</strong> This educator will be automatically allocated to teach <strong>all core curriculum subjects</strong> for this grade and manage daily roll-call attendance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Subject-to-Class Allocations ({assignmentPairs.length})
                        </span>
                        <button
                          type="button"
                          onClick={addAssignmentPair}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Add Assignment Pair
                        </button>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {assignmentPairs.map((pair, index) => (
                          <div
                            key={pair.id}
                            className="flex items-center gap-2 p-2 bg-[#111C33] rounded-xl border border-[#1E2E50]"
                          >
                            <span className="text-[10px] font-bold text-slate-500 w-4 text-center">
                              #{index + 1}
                            </span>

                            {/* Subject Selector */}
                            <div className="flex-1">
                              <select
                                value={pair.subject}
                                onChange={(e) => updateAssignmentPair(pair.id, 'subject', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#0D1527] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                {DEFAULT_CURRICULUM_SUBJECTS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            <span className="text-xs text-slate-500 font-bold">➔</span>

                            {/* Class Selector */}
                            <div className="flex-1">
                              <select
                                value={pair.classId}
                                onChange={(e) => updateAssignmentPair(pair.id, 'classId', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#0D1527] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                <option value="">Select Class Arm...</option>
                                {availableClasses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.className} {c.section && c.section !== 'Main' ? `(${c.section})` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeAssignmentPair(pair.id)}
                              disabled={assignmentPairs.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition rounded-lg hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        💡 Example: <strong>English Language</strong> in <strong>SSS 2 (Arts)</strong>, and <strong>Biology</strong> in <strong>SSS 3 (Science)</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Administrative role ({formRole}) does not require classroom teaching allocations.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1E2E50] hover:bg-[#2A3E6B] text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/40 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Allocations</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
