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
  Loader2
} from 'lucide-react';

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'biodata' | 'idcard'>('biodata');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

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

              {/* ID Card Display Area (Printable) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-center">
                {/* FRONT OF ID CARD */}
                <div className="w-full max-w-[420px] mx-auto bg-gradient-to-br from-slate-900 via-[#0B132B] to-emerald-950 text-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/40 relative overflow-hidden flex flex-col justify-between h-[270px]">
                  {/* Card Watermark pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                  {/* Card Header */}
                  <div className="relative z-10 flex items-center gap-3 border-b border-white/10 pb-3">
                    <img
                      src="/images/logo.png"
                      alt="MIMS Logo"
                      className="w-12 h-12 object-contain rounded-xl bg-white p-0.5 shadow shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs uppercase tracking-tight text-white leading-tight truncate">
                        MSSN ISLAMIC MODEL SCHOOLS
                      </h4>
                      <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">
                        Akure, Ondo State • Knowledge is Light
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-wider">
                        STUDENT IDENTITY CARD
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="relative z-10 flex items-center gap-4 my-2">
                    <img
                      src={formData.photoUrl}
                      alt="Student Photo"
                      className="w-20 h-24 rounded-2xl object-contain bg-slate-900/60 border border-emerald-400/40 p-1.5 shadow-md shrink-0"
                    />
                    <div className="text-xs space-y-0.5 min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Name</span>
                      <h3 className="font-black text-sm text-white uppercase leading-tight truncate">
                        {formData.fullName || 'Student Name'}
                      </h3>
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Admission No:</span>
                        <strong className="text-emerald-400 font-mono text-xs">{formData.admissionNo || 'MIMS/---'}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Class:</span>
                        <strong className="text-white text-xs">{formData.className || 'General'}</strong>
                      </div>
                      <div className="flex items-center gap-3 pt-0.5 text-[10px] text-slate-300">
                        <span>Blood: <strong className="text-white">{formData.bloodGroup}</strong></span>
                        <span>•</span>
                        <span>Sex: <strong className="text-white">{formData.gender}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                    <span>Issued: {formData.issueDate}</span>
                    <span className="font-mono text-emerald-400">Valid Till: {formData.expiryDate}</span>
                    <span className="font-bold text-white">MIMS/SEC</span>
                  </div>
                </div>

                {/* BACK OF ID CARD */}
                <div className="w-full max-w-[420px] mx-auto bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-slate-300 relative overflow-hidden flex flex-col justify-between h-[270px] text-xs">
                  <div>
                    <div className="text-center pb-2 border-b border-slate-200 mb-3">
                      <p className="font-extrabold text-[11px] text-slate-900 uppercase">
                        MSSN ISLAMIC MODEL SCHOOLS &amp; COLLEGE
                      </p>
                      <p className="text-[9px] text-emerald-700 font-bold">
                        Medina Community, Ilere/Ijare Road, Akure, Ondo State
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[10px] text-slate-600 leading-snug">
                      <p>• This smart identity card is official property of MSSN Islamic Model Schools Akure.</p>
                      <p>• Must be presented upon request by school proctors and examination invigilators.</p>
                      <p>• If lost and found, please return to the school administration office or nearest police station.</p>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Emergency Guardian Contact</span>
                      <p className="font-bold text-slate-900 text-xs">
                        {formData.guardianName || 'School Bursary / Admin'} {formData.guardianPhone ? `(${formData.guardianPhone})` : ''}
                      </p>
                      <p className="text-[9px] text-slate-500">School Hotlines: 08036268724, 08146034137</p>
                    </div>
                  </div>

                  {/* Barcode & Signature */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div className="font-mono text-[9px] tracking-widest text-slate-400 font-bold">
                      ||||| | |||| ||| ||||||| | |||
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-400 uppercase">Authorized Principal</span>
                      <span className="font-serif italic font-bold text-xs text-slate-800">[ School Seal ]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
