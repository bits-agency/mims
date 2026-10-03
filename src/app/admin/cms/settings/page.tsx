'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Building,
  RotateCcw,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';

export interface CampusLocation {
  id: string;
  title: string;
  address: string;
  type?: string;
}

interface SiteSettings {
  // Brand & Identity
  schoolName: string;
  motto: string;
  accreditation: string;

  // Contact Phone Numbers
  bursaryPhone: string;
  admissionsPhone: string;
  principalPhone: string;
  whatsappInquiry: string;

  // Official Emails
  generalEmail: string;
  admissionsEmail: string;
  bursarEmail: string;
  principalEmail: string;

  // Campuses
  seniorCampusAddress: string;
  nurseryPrimaryAddress: string;
  campuses: CampusLocation[];

  // Banking Particulars
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;

  // Operating Hours
  schoolHours: string;
  fridayHours: string;
  adminOfficeHours: string;
  visitingDaySchedule: string;

  // Social Channels
  facebookUrl: string;
  youtubeUrl: string;
  whatsappChannelUrl: string;
}

import { useEffect } from 'react';

const DEFAULT_SETTINGS: SiteSettings = {
  schoolName: 'MSSN Islamic Model Schools, Akure',
  motto: 'Knowledge, Faith and Excellent Morals • Al-Birr',
  accreditation: 'WAEC / NECO / Ondo State Ministry of Education Accredited',

  bursaryPhone: '+234 802 987 6543',
  admissionsPhone: '+234 803 234 5678',
  principalPhone: '+234 805 112 3344',
  whatsappInquiry: '+234 814 556 7788',

  generalEmail: 'info@mimsakure.com',
  admissionsEmail: 'admissions@mimsakure.com',
  bursarEmail: 'bursar@mimsakure.com',
  principalEmail: 'principal@mimsakure.com',

  seniorCampusAddress: 'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
  nurseryPrimaryAddress: 'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
  campuses: [
    {
      id: 'senior',
      title: 'Secondary School & Boarding Hostel Campus',
      address: 'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
      type: 'Secondary & Boarding',
    },
    {
      id: 'nursery_primary',
      title: 'Nursery & Primary School Wing Campus',
      address: 'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
      type: 'Nursery & Primary',
    },
    {
      id: 'madinah',
      title: 'Madinah Quranic & Tahfeez Residential Campus',
      address: 'Madinah Estate, Off FUTA South Gate Road, Akure, Ondo State',
      type: 'Tahfeez Academy',
    },
  ],

  bankName: 'Official Commercial Bank',
  accountName: 'MSSN Islamic Model Schools Akure - Operations',
  accountNumber: 'To Be Stated by School Management',
  sortCode: '301001',

  schoolHours: 'Monday - Thursday: 7:30 AM – 3:30 PM',
  fridayHours: 'Friday: 7:30 AM – 1:00 PM (Jumu\'ah Break)',
  adminOfficeHours: 'Monday - Friday: 8:00 AM – 4:30 PM',
  visitingDaySchedule: '1st Sunday of Every Month: 10:00 AM – 5:00 PM',

  facebookUrl: 'https://facebook.com/mimsakure',
  youtubeUrl: 'https://youtube.com/@mimsakure',
  whatsappChannelUrl: 'https://whatsapp.com/channel/mimsakure',
};

