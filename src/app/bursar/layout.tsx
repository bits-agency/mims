'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  LayoutDashboard,
  Receipt,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  LogOut,
  Bell,
  Menu,
  X,
  TrendingUp,
  ShieldCheck,
  Building
} from 'lucide-react';

const bursarNavItems = [
  { label: 'Financial Overview', href: '/bursar/dashboard', icon: LayoutDashboard },
  { label: 'Record Payment & Receipt', href: '/bursar/payments', icon: Receipt },
  { label: 'Student Fee Ledger', href: '/bursar/students', icon: Users },
  { label: 'Debtors & Defaulters', href: '/bursar/defaulters', icon: AlertTriangle },
  { label: 'Fee Structures & Levies', href: '/bursar/fee-structures', icon: FileSpreadsheet },
];

export default function BursarPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const displayName = currentUser?.fullName || currentUser?.username || 'School Bursar';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'BS';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-[#090E1A] text-slate-100 flex font-sans overflow-hidden">
      {/* 1. Desktop Dark Navy Sidebar (Fixed to viewport) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0D1527] text-slate-300 flex flex-col justify-between hidden lg:flex border-r border-[#1B2945] z-30 h-screen">
        <div className="flex-1 overflow-y-auto">
          {/* Official Brand Header */}
          <Link
            href="/bursar/dashboard"
            className="h-20 px-6 flex items-center gap-3 border-b border-[#1B2945] hover:bg-[#15223E] transition shrink-0"
          >
            <img
              src="/images/logo.png"
              alt="MSSN Islamic Model Schools Akure Logo"
              className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <h2 className="font-extrabold text-xs tracking-tight text-white leading-tight uppercase">
                MSSN ISLAMIC MODEL
              </h2>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                Bursary &amp; Accounts
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {bursarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bursar Profile Card Footer (Pinned to bottom) */}
        <div className="p-4 border-t border-[#1B2945] bg-[#0A101D] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                {initials}
              </div>
              <div className="truncate max-w-[120px]">
                <p className="text-xs font-bold text-white leading-tight truncate">{displayName}</p>
                <p className="text-[10px] text-emerald-400 truncate">Chief Bursar</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
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
                  href="/bursar/dashboard"
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
                      MIMS BURSARY
                    </h2>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Accounts Desk
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

              <nav className="p-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-180px)]">
                {bursarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-[#15223E]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-[#1B2945] bg-[#0A101D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                  <div className="truncate max-w-[120px]">
                    <p className="text-xs font-bold text-white leading-tight truncate">{displayName}</p>
                    <p className="text-[10px] text-emerald-400 truncate">Chief Bursar</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 h-16 sm:h-20 bg-[#0D1527] border-b border-[#1B2945] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-[#15223E] transition border border-[#1B2945]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>

            <Link href="/bursar/dashboard" className="lg:hidden flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg p-0.5 bg-white"
              />
              <span className="font-extrabold text-xs text-white tracking-tight">
                MIMS Bursary
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                Official School Bursary Console
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                Official Accounts Sync
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bursar/payments"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition border border-emerald-400/20"
            >
              <Receipt className="w-4 h-4" /> Record New Payment
            </Link>

            <button
              className="p-2.5 rounded-xl bg-[#111C33] border border-[#1E2E50] text-slate-400 hover:text-white transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
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
