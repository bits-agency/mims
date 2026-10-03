'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Users,
  GraduationCap,
  Laptop,
  Wallet,
  Settings,
  Code2,
  Search,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Lock,
  Check,
  Copy,
  Sparkles,
  ArrowUpRight,
  Hash,
  FileText,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DOC_CATEGORIES, DOC_SECTIONS, DocSection } from './docsData';

export default function DocsPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>('system-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Icon mapping
  const getIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Laptop':
        return <Laptop className={className} />;
      case 'Wallet':
        return <Wallet className={className} />;
      case 'Settings':
        return <Settings className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  // Filter sections by search and audience
  const filteredSections = useMemo(() => {
    return DOC_SECTIONS.filter((sec) => {
      const matchesAudience =
        selectedAudience === 'All' ||
        sec.targetAudience === selectedAudience ||
        sec.targetAudience === 'All';

      if (!searchQuery.trim()) return matchesAudience;

      const q = searchQuery.toLowerCase();
      const inTitle = sec.title.toLowerCase().includes(q);
      const inSummary = sec.summary.toLowerCase().includes(q);
      const inContent = sec.content.toLowerCase().includes(q);

      return matchesAudience && (inTitle || inSummary || inContent);
    });
  }, [searchQuery, selectedAudience]);

  // Active section data
  const activeSection = useMemo(() => {
    const found = DOC_SECTIONS.find((s) => s.id === activeSectionId);
    return found || DOC_SECTIONS[0];
  }, [activeSectionId]);

  // Handle URL hash on mount or hash change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = DOC_SECTIONS.find((s) => s.id === hash);
        if (found) {
          setActiveSectionId(found.id);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash when active section changes
  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    window.location.hash = id;
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find next and prev sections
  const currentIndex = DOC_SECTIONS.findIndex((s) => s.id === activeSection.id);
  const prevSection = currentIndex > 0 ? DOC_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[currentIndex + 1] : null;

  // Copy code helper
  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Audiences list
  const audiences = ['All', 'Visitors', 'Students', 'Teachers', 'Bursary', 'Management', 'Developers'];

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col font-sans">
      {/* 1. Standalone Top Documentation Header */}
      <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Docs Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/docs" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md shadow-emerald-900/30 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                    MIMS Documentation
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                    v2.4.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">
                  MSSN Islamic Model Schools Akure • System Knowledge Base
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, guides, roles, APIs..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>Main Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-900/20 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Strip */}
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-800/60">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, roles, APIs..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Documentation Body with Dual Sidebar Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Left Sidebar (Desktop Fixed & Mobile Drawer) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-[#0B132B] border-r border-slate-800 p-5 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:p-0 lg:bg-transparent lg:border-none lg:w-64 shrink-0
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Mobile Drawer Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-4 mb-4 border-b border-slate-800">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Navigation Menu
            </span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
            {/* Audience Filter Pills */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Filter by Role
              </p>
              <div className="flex flex-wrap gap-1.5">
                {audiences.map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      selectedAudience === aud
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Categorized Navigation Tree */}
            <div className="space-y-6 pt-2">
              {DOC_CATEGORIES.map((category) => {
                const categorySections = filteredSections.filter((s) => s.category === category.id);
                if (categorySections.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {categorySections.length}
                      </span>
                    </h3>

                    <div className="space-y-1">
                      {categorySections.map((sec) => {
                        const isActive = sec.id === activeSection.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => handleSelectSection(sec.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-xs font-bold'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                                {getIcon(sec.iconName, 'w-3.5 h-3.5')}
                              </span>
                              <span className="truncate">{sec.title}</span>
                            </div>
                            {sec.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                                  isActive
                                    ? 'bg-emerald-500/30 text-emerald-200'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Center Content Document */}
        <main className="flex-1 min-w-0 bg-[#0B132B]/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-xl">
          {/* Breadcrumb Header */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-800/80">
            <span className="text-slate-400">Documentation</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-slate-300 capitalize">
              {DOC_CATEGORIES.find((c) => c.id === activeSection.category)?.name || activeSection.category}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-semibold">{activeSection.title}</span>
          </div>

          {/* Section Title & Target Audience Badge */}
          <div className="space-y-3 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
                {getIcon(activeSection.iconName, 'w-3.5 h-3.5')}
                <span>Audience: {activeSection.targetAudience}</span>
              </span>
              {activeSection.badge && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                  {activeSection.badge}
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                Updated: October 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {activeSection.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {activeSection.summary}
            </p>
          </div>

          {/* Render Rich Markdown / Body Content */}
          <article className="prose prose-invert max-w-none space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed">
            {activeSection.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // Check if H3 header
              if (trimmed.startsWith('### ')) {
                const headingText = trimmed.replace('### ', '');
                const anchorId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <h3
                    key={idx}
                    id={anchorId}
                    className="text-lg sm:text-xl font-bold text-white pt-6 pb-2 border-b border-slate-800/80 flex items-center gap-2 group scroll-mt-24"
                  >
                    <a href={`#${anchorId}`} className="text-emerald-400 opacity-60 group-hover:opacity-100">
                      <Hash className="w-4 h-4 inline" />
                    </a>
                    <span>{headingText}</span>
                  </h3>
                );
              }

              // Check if Code block
              if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
                const lines = trimmed.split('\n');
                const lang = lines[0].replace('```', '') || 'code';
                const codeBody = lines.slice(1, -1).join('\n');
                return (
                  <div key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-[#060A14] font-mono text-xs">
                    <div className="bg-slate-800/90 px-4 py-2 flex items-center justify-between border-b border-slate-700/80 text-[11px] text-slate-300">
                      <span className="uppercase font-bold tracking-wider text-emerald-400">{lang}</span>
                      <button
                        onClick={() => handleCopyCode(codeBody, idx)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedCodeIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-emerald-200/90 leading-relaxed">
                      <code>{codeBody}</code>
                    </pre>
                  </div>
                );
              }

              // Check if Markdown Table
              if (trimmed.includes('|') && trimmed.includes('---')) {
                const rows = trimmed.split('\n').filter((r) => r.trim());
                const headerRow = rows[0].split('|').map((c) => c.trim()).filter(Boolean);
                const bodyRows = rows.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));

                return (
                  <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-slate-800 shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                        <tr>
                          {headerRow.map((h, i) => (
                            <th key={i} className="py-3 px-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {bodyRows.map((cols, ri) => (
                          <tr key={ri} className="hover:bg-slate-800/40 transition-colors">
                            {cols.map((col, ci) => (
                              <td key={ci} className="py-3 px-4 font-mono text-[11px] sm:text-xs">
                                {col}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Check if Ordered / Unordered List
              if (trimmed.startsWith('1. ') || trimmed.startsWith('- ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={idx} className="space-y-2 my-3 pl-2">
                    {items.map((it, itemIdx) => {
                      const cleanItem = it.replace(/^[0-9]+\.\s+|^-\s+/, '');
                      return (
                        <li key={itemIdx} className="flex items-start gap-2.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span>{cleanItem}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Standard Paragraph
              return (
                <p key={idx} className="text-slate-300 leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </article>

          {/* 3. Bottom Next / Previous Section Navigator */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevSection ? (
              <button
                onClick={() => handleSelectSection(prevSection.id)}
                className="w-full sm:w-auto p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-slate-900 text-left transition-all group flex items-center gap-3"
              >
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 rotate-180 transition-colors" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Previous Guide
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300">
                    {prevSection.title}
                  </span>
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextSection ? (
              <button
                onClick={() => handleSelectSection(nextSection.id)}
                className="w-full sm:w-auto p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-slate-900 text-right transition-all group flex items-center justify-end gap-3 ml-auto"
              >
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Next Guide
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300">
                    {nextSection.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* Right Sidebar: "On this page" TOC (Desktop Only) */}
        {activeSection.subsections && activeSection.subsections.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-24 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>On This Page</span>
              </h4>
              <nav className="space-y-1.5 border-l border-slate-800 pl-3">
                {activeSection.subsections.map((sub) => (
                  <a
                    key={sub.anchor}
                    href={`#${sub.anchor}`}
                    className="block text-xs text-slate-400 hover:text-emerald-300 py-1 transition-colors leading-tight"
                  >
                    {sub.title}
                  </a>
                ))}
              </nav>

              {/* Documentation Help & Support Card */}
              <div className="mt-8 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Need Assistance?</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Contact the IT Unit or Admissions Desk for portal access credentials or schema inquiries.
                </p>
                <div className="pt-1 text-[11px] text-slate-300 font-semibold">
                  📞 +234 803 358 1947
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Standalone Documentation Footer */}
      <footer className="mt-auto bg-[#050914] border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">
              MSSN Islamic Model Schools Akure — System Knowledge Base
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              School Website
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">
              Portals Login
            </Link>
            <span>•</span>
            <Link href="/admissions" className="hover:text-emerald-400 transition-colors">
              Admissions 2026/2027
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
