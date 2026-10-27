import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">

      {/* Main Footer Links & Directory */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1 & 2: School Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="MSSN Islamic Model Schools Akure Logo"
              className="w-12 h-12 object-contain bg-white rounded-xl p-1"
            />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                MSSN ISLAMIC MODEL SCHOOLS
              </span>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Akure • Knowledge is Light
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pr-6">
            MSSN Islamic Model Schools, Akure (formerly known as <em>Al-Birr Islamic Model College</em>) is a premier government-approved, faith-based educational institution established by the Muslim Students’ Society of Nigeria (MSSN), Akure Area Council. We seamlessly integrate rigorous Western academics with sound Islamic moral upbringing and specialized Qur’anic memorization.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              Motto: "Knowledge is Light" (العلم نور)
            </span>
          </div>
        </div>

        {/* Col 3: Academic Levels */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-emerald-500 pl-2">
            Academic Programs
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/admissions#creche" className="hover:text-emerald-400 transition">
                Crèche &amp; Pre-Nursery
              </Link>
            </li>
            <li>
              <Link href="/admissions#primary" className="hover:text-emerald-400 transition">
                Nursery &amp; Basic Primary
              </Link>
            </li>
            <li>
              <Link href="/admissions#secondary" className="hover:text-emerald-400 transition">
                Junior Secondary (JSS 1 - 3)
              </Link>
            </li>
            <li>
              <Link href="/admissions#secondary" className="hover:text-emerald-400 transition">
                Senior Secondary (SSS 1 - 3)
              </Link>
            </li>
            <li>
              <Link href="/admissions#hifz" className="text-emerald-300 font-bold hover:underline">
                Special Hifzul Qur’an Class
              </Link>
            </li>
            <li>
              <Link href="/admissions#nbais" className="hover:text-emerald-400 transition">
                NBAIS Arabic &amp; Islamic Studies
              </Link>
            </li>
            <li>
              <Link href="/admissions#waec" className="hover:text-emerald-400 transition">
                WAEC &amp; NECO Candidate Preparations
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Institutional Policy & Documentation */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-emerald-500 pl-2">
            Policy &amp; Handbook
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/docs" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                <span>All Institutional Docs</span>
                <span>&rarr;</span>
              </Link>
            </li>
            <li>
              <Link href="/docs#code-of-conduct" className="hover:text-emerald-300 transition">
                Student Code of Conduct
              </Link>
            </li>
            <li>
              <Link href="/docs#grading-system" className="hover:text-emerald-300 transition">
                Grading &amp; Assessment Policy
              </Link>
            </li>
            <li>
              <Link href="/docs#fee-clearance-policy" className="hover:text-emerald-300 transition">
                Fee Tariffs &amp; Bursary Regulations
              </Link>
            </li>
            <li>
              <Link href="/docs#hifz-memorization" className="hover:text-emerald-300 transition">
                Hifzul Qur’an Syllabus Rules
              </Link>
            </li>
            <li>
              <Link href="/docs#accreditation" className="hover:text-emerald-300 transition">
                WAEC, NECO &amp; NBAIS Charters
              </Link>
            </li>
            <li className="pt-2 border-t border-slate-800">
              <Link href="/login" className="hover:text-white transition font-bold text-slate-300">
                Staff &amp; Student Portal &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Operational Campuses */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-emerald-500 pl-2">
            City Campuses
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-white font-semibold">1. Madinah Quarters Campus</p>
              <p className="text-slate-400 text-[11px]">College Main Campus, Boarding &amp; Hifz, Ilere/Ijare Road, Akure</p>
            </div>
            <div>
              <p className="text-white font-semibold">2. High School Area Campus</p>
              <p className="text-slate-400 text-[11px]">Secondary &amp; Administrative Wing, Akure</p>
            </div>
            <div>
              <p className="text-white font-semibold">3. Omi Eja Annex</p>
              <p className="text-slate-400 text-[11px]">Early Childhood, Nursery &amp; Primary School, Akure</p>
            </div>
            <div className="pt-2">
              <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+234 803 358 1947 / +234 814 220 9043</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MSSN Islamic Model Schools, Akure (formerly Al-Birr Islamic Model College). All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Approved by Ondo State Ministry of Education</span>
            <span>•</span>
            <span>Knowledge is Light</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
