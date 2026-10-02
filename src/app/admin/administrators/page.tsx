'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
  Key,
  Trash2,
  Lock,
  Mail,
  User,
  Crown,
  Briefcase,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Check,
  Building,
  School,
  DollarSign
} from 'lucide-react';

interface Administrator {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: 'active' | 'suspended' | string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function AdministratorsManagementPage() {
  const router = useRouter();
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);

  // Add Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDesignation, setFormDesignation] = useState('Secondary School Principal');
  const [formRole, setFormRole] = useState<'admin' | 'bursar'>('admin');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('Mimsakure27');
  const [showPassword, setShowPassword] = useState(false);

  // Reset Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notifications & Loaders
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAdministrators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/administrators');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdministrators(data.administrators || []);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to load administrators' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error connecting to administrators service' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          if (!data.user.isSuperAdmin) {
            // Not super admin, will display access gate
            setLoading(false);
            return;
          }
          fetchAdministrators();
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleEmailChange = (val: string) => {
    setFormEmail(val);
    if (!formUsername || formUsername === formEmail.split('@')[0]) {
      const derived = val.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormUsername(derived);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all mandatory fields.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formName.trim(),
          email: formEmail.trim(),
          designation: formDesignation,
          role: formRole,
          username: formUsername.trim(),
          password: formPassword.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Administrator "${formName}" appointed successfully! Password: ${formPassword}`,
        });
        setIsAddModalOpen(false);
        setFormName('');
        setFormEmail('');
        setFormUsername('');
        setFormPassword('Mimsakure27');
        fetchAdministrators();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to appoint administrator.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: Administrator) => {
    if (admin.isSuperAdmin) {
      alert('The root Super Administrator account cannot be suspended.');
      return;
    }

    const nextStatus = admin.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to change the status of "${admin.name}" to ${nextStatus.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: admin.id, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Account status for "${admin.name}" updated to ${nextStatus}.`,
        });
        setAdministrators((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, status: nextStatus } : a))
        );
      } else {
        setNotification({ type: 'error', message: data.error || 'Status update failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to update status.' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !newPassword.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/administrators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAdmin.id, password: newPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Security credentials updated for "${selectedAdmin.name}". New password: ${newPassword}`,
        });
        setIsResetPasswordModalOpen(false);
        setNewPassword('');
        setSelectedAdmin(null);
      } else {
        setNotification({ type: 'error', message: data.error || 'Password reset failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to reset password.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: Administrator) => {
    if (admin.isSuperAdmin) {
      alert('The root Super Administrator account cannot be deleted.');
      return;
    }

    const confirmMsg = `WARNING: Are you sure you want to permanently revoke credentials and delete administrator "${admin.name}" (${admin.email})? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/administrators?id=${admin.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Administrator "${admin.name}" removed from the system registry.`,
        });
        setAdministrators((prev) => prev.filter((a) => a.id !== admin.id));
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to remove administrator.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to delete administrator.' });
    }
  };

  // If user is not Super Admin
  if (!loading && currentUser && !currentUser.isSuperAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl bg-red-950/20 border border-red-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Executive Authorization Required</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            The Administrators Desk is strictly restricted to the Governing Board & Super Administrator (
            <span className="text-emerald-400 font-mono">bamiebot@gmail.com</span>). School administrators and principals do not possess executive appointment authority.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Return to Operations Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered List
  const filtered = administrators.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (roleFilter === 'SUPER_ADMIN') return item.isSuperAdmin;
    if (roleFilter === 'BURSAR') return item.role === 'bursar' || item.name.toLowerCase().includes('bursar');
    if (roleFilter === 'PRINCIPAL')
      return (
        !item.isSuperAdmin &&
        (item.name.toLowerCase().includes('principal') ||
          item.name.toLowerCase().includes('headmaster') ||
          item.role === 'admin')
      );

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1527] to-[#131F38] border border-[#1E2E50] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Executive & Administrator Registry
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Board Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supervisory governance of School Principals, Headmasters, and Bursars across all sections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Appoint Administrator</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Key Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2E50] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Executive Officers</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{administrators.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Full operational credentials</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2E50] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Governing Board</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">1</p>
          <p className="text-[11px] text-slate-400 mt-1">bamiebot@gmail.com (Root)</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2E50] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Principals & Headmasters</span>
            <School className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {
              administrators.filter(
                (a) =>
                  !a.isSuperAdmin &&
                  (a.name.toLowerCase().includes('principal') || a.name.toLowerCase().includes('headmaster'))
              ).length
            }
          </p>
          <p className="text-[11px] text-blue-400/80 mt-1">Academic leadership</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2E50] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Bursary & Finance</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {administrators.filter((a) => a.role === 'bursar' || a.name.toLowerCase().includes('bursar')).length}
          </p>
          <p className="text-[11px] text-teal-400/80 mt-1">Financial reconciliation</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D1527] border border-[#1E2E50] p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, username..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'SUPER_ADMIN', 'PRINCIPAL', 'BURSAR'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                roleFilter === filter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[#131F38] text-slate-400 hover:text-white border border-[#1E2E50]'
              }`}
            >
              {filter === 'ALL'
                ? 'All'
                : filter === 'SUPER_ADMIN'
                ? 'Board'
                : filter === 'PRINCIPAL'
                ? 'Principals'
                : 'Bursars'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Administrators Table */}
      <div className="bg-[#0D1527] border border-[#1E2E50] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111C33] border-b border-[#1E2E50] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-4 px-6">Official Name & Designation</th>
                <th className="py-4 px-6">Access Role</th>
                <th className="py-4 px-6">Email & Username</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-right">Supervisory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E50]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                      <span>Loading administrator directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No administrators found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#131F38]/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            admin.isSuperAdmin
                              ? 'bg-gradient-to-tr from-amber-600 to-yellow-400'
                              : admin.role === 'bursar'
                              ? 'bg-gradient-to-tr from-teal-600 to-cyan-400'
                              : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                          }`}
                        >
                          {admin.isSuperAdmin ? (
                            <Crown className="w-4 h-4 text-white" />
                          ) : (
                            admin.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{admin.name}</span>
                            {admin.isSuperAdmin && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                                ROOT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {admin.isSuperAdmin ? 'Governing Board / Super Admin' : 'School Official'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          admin.isSuperAdmin
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : admin.role === 'bursar'
                            ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {admin.isSuperAdmin ? (
                          <>
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>Governing Board</span>
                          </>
                        ) : admin.role === 'bursar' ? (
                          <>
                            <DollarSign className="w-3 h-3 text-teal-400" />
                            <span>School Bursar</span>
                          </>
                        ) : (
                          <>
                            <School className="w-3 h-3 text-blue-400" />
                            <span>School Admin</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-xs">{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>@{admin.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          admin.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            admin.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        <span className="capitalize">{admin.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Active'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {admin.isSuperAdmin ? (
                        <span className="text-[11px] text-slate-400 font-semibold italic">
                          Permanent Root Authority
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            title={admin.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                              admin.status === 'active'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                          >
                            {admin.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setNewPassword('Mimsakure27');
                              setIsResetPasswordModalOpen(true);
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg bg-[#15223E] hover:bg-[#1E2E50] text-slate-300 hover:text-white border border-[#223356] transition"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            title="Delete Administrator"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Appoint Administrator / Bursar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0D1527] border border-[#1E2E50] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#111C33] border-b border-[#1E2E50] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Appoint School Administrator</h3>
                  <p className="text-xs text-slate-400">Issue official administrative credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#15223E] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrative Designation / Role Scope
                </label>
                <select
                  value={formDesignation}
                  onChange={(e) => {
                    const des = e.target.value;
                    setFormDesignation(des);
                    if (des.toLowerCase().includes('bursar')) {
                      setFormRole('bursar');
                    } else {
                      setFormRole('admin');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Secondary School Principal">Secondary School Principal</option>
                  <option value="Primary School Headmaster">Primary School Headmaster</option>
                  <option value="Primary School Headmistress">Primary School Headmistress</option>
                  <option value="School Bursar">School Bursar (Finance & Accounts)</option>
                  <option value="Vice Principal (Academics)">Vice Principal (Academics)</option>
                  <option value="Vice Principal (Administration)">Vice Principal (Administration)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Official Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ustadh I. Bamidele"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Official Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ibamidele@gmail.com"
                    value={formEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Portal Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ibamidele"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Initial Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white focus:outline-none focus:border-emerald-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default recommended password: Mimsakure27</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2E50]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#15223E] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Appoint Official</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Reset Password */}
      {isResetPasswordModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D1527] border border-[#1E2E50] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#111C33] border-b border-[#1E2E50] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{selectedAdmin.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setSelectedAdmin(null);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#15223E] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  New Temporary Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131F38] border border-[#1E2E50] text-xs text-white focus:outline-none focus:border-emerald-500 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2E50]">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-[#15223E] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