export default function AdminCmsSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/cms/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          let loadedCampuses: CampusLocation[] = DEFAULT_SETTINGS.campuses;
          if (Array.isArray(s.campus_locations) && s.campus_locations.length > 0) {
            loadedCampuses = s.campus_locations;
          } else if (Array.isArray(s.campuses) && s.campuses.length > 0) {
            loadedCampuses = s.campuses;
          } else if (s.senior_campus_address || s.nursery_primary_address) {
            loadedCampuses = [
              {
                id: 'senior',
                title: 'Secondary School & Boarding Hostel Campus',
                address: s.senior_campus_address || DEFAULT_SETTINGS.seniorCampusAddress,
                type: 'Secondary & Boarding',
              },
              {
                id: 'nursery_primary',
                title: 'Nursery & Primary School Wing Campus',
                address: s.nursery_primary_address || DEFAULT_SETTINGS.nurseryPrimaryAddress,
                type: 'Nursery & Primary',
              },
            ];
          }

          setSettings({
            schoolName: s.school_name || DEFAULT_SETTINGS.schoolName,
            motto: s.motto || DEFAULT_SETTINGS.motto,
            accreditation: s.accreditation || DEFAULT_SETTINGS.accreditation,
            bursaryPhone: s.bursary_phone || DEFAULT_SETTINGS.bursaryPhone,
            admissionsPhone: s.admissions_phone || DEFAULT_SETTINGS.admissionsPhone,
            principalPhone: s.principal_phone || DEFAULT_SETTINGS.principalPhone,
            whatsappInquiry: s.whatsapp_inquiry || DEFAULT_SETTINGS.whatsappInquiry,
            generalEmail: s.general_email || DEFAULT_SETTINGS.generalEmail,
            admissionsEmail: s.admissions_email || DEFAULT_SETTINGS.admissionsEmail,
            bursarEmail: s.bursar_email || DEFAULT_SETTINGS.bursarEmail,
            principalEmail: s.principal_email || DEFAULT_SETTINGS.principalEmail,
            seniorCampusAddress: loadedCampuses[0]?.address || s.senior_campus_address || DEFAULT_SETTINGS.seniorCampusAddress,
            nurseryPrimaryAddress: loadedCampuses[1]?.address || s.nursery_primary_address || DEFAULT_SETTINGS.nurseryPrimaryAddress,
            campuses: loadedCampuses,
            bankName: s.bank_name || DEFAULT_SETTINGS.bankName,
            accountName: s.account_name || DEFAULT_SETTINGS.accountName,
            accountNumber: s.account_number || DEFAULT_SETTINGS.accountNumber,
            sortCode: s.sort_code || DEFAULT_SETTINGS.sortCode,
            schoolHours: s.school_hours || DEFAULT_SETTINGS.schoolHours,
            fridayHours: s.friday_hours || DEFAULT_SETTINGS.fridayHours,
            adminOfficeHours: s.admin_office_hours || DEFAULT_SETTINGS.adminOfficeHours,
            visitingDaySchedule: s.visiting_day_schedule || DEFAULT_SETTINGS.visitingDaySchedule,
            facebookUrl: s.facebook_url || DEFAULT_SETTINGS.facebookUrl,
            youtubeUrl: s.youtube_url || DEFAULT_SETTINGS.youtubeUrl,
            whatsappChannelUrl: s.whatsapp_channel_url || DEFAULT_SETTINGS.whatsappChannelUrl,
          });
        }
      })
      .catch((err) => console.warn('Could not load settings from DB:', err));
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCampus = () => {
    const newCampus: CampusLocation = {
      id: `campus-${Date.now()}`,
      title: `Campus Location ${settings.campuses.length + 1}`,
      address: '',
      type: 'Campus Branch',
    };
    setSettings((prev) => ({
      ...prev,
      campuses: [...prev.campuses, newCampus],
    }));
  };

  const handleRemoveCampus = (index: number) => {
    if (settings.campuses.length <= 1) return;
    setSettings((prev) => {
      const updated = prev.campuses.filter((_, i) => i !== index);
      return {
        ...prev,
        campuses: updated,
        seniorCampusAddress: updated[0]?.address || prev.seniorCampusAddress,
        nurseryPrimaryAddress: updated[1]?.address || prev.nurseryPrimaryAddress,
      };
    });
  };

  const handleCampusChange = (index: number, field: keyof CampusLocation, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.campuses];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        campuses: updated,
        seniorCampusAddress: updated[0]?.address || prev.seniorCampusAddress,
        nurseryPrimaryAddress: updated[1]?.address || prev.nurseryPrimaryAddress,
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: settings.schoolName,
          motto: settings.motto,
          accreditation: settings.accreditation,
          bursary_phone: settings.bursaryPhone,
          admissions_phone: settings.admissionsPhone,
          principal_phone: settings.principalPhone,
          whatsapp_inquiry: settings.whatsappInquiry,
          general_email: settings.generalEmail,
          admissions_email: settings.admissionsEmail,
          bursar_email: settings.bursarEmail,
          principal_email: settings.principalEmail,
          senior_campus_address: settings.campuses[0]?.address || settings.seniorCampusAddress,
          nursery_primary_address: settings.campuses[1]?.address || settings.nurseryPrimaryAddress,
          campus_locations: settings.campuses,
          campuses: settings.campuses,
          bank_name: settings.bankName,
          account_name: settings.accountName,
          account_number: settings.accountNumber,
          sort_code: settings.sortCode,
          school_hours: settings.schoolHours,
          friday_hours: settings.fridayHours,
          admin_office_hours: settings.adminOfficeHours,
          visiting_day_schedule: settings.visitingDaySchedule,
          facebook_url: settings.facebookUrl,
          youtube_url: settings.youtubeUrl,
          whatsapp_channel_url: settings.whatsappChannelUrl,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all contact and institution settings to factory defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Site settings and public contact details updated successfully! Changes reflect on the public website immediately.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Dynamic CMS Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Contact Details & Site Settings CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero static contacts: Update institutional hotlines, physical campus addresses, bank deposit accounts, and visiting hours in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#0D1527] border border-[#213357] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'edit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Editor View
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Preview</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset to Defaults"
            className="p-2.5 rounded-xl bg-[#182645] hover:bg-[#203259] text-slate-400 hover:text-white border border-[#213357] transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Hotlines & Direct Contacts */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1E2E50]">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Official Hotlines & WhatsApp Contacts</h3>
                <p className="text-[11px] text-slate-400">
                  Displayed on the website header, footer, and Contact Us page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Admissions Office Desk Phone
                </label>
                <input
                  type="text"
                  value={settings.admissionsPhone}
                  onChange={(e) => handleChange('admissionsPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Bursary & Fee Inquiries Hotline
                </label>
                <input
                  type="text"
                  value={settings.bursaryPhone}
                  onChange={(e) => handleChange('bursaryPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Principal / Administrative Office Line
                </label>
                <input
                  type="text"
                  value={settings.principalPhone}
                  onChange={(e) => handleChange('principalPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official 24/7 WhatsApp Inquiry Line
                </label>
                <input
                  type="text"
                  value={settings.whatsappInquiry}
                  onChange={(e) => handleChange('whatsappInquiry', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Official Institutional Emails */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1E2E50]">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Institutional Inboxes</h3>
                <p className="text-[11px] text-slate-400">
                  Target mailboxes receiving inquiries submitted through contact forms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  General Secretariat Email
                </label>
                <input
                  type="email"
                  value={settings.generalEmail}
                  onChange={(e) => handleChange('generalEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Admissions Office Email
                </label>
                <input
                  type="email"
                  value={settings.admissionsEmail}
                  onChange={(e) => handleChange('admissionsEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Bursary & Payments Email
                </label>
                <input
                  type="email"
                  value={settings.bursarEmail}
                  onChange={(e) => handleChange('bursarEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Principal Secretariat Email
                </label>
                <input
                  type="email"
                  value={settings.principalEmail}
                  onChange={(e) => handleChange('principalEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Campus Physical Locations */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#1E2E50]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Physical Campus Locations</h3>
                  <p className="text-[11px] text-slate-400">
                    Full street addresses for physical visits, admissions tours, and postal deliveries.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCampus}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Location</span>
              </button>
            </div>

            <div className="space-y-4">
              {settings.campuses.map((campus, index) => (
                <div
                  key={campus.id || index}
                  className="p-4 rounded-xl bg-[#0D1527] border border-[#213357] space-y-3 relative group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={campus.title}
                        onChange={(e) => handleCampusChange(index, 'title', e.target.value)}
                        placeholder="Campus Name (e.g. Madinah Campus, Annex...)"
                        className="bg-[#101A30] border border-[#23355A] focus:border-emerald-500 text-xs font-bold text-white focus:outline-none px-3 py-1.5 rounded-lg flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <input
                        type="text"
                        value={campus.type || ''}
                        onChange={(e) => handleCampusChange(index, 'type', e.target.value)}
                        placeholder="Tag (e.g. Boarding, Primary)"
                        className="bg-[#101A30] border border-[#23355A] focus:border-emerald-500 text-[11px] text-slate-300 focus:outline-none px-2.5 py-1.5 rounded-lg w-32"
                      />
                      {settings.campuses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCampus(index)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Remove Campus Location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Street Address &amp; Directions
                    </label>
                    <input
                      type="text"
                      value={campus.address}
                      onChange={(e) => handleCampusChange(index, 'address', e.target.value)}
                      placeholder="Full street address in Akure, landmarks, etc."
                      className="w-full px-3.5 py-2.5 bg-[#090E1C] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Bank Account Particulars for Fee Deposits */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1E2E50]">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Official Bank Accounts for Fee Deposits</h3>
                <p className="text-[11px] text-slate-400">
                  Verified bank details presented to parents on the public Bursary and Admissions pages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={settings.accountName}
                  onChange={(e) => handleChange('accountName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold text-sm tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Section 5: School Hours & Schedules */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1E2E50]">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Campus Hours & Visiting Schedules</h3>
                <p className="text-[11px] text-slate-400">
                  Timings communicated across the portal and admissions prospectus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Regular School Hours (Mon - Thu)
                </label>
                <input
                  type="text"
                  value={settings.schoolHours}
                  onChange={(e) => handleChange('schoolHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Friday Jumu'ah Schedule
                </label>
                <input
                  type="text"
                  value={settings.fridayHours}
                  onChange={(e) => handleChange('fridayHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Administrative Office Hours
                </label>
                <input
                  type="text"
                  value={settings.adminOfficeHours}
                  onChange={(e) => handleChange('adminOfficeHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Boarding Hostel Visiting Day
                </label>
                <input
                  type="text"
                  value={settings.visitingDaySchedule}
                  onChange={(e) => handleChange('visitingDaySchedule', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Social & Digital Handles */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#1E2E50]">
              <Share2 className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Social Media & Public Broadcasts</h3>
                <p className="text-[11px] text-slate-400">
                  Official community channels for announcements and multimedia broadcasts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={settings.youtubeUrl}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  WhatsApp Channel / Community
                </label>
                <input
                  type="url"
                  value={settings.whatsappChannelUrl}
                  onChange={(e) => handleChange('whatsappChannelUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky bottom-6 z-20 bg-[#111C33]/95 backdrop-blur-md border border-[#213357] p-4 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-emerald-400" />
              <span>Unsaved changes will be discarded on page refresh.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition border border-emerald-400/20"
              >
                <Save className="w-4 h-4" />
                <span>Save All Site Settings</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Live Public Preview Tab */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>
              <strong>Live Website Preview:</strong> This is how parents, students, and visitors see the school contact particulars.
            </span>
            <button
              onClick={() => setActiveTab('edit')}
              className="text-xs font-bold text-white underline hover:text-emerald-400"
            >
              Return to Editor
            </button>
          </div>

          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 space-y-6">
            <div className="border-b border-[#1E2E50] pb-4">
              <h2 className="text-xl font-black text-white">{settings.schoolName}</h2>
              <p className="text-xs text-emerald-400 font-semibold mt-1">{settings.motto}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{settings.accreditation}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campuses Preview */}
              <div className="bg-[#0D1527] p-4 rounded-xl border border-[#203258] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">
                  Campus Locations ({settings.campuses.length})
                </h4>
                <div className="space-y-3">
                  {settings.campuses.map((campus, idx) => (
                    <div key={campus.id || idx} className={idx > 0 ? "pt-2.5 border-t border-[#1A284A]" : ""}>
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{campus.title}</span>
                        </span>
                        {campus.type && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                            {campus.type}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 pl-3">{campus.address || 'Address pending configuration'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Preview */}
              <div className="bg-[#0D1527] p-4 rounded-xl border border-[#203258] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">
                  Fee Payment Deposit Account
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Bank:</span>
                  <span className="font-bold text-white">{settings.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-bold text-white">{settings.accountName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{settings.accountNumber}</span>
                </div>
              </div>
            </div>

            {/* Contacts Table Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#0D1527] p-3 rounded-xl border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Admissions Desk</span>
                <span className="text-xs font-bold text-white mt-1 block">{settings.admissionsPhone}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{settings.admissionsEmail}</span>
              </div>
              <div className="bg-[#0D1527] p-3 rounded-xl border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Bursary Office</span>
                <span className="text-xs font-bold text-white mt-1 block">{settings.bursaryPhone}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{settings.bursarEmail}</span>
              </div>
              <div className="bg-[#0D1527] p-3 rounded-xl border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">General Inquiries</span>
                <span className="text-xs font-bold text-white mt-1 block">{settings.whatsappInquiry}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{settings.generalEmail}</span>
              </div>
              <div className="bg-[#0D1527] p-3 rounded-xl border border-[#203258]">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Regular Hours</span>
                <span className="text-xs font-bold text-white mt-1 block">7:30 AM - 3:30 PM</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Fri: Until 1:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
