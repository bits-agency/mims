'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Printer,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  Inbox
} from 'lucide-react';

export default function AdmissionsStatusPage() {
  const [refQuery, setRefQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refQuery.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSearched(true);

    try {
      const res = await fetch(`/api/admissions/applicants`);
      const data = await res.json();

      if (data.success && data.applicants && data.applicants.length > 0) {
        const found = data.applicants.find(
          (a: any) =>
            (a.admission_no && a.admission_no.toLowerCase() === refQuery.trim().toLowerCase()) ||
            (a.users?.email && a.users.email.toLowerCase() === refQuery.trim().toLowerCase()) ||
            `${a.firstname} ${a.lastname}`.toLowerCase().includes(refQuery.trim().toLowerCase())
        );

        if (found) {
          setApplicant({
            name: `${found.firstname} ${found.lastname}`,
            refNo: found.admission_no || refQuery.trim().toUpperCase(),
            email: found.users?.email || 'Registered Applicant',
            status: found.exam_status || 'scheduled',
            examDate: found.exam_date || 'Saturday, 18th October 2026',
            examTime: found.exam_time || '09:00 AM WAT',
            examVenue: found.exam_venue || 'MIMS Main Examination Hall, Akure Campus',
            instructions:
              found.exam_notes ||
              'Please arrive at least 30 minutes before exam time. Candidates must bring their printed examination slip, two 2B pencils, an eraser, and their original birth certificate for physical verification.',
          });
        } else {
          setApplicant(null);
          setErrorMessage(`No application record found matching "${refQuery}". Please check your application reference number.`);
        }
      } else {
        setApplicant(null);
        setErrorMessage('No active application records found in the database. Please verify your reference number.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMessage('Unable to retrieve application status at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="no-print flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </Link>
          <Link
            href="/admissions/apply"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Apply for Admission &rarr;
          </Link>
        </div>

        {/* Search Bar */}
        <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-black text-slate-900 mb-1">
            Check Admission Application Status
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Enter your Application Reference Number, Admission Number, or registered Email.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={refQuery}
                onChange={(e) => setRefQuery(e.target.value)}
                placeholder="e.g. MIMS/2025/001 or applicant@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Track Status'}
            </button>
          </form>
        </div>

        {/* Feedback / Results */}
        {errorMessage && (
          <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!searched && !applicant && (
          <div className="no-print bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Track Your Application</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please enter your application reference number above to view your entrance examination status and print your official exam docket.
            </p>
          </div>
        )}

        {/* Status Alert Banner */}
        {applicant && (
          <>
            {applicant.status === 'scheduled' ? (
              <div className="no-print p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Entrance Examination Scheduled!</strong>
                    Your admission application has been vetted and approved for the entrance examination.
                  </div>
                </div>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition shrink-0"
                >
                  <Printer className="w-4 h-4" /> Print Exam Slip
                </button>
              </div>
            ) : (
              <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Application Under Review</strong>
                  Your application credentials are currently being processed by the Admissions Board. Check back soon for your examination schedule.
                </div>
              </div>
            )}

            {/* Printable Examination Slip Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/logo.png"
                    alt="MSSN Islamic Model Schools Akure Logo"
                    className="w-16 h-16 object-contain rounded-2xl bg-white p-1 shadow-md border border-slate-200 shrink-0"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      MSSN ISLAMIC MODEL SCHOOLS (MIMS)
                    </h1>
                    <p className="text-xs uppercase font-bold tracking-widest text-emerald-700">
                      Akure, Ondo State, Nigeria
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tel: 08036268724, 08146034137 | Email: admissions@mimsakure.edu.ng
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                    Entrance Exam Slip
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{applicant.refNo}</p>
                </div>
              </div>

              {/* Applicant Biodata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 text-sm">
                <div>
                  <span className="block text-xs uppercase font-bold text-slate-400 mb-0.5">
                    Applicant Full Name
                  </span>
                  <span className="font-extrabold text-slate-900 text-base">{applicant.name}</span>
                </div>

                <div>
                  <span className="block text-xs uppercase font-bold text-slate-400 mb-0.5">
                    Application Reference No.
                  </span>
                  <span className="font-extrabold text-emerald-600 font-mono text-base">
                    {applicant.refNo}
                  </span>
                </div>

                <div>
                  <span className="block text-xs uppercase font-bold text-slate-400 mb-0.5">
                    Registered Email
                  </span>
                  <span className="font-medium text-slate-700">{applicant.email}</span>
                </div>

                <div>
                  <span className="block text-xs uppercase font-bold text-slate-400 mb-0.5">
                    Admission Target
                  </span>
                  <span className="font-bold text-slate-900">2025/2026 Academic Session</span>
                </div>
              </div>

              {/* Exam Logistics */}
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Scheduled Examination Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-1">
                    <Calendar className="w-4 h-4" /> Exam Date
                  </div>
                  <p className="font-extrabold text-slate-900 text-sm">{applicant.examDate}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-1">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                  <p className="font-extrabold text-slate-900 text-sm">{applicant.examTime}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-1">
                    <MapPin className="w-4 h-4" /> Venue
                  </div>
                  <p className="font-extrabold text-slate-900 text-xs leading-snug">
                    {applicant.examVenue}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs mb-8 leading-relaxed">
                <strong className="block font-bold text-sm mb-1.5 text-amber-950">
                  Important Examination Instructions:
                </strong>
                {applicant.instructions}
              </div>

              {/* Signature Footnotes */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-8 mb-2" />
                  <p className="font-semibold text-slate-700">Admissions Officer Signature</p>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-8 mb-2" />
                  <p className="font-semibold text-slate-700">Parent / Guardian Signature</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
