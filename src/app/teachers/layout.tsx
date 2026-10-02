'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Award,
  CalendarCheck,
  MessageSquare,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

const teacherNavItems = [
  { label: 'Overview', href: '/teachers/dashboard', icon: LayoutDashboard },
  { label: 'Subject Roster', href: '/teachers/roster', icon: Users },
  { label: 'Grading & Scores', href: '/teachers/grading', icon: Award },
  { label: 'Attendance Register', href: '/teachers/attendance', icon: CalendarCheck },
  { label: 'Staff Circulars', href: '/teachers/messages', icon: MessageSquare },
];

export default function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* 1. Desktop Dark Navy Sidebar (Permanently fixed to viewport) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between hidden lg:flex border-r border-slate-800 z-30 h-screen">
        <div className="flex-1 overflow-y-auto">
          {/* School Brand Header */}
          <Link
            href="/teachers/dashboard"
            className="h-20 px-6 flex items-center gap-3 border-b border-slate-800 hover:bg-slate-800/30 transition shrink-0"
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
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                Faculty Portal
              </p>
            </div>
          </Link>

          {/* Allocation Quick Pill */}
          <div className="mx-4 my-3 px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Physics &amp; Further Maths</span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            {teacherNavItems.map((item) => {
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

        {/* Teacher Profile Card Footer (Pinned firmly at bottom) */}
        <div className="p-4 border-t border-slate-800 bg-[#070D1E] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"
                alt="Teacher avatar"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  Mrs. Zainab Yusuf
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Science Master • SS 2 &amp; 3</p>
              </div>
            </div>
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
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[85vw] bg-[#0B132B] text-slate-300 h-full flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800">
            <div>
              <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800">
                <Link
                  href="/teachers/dashboard"
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
                      MSSN FACULTY
                    </h2>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Teacher Portal
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

              <nav className="p-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-180px)]">
                {teacherNavItems.map((item) => {
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

            <div className="p-4 border-t border-slate-800 bg-[#070D1E]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop"
                    alt="Teacher avatar"
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Mrs. Zainab Yusuf</p>
                    <p className="text-[10px] text-slate-400">Physics Master</p>
                  </div>
                </div>
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
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition border border-slate-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <Link href="/teachers/dashboard" className="lg:hidden flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg p-0.5 border border-slate-200"
              />
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                MIMS Faculty
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">
                2025/2026 Academic Session • First Term
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                Week 8 of 13
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teachers/messages"
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
              title="Staff Circulars"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white" />
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
