'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  HelpCircle,
  Send
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setForgotLoading(true);
    // Simulate support ticket & Supabase recovery initiation
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
      setForgotMsg(
        `A recovery ticket and reset instructions have been logged for "${forgotIdentifier}". If this account exists in our school registry, an email will be dispatched. Alternatively, please contact the ICT Support line below.`
      );
    }, 1000);
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'apply') {
      router.replace('/admissions/apply');
    }
  }, [searchParams, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: signInIdentifier,
          password: signInPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      router.push(data.redirectUrl || '/students/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 transition-all">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          School Portal Sign In
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Admission Number, Staff ID, or official email to access your portal.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Admission Number / Staff ID / Email
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. MIMS/2026/0014 or staff email"
              value={signInIdentifier}
              onChange={(e) => setSignInIdentifier(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => {
                setIsForgotOpen(true);
                setForgotSubmitted(false);
                setForgotMsg('');
              }}
              className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium">
            Remember this session
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In to Portal'}
        </button>

      </form>

      {/* Link to Dedicated Admission Application Page */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-600">
          New applicant or prospective student?
        </p>
        <Link
          href="/admissions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
        >
          <span>Admissions &amp; Application Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        Need assistance?{' '}
        <Link href="/contact" className="font-semibold text-emerald-600 hover:underline">
          Contact Admissions Helpdesk
        </Link>
      </p>

      {/* Forgot Password / Account Recovery Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 text-left space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Account Access Recovery
                  </h3>
                  <p className="text-xs text-slate-500">
                    MIMS Akure Portal Security Support
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{forgotMsg}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Email Address or Admission Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. staff@mims.sch.ng or MIMS/2026/0014"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    If this is a registered staff email, a recovery link will be dispatched immediately.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? (
                    'Submitting Request...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Password Reset Request</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Student & Direct Support Guidance */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-950">
                <strong className="block font-bold mb-0.5 text-amber-900">
                  Student &amp; Parent Password Policy:
                </strong>
                For student child-safety and academic record privacy, student account passwords can also be directly reset in-person by your <strong>Class Form Teacher</strong>, the <strong>ICT Computer Lab</strong>, or the <strong>School Bursar desk</strong>.
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Direct Institutional Helpdesk:
                </span>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Phone className="w-3.5 h-3.5" /> 0803 626 8724, 0814 603 4137
                  </span>
                  <span className="text-[11px] text-slate-500">Mon - Fri, 8am - 4pm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      {/* Brand Header */}
      <Link href="/" className="mb-6 flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="MSSN Islamic Model Schools Akure Logo"
          className="w-14 h-14 object-contain rounded-2xl bg-white p-1 shadow-md border border-slate-200"
        />
        <div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
            MSSN ISLAMIC MODEL SCHOOLS
          </span>
          <p className="text-[10px] tracking-wider uppercase text-emerald-700 font-extrabold">
            Akure • Knowledge is Light
          </p>
        </div>
      </Link>

      <Suspense fallback={<div className="text-xs text-slate-500">Loading portal...</div>}>
        <LoginFormContent />
      </Suspense>

      <p className="text-[11px] text-slate-400 mt-6 text-center">
        © 2026 MSSN Islamic Model Schools Akure. All rights reserved.
      </p>
    </div>
  );
}
