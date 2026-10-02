'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  HeartHandshake,
  Compass,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Trophy,
  CheckCircle,
  Users,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

const heroSlides = [
  {
    image: '/images/morning-assembly.jpg',
    tag: 'Faith, Moral Uprightness & Discipline',
    title: 'Excellence in Academic & Character',
    desc: 'MSSN Islamic Model Schools, Akure (formerly Al-Birr Islamic Model College) blends a rigorous Western curriculum with sound Islamic training under our inspiring motto: "Knowledge is Light".',
  },
  {
    image: '/images/library-study.jpg',
    tag: 'State-of-the-Art Research & Reading Culture',
    title: 'Nurturing Intellectual & Religious Scholars',
    desc: 'Fully accredited and approved by relevant state and national educational bodies for WAEC, NECO, BECE, and NBAIS examinations with zero tolerance for examination malpractice.',
  },
  {
    image: '/images/sports-league.jpg',
    tag: 'Physical Agility & Inter-School League Champions',
    title: 'Championing Well-Rounded Holistic Development',
    desc: 'Fostering teamwork, athletic stamina, and leadership through competitive sports leagues alongside top-tier STEM and humanities curricula.',
  },
  {
    image: '/images/campus-annex.jpg',
    tag: 'Multiple City Campuses: High School, Omi Eja & Madinah',
    title: 'Islamic Education, Western Education & Hifzul Qur’an',
    desc: 'Equipped science laboratories, comprehensive boarding facilities, and a specialized Hifzul Qur’an track dedicated to complete Al-Qur’an memorization.',
  },
  {
    image: '/images/awards-presentation.png',
    tag: 'June 2025: 1st Position Ondo Central Senatorial District',
    title: 'Unrivalled Track Record of Academic Excellence',
    desc: 'Defeating well-funded private institutions in the region and clinching championship trophies in state, regional, and national Quranic and impromptu speaking competitions.',
  },
];

