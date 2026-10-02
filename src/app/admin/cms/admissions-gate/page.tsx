'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  BookOpen,
  Save,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AdmissionsGateConfig {
  isOpen: boolean;
  targetSession: string;
  applicationDeadline: string;
  entranceExamDate: string;
  entranceExamTime: string;
  examVenue: string;
  dayFormFee: number;
  boardingFormFee: number;
  announcementNotice: string;
  closedNotice: string;
  allowedClasses: string[];
  screeningSubjects: string[];
}

const DEFAULT_CONFIG: AdmissionsGateConfig = {
  isOpen: true,
  targetSession: '2026/2027 Academic Session',
  applicationDeadline: '2026-07-15',
  entranceExamDate: '2026-07-18',
  entranceExamTime: '09:00 AM Prompt',
  examVenue: 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
  dayFormFee: 5000,
  boardingFormFee: 10000,
  announcementNotice:
    'Admissions for the 2026/2027 Academic Session are now formally OPEN! Qualified candidates seeking admission into Creche, Nursery, Primary, JSS 1, and SSS 1 (Science & Arts) are invited to register online.',
  closedNotice:
    'Online admissions for the current cycle are currently CLOSED. Entrance examinations and interview schedules have concluded. For transfer inquiries into terminal classes, kindly contact the Principal\'s Office.',
  allowedClasses: ['Creche', 'Nursery 1-2', 'Primary 1-5', 'JSS 1', 'JSS 2', 'SSS 1 Science', 'SSS 1 Arts'],
  screeningSubjects: ['Mathematics', 'English Language', 'General Aptitude', 'Quran Recitation & Tajweed'],
};

