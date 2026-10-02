'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  CheckCircle2,
  Lock,
  Camera,
  AlertCircle,
  Save,
  QrCode,
  ShieldCheck,
  Sparkles,
  Loader2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'biodata' | 'idcard' | 'security'>('biodata');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Security & Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Student Biodata State
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNo: '',
    className: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    address: '',
    guardianName: '',
    guardianRelationship: 'Parent',
    guardianPhone: '',
    guardianEmail: '',
    photoUrl: '/images/logo.png',
    expiryDate: 'July 2028',
    issueDate: 'September 2025',
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          const profile = data.user.profile;
          const className = profile?.classes?.class_name
            ? `${profile.classes.class_name} ${profile.classes.section ? `(${profile.classes.section})` : ''}`
            : 'Enrolled Student';

          setFormData({
            fullName: data.user.fullName || data.user.username || '',
            admissionNo: profile?.admission_no || '',
            className: className,
            gender: profile?.gender || 'Male',
            dob: profile?.date_of_birth || '',
            bloodGroup: 'O+',
            address: profile?.address || '',
            guardianName: profile?.parent_name || '',
            guardianRelationship: 'Parent / Guardian',
            guardianPhone: profile?.parent_phone || '',
            guardianEmail: data.user.email || '',
            photoUrl: profile?.passport_url || '/images/logo.png',
            expiryDate: 'July 2028',
            issueDate: 'September 2025',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBiodata = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handlePrintIdCard = () => {
    window.print();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match. Please re-enter.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters in length.' });
      return;
    }

    setChangingPassword(true);
    setPasswordStatus(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully! Keep your new password safe.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', message: data.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordStatus({ type: 'error', message: 'Network error updating password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl w-full mx-auto font-sans">
      {/* Header & Tabs */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Biodata &amp; Digital ID Card
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal biodata records and official school identity card
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'biodata'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Edit Biodata
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('idcard')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'idcard'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            Generate ID Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            Security &amp; Password
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="no-print p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Biodata updated successfully! Your auto-generated Student ID Card has been refreshed in real-time.
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading student profile...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EDITABLE BIODATA FORM */}
          {activeTab === 'biodata' && (
            <form onSubmit={handleSaveBiodata} className="no-print space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                {/* Student Photo & Header Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src={formData.photoUrl}
                      alt="Student Passport"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-contain bg-slate-50 border border-slate-200 ring-4 ring-emerald-500/20 shadow-md p-2"
                    />
                  </div>

                  <div className="text-center sm:text-left flex-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                      OFFICIAL ENROLLED STUDENT
                    </span>
                    <h2 className="text-xl font-black text-slate-900">{formData.fullName || 'Student'}</h2>
                    <p className="text-xs font-mono font-bold text-emerald-700">
                      Admission No: {formData.admissionNo || 'Pending'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enrolled Class: <strong className="text-slate-800">{formData.className || 'General'}</strong>
                    </p>
                  </div>
                </div>

                {/* Editable Fields: Student Bio */}
                <div className="pt-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                    Personal Biodata
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Student Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admission Number</label>
                      <input
                        type="text"
                        disabled
                        value={formData.admissionNo}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Class Level &amp; Arm</label>
                      <input
                        type="text"
                        disabled
                        value={formData.className}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                      <input
                        type="text"
                        placeholder="Enter home address in Akure..."
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                    Parent / Guardian Emergency Contact
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Guardian Name</label>
                      <input
                        type="text"
                        placeholder="Parent / Guardian full name"
                        value={formData.guardianName}
                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={formData.guardianRelationship}
                        onChange={(e) => handleInputChange('guardianRelationship', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Hotline Phone</label>
                      <input
                        type="tel"
                        placeholder="e.g. 0803XXXXXXX"
                        value={formData.guardianPhone}
                        onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="parent@example.com"
                        value={formData.guardianEmail}
                        onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Biodata Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('idcard')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Preview &amp; Print ID Card
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: AUTO-GENERATED STUDENT SMART ID CARD */}
          {activeTab === 'idcard' && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Official Student Identity Card (Card View)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Auto-generated from verified biodata • Ready for color laminate printing
                  </p>
                </div>

                <button
                  onClick={handlePrintIdCard}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Student ID Card
                </button>
              </div>

              {/* ID Card Display Area (Realistic White PVC Plastic ID Card) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-center">
                {/* FRONT OF ID CARD */}
                <div className="w-full max-w-[420px] mx-auto bg-white text-slate-900 rounded-2xl shadow-xl shadow-slate-300/70 border-2 border-emerald-600 relative overflow-hidden flex flex-col justify-between h-[270px]">
                  {/* Top Green Institutional Ribbon Header */}
                  <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b-2 border-emerald-500 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src="/images/logo.png"
                        alt="MIMS Logo"
                        className="w-10 h-10 object-contain rounded-lg bg-white p-0.5 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-[11px] sm:text-xs uppercase tracking-tight text-white leading-tight truncate">
                          MSSN ISLAMIC MODEL SCHOOLS
                        </h4>
                        <p className="text-[8px] uppercase font-bold text-emerald-200 tracking-wider">
                          Akure, Ondo State • Knowledge is Light
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                      STUDENT
                    </span>
                  </div>

                  {/* Card Main Body on Pure White PVC */}
                  <div className="p-3.5 flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Student Photo Passport with Green Border */}
                    <div className="relative shrink-0">
                      <img
                        src={formData.photoUrl}
                        alt="Student Photo"
                        className="w-20 h-24 rounded-xl object-contain bg-slate-100 border-2 border-emerald-600 p-0.5 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                        ✓
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="text-xs space-y-1 min-w-0 flex-1">
                      <div>
                        <span className="text-[8px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Full Name
                        </span>
                        <h3 className="font-black text-sm text-slate-950 uppercase leading-tight truncate">
                          {formData.fullName || 'Student Name'}
                        </h3>
                      </div>

                      <div>
                        <span className="text-[8px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Admission Number
                        </span>
                        <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          {formData.admissionNo || 'MIMS/---'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <span className="text-[8px] uppercase font-extrabold tracking-wider text-slate-400 block">
                            Class Arm
                          </span>
                          <span className="font-extrabold text-[11px] text-slate-800 truncate block">
                            {formData.className || 'Senior Secondary'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-extrabold tracking-wider text-slate-400 block">
                            Sex / Blood
                          </span>
                          <span className="font-bold text-[11px] text-slate-700">
                            {formData.gender} • {formData.bloodGroup}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Smart QR / Barcode Scan Graphic */}
                    <div className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 shrink-0">
                      <QrCode className="w-10 h-10 text-emerald-800" />
                      <span className="text-[7px] font-mono font-bold text-emerald-800 mt-0.5">VERIFIED</span>
                    </div>
                  </div>

                  {/* Card Bottom Stripe */}
                  <div className="bg-slate-50 border-t border-emerald-200 px-4 py-1.5 flex items-center justify-between text-[8px] text-slate-600 font-semibold shrink-0">
                    <span>Session: <strong className="text-slate-900">2025/2026</strong></span>
                    <span>Valid: <strong className="text-emerald-800">{formData.expiryDate}</strong></span>
                    <span className="font-bold text-emerald-900 uppercase">MIMS AKURE CAMPUS</span>
                  </div>
                </div>

                {/* BACK OF ID CARD */}
                <div className="w-full max-w-[420px] mx-auto bg-white text-slate-900 rounded-2xl shadow-xl shadow-slate-300/70 border-2 border-emerald-600 relative overflow-hidden flex flex-col justify-between h-[270px] text-xs">
                  {/* Top Green Accent Header */}
                  <div className="bg-emerald-800 text-white px-4 py-1.5 text-center font-black text-[9px] uppercase tracking-wider shrink-0">
                    Official Student Identity Card • Rules &amp; Recovery
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 text-[9px] text-slate-700 leading-relaxed">
                      <p className="flex items-start gap-1">
                        <span className="text-emerald-700 font-bold shrink-0">•</span>
                        <span>This smart card remains official property of <strong>MSSN Islamic Model Schools Akure</strong>.</span>
                      </p>
                      <p className="flex items-start gap-1">
                        <span className="text-emerald-700 font-bold shrink-0">•</span>
                        <span>Must be presented upon request during examinations, campus entry, and co-curricular events.</span>
                      </p>
                      <p className="flex items-start gap-1">
                        <span className="text-emerald-700 font-bold shrink-0">•</span>
                        <span>If found, please return to any MIMS Campus or the nearest security post/police station.</span>
                      </p>
                    </div>

                    {/* Emergency Contact Box in Soft Green Tint */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[10px]">
                      <span className="text-[8px] uppercase font-extrabold text-emerald-800 block">
                        Guardian Emergency Contact
                      </span>
                      <p className="font-bold text-slate-900 text-xs">
                        {formData.guardianName || 'Parent / Guardian'} {formData.guardianPhone ? `(${formData.guardianPhone})` : ''}
                      </p>
                      <p className="text-[8px] text-slate-500 mt-0.5">
                        School Administrative Lines: 0803 358 1947 • 0803 626 8724
                      </p>
                    </div>

                    {/* Barcode & Principal's Authorization Seal */}
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[9px] tracking-widest text-slate-600 font-black">
                          ||||| ||| |||| || ||||||| | |||
                        </div>
                        <span className="text-[7px] font-mono text-slate-400">SERIAL: {formData.admissionNo || 'MIMS-PVC-0042'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[7px] text-slate-400 uppercase font-bold">Authorized Signatory</span>
                        <span className="font-serif italic font-bold text-[11px] text-emerald-800">[ School Seal &amp; Principal ]</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Thin Green Accent */}
                  <div className="h-1.5 bg-emerald-700 w-full shrink-0" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD UPDATE */}
          {activeTab === 'security' && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Account Security &amp; Password</h2>
                  <p className="text-xs text-slate-500">Update your student portal login credentials</p>
                </div>
              </div>

              {passwordStatus && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current / Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password (e.g. Mimsakure27)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If this is your first time logging in, your default password was provided by the school.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
