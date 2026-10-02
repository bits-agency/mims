'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    campus: 'Madinah Quarters (Main College & Boarding)',
    level: 'Junior Secondary (JSS 1 - 3)',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const campuses = [
    {
      name: 'Madinah Quarters Campus',
      tagline: 'Main College, Boarding & Hifzul Qur’an Academy',
      address: 'Along Ilere/Ijare Road, Madinah Quarters, Akure, Ondo State, Nigeria',
      lead: 'Ustadh K. A. Adeleke (Campus Director)',
      phone: '+234 803 358 1947 / +234 814 220 9043',
      email: 'madinah@mssnmodelschools.org.ng',
      hours: 'Mon – Fri: 7:30 AM – 4:30 PM (Boarding 24/7)',
      features: [
        'Senior Secondary College (SSS 1 - 3)',
        'Full Boarding Residences for Boys & Girls',
        'Special Hifzul Qur’an Academy & Sanad Training',
        'Physics, Chemistry, Biology & ICT Labs',
        'Standard Sports Pitch & Athletic Track',
      ],
    },
    {
      name: 'High School Area Campus',
      tagline: 'Secondary & Central Administrative Wing',
      address: 'High School Area, Off Oba Adesida / Oyemekun Road Axis, Akure, Ondo State',
      lead: 'Hajia F. M. Bello (Registrar / Dean)',
      phone: '+234 806 712 4490 / +234 802 884 1120',
      email: 'highschool@mssnmodelschools.org.ng',
      hours: 'Mon – Fri: 7:30 AM – 4:00 PM',
      features: [
        'Junior Secondary School (JSS 1 - 3)',
        'Senior Secondary Day Scholars Wing',
        'Central Examination & Admissions Registry',
        'WAEC, NECO, BECE & NBAIS Verification Desk',
        'Conference Hall & Teacher Resource Center',
      ],
    },
    {
      name: 'Omi Eja Annex',
      tagline: 'Early Childhood & Basic Primary Center',
      address: 'Omi Eja Community, Off Ondo Road, Akure, Ondo State, Nigeria',
      lead: 'Mrs. R. O. Sulaiman (Headmistress)',
      phone: '+234 816 559 3012 / +234 805 119 7804',
      email: 'omieja@mssnmodelschools.org.ng',
      hours: 'Mon – Fri: 7:30 AM – 2:30 PM (Crèche open till 5:00 PM)',
      features: [
        'Crèche & Infant Daycare (from 3 months)',
        'Pre-Nursery & Nursery 1 - 3 (Montessori & Phonics)',
        'Basic Primary School (Primary 1 - 6)',
        'Dedicated Audio-Visual & Phonics Studio',
        'Fenced, Secure Playground & Early Years Recitation Hall',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Can parents visit the school to inspect facilities before enrolling?',
      a: 'Yes, parents and guardians are warmly welcomed to visit any of our three operational centers from Monday to Friday between 8:30 AM and 2:30 PM. Our admissions officers will gladly conduct a guided tour of the classrooms, science laboratories, hostels, and prayer halls.',
    },
    {
      q: 'Do you offer school bus transportation across Akure metropolis?',
      a: 'Yes! MSSN Islamic Model Schools operates dedicated, monitored school buses covering major routes in Akure, including Oba-Ile, Ijapo, Alagbaka, FUTA South/North Gate, Ondo Road, Arakale, and Shagari Village.',
    },
    {
      q: 'Is the Special Hifzul Qur’an class mandatory for all students?',
      a: 'All students receive comprehensive Islamic Religious Studies (IRS) and foundational Arabic. However, the intensive Hifzul Qur’an Class (aimed at complete Qur’an memorization) is an elective track chosen by parents who wish their children to complete memorization during their secondary schooling years.',
    },
    {
      q: 'What are the bank payment details for tuition and registration fees?',
      a: 'All official tuition payments must be remitted directly to the school’s designated official accounts (separate accounts for Nursery & Primary and Secondary wings) in favor of "MSSN Islamic Model Schools". Cash payments to individuals are strictly prohibited.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentPath="/contact" />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>3 Operational Centers Across Akure Metropolis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Campuses &amp; Contact Directory
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Have an inquiry about admissions, campus visits, boarding facilities, or transfer requirements? Our administrative and pastoral team across High School Area, Omi Eja Annex, and Madinah Quarters are here to assist you.
          </p>
        </div>
      </section>

      {/* 3 Campuses Full Detail Cards */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Our Centers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Three Dedicated Learning Campuses
          </h2>
          <p className="text-sm text-slate-600">
            Discover the specific programs, leadership, and contact channels for each of our operational centers in Akure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {campuses.map((campus, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 inline-block mb-2">
                    Campus {idx + 1}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">{campus.name}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">{campus.tagline}</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{campus.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{campus.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{campus.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{campus.hours}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Facilities:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {campus.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/admissions/apply"
                  className="w-full block text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-emerald-600 transition"
                >
                  Apply to this Campus
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form & Direct Office Hotline */}
      <section className="bg-slate-100 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Have a Specific Question? Send Our Admissions Registry a Message
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you are an aspiring parent inquiring about middle-term transfer vacancies, boarding requirements, or Qur’an memorization pacing, fill out the form and our admissions desk will reply within 24 hours.
            </p>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Central Admissions Helpdesk</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct phone consultations with the registrar are available Monday through Friday from 8:00 AM to 4:00 PM:
              </p>
              <div className="space-y-1 text-xs font-semibold text-emerald-800">
                <p>Hotline 1: +234 803 358 1947</p>
                <p>Hotline 2: +234 814 220 9043</p>
                <p>WhatsApp: +234 806 712 4490</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Enquiry Received Successfully!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Jazakumullahu Khayran. Our Admissions Registry has received your message. A representative will contact you via phone or email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-black text-slate-900">Admissions Inquiry &amp; Tour Booking</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alh. Ibrahim Oladimeji"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0803 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. parent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus of Interest
                    </label>
                    <select
                      value={formData.campus}
                      onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option>Madinah Quarters (Main College &amp; Boarding)</option>
                      <option>High School Area (Secondary Day Campus)</option>
                      <option>Omi Eja Annex (Early Childhood &amp; Primary)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Prospective Class
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option>Crèche &amp; Pre-Nursery</option>
                      <option>Nursery (1 - 3)</option>
                      <option>Primary (Basic 1 - 6)</option>
                      <option>Junior Secondary (JSS 1 - 3)</option>
                      <option>Senior Secondary (SSS 1 - 3)</option>
                      <option>Special Hifzul Qur’an Class</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Question / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your child, questions regarding entrance exams, hostel arrangement or syllabus..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry to Admissions Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions by Parents
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