export default function AdminCmsAdmissionsGatePage() {
  const [config, setConfig] = useState<AdmissionsGateConfig>(DEFAULT_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'controller' | 'preview'>('controller');

  const handleToggle = () => {
    setConfig((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">
            Admissions gate status & exam schedule published! Public admissions portal updated.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111C33] to-[#0D1527] border border-[#1E2E50] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Admissions Portal Switch
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Admissions Gate & Entrance Exam Controller
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toggle public registration status OPEN or CLOSED, configure screening dates, exam venue, and application fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#0D1527] border border-[#213357] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('controller')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'controller'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gate Controller
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
              <span>Public Live View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master Gate Switch Banner */}
      <div
        className={`border rounded-2xl p-6 transition-all ${
          config.isOpen
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-rose-950/20 border-rose-500/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                config.isOpen
                  ? 'bg-emerald-600 shadow-emerald-900/40'
                  : 'bg-rose-600 shadow-rose-900/40'
              }`}
            >
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    config.isOpen ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Current Portal State:
                </span>
                <span
                  className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                    config.isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {config.isOpen ? 'PORTAL OPEN (Accepting Applications)' : 'PORTAL CLOSED'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {config.isOpen
                  ? `Prospective students can fill forms for ${config.targetSession}`
                  : `Online application forms are locked for ${config.targetSession}`}
              </h2>
            </div>
          </div>

          <button
            onClick={handleToggle}
            className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 ${
              config.isOpen
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 border border-rose-400/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 border border-emerald-400/30'
            }`}
          >
            {config.isOpen ? 'Switch Gate to CLOSED' : 'Switch Gate to OPEN'}
          </button>
        </div>
      </div>

      {activeTab === 'controller' ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Session & Deadlines */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-[#1E2E50]">
              Academic Session & Deadlines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Academic Session
                </label>
                <input
                  type="text"
                  value={config.targetSession}
                  onChange={(e) =>
                    setConfig({ ...config, targetSession: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Application Submission Deadline
                </label>
                <input
                  type="date"
                  value={config.applicationDeadline}
                  onChange={(e) =>
                    setConfig({ ...config, applicationDeadline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Entrance Examination Schedule */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-[#1E2E50]">
              Entrance Examination & Screening Particulars
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Examination Date
                </label>
                <input
                  type="date"
                  value={config.entranceExamDate}
                  onChange={(e) =>
                    setConfig({ ...config, entranceExamDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Commencement Time
                </label>
                <input
                  type="text"
                  value={config.entranceExamTime}
                  onChange={(e) =>
                    setConfig({ ...config, entranceExamTime: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Examination Venue
                </label>
                <input
                  type="text"
                  value={config.examVenue}
                  onChange={(e) =>
                    setConfig({ ...config, examVenue: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Day Student Application Fee (₦)
                </label>
                <input
                  type="number"
                  value={config.dayFormFee}
                  onChange={(e) =>
                    setConfig({ ...config, dayFormFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Boarding Student Application Fee (₦)
                </label>
                <input
                  type="number"
                  value={config.boardingFormFee}
                  onChange={(e) =>
                    setConfig({ ...config, boardingFormFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-purple-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Custom Announcement Messages */}
          <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-[#1E2E50]">
              Portal Announcement Texts
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  Portal OPEN Broadcast Notice
                </label>
                <textarea
                  rows={3}
                  value={config.announcementNotice}
                  onChange={(e) =>
                    setConfig({ ...config, announcementNotice: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-400 block mb-1">
                  Portal CLOSED Replacement Notice
                </label>
                <textarea
                  rows={3}
                  value={config.closedNotice}
                  onChange={(e) =>
                    setConfig({ ...config, closedNotice: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#0D1527] border border-[#213357] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="sticky bottom-6 z-20 bg-[#111C33]/95 backdrop-blur-md border border-[#213357] p-4 rounded-2xl flex items-center justify-between shadow-2xl">
            <span className="text-xs text-slate-400">
              Changes apply instantly to the public admissions application flow.
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition border border-emerald-400/20"
            >
              <Save className="w-4 h-4" />
              <span>Publish Gate Configuration</span>
            </button>
          </div>
        </form>
      ) : (
        /* Live Public View Preview */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>
              <strong>Simulated Public Admissions Page:</strong> This is how parents experience the admissions section with the current switch set to <strong>{config.isOpen ? 'OPEN' : 'CLOSED'}</strong>.
            </span>
            <button
              onClick={() => setActiveTab('controller')}
              className="text-xs font-bold text-white underline hover:text-emerald-400"
            >
              Return to Controller
            </button>
          </div>

          {config.isOpen ? (
            <div className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Admissions Active
                </span>
                <span className="text-xs text-slate-400 font-semibold">{config.targetSession}</span>
              </div>

              <div className="p-4 bg-[#0D1527] border border-[#203258] rounded-xl text-xs text-slate-200 leading-relaxed">
                {config.announcementNotice}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0D1527] p-4 rounded-xl border border-[#203258]">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                    <Calendar className="w-4 h-4" /> Entrance Exam Date
                  </div>
                  <div className="text-sm font-black text-white">{config.entranceExamDate}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{config.entranceExamTime}</div>
                </div>

                <div className="bg-[#0D1527] p-4 rounded-xl border border-[#203258]">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                    <MapPin className="w-4 h-4" /> Examination Venue
                  </div>
                  <div className="text-xs font-bold text-white">{config.examVenue}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Candidates must arrive 30 mins prior</div>
                </div>

                <div className="bg-[#0D1527] p-4 rounded-xl border border-[#203258]">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <CreditCard className="w-4 h-4" /> Application Fee
                  </div>
                  <div className="text-sm font-black text-white">
                    Day: ₦{config.dayFormFee.toLocaleString()} • Boarding: ₦{config.boardingFormFee.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Payable online via Jaiz / Paystack</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-900/30"
                >
                  <span>Proceed to Online Application Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#111C33] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">Admissions Currently Closed</h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                {config.closedNotice}
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E2E50] hover:bg-[#283C66] text-slate-200 font-bold text-xs transition"
                >
                  Contact Admissions Secretariat
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