const topJambScorers = [
  { name: 'Omiyale Hafsoh Olaide', score: 285, badge: 'Top Scorer' },
  { name: 'Abdulkareem Abdulmajeed Opeyemi', score: 278, badge: 'Honour Roll' },
  { name: 'Ibrahim Mujitah Oloruntoyin', score: 266, badge: 'Honour Roll' },
  { name: 'Agoro Khalilat', score: 246, badge: 'Distinction' },
  { name: 'Ajibade Faruq Ayobami', score: 244, badge: 'Distinction' },
  { name: 'Surajudeen Barakat Blessing', score: 233, badge: 'Distinction' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Navbar currentPath="/" />

      {/* 3. Dynamic Changing Hero Slideshow Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-24 lg:py-32 min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] flex items-center">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60" />
          </div>
        ))}

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold mb-4 sm:mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {heroSlides[currentSlide].tag}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-6 text-white drop-shadow-sm">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-100 mb-6 sm:mb-8 leading-relaxed font-normal sm:font-medium max-w-3xl drop-shadow-sm">
              {heroSlides[currentSlide].desc}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/admissions/apply"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-base transition shadow-xl shadow-emerald-500/30 transform active:scale-95"
              >
                Apply for Admission
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-base backdrop-blur-md border border-white/20 transition transform active:scale-95"
              >
                Learn About MIMS
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <button
          onClick={prevSlide}
          title="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition hidden sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          title="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition hidden sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-emerald-400'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 4. Stat Counter Bar */}
      <section className="bg-slate-950 py-8 sm:py-12 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8 text-center">
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-center">
              <div className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight leading-tight">
                1st Position
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 mt-1.5 font-semibold leading-tight">
                Ondo Central Senatorial Dist. (2025)
              </div>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-center">
              <div className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight leading-tight">
                285
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 mt-1.5 font-semibold leading-tight">
                Top JAMB UTME Score
              </div>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-center">
              <div className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight leading-tight">
                100%
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 mt-1.5 font-semibold leading-tight">
                Malpractice-Free Exams
              </div>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-center">
              <div className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight leading-tight">
                3 Campuses
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 mt-1.5 font-semibold leading-tight">
                High School, Omi Eja, Madinah
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Institutional Overview & Distinct Heritage */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Reputable, Government-Approved Institution
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Where High Academic Rigor Meets Timeless Islamic Faith
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                <strong>MSSN Islamic Model Schools, Akure</strong> (formerly known as <em>Al-Birr Islamic Model College</em>) is a prestigious, government-approved faith-based educational institution established by the <strong>Muslim Students&apos; Society of Nigeria (MSSN), Akure Area Council</strong>.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Operating under the inspiring motto <strong className="text-emerald-700">&ldquo;Knowledge is light,&rdquo;</strong> the institution is committed to raising well-rounded future leaders who are academically competitive on global standards, morally upright, and spiritually guided.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800 mb-8">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-emerald-600 font-bold text-sm mb-1">WAEC & NECO</span>
                  Accredited secondary curriculum from JSS 1 to SSS 3.
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-emerald-600 font-bold text-sm mb-1">NBAIS & BECE</span>
                  National Board for Arabic & Islamic Studies recognized.
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 group"
              >
                Read our full institutional profile & leadership philosophy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/images/morning-assembly.jpg"
                alt="Morning Assembly at MSSN Islamic Model Schools Akure"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs uppercase font-bold text-emerald-400 block mb-1">Morning Assembly</span>
                  <p className="text-sm font-bold">Instilling discipline, punctuality, and Islamic brotherhood every sunrise.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Academic Programs & Special Hifzul Qur'an Track */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
              Comprehensive Educational Pathways
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Nurturing Learners From Crèche to Senior Secondary
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              We provide a seamless educational journey tailored to each developmental milestone, crowned by our specialized Tahfeez program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Early Childhood & Primary */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Early Childhood & Primary</h3>
              <p className="text-xs text-emerald-700 font-bold mb-4">Crèche • Pre-Nursery • Nursery • Primary</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                A warm, nurturing foundation fostering early literacy, numeracy, social etiquette (Adaab), and foundational Arabic alphabets for sound early childhood development.
              </p>
              <Link href="/admissions" className="text-xs font-bold text-emerald-600 hover:underline">
                Explore Primary Curriculum →
              </Link>
            </div>

            {/* Secondary Education */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secondary Education</h3>
              <p className="text-xs text-emerald-700 font-bold mb-4">Junior Secondary (JSS) & Senior Secondary (SSS)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Rigorous preparation across Sciences, Arts, and Commercial tracks. Full state and national accreditation for WAEC, NECO, and BECE certifications.
              </p>
              <Link href="/admissions" className="text-xs font-bold text-emerald-600 hover:underline">
                Secondary Admissions Guide →
              </Link>
            </div>

            {/* Special Hifzul Qur'an Track */}
            <div className="p-8 rounded-3xl bg-emerald-900 text-white shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Special Hifzul Qur&apos;an Class</h3>
              <p className="text-xs text-emerald-300 font-bold mb-4">Intensive Tajweed & Full Quran Memorization</p>
              <p className="text-xs text-emerald-100 leading-relaxed mb-6">
                A defining signature program of MIMS Akure, combining daily Quran memorization circles with Western academic lessons to graduate certified Huffaz.
              </p>
              <Link href="/about#hifz" className="text-xs font-bold text-emerald-300 hover:underline">
                Learn About Tahfeez Track →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Celebration of Achievement & JAMB Honour Roll */}
      <section id="achievements" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
              <Trophy className="w-4 h-4 text-amber-400" />
              Celebration of Academic Distinction
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              JAMB 2025 Honour Roll & Competitions
            </h2>
            <p className="text-sm text-emerald-200 mt-2 font-medium">
              MSSN Islamic Model Schools Akure <span className="opacity-80">(formerly Al-Birr Islamic Model Schools)</span>
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Defeating top private institutions in Ondo State and clinching 1st position across senatorial districts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Real Banner Graphic */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-white p-2">
              <img
                src="/images/jamb-honour-roll.png"
                alt="JAMB 2025 Honour Roll MSSN Islamic Model Schools"
                className="w-full h-auto object-contain rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md text-center text-xs text-white">
                <span className="font-bold text-amber-400">Official 2025 Honour Roll Roster</span>
              </div>
            </div>

            {/* Top Scorers Cards Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topJambScorers.map((student, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/50 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block mb-0.5">
                        {student.badge}
                      </span>
                      <h4 className="font-bold text-sm text-white">{student.name}</h4>
                      <p className="text-[11px] text-slate-300">JAMB UTME 2025</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex flex-col items-center justify-center font-black">
                      <span className="text-base text-amber-300">{student.score}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-300">Score</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Senatorial Championship Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-6 mt-6">
                <img
                  src="/images/awards-presentation.png"
                  alt="State Award of Excellence Presentation"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-lg shrink-0"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                    <Award className="w-4 h-4" /> 1st Position Ondo Central Senatorial District
                  </div>
                  <h4 className="text-base font-bold text-white">
                    State Champion Academic Distinction & Trophy Winner
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    In June 2025, our students won First Position in the Ondo Central Senatorial District Inter-School Competition, defeating well-funded private institutions in the region.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Multiple Operational Centers Across Akure */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
              Strategic City Presence
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Multiple Operational Campus Centers
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              To accommodate our growing student body across Ondo State, the institution maintains modern, fully-equipped learning centers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mb-4">
                01
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mb-1">Madinah Quarters Campus</h3>
              <p className="text-xs text-emerald-700 font-bold mb-3">Main College & Boarding Complex</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Medina Community, Ilere/Ijare Road, Akure. Houses our modern laboratories, college annex, and boarding dormitories.
              </p>
              <span className="text-[11px] font-semibold text-slate-500">Boarding & Day Facilities</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mb-4">
                02
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mb-1">High School Area Campus</h3>
              <p className="text-xs text-emerald-700 font-bold mb-3">Primary & Secondary Classrooms</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Centrally situated in the High School zone of Akure with secure learning spaces and active morning assemblies.
              </p>
              <span className="text-[11px] font-semibold text-slate-500">Primary & Junior Secondary</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center mb-4">
                03
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mb-1">Omi Eja Annex Center</h3>
              <p className="text-xs text-emerald-700 font-bold mb-3">Early Childhood & Primary Care</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Specialized early learning center accommodating crèche, nursery, and primary school pupils in a caring environment.
              </p>
              <span className="text-[11px] font-semibold text-slate-500">Crèche, Nursery & Primary</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              View Full Campus Locations & Enquiries
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
