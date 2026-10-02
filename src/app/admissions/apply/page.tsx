'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  GraduationCap,
  User,
  Users,
  HeartHandshake,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Building,
  Sparkles,
  HelpCircle,
  Printer,
  Loader2
} from 'lucide-react';

export default function AdmissionsApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Student Information
    firstname: '',
    middlename: '',
    lastname: '',
    dob: '',
    gender: 'male',
    target_class: 'Junior Secondary (JSS 1)',
    campus_preference: 'Madinah Quarters (Main College & Boarding)',
    boarding_type: 'Day Scholar',
    nationality: 'Nigerian',
    state_of_origin: 'Ondo State',
    lga: 'Akure South',
    photo: '',

    // 2. Parent / Guardian Information
    guardian_name: '',
    guardian_relationship: 'Father',
    guardian_phone: '',
    guardian_alt_phone: '',
    email: '',
    address: '',
    residential_area: 'Madinah / Ilere Road',
    guardian_occupation: '',
    guardian_workplace: '',

    // 3. Academic & Medical Background
    prev_school_name: '',
    prev_school_address: '',
    prev_grade_completed: 'Basic 6 / Primary 6',
    report_submission_mode: 'physical',
    report_file_url: '',
    report_file_name: '',
    medical_history: 'None / No known medical allergies',
    special_needs: 'None',

    // 4. Administrative Details
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: 'Uncle / Relative',
    referral_source: 'Word of Mouth / Parent Recommendation',
    declaration_agreed: true,
  });

  const [submittedData, setSubmittedData] = useState<{
    ref: string;
    fullName: string;
    dob: string;
    studentAge: number | null;
    gender: string;
    targetClass: string;
    campus: string;
    boardingType: string;
    nationality: string;
    stateOfOrigin: string;
    guardianName: string;
    guardianRelationship: string;
    phone: string;
    email: string;
    address: string;
    prevSchool: string;
    prevGrade: string;
    medicalHistory: string;
    photo?: string;
    reportFileUrl?: string;
  } | null>(null);

  // Handle Passport Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Passport photograph file size must be less than 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Academic Report Card Upload to Cloudinary
  const handleReportFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Report card file size must be less than 5MB.');
      return;
    }

    setUploadingReport(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'mims/admissions/reports');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload report file');
      }

      setFormData((prev) => ({
        ...prev,
        report_file_url: data.url,
        report_file_name: file.name,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setUploadingReport(false);
    }
  };

  // Calculate age automatically from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const studentAge = calculateAge(formData.dob);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    setError(null);
    if (step === 1) {
      if (!formData.firstname.trim() || !formData.lastname.trim()) {
        setError('Please enter the child’s first name and last name.');
        return false;
      }
      if (!formData.dob) {
        setError('Please select the child’s date of birth.');
        return false;
      }
      if (!formData.photo) {
        setError('Please upload the applicant’s passport photograph.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.guardian_name.trim()) {
        setError('Please enter the parent or guardian’s full name.');
        return false;
      }
      if (!formData.guardian_phone.trim() || formData.guardian_phone.length < 10) {
        setError('Please provide a valid 11-digit mobile phone number for calls and SMS.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid email address for formal admission correspondence.');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Please enter your residential home address in Akure.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.emergency_name.trim() || !formData.emergency_phone.trim()) {
        setError('Please provide an emergency contact person and phone number.');
        return false;
      }
      if (!formData.declaration_agreed) {
        setError('You must confirm the truthfulness of the provided information.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit admission application');
      }

      setSubmittedData({
        ref: data.applicationRef || 'APP/2026/0142',
        fullName: [formData.firstname, formData.middlename, formData.lastname].filter(Boolean).join(' '),
        dob: formData.dob,
        studentAge,
        gender: formData.gender === 'female' ? 'Female' : 'Male',
        targetClass: formData.target_class,
        campus: formData.campus_preference,
        boardingType: formData.boarding_type,
        nationality: formData.nationality,
        stateOfOrigin: formData.state_of_origin,
        guardianName: formData.guardian_name,
        guardianRelationship: formData.guardian_relationship,
        phone: formData.guardian_phone,
        email: formData.email,
        address: formData.address,
        prevSchool: formData.prev_school_name,
        prevGrade: formData.prev_grade_completed,
        medicalHistory: formData.medical_history,
        photo: formData.photo,
        reportFileUrl: formData.report_file_url,
      });

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Application submission error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Navbar currentPath="/admissions" />

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026/2027 Academic Session</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Online Student Admission Application
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            MSSN Islamic Model Schools, Akure • Crèche, Nursery, Primary, Secondary &amp; Special Hifzul Qur’an Class
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {submittedData ? (
          /* Confirmation View & Dedicated Single-Sheet Printable Slip */
          <div>
            {/* Print CSS Styles to enforce single-page A4 print */}
            <style jsx global>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm;
                }
                html, body {
                  background: #fff !important;
                  color: #000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .no-print, header, nav, footer, section {
                  display: none !important;
                }
                #admission-slip-printable {
                  display: block !important;
                  visibility: visible !important;
                  position: static !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  padding: 16px !important;
                  background: white !important;
                  color: black !important;
                  page-break-after: avoid !important;
                  page-break-inside: avoid !important;
                  border: 2px solid #000 !important;
                }
              }
            `}</style>

            {/* 1. ON-SCREEN CONFIRMATION (Hidden on print) */}
            <div className="no-print bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 inline-block">
                  Application Successfully Logged
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Alhamdulillah! Registration Completed
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your admission application has been registered with the Central Admissions Registry of MSSN Islamic Model Schools, Akure.
                </p>
              </div>

              {/* Application Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                  <div className="flex items-center gap-4">
                    {submittedData.photo ? (
                      <img
                        src={submittedData.photo}
                        alt={submittedData.fullName}
                        className="w-16 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-xs shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-16 h-20 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Official Application Reference
                      </span>
                      <span className="text-xl sm:text-2xl font-mono font-black text-emerald-700">
                        {submittedData.ref}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Exam Slip</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Applicant Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{submittedData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Grade Applied For:</span>
                    <span className="font-bold text-slate-900 text-sm">{submittedData.targetClass}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Assigned Campus Wing:</span>
                    <span className="font-bold text-slate-900">{submittedData.campus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Primary Guardian:</span>
                    <span className="font-bold text-slate-900">{submittedData.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Contact Mobile (SMS &amp; Calls):</span>
                    <span className="font-bold text-slate-900">{submittedData.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Notification Email:</span>
                    <span className="font-bold text-slate-900">{submittedData.email}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps Guidance */}
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>What Happens Next? (Admissions Protocol)</span>
                </h4>
                <ul className="space-y-2 text-xs text-emerald-900 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">1.</span>
                    <span><strong>Email Dispatch:</strong> An official acknowledgement containing your Reference ID has been sent to <strong>{submittedData.email}</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">2.</span>
                    <span><strong>Direct Phone Call &amp; SMS:</strong> Our Admissions Officer will call you directly on <strong>{submittedData.phone}</strong> to confirm your scheduled Entrance Examination date and interview slot.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 shrink-0">3.</span>
                    <span><strong>Screening Day Items:</strong> On your scheduled assessment day, please bring: this printed slip, 2 recent passport photographs, photocopy of birth certificate, and previous school academic report.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Application Summary Slip (1 Page)</span>
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition text-center"
                >
                  Return to Home Page
                </Link>
              </div>
            </div>

            {/* 2. DEDICATED OFFICIAL SINGLE-PAGE PRINTABLE SLIP (Appears ONLY in Print Dialog) */}
            <div id="admission-slip-printable" className="hidden print:block font-serif text-black leading-tight">
              {/* Institution Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/logo.png"
                    alt="MIMS Logo"
                    className="w-16 h-16 object-contain shrink-0"
                  />
                  <div>
                    <h1 className="text-lg font-black tracking-tight uppercase leading-tight font-sans">
                      MSSN ISLAMIC MODEL SCHOOLS (MIMS)
                    </h1>
                    <p className="text-[10px] text-gray-700 font-sans">
                      Medina Community, Ilere/Ijare Road, P.O. Box 2488, Akure, Ondo State
                    </p>
                    <p className="text-[9px] font-bold italic text-emerald-800 font-sans">
                      Motto: Knowledge, Faith and Excellent Morals • Al-Birr
                    </p>
                    <p className="text-[9px] text-gray-600 font-sans">
                      Admissions Desk: 08036268724, 08146034137 • admissions@mimsakure.com
                    </p>
                  </div>
                </div>

                {submittedData.photo ? (
                  <img
                    src={submittedData.photo}
                    alt={submittedData.fullName}
                    className="w-20 h-24 object-cover border-2 border-black shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-20 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-500 shrink-0 text-center p-1">
                    Affix Passport Photograph
                  </div>
                )}
              </div>

              {/* Title & Reference Box */}
              <div className="flex items-center justify-between bg-gray-100 border border-black px-3 py-1.5 mb-3 font-sans">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-600 block">
                    DOCUMENT TYPE:
                  </span>
                  <strong className="text-xs font-black uppercase text-black">
                    OFFICIAL ENTRANCE EXAMINATION &amp; ADMISSION SLIP
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-gray-600 block">
                    APPLICATION REFERENCE NO.
                  </span>
                  <span className="font-mono font-black text-sm text-black">
                    {submittedData.ref}
                  </span>
                </div>
              </div>

              {/* Section 1: Candidate Biodata Dossier Table */}
              <div className="mb-3 font-sans text-[11px]">
                <div className="bg-gray-200 border-x border-t border-black px-2 py-0.5 font-bold uppercase text-[9px]">
                  1. Candidate Matriculation &amp; Personal Dossier
                </div>
                <table className="w-full border-collapse border border-black text-left">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-1.5 font-semibold text-gray-600 w-1/4 bg-gray-50">Candidate Full Name:</td>
                      <td className="p-1.5 font-bold text-black w-1/4">{submittedData.fullName}</td>
                      <td className="p-1.5 font-semibold text-gray-600 w-1/4 bg-gray-50">Gender &amp; Age:</td>
                      <td className="p-1.5 font-bold text-black w-1/4">
                        {submittedData.gender} ({submittedData.studentAge !== null ? `${submittedData.studentAge} Years` : 'N/A'})
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Target Grade Level:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.targetClass}</td>
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Date of Birth:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.dob || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Campus Preference:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.campus}</td>
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Boarding Status:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.boardingType}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Primary Guardian:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.guardianName} ({submittedData.guardianRelationship})</td>
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Guardian Phone:</td>
                      <td className="p-1.5 font-bold text-black font-mono">{submittedData.phone}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Notification Email:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.email}</td>
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Previous School &amp; Grade:</td>
                      <td className="p-1.5 font-bold text-black">{submittedData.prevSchool || 'N/A'} ({submittedData.prevGrade || 'N/A'})</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-semibold text-gray-600 bg-gray-50">Residential Address:</td>
                      <td className="p-1.5 font-bold text-black" colSpan={3}>{submittedData.address}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Scheduled Assessment & Venue Logistics */}
              <div className="mb-3 font-sans text-[11px]">
                <div className="bg-gray-200 border-x border-t border-black px-2 py-0.5 font-bold uppercase text-[9px]">
                  2. Scheduled Entrance Examination Details
                </div>
                <div className="border border-black p-2.5 bg-gray-50/60 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Assessment Date</span>
                    <strong className="text-xs text-black block">Saturday, 18th October 2026</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Accreditation Time</span>
                    <strong className="text-xs text-black block">08:30 AM (Exam: 09:00 AM)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Examination Venue</span>
                    <strong className="text-xs text-black block">MSSN Complex Hall, Akure</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Mandatory Candidate Requirements Checklist */}
              <div className="mb-3 font-sans text-[10px] border border-black p-2 leading-tight">
                <span className="font-bold uppercase text-black block mb-1">
                  Mandatory Screening Day Checklist (Must Bring):
                </span>
                <div className="grid grid-cols-2 gap-1 text-gray-700">
                  <div>☑ 1. This Printed Official Application Slip</div>
                  <div>☑ 2. Two (2) Recent Passport Photographs</div>
                  <div>☑ 3. Original &amp; Photocopy of Birth Certificate</div>
                  <div>☑ 4. Previous School Report Card / Transcript</div>
                  <div>☑ 5. HB Pencils, Eraser &amp; Ballpoint Pen</div>
                  <div>☑ 6. Strict compliance with prescribed Islamic modesty</div>
                </div>
              </div>

              {/* Section 4: Attestation & Authorization Signatures */}
              <div className="border-t-2 border-black pt-2 font-sans text-[9px] text-gray-700">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="h-9 border-b border-dashed border-gray-400 mb-1" />
                    <p className="font-bold text-black">Candidate Signature</p>
                    <p className="text-[8px] text-gray-500">I certify the biodata supplied is true</p>
                  </div>
                  <div>
                    <div className="h-9 border-b border-dashed border-gray-400 mb-1" />
                    <p className="font-bold text-black">Parent / Guardian Signature</p>
                    <p className="text-[8px] text-gray-500">Authorized parental endorsement</p>
                  </div>
                  <div>
                    <div className="h-9 border-2 border-black p-1 mb-1 flex items-center justify-center font-mono font-bold text-[8px] text-gray-400">
                      [ ADMISSIONS REGISTRAR STAMP ]
                    </div>
                    <p className="font-bold text-black">Verification Desk</p>
                    <p className="text-[8px] text-gray-500">MIMS Central Registry</p>
                  </div>
                </div>

                <div className="mt-2 text-center text-[8px] text-gray-400">
                  Generated by MIMS Cloud Registry System • {submittedData.ref} • Valid for 2026 Admissions
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Step Application Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
            {/* Step Progress Indicators */}
            <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-6">
              {[
                { num: 1, label: 'Student Info' },
                { num: 2, label: 'Parent / Guardian' },
                { num: 3, label: 'Academic & Health' },
                { num: 4, label: 'Admin Details' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`text-center space-y-1.5 pb-2 border-b-2 transition ${
                    currentStep === s.num
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : currentStep > s.num
                      ? 'border-emerald-500 text-slate-700'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  <span
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === s.num
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : currentStep > s.num
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:block text-[11px] font-semibold truncate">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Student Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      <span>Step 1: Student Information</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Please enter the child’s full legal name, age, grade level placement, and upload a passport photograph.
                    </p>
                  </div>

                  {/* Passport Photo Upload Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative w-28 h-32 rounded-2xl bg-white border-2 border-dashed border-emerald-400/80 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt="Applicant Passport Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <User className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold block leading-tight">
                            Passport Photo
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                          <span>Applicant Passport Photograph</span>
                          <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-black uppercase">Required</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                          Upload a clear, front-facing portrait of the student on a plain/white background. This image will appear on the official entrance exam invitation slip.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <label
                          htmlFor="passport-file-input"
                          className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.photo ? 'Change Photo' : 'Upload Passport Photo'}</span>
                        </label>
                        <input
                          id="passport-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />

                        {formData.photo && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition"
                          >
                            Remove
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400">Max size: 2MB (JPG or PNG)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        required
                        placeholder="e.g. Ibrahim"
                        value={formData.firstname}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middlename"
                        placeholder="e.g. Kolawole"
                        value={formData.middlename}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Last Name (Surname) *
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        required
                        placeholder="e.g. Adeleke"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        required
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {studentAge !== null && (
                        <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                          Verified Age: {studentAge} years old
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="male">Male (Boy)</option>
                        <option value="female">Female (Girl)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Grade / Year Group Applied For *
                      </label>
                      <select
                        name="target_class"
                        value={formData.target_class}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <optgroup label="Early Childhood Care">
                          <option>Crèche (3 months - 1.5 yrs)</option>
                          <option>Pre-Nursery</option>
                          <option>Nursery 1</option>
                          <option>Nursery 2</option>
                          <option>Nursery 3</option>
                        </optgroup>
                        <optgroup label="Basic Primary Education">
                          <option>Basic 1 (Primary 1)</option>
                          <option>Basic 2 (Primary 2)</option>
                          <option>Basic 3 (Primary 3)</option>
                          <option>Basic 4 (Primary 4)</option>
                          <option>Basic 5 (Primary 5)</option>
                          <option>Basic 6 (Primary 6)</option>
                        </optgroup>
                        <optgroup label="Junior Secondary">
                          <option>Junior Secondary (JSS 1)</option>
                          <option>Junior Secondary (JSS 2)</option>
                          <option>Junior Secondary (JSS 3)</option>
                        </optgroup>
                        <optgroup label="Senior Secondary">
                          <option>Senior Secondary (SSS 1 Science)</option>
                          <option>Senior Secondary (SSS 1 Commercial)</option>
                          <option>Senior Secondary (SSS 1 Arts &amp; Humanities)</option>
                          <option>Senior Secondary (SSS 2)</option>
                        </optgroup>
                        <optgroup label="Quranic Track">
                          <option>Special Hifzul Qur’an Class (Tahfeez Track)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Campus Preference *
                      </label>
                      <select
                        name="campus_preference"
                        value={formData.campus_preference}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Madinah Quarters (Main College &amp; Boarding)</option>
                        <option>High School Area (Secondary &amp; Admin Wing)</option>
                        <option>Omi Eja Annex (Early Childhood &amp; Primary)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Enrollment Mode *
                      </label>
                      <select
                        name="boarding_type"
                        value={formData.boarding_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Day Scholar</option>
                        <option>Full Boarding (Madinah Quarters)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State of Origin *
                      </label>
                      <select
                        name="state_of_origin"
                        value={formData.state_of_origin}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Ondo State</option>
                        <option>Osun State</option>
                        <option>Oyo State</option>
                        <option>Ogun State</option>
                        <option>Ekiti State</option>
                        <option>Lagos State</option>
                        <option>Kwara State</option>
                        <option>Edo State</option>
                        <option>Kogi State</option>
                        <option>Other State</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Local Govt Area (LGA)
                      </label>
                      <input
                        type="text"
                        name="lga"
                        placeholder="e.g. Akure South / North"
                        value={formData.lga}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Parent / Guardian Information */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span>Step 2: Parent / Guardian Information</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contact details for formal letters, emergency alerts, SMS notifications, and fee invoicing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Parent / Guardian Full Name(s) *
                      </label>
                      <input
                        type="text"
                        name="guardian_name"
                        required
                        placeholder="e.g. Alhaji Mustapha Adeleke"
                        value={formData.guardian_name}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Relationship to Student *
                      </label>
                      <select
                        name="guardian_relationship"
                        value={formData.guardian_relationship}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Legal Guardian</option>
                        <option>Uncle / Aunt</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Active Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="guardian_phone"
                        required
                        placeholder="e.g. 0803 358 1947"
                        value={formData.guardian_phone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500">For SMS notifications and admissions call</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Alternative Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="guardian_alt_phone"
                        placeholder="e.g. 0814 220 9043"
                        value={formData.guardian_alt_phone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. parent@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500">For admission letters and exam slips</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Home Residential Address in Akure *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="e.g. No 14, Olusegun Obasanjo Way, Near Central Mosque"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Residential Area / Zone *
                      </label>
                      <select
                        name="residential_area"
                        value={formData.residential_area}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Madinah / Ilere Road</option>
                        <option>High School / Oyemekun</option>
                        <option>Omi Eja / Ondo Road</option>
                        <option>Alagbaka Estate</option>
                        <option>Ijapo Estate</option>
                        <option>Oba-Ile Axis</option>
                        <option>FUTA / South Gate</option>
                        <option>Shagari Village</option>
                        <option>Arakale / Isikan</option>
                        <option>Outside Akure City</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Parent Occupation
                      </label>
                      <input
                        type="text"
                        name="guardian_occupation"
                        placeholder="e.g. Civil Servant / Chartered Accountant"
                        value={formData.guardian_occupation}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Workplace / Organization
                      </label>
                      <input
                        type="text"
                        name="guardian_workplace"
                        placeholder="e.g. Ministry of Health, Akure"
                        value={formData.guardian_workplace}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Academic & Medical Background */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span>Step 3: Academic &amp; Medical Background</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Previous schooling records, health history, and special learning considerations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Previous School Attended
                      </label>
                      <input
                        type="text"
                        name="prev_school_name"
                        placeholder="e.g. Al-Huda Nursery & Primary School"
                        value={formData.prev_school_name}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Previous School Location (Town / City)
                      </label>
                      <input
                        type="text"
                        name="prev_school_address"
                        placeholder="e.g. Akure, Ondo State"
                        value={formData.prev_school_address}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Last Grade / Class Completed
                      </label>
                      <input
                        type="text"
                        name="prev_grade_completed"
                        placeholder="e.g. Primary 5 / JSS 1"
                        value={formData.prev_grade_completed}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Previous Academic Report Mode
                      </label>
                      <select
                        name="report_submission_mode"
                        value={formData.report_submission_mode}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                      >
                        <option value="physical">Bring physical copy on Screening / Exam Day</option>
                        <option value="digital">Uploaded copy / Digital Submission</option>
                      </select>
                    </div>
                  </div>

                  {/* Triggered Upload Section when Digital Mode is Selected */}
                  {formData.report_submission_mode === 'digital' && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold text-emerald-950">
                            Upload Previous Academic Report / Transcript
                          </label>
                          <p className="text-[11px] text-slate-600">
                            Upload a clear PDF or photo of your child&apos;s most recent school terminal report card.
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          Digital Submission
                        </span>
                      </div>

                      {formData.report_file_url ? (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-emerald-300 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">
                                {formData.report_file_name || 'Academic_Report_Card.pdf'}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded to School Cloud
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <a
                              href={formData.report_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-emerald-700 hover:underline px-2 py-1"
                            >
                              Preview
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  report_file_url: '',
                                  report_file_name: '',
                                }))
                              }
                              className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="report-file-input"
                            className="cursor-pointer border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center bg-white transition gap-2"
                          >
                            {uploadingReport ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 py-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Uploading document to Cloudinary...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-emerald-600" />
                                <span className="text-xs font-bold text-slate-800">
                                  Click or drag to upload report card / transcript
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Supports PDF, JPG, PNG or WebP (Max 5MB)
                                </span>
                              </>
                            )}
                          </label>
                          <input
                            id="report-file-input"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleReportFileUpload}
                            className="hidden"
                            disabled={uploadingReport}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medical History, Known Allergies or Chronic Conditions
                    </label>
                    <textarea
                      name="medical_history"
                      rows={2}
                      placeholder="e.g. Asthma, peanut allergy, penicillin reaction, sickle cell genotype, or state 'None'"
                      value={formData.medical_history}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500">Crucial for student infirmary and boarding health protocols</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Special Educational Needs or Physical Support
                    </label>
                    <input
                      type="text"
                      name="special_needs"
                      placeholder="e.g. Wears prescription eyeglasses, requires front seating, or 'None'"
                      value={formData.special_needs}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Administrative & Emergency Contact Details */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Step 4: Emergency Contacts &amp; Survey</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Alternative emergency contacts and declaration before formal submission.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Emergency Contact Person *
                      </label>
                      <input
                        type="text"
                        name="emergency_name"
                        required
                        placeholder="e.g. Mrs. Fatimah Adeleke"
                        value={formData.emergency_name}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Emergency Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="emergency_phone"
                        required
                        placeholder="e.g. 0806 712 4490"
                        value={formData.emergency_phone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Relationship to Child *
                      </label>
                      <select
                        name="emergency_relationship"
                        value={formData.emergency_relationship}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option>Mother</option>
                        <option>Father</option>
                        <option>Uncle / Aunt</option>
                        <option>Grandparent</option>
                        <option>Family Friend</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      How Did You Hear About MSSN Islamic Model Schools?
                    </label>
                    <select
                      name="referral_source"
                      value={formData.referral_source}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option>Word of Mouth / Parent Recommendation</option>
                      <option>Mosque Announcement / MSSN Akure Area Council</option>
                      <option>Social Media / Online Search</option>
                      <option>June 2025 Senatorial District Championship News</option>
                      <option>School Bus / Highway Billboard</option>
                      <option>Handbill / Flyer</option>
                      <option>Other Referral</option>
                    </select>
                  </div>

                  {/* Declaration Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.declaration_agreed}
                        onChange={(e) =>
                          setFormData({ ...formData, declaration_agreed: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed font-medium">
                        I hereby certify that all information provided in this admission form is accurate and complete to the best of my knowledge. I understand that the Admissions Registry will verify credentials prior to final enrollment.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    <span>{loading ? 'Submitting Application...' : 'Submit Application Form'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
