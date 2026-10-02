'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Settings,
  ShieldCheck,
  UserPlus,
  Briefcase,
  Sliders,
  Globe,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    email: string;
    role: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const displayName = currentUser?.fullName || currentUser?.username || 'Super Administrator';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navOperations = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Classes & Arms', href: '/admin/classes', icon: BookOpen },
    { label: 'Staff & Roles', href: '/admin/staff', icon: Briefcase },
    { label: 'Sessions & Terms', href: '/admin/sessions', icon: Calendar },
    { label: 'Admissions Desk', href: '/admin/admissions', icon: UserPlus },
    { label: 'Student Registry', href: '/admin/students', icon: Users },
  ];

  const navCMS = [
    { label: 'Contact & Site Settings', href: '/admin/cms/settings', icon: Sliders },
    { label: 'Admissions Gate Toggle', href: '/admin/cms/admissions-gate', icon: Globe },
    { label: 'Achievements & Honors', href: '/admin/cms/achievements', icon: Award },
    { label: 'Media & Photo Gallery', href: '/admin/cms/media', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-[#090E1A] text-slate-100 flex font-sans">
      {/* 1. Desktop Dark Navy Sidebar (Fixed to viewport) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0D1527] text-slate-300 flex flex-col justify-between hidden lg:flex border-r border-[#1B2945] z-30 h-screen">
        <div className="flex-1 overflow-y-auto">
          {/* Logo & Portal Brand */}
          <Link
            href="/admin/dashboard"
            className="h-20 px-6 flex items-center gap-3 border-b border-[#1B2945] hover:bg-[#15223E] transition shrink-0"
          >
            <img
              src="/images/logo.png"
              alt="MSSN Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <h2 className="font-extrabold text-xs tracking-tight text-white leading-tight uppercase">
                MSSN ISLAMIC MODEL
              </h2>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                Super Admin Console
              </p>
            </div>
          </Link>

          {/* Navigation Wings */}
          <nav className="p-4 space-y-6 text-xs font-semibold">
            {/* Wing 1: School Operations */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                School Operations
              </span>
              {navOperations.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Wing 2: Website CMS & Public Controls */}
            <div className="space-y-1 pt-4 border-t border-[#1B2945]">
              <div className="px-3 flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Website CMS
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  LIVE
                </span>
              </div>
              {navCMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Super Admin User Profile Footer */}
        <div className="p-4 border-t border-[#1B2945] bg-[#0A101F] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow">
                {initials}
              </div>
              <div className="truncate max-w-[120px]">
                <p className="text-xs font-bold text-white leading-tight truncate">{displayName}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Super Administrator</p>
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

      {/* 2. Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[85vw] bg-[#0D1527] text-slate-300 h-full flex flex-col justify-between shadow-2xl z-10 border-r border-[#1B2945]">
            <div>
              <div className="h-20 px-5 flex items-center justify-between border-b border-[#1B2945]">
                <Link
                  href="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="w-9 h-9 object-contain rounded-xl bg-white p-0.5 shadow shrink-0"
                  />
                  <div>
                    <h2 className="font-extrabold text-xs text-white uppercase leading-tight">
                      MIMS ADMIN
                    </h2>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Executive Console
                    </p>
                  </div>
                </Link>

                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#15223E] transition"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-4 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-180px)]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                    Operations
                  </span>
                  <div className="space-y-1">
                    {navOperations.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                            isActive
                              ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1B2945]">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-2">
                    Website CMS
                  </span>
                  <div className="space-y-1">
                    {navCMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>

            <div className="p-4 border-t border-[#1B2945] bg-[#0A101F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="truncate max-w-[130px]">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-emerald-400">Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 transition"
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
        {/* Top Header Bar */}
        <header className="h-16 sm:h-20 bg-[#0D1527] border-b border-[#1B2945] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-[#15223E] transition border border-[#223356]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-200" />
            </button>

            <Link href="/admin/dashboard" className="lg:hidden flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg p-0.5 border border-[#223356]"
              />
              <span className="font-extrabold text-sm text-white tracking-tight">
                MIMS Console
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="font-extrabold text-white">Supervisory Mode</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Full Authorization
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15223E] hover:bg-[#1C2C4E] border border-[#223356] text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              className="relative p-2.5 rounded-xl bg-[#15223E] border border-[#223356] text-slate-300 hover:text-white transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-[#0D1527]" />
            </button>
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
