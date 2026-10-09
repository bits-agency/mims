'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Copy,
  Plus,
  ShieldCheck,
  Tag,
  Edit2,
  Save,
  Trash2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  School,
  Lock,
  ArrowRight
} from 'lucide-react';
import { LevelFeeStructure, BankAccountConfig, FeeLevy } from '@/app/api/bursar/fee-structures/route';

export default function SuperAdminFeeStructuresPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [structures, setStructures] = useState<LevelFeeStructure[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Record<string, BankAccountConfig>>({});
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editLevies, setEditLevies] = useState<FeeLevy[]>([]);
  const [editingBankKey, setEditingBankKey] = useState<string | null>(null);
  const [bankEditForm, setBankEditForm] = useState<BankAccountConfig>({
    sectionName: '',
    applicableWings: [],
    bankName: '',
    accountName: '',
    accountNumber: '',
    status: '',
  });
  const [selectedTerm, setSelectedTerm] = useState<'first' | 'second' | 'third'>('first');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async (termToLoad: string = selectedTerm) => {
    try {
      const [userRes, feeRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/bursar/fee-structures?term=${termToLoad}`),
      ]);

      const userData = await userRes.json();
      if (userData.authenticated && userData.user) {
        setCurrentUser(userData.user);
      }

      const feeData = await feeRes.json();
      if (feeData.success) {
        if (feeData.structures) setStructures(feeData.structures);
        if (feeData.bankAccounts) setBankAccounts(feeData.bankAccounts);
      }
    } catch (err) {
      console.error('Failed to load fee structures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedTerm);
  }, [selectedTerm]);

  const isSuper = !!currentUser?.isSuperAdmin;

  const copyAccount = (key: string, accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const startEditStructure = (structure: LevelFeeStructure) => {
    setEditingLevel(structure.levelId);
    setEditLevies(JSON.parse(JSON.stringify(structure.levies || [])));
  };

  const cancelEditStructure = () => {
    setEditingLevel(null);
    setEditLevies([]);
  };

  const updateLevyField = (index: number, field: keyof FeeLevy, value: any) => {
    setEditLevies((prev) =>
      prev.map((l, idx) => (idx === index ? { ...l, [field]: value } : l))
    );
  };

  const addCustomLevy = () => {
    const newLevy: FeeLevy = {
      id: `levy-${Date.now()}`,
      name: 'New Custom Levy',
      amount: 3000,
      priority: editLevies.length + 1,
      category: 'academic',
    };
    setEditLevies((prev) => [...prev, newLevy]);
  };

  const removeLevy = (index: number) => {
    setEditLevies((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveStructureChanges = async (levelId: string) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const updated = structures.map((s) => {
        if (s.levelId === levelId) {
          const total = editLevies.reduce((sum, l) => sum + Number(l.amount || 0), 0);
          return {
            ...s,
            levies: editLevies,
            totalFee: total,
          };
        }
        return s;
      });

      const res = await fetch('/api/bursar/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: selectedTerm, structures: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setStructures(updated);
        setEditingLevel(null);
        setSaveStatus(`Fee structure for ${selectedTerm === 'first' ? 'First' : selectedTerm === 'second' ? 'Second' : 'Third'} Term saved successfully.`);
      } else {
        setErrorMessage(data.error || 'Failed to update fee structures.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update fee structures.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const startEditBank = (key: string, config: BankAccountConfig) => {
    setEditingBankKey(key);
    setBankEditForm({ ...config });
  };

  const saveBankChanges = async () => {
    if (!editingBankKey) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const updatedAccounts = {
        ...bankAccounts,
        [editingBankKey]: bankEditForm,
      };

      const res = await fetch('/api/bursar/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccounts: updatedAccounts }),
      });
      const data = await res.json();
      if (data.success) {
        setBankAccounts(updatedAccounts);
        setEditingBankKey(null);
        setSaveStatus('Designated bank account details updated and locked successfully.');
      } else {
        setErrorMessage(data.error || 'Failed to update bank details.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update bank details.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const calculatedEditTotal = editLevies.reduce((sum, l) => sum + Number(l.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isSuper) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-sans">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Access Restricted: Super Admin Only</h2>
          </div>
          <p className="text-xs leading-relaxed text-rose-200">
            Internal financial governance requires that only the Governing Board / Super Administrator can modify school fee schedules, levies, or official bank accounts. Regular administrators and bursars have view-only access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Super Admin Exclusive Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Institutional Fee Structures &amp; Designated Bank Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Set and lock official fee tariffs, itemized levies, and separate bank accounts for Primary and Secondary wings.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Anti-Tampering Control Active
        </div>
      </div>

      {/* Security Governance Notice */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-0.5">Strict Financial Governance &amp; Anti-Fraud Protection</p>
          <p className="text-blue-200/90 leading-relaxed">
            Bursars are restricted to recording payments and issuing receipts. Only the Super Administrator can update bank accounts or alter fee tariffs. Any changes made here immediately take effect across all official receipts and student portal billings.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {saveStatus}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Separate Bank Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Official School Collection Accounts (Separate Primary &amp; Secondary)
          </h2>
          <span className="text-[11px] text-slate-400">
            Editable exclusively by Super Admin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(bankAccounts).map(([key, acc]) => {
            const isEditing = editingBankKey === key;
            const isPrimary = key === 'primary';
            return (
              <div
                key={key}
                className="bg-[#111C33] border border-[#1E2E50] rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPrimary
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isPrimary ? 'PRI' : 'SEC'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.sectionName}</h3>
                      <p className="text-[10px] text-slate-400">{acc.status}</p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => startEditBank(key, acc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
                      title="Edit Official Bank Account"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Account
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2 border-t border-[#1E2E50] text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankEditForm.bankName}
                        onChange={(e) => setBankEditForm({ ...bankEditForm, bankName: e.target.value })}
                        className="w-full bg-[#0D1527] border border-[#223356] rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                        placeholder="e.g. Zenith Bank Plc, First Bank, etc."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={bankEditForm.accountName}
                        onChange={(e) => setBankEditForm({ ...bankEditForm, accountName: e.target.value })}
                        className="w-full bg-[#0D1527] border border-[#223356] rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                        placeholder="e.g. MSSN Islamic Model Schools"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={bankEditForm.accountNumber}
                          onChange={(e) => setBankEditForm({ ...bankEditForm, accountNumber: e.target.value })}
                          className="w-full bg-[#0D1527] border border-[#223356] rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                          placeholder="e.g. 1012345678"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Sort Code / Branch (Optional)
                        </label>
                        <input
                          type="text"
                          value={bankEditForm.sortCode || ''}
                          onChange={(e) => setBankEditForm({ ...bankEditForm, sortCode: e.target.value })}
                          className="w-full bg-[#0D1527] border border-[#223356] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                          placeholder="e.g. 301001"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingBankKey(null)}
                        className="px-3 py-1.5 rounded-lg bg-[#15223E] text-slate-300 hover:bg-[#1D2F54] transition font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveBankChanges}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving...' : 'Save & Lock Account'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-[#1E2E50] text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Bank Name</span>
                      <span className="text-white font-semibold">{acc.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Account Name</span>
                      <span className="text-slate-200 font-medium text-right truncate max-w-[200px]">
                        {acc.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 bg-[#0D1527] p-2.5 rounded-xl border border-[#1B2945]">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">
                          Account Number
                        </span>
                        <span className="text-emerald-400 font-mono font-black text-sm tracking-wider">
                          {acc.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => copyAccount(key, acc.accountNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#15223E] hover:bg-[#1E2E50] text-slate-300 hover:text-white font-bold text-[11px] transition"
                      >
                        {copiedKey === key ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Levy Structures Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E2E50]">
          <div>
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Academic Levels, Itemized Levies &amp; Termly Tariffs
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Super Admin Control: Customize distinct fee tariffs for First Term, Second Term, or Promotional Third Term.
            </p>
          </div>

          {/* Interactive Term Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1120] border border-[#1E2E50]">
            <button
              type="button"
              onClick={() => setSelectedTerm('first')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTerm === 'first'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1st Term
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('second')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTerm === 'second'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2nd Term
            </button>
            <button
              type="button"
              onClick={() => setSelectedTerm('third')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedTerm === 'third'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3rd Term
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 bg-[#0E1729] p-3 rounded-xl border border-[#1C2C4E]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Configuring active fees for:{' '}
              <strong className="text-white">
                {selectedTerm === 'first' ? 'First Term (Harmattan Session)' : selectedTerm === 'second' ? 'Second Term (Lent Session)' : 'Third Term (Promotional Session)'}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {structures.length} Level Fee Schedules
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {structures.map((s) => {
            const isEditing = editingLevel === s.levelId;
            return (
              <div
                key={s.levelId}
                className="bg-[#111C33] border border-[#1E2E50] rounded-2xl overflow-hidden shadow-sm transition hover:border-[#2A3E6B]"
              >
                {/* Structure Header */}
                <div className="p-5 bg-[#0D1527] border-b border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          {s.levelName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                          {s.wing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Approved Total Tariff
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        ₦{(isEditing ? calculatedEditTotal : s.totalFee).toLocaleString()}
                      </span>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={() => startEditStructure(s)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Levies
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cancelEditStructure}
                          className="px-3 py-1.5 rounded-xl bg-[#15223E] hover:bg-[#1E2E50] text-slate-300 font-bold text-xs transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveStructureChanges(s.levelId)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {saving ? 'Saving...' : 'Save & Lock Tariff'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Levies Breakdown Table */}
                <div className="p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#1E2E50] text-[10px] uppercase font-bold text-slate-400">
                          <th className="pb-3 pl-1">Priority</th>
                          <th className="pb-3">Levy / Fee Description</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3 text-right">Amount (₦)</th>
                          {isEditing && <th className="pb-3 text-center">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2E50]/60">
                        {(isEditing ? editLevies : s.levies).map((levy, index) => (
                          <tr key={levy.id} className="hover:bg-[#15223E]/50 transition">
                            <td className="py-3 pl-1">
                              <span className="w-5 h-5 rounded-full bg-[#15223E] border border-[#223356] text-[10px] font-mono font-bold flex items-center justify-center text-slate-300">
                                {levy.priority || index + 1}
                              </span>
                            </td>

                            <td className="py-3 font-semibold text-white">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={levy.name}
                                  onChange={(e) => updateLevyField(index, 'name', e.target.value)}
                                  className="w-full bg-[#0D1527] border border-[#223356] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-emerald-500"
                                />
                              ) : (
                                <span>{levy.name}</span>
                              )}
                            </td>

                            <td className="py-3">
                              {isEditing ? (
                                <select
                                  value={levy.category}
                                  onChange={(e) => updateLevyField(index, 'category', e.target.value)}
                                  className="bg-[#0D1527] border border-[#223356] rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                                >
                                  <option value="essential">Essential / Medical</option>
                                  <option value="academic">Academic / Assessment</option>
                                  <option value="facility">Facility / Development</option>
                                  <option value="tuition">Tuition</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  levy.category === 'essential'
                                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                    : levy.category === 'academic'
                                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                                    : levy.category === 'facility'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                }`}>
                                  {levy.category}
                                </span>
                              )}
                            </td>

                            <td className="py-3 text-right font-mono font-bold text-slate-200">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-1 justify-end">
                                  <span className="text-slate-400">₦</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="500"
                                    value={levy.amount}
                                    onChange={(e) => updateLevyField(index, 'amount', Number(e.target.value))}
                                    className="w-28 bg-[#0D1527] border border-[#223356] rounded-lg px-2.5 py-1 text-right text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                                  />
                                </div>
                              ) : (
                                <span>₦{Number(levy.amount || 0).toLocaleString()}</span>
                              )}
                            </td>

                            {isEditing && (
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => removeLevy(index)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Remove Levy"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[#1E2E50] text-xs font-bold text-white bg-[#0D1527]/50">
                          <td colSpan={3} className="py-3 pl-2 text-slate-300 font-bold uppercase text-[10px]">
                            {isEditing ? 'Calculated Grand Total' : 'Session Cumulative Total'}
                          </td>
                          <td className="py-3 text-right font-mono font-black text-emerald-400 text-sm">
                            ₦{(isEditing ? calculatedEditTotal : s.totalFee).toLocaleString()}
                          </td>
                          {isEditing && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {isEditing && (
                    <div className="pt-3 flex items-center justify-between border-t border-[#1E2E50] mt-3">
                      <button
                        onClick={addCustomLevy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs border border-blue-500/30 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Custom Levy Item
                      </button>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        Priority 1 clears first during partial payments.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
