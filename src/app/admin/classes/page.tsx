'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  GraduationCap,
  X,
  Loader2,
  Inbox,
  Edit,
  Trash2
} from 'lucide-react';

interface ClassItem {
  id: string;
  className: string;
  section: string;
  wing: 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  studentCount: number;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Create Form State
  const [newClassName, setNewClassName] = useState('SSS 1');
  const [newSection, setNewSection] = useState('Science (Gold)');
  const [newWing, setNewWing] = useState<'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Senior Secondary');
  const [tuitionFee, setTuitionFee] = useState('50000');
  const [devLevy, setDevLevy] = useState('5000');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editWing, setEditWing] = useState<'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'>('Senior Secondary');
  const [editTuitionFee, setEditTuitionFee] = useState('50000');
  const [editDevLevy, setEditDevLevy] = useState('5000');
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (data.success && data.classes) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openEditModal = (item: ClassItem) => {
    setEditingClass(item);
    setEditClassName(item.className);
    setEditSection(item.section);
    setEditWing(item.wing);
    setIsEditModalOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim() || !editSection.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClass.id,
          className: editClassName,
          section: editSection,
          wing: editWing,
          tuitionFee: editTuitionFee,
          devLevy: editDevLevy,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification(`Class ${editClassName} (${editSection}) updated successfully!`);
        setTimeout(() => setNotification(null), 4000);
        setIsEditModalOpen(false);
        setEditingClass(null);
        fetchClasses();
      } else {
        alert(data.error || 'Failed to update class arm');
      }
    } catch (err) {
      alert('Error updating class');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClass = async (item: ClassItem) => {
    if (!confirm(`Are you sure you want to delete class arm: ${item.className} - ${item.section}?`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/classes?id=${item.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`Class ${item.className} (${item.section}) removed.`);
        setTimeout(() => setNotification(null), 4000);
        fetchClasses();
      } else {
        alert(data.error || 'Failed to remove class');
      }
    } catch (err) {
      alert('Network error removing class');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newSection.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClassName,
          section: newSection,
          wing: newWing,
          tuitionFee,
          devLevy,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification(`Class ${newClassName} (${newSection}) provisioned with Bursar tariff!`);
        setTimeout(() => setNotification(null), 4000);
        setIsModalOpen(false);
        fetchClasses();
      } else {
        alert(data.error || 'Failed to create class');
      }
    } catch (err) {
      alert('Error connecting to database');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = classes.filter((c) => {
    const matchesSearch =
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWing = selectedWing === 'All' || c.wing === selectedWing;
    return matchesSearch && matchesWing;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Alert */}
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
              Institutional Structure
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Classes, Arms &amp; Bursary Tariff Linkage
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create school classes and academic arms. Configured fee tariffs automatically bind to Bursary invoices and clearance checks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Class Arm</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Classes</span>
          <div className="text-2xl font-black text-white mt-1">{classes.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Active academic sections</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Senior Secondary</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {classes.filter((c) => c.wing === 'Senior Secondary').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">SSS 1 - SSS 3 Arms</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Junior Secondary</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {classes.filter((c) => c.wing === 'Junior Secondary').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">JSS 1 - JSS 3 Arms</span>
        </div>
        <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary &amp; Nursery</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {classes.filter((c) => c.wing === 'Primary' || c.wing === 'Nursery').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">Early Learning Arms</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111C33] border border-[#1E2E50] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search class by name or arm..."
            className="w-full pl-10 pr-4 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="bg-[#0D1527] border border-[#213357] text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All School Wings</option>
            <option value="Senior Secondary">Senior Secondary</option>
            <option value="Junior Secondary">Junior Secondary</option>
            <option value="Primary">Primary Education</option>
            <option value="Nursery">Nursery &amp; Early Years</option>
          </select>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading classes from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center p-6">
            <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-white font-bold text-sm">No Classes Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently zero classes in this category. Click the button above to provision a class and configure its Bursar tariff.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0D1527] border-b border-[#1E2E50] text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3.5 px-4">Class Level</th>
                  <th className="py-3.5 px-4">Section / Arm</th>
                  <th className="py-3.5 px-4">School Wing</th>
                  <th className="py-3.5 px-4">Enrolled Students</th>
                  <th className="py-3.5 px-4 text-center">Bursar Billing Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E50]/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#152342] transition group">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {item.className}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">
                      {item.section}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#182645] text-slate-300 border border-[#23355A]">
                        {item.wing}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-300 font-mono">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.studentCount} Students
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Tariff Bound
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Class Arm & Tariff"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182645] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold transition border border-[#273B66] hover:border-emerald-500/40"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Arm</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClass(item)}
                          disabled={deletingId === item.id}
                          title="Delete Class Arm"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition border border-rose-500/20 disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E50]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create School Class &amp; Arm</h3>
                <p className="text-xs text-slate-400">
                  Configure class level, academic arm, and bind official fee tariffs for Bursar tracking.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Class Level
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSS 1, JSS 2, Basic 5"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Section / Arm Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science (Gold), Diamond"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  School Wing
                </label>
                <select
                  value={newWing}
                  onChange={(e) => setNewWing(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Senior Secondary">Senior Secondary (SSS 1 - SSS 3)</option>
                  <option value="Junior Secondary">Junior Secondary (JSS 1 - JSS 3)</option>
                  <option value="Primary">Primary Education (Basic 1 - Basic 6)</option>
                  <option value="Nursery">Nursery &amp; Early Years (Creche - KG 2)</option>
                </select>
              </div>

              {/* Bursar Tariff Linkage */}
              <div className="p-4 rounded-xl bg-[#0D1527] border border-[#213357] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Bursar Fee Tariff Linkage
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Billed to Students</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Termly Tuition Amount (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-1.5 bg-[#111C33] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Development Levy (₦)
                    </label>
                    <input
                      type="number"
                      value={devLevy}
                      onChange={(e) => setDevLevy(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-1.5 bg-[#111C33] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Total Tariff: <strong className="text-white font-mono">₦{(Number(tuitionFee || 0) + Number(devLevy || 0)).toLocaleString()}.00</strong> per term. The Bursar dashboard will track clearance against this amount.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save &amp; Bind Tariff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Class */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111C33] border border-[#213357] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingClass(null);
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
                <h3 className="text-base font-bold text-white">Edit Academic Class &amp; Arm</h3>
                <p className="text-xs text-slate-400">
                  Update class level, arm designation, and configure fee tariff linkage.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Class Level
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSS 1, JSS 2, Basic 5"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Section / Arm Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science (Gold), Diamond"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  School Wing
                </label>
                <select
                  value={editWing}
                  onChange={(e) => setEditWing(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Senior Secondary">Senior Secondary (SSS 1 - SSS 3)</option>
                  <option value="Junior Secondary">Junior Secondary (JSS 1 - JSS 3)</option>
                  <option value="Primary">Primary Education (Basic 1 - Basic 6)</option>
                  <option value="Nursery">Nursery &amp; Early Years (Creche - KG 2)</option>
                </select>
              </div>

              {/* Bursar Tariff Linkage */}
              <div className="p-4 rounded-xl bg-[#0D1527] border border-[#213357] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Bursar Fee Tariff Linkage
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Billed to Students</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Termly Tuition Amount (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={editTuitionFee}
                      onChange={(e) => setEditTuitionFee(e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-1.5 bg-[#111C33] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Development Levy (₦)
                    </label>
                    <input
                      type="number"
                      value={editDevLevy}
                      onChange={(e) => setEditDevLevy(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-1.5 bg-[#111C33] border border-[#213357] rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Total Tariff: <strong className="text-white font-mono">₦{(Number(editTuitionFee || 0) + Number(editDevLevy || 0)).toLocaleString()}.00</strong> per term. The Bursar dashboard will track clearance against this amount.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
