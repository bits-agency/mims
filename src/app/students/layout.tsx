'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

const studentNavItems = [
  { label: 'Overview', href: '/students/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', href: '/students/attendance', icon: CalendarCheck },
  { label: 'Results & Grades', href: '/students/results', icon: Award },
  { label: 'Fees & Payments', href: '/students/fees', icon: CreditCard },
  { label: 'Notices & Circulars', href: '/students/messages', icon: MessageSquare },
  { label: 'Biodata & ID Card', href: '/students/profile', icon: User },
];

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student Account',
    className: 'Senior Secondary',
    admissionNo: '',
    initials: 'ST',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const fullName = data.user.fullName || data.user.username || 'Student Account';
          const profile = data.user.profile;
          const className = profile?.classes?.class_name
            ? `${profile.classes.class_name} ${profile.classes.section ? `(${profile.classes.section})` : ''}`
            : 'Enrolled Student';

          const names = fullName.trim().split(' ');
          const initials = names.map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

          setStudentInfo({
            name: fullName,
            className,
            admissionNo: profile?.admission_no || '',
            initials,
          });
        }
      })
      .catch((err) => console.warn('Student auth fetch error:', err));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* 1. Desktop Dark Navy Sidebar (Fixed to viewport) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between hidden lg:flex border-r border-slate-800 z-30 h-screen">
        <div className="flex-1 overflow-y-auto">
          {/* Official Logo & Portal Title */}
          <Link
            href="/students/dashboard"
            className="h-20 px-6 flex items-center gap-3 border-b border-slate-800 hover:bg-slate-800/30 transition"
          >
            <img
              src="/images/logo.png"
              alt="MSSN Islamic Model Schools Akure Logo"
              className="w-11 h-11 object-contain rounded-xl bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <h2 className="font-extrabold text-xs tracking-tight text-white leading-tight uppercase">
                MSSN ISLAMIC MODEL SCHOOLS
              </h2>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                Student Portal
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 font-bold border border-emerald-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Student Profile Card Footer (Pinned to bottom of viewport) */}
        <div className="p-4 border-t border-slate-800 bg-[#070D1E] shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/students/profile" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition">
                {studentInfo.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-emerald-400 transition">
                  {studentInfo.name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{studentInfo.className}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer / Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop blur */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-out Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-[#0B132B] text-slate-300 h-full flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800">
            <div>
              {/* Drawer Header */}
              <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800">
                <Link
                  href="/students/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow shrink-0"
                  />
                  <div>
                    <h2 className="font-extrabold text-xs text-white uppercase leading-tight">
                      MSSN ISLAMIC
                    </h2>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Student Portal
                    </p>
                  </div>
                </Link>

                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="p-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-180px)]">
                {studentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        isActive
                          ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Profile */}
            <div className="p-4 border-t border-slate-800 bg-[#070D1E]">
              <div className="flex items-center justify-between">
                <Link
                  href="/students/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/30">
                    {studentInfo.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-tight truncate">{studentInfo.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{studentInfo.className}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar with Hamburger Button on Mobile */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition border border-slate-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            {/* Mobile Brand Title */}
            <Link href="/students/dashboard" className="lg:hidden flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg p-0.5 border border-slate-200"
              />
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                MIMS Portal
              </span>
            </Link>

            {/* Desktop Academic Context */}
            <div className="hidden lg:block">
              <span className="text-xs font-bold text-slate-500">
                2025/2026 Academic Session • First Term
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, tests, topics..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Notification Bell */}
            <Link
              href="/students/messages"
              title="Notices & Circulars"
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Children Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
