'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Award,
  BookOpen,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Layers,
  Flame,
  Star
} from 'lucide-react';

export default function AboutPage() {
  const photoGallery = [
    {
      src: '/images/primary-pupils-uniform.jpg',
      title: 'Nursery & Basic Primary Section in Uniform',
      subtitle: 'Nurturing young minds in faith, adab, early literacy, and foundational Arabic recitation.',
    },
    {
      src: '/images/primary-school-bus.jpg',
      title: 'Monitored School Bus Transit Network',
      subtitle: 'Safe, punctual, and air-conditioned city-wide transportation bearing our motto: "No Islam, No Paradise".',
    },
    {
      src: '/images/primary-campus-courtyard.jpg',
      title: 'Omi Eja Campus Courtyard & Primary Classrooms',
      subtitle: 'Spacious, purpose-built educational environment designed for safety and active learning.',
    },
    {
      src: '/images/morning-assembly.jpg',
      title: 'Morning Spiritual Assembly & Uniform Discipline',
      subtitle: 'Instilling adab, punctual attendance, and spiritual reflection at the assembly ground.',
    },
    {
      src: '/images/library-study.jpg',
      title: 'Academic Research & Quiet Study Library',
      subtitle: 'Fostering an inquiring mind with access to rich Western and Islamic scholarly texts.',
    },
    {
      src: '/images/sports-league.jpg',
      title: 'Athletic Competitions & Inter-School Sports League',
      subtitle: 'Building physical endurance, teamwork, resilience, and sportsmanship.',
    },
    {
      src: '/images/campus-annex.jpg',
      title: 'College Main Campus & Secure Annex Facilities',
      subtitle: 'Serene, purpose-built academic environments across Akure city.',
    },
    {
      src: '/images/awards-presentation.png',
      title: 'Ondo Central Senatorial Championship Victory',
      subtitle: 'Clinched 1st Position in June 2025 against well-funded private institutions in the region.',
    },
    {
      src: '/images/exam-hall.jpg',
      title: 'Standard Examination Hall & Zero Malpractice Ethics',
      subtitle: 'Rigorous preparation for WAEC, NECO, BECE, and NBAIS national certifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentPath="/about" />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Established by MSSN Akure Area Council • Formerly Al-Birr Islamic Model College</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Nurturing Intellectual Luminaries, Moral Uprightness &amp; Spiritual Depth
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-normal">
            Operating under our inspiring motto <span className="text-emerald-400 font-extrabold italic">"Knowledge is Light" (العلم نور)</span>, MSSN Islamic Model Schools, Akure is a reputable, government-approved faith-based educational institution dedicated to raising visionary leaders equipped for global academic prominence and enduring Islamic piety.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold">
            <Link
              href="/admissions/apply"
              className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition shadow-lg flex items-center gap-2"
            >
              <span>Enroll for 2026/2027 Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition backdrop-blur-xs"
            >
              Explore Our 3 Campuses
            </Link>
          </div>
        </div>
      </section>

      {/* Main Narrative Section: Origin & Legacy */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              <Compass className="w-4 h-4" />
              <span>Our Story &amp; Heritage</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A Legacy of Uncompromising Standards: From Al-Birr to MSSN Islamic Model Schools
            </h2>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <p>
                <strong>MSSN Islamic Model Schools, Akure</strong> (formerly celebrated across Ondo State and Western Nigeria as <strong>Al-Birr Islamic Model College</strong>) stands today as a pinnacle of faith-guided educational excellence. The institution was birthed from the strategic foresight of the <strong>Muslim Students’ Society of Nigeria (MSSN), Akure Area Council</strong>. The visionary founders recognized an acute dilemma confronting Muslim families: the painful trade-off between world-class Western secular schooling and the preservation of genuine Islamic identity, pristine morality, and Qur’anic fluency.
              </p>
              <p>
                To resolve this paradigm, MSSN Akure Area Council established a specialized educational sanctuary that blends a rigorous, competitive Western curriculum with robust, authentic Islamic training. From its modest beginnings as Al-Birr Islamic Model College, the institution expanded systematically in student population, physical infrastructure, and academic laurels. Today, the rebranded <strong>MSSN Islamic Model Schools</strong> operates three vibrant operational centers across the capital city of Akure, serving learners from infancy through senior secondary matriculation.
              </p>
              <p>
                Our foundational creed is anchored on the noble motto <strong className="text-emerald-800">"Knowledge is Light"</strong>. In an era marked by rapid societal disruption and eroding moral benchmarks, we hold firmly that true enlightenment transcends mere test scores; it demands a soul anchored in piety, intellectual vigor, social responsibility, and unwavering character.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="block text-2xl font-black text-emerald-700">100%</span>
                <span className="text-xs text-slate-600 font-medium">Government Approved &amp; Registered</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="block text-2xl font-black text-emerald-700">3 Centers</span>
                <span className="text-xs text-slate-600 font-medium">Campuses Across Akure City</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="block text-2xl font-black text-emerald-700">1st Place</span>
                <span className="text-xs text-slate-600 font-medium">2025 Ondo Senatorial Champions</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              <img
                src="/images/morning-assembly.jpg"
                alt="Morning Assembly at MSSN Islamic Model Schools Akure"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Assembly Ground
                </span>
                <p className="text-xs text-slate-200 leading-snug">
                  Students arrayed in dignified uniforms, engaged in daily assembly prayers, national anthems, and moral exhortations.
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Vision, Mission & Core Values Banner */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Our Vision, Mission &amp; Three Foundational Pillars
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Every lesson taught, every examination written, and every sermon delivered is governed by an enduring commitment to God-consciousness and worldly competence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Our Vision</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To be the foremost center of educational and spiritual illumination in Nigeria, recognized nationally and internationally for raising a generation of Muslim scholars, ethical scientists, dynamic public leaders, and upright professionals who excel at the highest echelons of modern society while standing as beacons of Islamic righteousness.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Our Mission</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To provide a comprehensive, stimulating learning environment that blends standard Western curricula with classical Arabic, Islamic sciences, and Hifzul Qur’an. We foster intellectual curiosity, analytical problem-solving, moral discipline, and civic responsibility through dedicated educators, modern pedagogical infrastructure, and collaborative parent partnerships.
              </p>
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/40 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">1. Academic Rigor</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rigorous preparation across Science, Technology, Engineering, Arts, and Commercial tracks. Consistent record of distinctions in WAEC, NECO, JAMB/UTME, and BECE examinations.
              </p>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/40 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">2. Moral Uprightness</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nurturing noble manners (Adab), honesty, humility, and zero tolerance for bullying, exam misconduct, or moral delinquency. Every child is guided by devoted mentors.
              </p>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/40 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">3. Spiritual Guidance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daily congregational prayers (Salah), Weekly Halaqat, Friday Jum'ah service, fasting encouragement, and an inspiring environment grounded in the Sunnah of the Prophet (SAW).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Hifzul Qur'an Class Feature */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Star className="w-3.5 h-3.5" />
                <span>Distinctive Institutional Offering</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                The Special Hifzul Qur'an Class: Preserving the Sacred Word
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                A defining hallmark of MSSN Islamic Model Schools, Akure is our specialized <strong>Hifzul Qur'an Department</strong>. Unlike conventional schools where religious studies are an auxiliary afterthought, our institution operates a systematic, structured Qur'an memorization track integrated seamlessly alongside the national academic timetable.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Expert Hafiz Instructors:</strong> Certified reciters with verified Sanad guide students in proper articulation (Makharij) and phonetics (Ahkam At-Tajweed).</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Structured Muraja'ah (Revision Schedule):</strong> Robust daily and weekly retention mechanisms ensure that verses memorized remain crystal clear throughout life.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>National Board for Arabic &amp; Islamic Studies (NBAIS):</strong> Students are formally prepared for NBAIS national certification alongside standard WAEC/NECO credentials.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-slate-950/70 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4 max-w-sm w-full backdrop-blur-xs">
                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">
                  Milestone Achievement
                </p>
                <div className="text-4xl font-black text-white">60 Hizb</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dedicated boarding and day scholars graduate having completed or substantially committed major portions of the Noble Qur'an to memory.
                </p>
                <Link
                  href="/admissions#hifz"
                  className="block w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Learn About the Hifz Curriculum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record of Excellence: June 2025 Senatorial Victory */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 group">
              <img
                src="/images/awards-presentation.png"
                alt="Award Presentation - June 2025 Ondo Central Senatorial District"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider inline-block mb-1">
                  1st Position Champions
                </span>
                <p className="text-xs text-slate-200">
                  School delegates receiving the prestigious championship award at the Ondo Central Senatorial District competition.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Championship Pedigree</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A Proven Record of Excellence in Academic &amp; Religious Arenas
            </h2>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <p>
                Students of <strong>MSSN Islamic Model Schools, Akure</strong> consistently showcase their towering intellectual competence, mental agility, and religious depth in state, zonal, and national arenas.
              </p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-slate-900 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>June 2025: 1st Position in Ondo Central Senatorial District Inter-School Competition</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  In June 2025, the school clinched the <strong>First Position</strong> in the highly contested Ondo Central Senatorial District Inter-School Competition, triumphing over long-established and heavily financed private schools across Akure and neighboring towns. Our students dominated both the STEM quiz bowls and impromptu debate panels.
                </p>
              </div>
              <p>
                Additionally, our students regularly secure top honors in regional and national Quranic recitation, Islamic jurisprudence (Fiqh), and impromptu speaking contests hosted by the <strong>Muslim Students' Society of Nigeria (MSSN) B-Zone</strong> and corporate educational foundations. This track record affirms that combining moral integrity with intellectual rigor produces indomitable young achievers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase Gallery */}
      <section className="bg-slate-100 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Campus Life &amp; Activities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Life at MSSN Islamic Model Schools
            </h2>
            <p className="text-sm text-slate-600">
              Explore snapshots of our vibrant academic community, scientific inquiry, sports tournaments, library hours, and spiritual devotions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photoGallery.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition group flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 City Campuses Overview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Multi-Campus Structure
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Three Strategic Operational Centers Across Akure City
          </h2>
          <p className="text-sm text-slate-600">
            To accommodate our expanding student body and cater conveniently to families across the Ondo State metropolis, MSSN Islamic Model Schools maintains three distinct, fully staffed centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Madinah Quarters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-xl transition flex flex-col justify-between overflow-hidden group">
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src="/images/campus-annex.jpg"
                alt="Madinah Quarters Campus"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-slate-900/90 text-white flex items-center justify-center font-black text-sm backdrop-blur-xs">
                01
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Madinah Quarters Campus</h3>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  College Main Campus &amp; Boarding
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Situated along Ilere/Ijare Road, this serene, expansive campus hosts the Senior Secondary School, boarding residences, the main science laboratories, and the central Hifzul Qur'an academy.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Main College &amp; Hostels</span>
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* High School Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-xl transition flex flex-col justify-between overflow-hidden group">
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src="/images/morning-assembly.jpg"
                alt="High School Area Campus"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-slate-900/90 text-white flex items-center justify-center font-black text-sm backdrop-blur-xs">
                02
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">High School Area Campus</h3>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  Secondary &amp; Administrative Wing
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Located strategically in the heart of the educational zone in Akure, providing seamless daytime access for Junior and Senior secondary day students, central administrative oversight, and exam registration.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Central Urban Access</span>
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Omi Eja Annex */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-xl transition flex flex-col justify-between overflow-hidden group">
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src="/images/primary-campus-courtyard.jpg"
                alt="Omi Eja Annex Primary Center"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-slate-900/90 text-white flex items-center justify-center font-black text-sm backdrop-blur-xs">
                03
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Omi Eja Annex</h3>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  Early Childhood &amp; Primary Wing
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A warm, safe, and nurturing environment specifically configured for Crèche, Pre-Nursery, Nursery, and Basic Primary education with child-friendly playgrounds, audio-visual phonics, and early Arabic foundations.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Infant &amp; Basic School</span>
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-emerald-900">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Give Your Child the Gift of Faith, Character &amp; Intellectual Prominence
          </h2>
          <p className="text-sm sm:text-base text-emerald-200 max-w-2xl mx-auto leading-relaxed">
            Admissions for the 2026/2027 Academic Session are currently open across all three centers in Akure. Experience the MSSN difference.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-bold">
            <Link
              href="/admissions/apply"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg flex items-center gap-2"
            >
              <span>Begin Online Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-800 text-white transition"
            >
              Contact Admissions Office
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
