'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Compass,
  Award,
  Layers,
  HelpCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail
} from 'lucide-react';

export default function AdmissionsPage() {
  const [gateConfig, setGateConfig] = useState<{
    isOpen: boolean;
    targetSession: string;
    announcementNotice?: string;
    closedNotice?: string;
  }>({
    isOpen: true,
    targetSession: '2026/2027 Academic Session',
    announcementNotice: 'Admissions Open for 2026/2027 Academic Session',
    closedNotice: 'Online admissions for the current academic cycle are currently closed.'
  });

  useEffect(() => {
    async function loadGate() {
      try {
        const res = await fetch('/api/cms/admissions-gate');
        const data = await res.json();
        if (data?.success && data.config) {
          setGateConfig({
            isOpen: typeof data.config.isOpen === 'boolean' ? data.config.isOpen : true,
            targetSession: data.config.targetSession || '2026/2027 Academic Session',
            announcementNotice: data.config.announcementNotice,
            closedNotice: data.config.closedNotice,
          });
        }
      } catch (err) {
        console.warn('Could not load admissions gate config:', err);
      }
    }
    loadGate();
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Submit Online Application',
      desc: 'Complete our streamlined online application form with applicant biodata, prospective class selection, and guardian details. Receive your instant Application ID (e.g., APP/2026/0142).',
    },
    {
      step: '02',
      title: 'Registry Review & Exam Notification',
      desc: 'Our Admissions Registry reviews your application. You receive an official email confirmation and personal phone call / SMS from the school with your scheduled entrance exam date, time, and campus venue.',
    },
    {
      step: '03',
      title: 'Entrance Examination & Interview',
      desc: 'Sit for the written assessment (Mathematics, English Language, General Knowledge & Basic Islamic Studies), followed by a brief oral aptitude and Qur’an reading assessment.',
    },
    {
      step: '04',
      title: 'Provisional Offer & Enrollment',
      desc: 'Successful candidates receive an official provisional admission letter with fee schedules, uniform measurements, textbook lists, and boarding allocation for Madinah Quarters.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentPath="/admissions" />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {gateConfig.isOpen ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>{gateConfig.announcementNotice ? 'Admissions Open' : `Admissions Open for ${gateConfig.targetSession}`}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-300 text-xs sm:text-sm font-bold uppercase tracking-wider animate-pulse">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Online Admissions Closed for {gateConfig.targetSession}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Academic Programs, Curricula &amp; Enrollment Guide
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            MSSN Islamic Model Schools, Akure provides a seamless developmental educational ladder spanning Early Childhood Care, Basic Primary School, Junior &amp; Senior Secondary College, and an elite Special Hifzul Qur’an Academy.
          </p>

          {/* If Closed, display prominent notice banner */}
          {!gateConfig.isOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed shadow-xl text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold mb-1">Admissions Window Notice:</strong>
                {gateConfig.closedNotice || 'Online admissions for the current academic cycle are currently closed. All entrance screening tests have concluded. For transfer inquiries, kindly contact the Principal\'s Office directly.'}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-bold">
            {gateConfig.isOpen ? (
              <Link
                href="/admissions/apply"
                className="px-7 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-lg flex items-center gap-2 font-bold"
              >
                <span>Begin Online Application</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/contact"
                className="px-7 py-3 rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 transition shadow-lg flex items-center gap-2 font-bold border border-rose-400/40"
              >
                <span>Admissions Closed — Contact School</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/contact"
              className="px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
            >
              Campuses &amp; Enquiries
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Detailed Breakdown */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            A Continuous Learning Pathway
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Comprehensive Academic Levels at MSSN Islamic Model Schools
          </h2>
          <p className="text-sm text-slate-600">
            Each developmental stage is meticulously tailored to stimulate cognitive growth, moral refinement, and practical Islamic living in state-of-the-art facilities.
          </p>
        </div>

        {/* Level 1: Early Childhood & Primary */}
        <div id="creche" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-1">
                Tier 01 • Omi Eja Annex
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Early Childhood &amp; Basic Primary Care
              </h3>
              <p className="text-xs text-slate-500">Crèche, Pre-Nursery, Nursery &amp; Primary (Basic 1 - 6)</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
              Ages 6 Months to 11 Years
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Nurturing Wonder, Literacy &amp; Character from Day One</h4>
              <p>
                Operating predominantly out of our specialized <strong>Omi Eja Annex</strong> in Akure, our early childhood division offers a warm, safe, child-centered environment. We fuse the best of modern Montessori phonics and sensory exploration with foundational Islamic morals, daily supplications (Adhkar), and basic Arabic letter identification.
              </p>
              <p>
                Our classrooms are brightly lit, climate-controlled, and equipped with multimedia learning aids. Children are nurtured by certified early childhood educators with a passion for child psychology and behavioral guidance.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Curriculum Pillars:</h4>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Jolly Phonics &amp; Early Literacy:</strong> Rapid sound blending, guided reading, and creative storytelling.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Numeracy &amp; STEM Foundations:</strong> Concrete manipulative mathematics, pattern recognition, and nature observation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Arabic &amp; Tahfeez Primer:</strong> Memorization of short Surahs from Juz’ Amma, proper articulation of Arabic alphabet, and daily etiquette.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Primary School Leaving Certificate (CAS):</strong> Thorough grounding ensuring 100% entrance examination success into prestigious secondary colleges.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Level 2: Secondary Education */}
        <div id="secondary" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-1">
                Tier 02 • High School Area &amp; Madinah Quarters
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Secondary College Education
              </h3>
              <p className="text-xs text-slate-500">Junior Secondary (JSS 1 - 3) &amp; Senior Secondary (SSS 1 - 3)</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
              Ages 11 to 18 Years • Day &amp; Boarding Options
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Dual Rigor: World-Class STEM, Arts &amp; Ethical Leadership</h4>
              <p>
                Our secondary college curriculum complies fully with the <strong>Nigerian National Policy on Education</strong> and is accredited by the <strong>Ondo State Ministry of Education</strong>, <strong>WAEC</strong>, <strong>NECO</strong>, and <strong>NBAIS</strong>.
              </p>
              <p>
                We maintain fully equipped laboratories for Physics, Chemistry, Biology, and Agricultural Science, alongside a high-speed ICT Computer Laboratory for computer-based testing (CBT) training. We boast zero tolerance for examination malpractice, nurturing scholars whose distinction scores represent genuine academic mastery.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Academic Disciplines Offered:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="block text-emerald-800 mb-1">Science Department</strong>
                  <p className="text-slate-600 text-[11px]">Physics, Chemistry, Biology, Further Maths, Agricultural Science, Technical Drawing.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="block text-emerald-800 mb-1">Commercial Department</strong>
                  <p className="text-slate-600 text-[11px]">Financial Accounting, Commerce, Economics, Marketing, Office Practice.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="block text-emerald-800 mb-1">Arts &amp; Humanities</strong>
                  <p className="text-slate-600 text-[11px]">Government, Literature in English, History, Civic Education, Islamic Studies.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <strong className="block text-emerald-800 mb-1">Arabic &amp; Languages</strong>
                  <p className="text-slate-600 text-[11px]">English Language, Classical Arabic, Yoruba Language, French Language.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level 3: Special Hifzul Qur'an Class */}
        <div id="hifz" className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl space-y-6">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                Distinctive Crown Jewel • Madinah Quarters &amp; High School Area
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Special Hifzul Qur’an Class (Tahfeez Academy)
              </h3>
              <p className="text-xs text-emerald-200">Dedicated Al-Qur’an Memorization Program Running Concurrently with Academics</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 self-start sm:self-auto">
              Boarding &amp; Day Tracks
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-slate-200 leading-relaxed">
            <div className="space-y-4">
              <h4 className="font-bold text-white text-base">Preserving the Divine Scripture in Young Hearts</h4>
              <p>
                The <strong>Special Hifzul Qur’an Class</strong> is designed for families who refuse to compromise their child’s spiritual destiny for secular education. Students in this program undergo intensive, structured memorization sessions in the early mornings before formal classes commence and during dedicated evening review circles (Halaqat).
              </p>
              <p>
                Under the direct supervision of qualified Huffaz and Tajweed specialists with verified chains of transmission (Sanad), learners master correct phonetic articulation (Makharij al-Huruf), rules of stopping and starting (Waqf wa Ibtida’), and weekly cumulative revision (Muraja'ah).
              </p>
            </div>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/30 space-y-4 backdrop-blur-xs">
              <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">Key Milestones &amp; NBAIS Certification:</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Systematic Progression:</strong> Students advance from Juz’ Amma up to complete 30 Juz’ (60 Hizb) with structured exams at every 5-Juz’ milestone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>NBAIS National Accreditation:</strong> Candidates sit for the National Board for Arabic and Islamic Studies (NBAIS) examinations, conferring official national recognition.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>National &amp; Regional Musabaqah:</strong> Regular participation in national Qur’anic recitation competitions, consistently bringing trophies back to Akure.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Admissions Procedure */}
      <section className="bg-slate-100 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Admission Guidelines
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Simple 4-Step Application &amp; Enrollment Process
            </h2>
            <p className="text-sm text-slate-600">
              We welcome applications from motivated learners into Crèche, Nursery, Primary, JSS 1, JSS 2, SSS 1, and the Special Hifz track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Requirements Box */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Required Documentation for Screening Day</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Printed Entrance Examination Slip</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Original &amp; Photocopy of Birth Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Two (2) recent passport photographs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Last Academic Report Sheet from previous school</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boarding and Pastoral Care */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              Pastoral &amp; Residential Care
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A Home Away from Home at Our Madinah Quarters Campus
            </h2>
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                Our purpose-built boarding houses at the serene <strong>Madinah Quarters Campus</strong> along Ilere/Ijare Road provide separate, secure hostel blocks for boys and girls. Supervised by devoted resident house parents and Islamic wardens, the boarding environment cultivates discipline, communal brother/sisterhood, and healthy daily habits.
              </p>
              <p>
                Boarders participate in daily Tahajjud (night prayers), structured evening prep studies, supervised sports, and wholesome halal dining planned by certified nutritional staff.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>24/7 Gated Security</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>On-Site Health Clinic</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-900 group aspect-4/3">
                <img
                  src="/images/campus-annex.jpg"
                  alt="Madinah Quarters College & Boarding"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Madinah Boarding Campus
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-900 group aspect-4/3">
                <img
                  src="/images/primary-pupils-uniform.jpg"
                  alt="Primary School Pupils in Uniform"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Nursery & Primary Pupils
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-900 group aspect-4/3">
                <img
                  src="/images/primary-campus-courtyard.jpg"
                  alt="Omi Eja Primary Courtyard"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Omi Eja Campus Courtyard
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-900 group aspect-4/3">
                <img
                  src="/images/primary-school-bus.jpg"
                  alt="MIMS School Bus Logistics Network"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    School Bus Transit Network
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Ready to Begin the Journey to Excellence?
          </h2>
          <p className="text-sm sm:text-base text-emerald-200 leading-relaxed">
            Apply online today in less than 5 minutes. Secure an examination slot at your preferred center in Akure.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-bold">
            {gateConfig.isOpen ? (
              <Link
                href="/admissions/apply"
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg"
              >
                Fill Application Form Now
              </Link>
            ) : (
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg border border-rose-400/40"
              >
                Admissions Closed — Contact School
              </Link>
            )}
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-800 text-white transition"
            >
              Campuses &amp; Enquiries
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
