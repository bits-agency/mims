'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck, Phone, MapPin, XCircle } from 'lucide-react';

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath }: NavbarProps) {
  const pathname = usePathname() || currentPath || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmissionsOpen, setIsAdmissionsOpen] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/cms/admissions-gate')
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.config) {
          if (typeof data.config.isOpen === 'boolean') {
            setIsAdmissionsOpen(data.config.isOpen);
          } else if (typeof data.config.is_open === 'boolean') {
            setIsAdmissionsOpen(data.config.is_open);
          }
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Admissions & Programs', href: '/admissions' },
    { label: 'Campuses & Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className={`text-[10px] sm:text-[11px] py-1.5 px-3 sm:px-6 border-b transition-colors ${
        isAdmissionsOpen
          ? 'bg-emerald-950 text-emerald-100 border-emerald-900'
          : 'bg-slate-900 text-slate-200 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            {isAdmissionsOpen ? (
              <>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                  Admissions 2026/2027
                </span>
                <span className="truncate min-w-0 font-medium">
                  <span className="hidden sm:inline">Entrance Exam &amp; Registration Ongoing Across All 3 Akure Campuses</span>
                  <span className="inline sm:hidden">Registration Ongoing Across All 3 Campuses</span>
                </span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <XCircle className="w-2.5 h-2.5" />
                  Closed
                </span>
                <span className="truncate min-w-0 text-slate-300 font-medium">
                  <span className="hidden sm:inline">Online Admissions Closed • Campus Transfer Inquiries: +234 803 358 1947</span>
                  <span className="inline sm:hidden">Online Admissions Closed • Enquiries: +234 803 358 1947</span>
                </span>
              </>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-300 font-medium shrink-0 text-xs">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" /> +234 803 358 1947
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Motto: Knowledge is Light</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src="/images/logo.png"
            alt="MSSN Islamic Model Schools Akure Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-base lg:text-lg tracking-tight text-slate-900 leading-tight block truncate">
              MSSN ISLAMIC MODEL SCHOOLS
            </span>
            <p className="text-[8px] sm:text-[10px] tracking-wider uppercase text-emerald-700 font-extrabold truncate">
              Akure • Formerly Al-Birr Islamic Model College
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 border-b-2 font-medium ${
                  active
                    ? 'text-emerald-600 border-emerald-600 font-bold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition hidden sm:inline-flex"
          >
            Portal Login
          </Link>
          {isAdmissionsOpen ? (
            <Link
              href="/admissions/apply"
              className="text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          ) : (
            <Link
              href="/admissions"
              className="text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition shadow-xs whitespace-nowrap flex items-center gap-1.5 border border-slate-700"
            >
              <span>Admissions Info</span>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-bold py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              School Portal Sign In
            </Link>
            {isAdmissionsOpen ? (
              <Link
                href="/admissions/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
              >
                Apply for Admission 2026/2027
              </Link>
            ) : (
              <Link
                href="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold py-2.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition shadow-xs border border-slate-700"
              >
                Admissions Closed — View Programs
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
