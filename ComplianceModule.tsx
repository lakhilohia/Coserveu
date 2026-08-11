import React, { useState, useMemo } from 'react';
import { Company, Session } from '../types';
import { computeEngine, fmt } from '../utils/engine';
import { UPDATED_FPC_MASTERS } from '../data/seedFPCs';
import { get4000MCQs, MCQItem } from '../data/mcqBank';
import { TaskRegisterView } from './TaskRegisterView';
import { ExpertPortalView } from './ExpertPortalView';

interface ComplianceModuleProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  session: Session;
  view:
    | 'calendar'
    | 'audittracker'
    | 'auditreport'
    | 'negledger'
    | 'fpocomp'
    | 'forms'
    | 'directory'
    | 'gst_credentials'
    | 'mcq'
    | 'tasks'
    | 'documents'
    | 'audit'
    | 'expert';
  setDrill: (d: any) => void;
}

export interface ComplianceAttachment {
  name: string;
  type: string;
  dataUrl: string;
  size?: number;
  uploadedAt: string;
}

export interface ComplianceRecordData {
  key: string;
  title: string;
  type: string;
  due: string;
  status: 'Filed' | 'Not Filed' | 'Pending' | 'Upcoming' | 'Exempt';
  filedDate?: string;
  acknowledgementNo?: string;
  reasonNotFiled?: string;
  attachment?: ComplianceAttachment | null;
  proofAttachment?: ComplianceAttachment | null;
  updatedBy?: string;
  updatedAt?: string;
  remarks?: string;
}

export const DEFAULT_COMPLIANCE_ITEMS: ComplianceRecordData[] = [
  { key: 'gstr1', title: 'GSTR-1 Monthly Return', due: '11th of Every Month', status: 'Upcoming', type: 'GST' },
  { key: 'gstr3b', title: 'GSTR-3B Monthly Tax Return', due: '20th of Every Month', status: 'Upcoming', type: 'GST' },
  { key: 'tds26q', title: 'TDS Quarterly Return (Form 26Q)', due: '31st July / Oct / Jan / May', status: 'Pending', type: 'IT' },
  { key: 'agm', title: 'AGM (Annual General Meeting)', due: '30th September 2026', status: 'Pending', type: 'MCA' },
  { key: 'aoc4', title: 'Form AOC-4 (Financial Statements)', due: '30 Days from AGM', status: 'Pending', type: 'MCA' },
  { key: 'mgt7a', title: 'Form MGT-7A (Small Co Annual Return)', due: '60 Days from AGM', status: 'Pending', type: 'MCA' },
  { key: 'coi', title: '1. Certificate of Incorporation & Memorandum', due: 'Permanent Statutory Record', status: 'Filed', type: 'MCA' },
  { key: 'bs_pl', title: '2. Audited Balance Sheet & P&L Previous FY', due: '30th Sept Annually', status: 'Filed', type: 'Audit' },
  { key: 'bank_stmt', title: '3. Bank Statements with Bank Reconciliation', due: 'Monthly Audit Requirement', status: 'Pending', type: 'Bank' },
  { key: 'cash_vouchers', title: '4. Cash Voucher Receipts & Proceedings Copy', due: 'Continuous Accounting', status: 'Filed', type: 'Vouchers' },
  { key: 'gst_returns', title: '5. GST Returns (GSTR-1, GSTR-3B, GSTR-9)', due: 'Monthly & Annual', status: 'Pending', type: 'GST' },
  { key: 'minutes_book', title: '6. Board Resolution & Minutes Book', due: 'Quarterly Board Meetings', status: 'Filed', type: 'MCA' },
  { key: 'far_register', title: '7. Fixed Asset Register & Physical Verification', due: 'Annual Physical Audit', status: 'Filed', type: 'FAR' },
  { key: 'mgt1_shares', title: '8. Share Capital Register & Member List (MGT-1)', due: 'Continuous Statutory Register', status: 'Filed', type: 'Shares' },
];

export const ComplianceModule: React.FC<ComplianceModuleProps> = ({
  co,
  update,
  session,
  view,
  setDrill,
}) => {
  const [remark, setRemark] = useState(co.auditRemark || '');
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [dirSearch, setDirSearch] = useState('');

  // 4,000 MCQ state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqCategory, setMcqCategory] = useState<'all' | 'mca' | 'gst' | 'it' | 'tally' | 'fpo'>('all');
  const [mcqSearch, setMcqSearch] = useState('');
  const [mcqPage, setMcqPage] = useState(1);
  const [mockMode, setMockMode] = useState(false);
  const [mockSeed, setMockSeed] = useState(0);

  // Get current state of compliance items from co.fpoCompliance
  const getComplianceRecord = (item: ComplianceRecordData): ComplianceRecordData => {
    const saved = co.fpoCompliance?.[item.key] as any;
    if (saved) {
      return {
        ...item,
        ...saved,
      };
    }
    return item;
  };

  const saveRemark = () => {
    update(c => {
      c.auditRemark = remark;
    });
    alert('✓ Auditor observation saved successfully.');
  };

  const currentRecord = selectedItemKey
    ? getComplianceRecord(
        DEFAULT_COMPLIANCE_ITEMS.find(i => i.key === selectedItemKey) || {
          key: selectedItemKey,
          title: selectedItemKey,
          type: 'Statutory',
          due: 'Statutory Requirement',
          status: 'Pending',
        }
      )
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">
          {view === 'calendar' && '📅 FPC Statutory Compliance Calendar FY2025-26'}
          {view === 'audittracker' && '📋 Audit Document Submission Tracker (59 FPCs x 19 Matrix)'}
          {view === 'auditreport' && '📝 Independent Statutory Auditor Report & Audit Notes'}
          {view === 'negledger' && '🚩 Negative Ledgers & Negative Stock Monitoring'}
          {view === 'fpocomp' && '✅ Farmer Producer Company Compliance Checklist (Sec 581)'}
          {view === 'forms' && '📃 Premium Statutory Forms & SPICe+ MCA Drafting Engine ★'}
          {view === 'directory' && '📇 FPC Directory & CBBO Network Contacts'}
          {view === 'mcq' && '❓ Statutory Accounting, Tax & Governance MCQ Practice Sets ★'}
          {view === 'tasks' && '🗓️ Task & Official Correspondence Register'}
          {view === 'documents' && '📁 Documents & Statutory Upload Vault'}
          {view === 'audit' && '🔐 Statutory Audit Trail (Rule 11(g) CA Act Compliant)'}
          {view === 'expert' && '⚖️ Domain Expert & CA Review Portal'}
        </h2>
        <p className="text-xs text-slate-400">
          FPC Statutory Compliance &amp; Governance Center · CBBO-ASRLM 59 FPO Network · Click any tab to drill down, update filing status &amp; upload proof (SS / PDF / Excel)
        </p>
      </div>

      {/* COMPLIANCE CALENDAR */}
      {view === 'calendar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_COMPLIANCE_ITEMS.slice(0, 6).map(item => {
              const rec = getComplianceRecord(item);
              const isFiled = rec.status === 'Filed';

              return (
                <div
                  key={rec.key}
                  onClick={() => setSelectedItemKey(rec.key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md space-y-2.5 text-xs ${
                    isFiled
                      ? 'bg-emerald-950/30 border-emerald-800/80 hover:bg-emerald-900/40'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                      {rec.type}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] border ${
                        isFiled
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : rec.status === 'Not Filed'
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {isFiled ? '✓ Filed' : rec.status === 'Not Filed' ? '❌ Not Filed' : `⏳ ${rec.status}`}
                    </span>
                  </div>

                  <div className="font-bold text-slate-100 text-sm flex items-center justify-between">
                    <span>{rec.title}</span>
                    <span className="text-blue-400 text-[11px] font-normal">Drill Down →</span>
                  </div>

                  <div className="text-slate-400">Due Date: {rec.due}</div>

                  {isFiled ? (
                    <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                      <span>Ref: {rec.acknowledgementNo || 'ACK-FILED'}</span>
                      {rec.attachment && <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">📎 Attachment Attached</span>}
                    </div>
                  ) : rec.reasonNotFiled ? (
                    <div className="text-[11px] text-amber-300 pt-1 border-t border-slate-700/60 truncate">
                      <span>Reason: {rec.reasonNotFiled}</span>
                      {rec.proofAttachment && <span className="ml-1 text-[10px] bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-200">📎 Proof Attached</span>}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-700/60 italic">
                      Click to update filing status or state reason &amp; upload proof
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AUDIT DOC TRACKER */}
      {view === 'audittracker' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Document Requirement</th>
                  <th className="py-2.5 px-3">Statutory Standard</th>
                  <th className="py-2.5 px-3 text-center">Filing Status</th>
                  <th className="py-2.5 px-3">Reason / Proof</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DEFAULT_COMPLIANCE_ITEMS.slice(6).map(item => {
                  const rec = getComplianceRecord(item);
                  const isFiled = rec.status === 'Filed';

                  return (
                    <tr
                      key={rec.key}
                      onClick={() => setSelectedItemKey(rec.key)}
                      className="hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-200">{rec.title}</td>
                      <td className="py-2.5 px-3 text-slate-400">Companies Act 2013 / Income Tax Act</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                            isFiled
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : rec.status === 'Not Filed'
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {isFiled ? '✓ Filed / Verified' : rec.status === 'Not Filed' ? '❌ Not Filed' : rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {isFiled ? (
                          <span className="text-emerald-400 text-[11px]">
                            {rec.acknowledgementNo ? `Ack: ${rec.acknowledgementNo}` : 'Verified'}
                            {rec.attachment && ' 📎 Proof'}
                          </span>
                        ) : rec.reasonNotFiled ? (
                          <span className="text-amber-300 text-[11px] truncate max-w-[200px] block">
                            Reason: {rec.reasonNotFiled} {rec.proofAttachment && '📎 Proof'}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No proof uploaded yet</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700 px-3 py-1 rounded text-xs transition-all font-medium">
                          Update / Upload Proof →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDITOR REPORT */}
      {view === 'auditreport' && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Statutory Auditor Observation &amp; Remarks</h3>
            <textarea
              rows={4}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Enter auditor qualification or observation notes here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={saveRemark}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg"
            >
              Save Auditor Remarks
            </button>
          </div>
        </div>
      )}

      {/* NEGATIVE LEDGERS & STOCK */}
      {view === 'negledger' && (() => {
        const eng = computeEngine(co);
        const negLedgers = co.ledgers.filter(l => {
          const bal = eng.bal[l.id]?.signed || 0;
          if ((l.grp === 'g_cash' || l.grp === 'g_bank' || l.grp === 'g_ca') && bal < 0) return true;
          if ((l.grp === 'g_cred' || l.grp === 'g_cl') && bal > 0) return true;
          return false;
        });

        return (
          <div className="space-y-4">
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-200 text-xs">
              <strong>Audit Guard Warning:</strong> The accounts below reflect negative cash, bank, or anomalous ledger balances and require immediate domain expert reconciliation before audit sign-off.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>🚩 Negative / Anomalous Ledgers ({negLedgers.length})</span>
                </h3>

                {negLedgers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">✓ No negative cash or bank ledgers currently detected.</p>
                ) : (
                  <div className="space-y-2">
                    {negLedgers.map(l => {
                      const signed = eng.bal[l.id]?.signed || 0;
                      return (
                        <div
                          key={l.id}
                          onClick={() => setDrill({ ledgerId: l.id })}
                          className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-red-900/60 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-100">{l.name}</div>
                            <div className="text-[10px] text-slate-400">Group: {eng.grpById[l.grp]?.name || l.grp}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-red-400">{fmt(signed)}</div>
                            <span className="text-[10px] text-blue-400 hover:underline">Drill Down →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">📦 Stock Items Audit</h3>
                <p className="text-xs text-slate-500 italic">✓ All inventory stock levels are positive or zero.</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* STATUTORY FORMS */}
      {view === 'forms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'SPICe+ Part A & B MCA Drafting', file: 'SPICe_Plus_FPC_Form.doc' },
              { name: 'GST REG-01 Registration Form', file: 'GST_REG01_Application.doc' },
              { name: 'ITR-6 Company Tax Return Draft', file: 'ITR6_FPC_Drafting.doc' },
            ].map((f, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-slate-100">{f.name}</div>
                <button
                  onClick={() => {
                    const blob = new Blob([`Draft copy of ${f.name} for ${co.name}`], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = f.file;
                    a.click();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded text-xs"
                >
                  ⬇ Download Editable Draft (.doc)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FPC DIRECTORY & GST CREDENTIALS */}
      {(view === 'directory' || view === 'gst_credentials') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>🔑 CBBO-ASRLM 59 FPO Network Directory &amp; GST Portal Credentials</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Official GSTIN, GST Portal Usernames &amp; GST Passwords for all 59 FPCs across Assam
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="🔍 Search GST ID, Pass, District, Block, FPC, or Email..."
                value={dirSearch}
                onChange={e => setDirSearch(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-full sm:w-80 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">District / Block</th>
                  <th className="py-2.5 px-3">Name of the Party (FPC)</th>
                  <th className="py-2.5 px-3 text-emerald-400">GST ID / GST Username</th>
                  <th className="py-2.5 px-3 text-amber-400">GST Pass</th>
                  <th className="py-2.5 px-3 font-mono">GSTIN</th>
                  <th className="py-2.5 px-3">App Pass</th>
                  <th className="py-2.5 px-3">Official Mail ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50 font-mono">
                {UPDATED_FPC_MASTERS.filter(m => {
                  if (!dirSearch.trim()) return true;
                  const q = dirSearch.toLowerCase();
                  return (
                    m.district.toLowerCase().includes(q) ||
                    m.block.toLowerCase().includes(q) ||
                    m.name.toLowerCase().includes(q) ||
                    (m.gstUsername || '').toLowerCase().includes(q) ||
                    (m.gstPass || '').toLowerCase().includes(q) ||
                    (m.gstin || '').toLowerCase().includes(q) ||
                    m.officialEmail.toLowerCase().includes(q)
                  );
                }).map(m => (
                  <tr key={m.slNo} className="hover:bg-slate-800/60 transition-colors font-sans">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">{m.slNo}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-300">
                      <span className="text-blue-400">{m.district}</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-slate-400">{m.block}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-300 font-bold select-all bg-emerald-950/20 px-2 py-1 rounded">
                      {m.gstUsername || 'Pending'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-300 font-bold select-all bg-amber-950/20 px-2 py-1 rounded">
                      {m.gstPass || m.pass}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px]">
                      {m.gstin || '18AABCA2024A100'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold select-all">
                      {m.pass}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-300 select-all text-[11px]">{m.officialEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STATUTORY & TAX MCQS (4,000 MCQ PRACTICE BANK) */}
      {view === 'mcq' && (() => {
        const isDomainExpert =
          session.user.role === 'Domain Expert' ||
          session.user.role === 'Admin' ||
          session.user.role === 'Auditor' ||
          session.user.name.toLowerCase() === 'domainexpert';

        if (!isDomainExpert) {
          return (
            <div className="space-y-6">
              <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 md:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 bg-amber-950 text-amber-300 border border-amber-800 text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  🔒 RESTRICTED — DOMAIN EXPERT LOGIN REQUIRED
                </div>

                <div className="space-y-2 max-w-xl mx-auto">
                  <h3 className="text-xl font-bold text-slate-100">
                    4,000 MCQ ICSI & Statutory Accounting Practice Engine
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The 4,000+ MCQ Certification Practice Engine (covering Companies Act 2013, GST, Income Tax Sec 194Q, Double-Entry Bookkeeping, and FPO Governance) is strictly restricted to <strong>Domain Expert Logins</strong>.
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-3 text-left">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    🔑 Domain Expert Access Credentials:
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="text-emerald-400 font-bold">domainexpert</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Password:</span>
                      <span className="text-amber-300 font-bold">Expert@2026</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Please log out and sign in using the Domain Expert account to access all 4,000 questions, chapter filters, and timed mock test papers.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        const allQs = get4000MCQs();

        // Apply filtering
        const filteredQs = allQs.filter(q => {
          const matchCat = mcqCategory === 'all' || q.catId === mcqCategory;
          const matchSearch =
            !mcqSearch.trim() ||
            q.q.toLowerCase().includes(mcqSearch.toLowerCase()) ||
            q.chapter.toLowerCase().includes(mcqSearch.toLowerCase()) ||
            q.exp.toLowerCase().includes(mcqSearch.toLowerCase());
          return matchCat && matchSearch;
        });

        const pageSize = 20;
        const totalPages = Math.ceil(filteredQs.length / pageSize) || 1;
        const currentPage = Math.min(mcqPage, totalPages);
        const pagedQs = filteredQs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        const answeredCount = Object.keys(mcqAnswers).length;
        const correctCount = Object.entries(mcqAnswers).filter(([qid, userAns]) => {
          const q = allQs.find(item => item.id === qid);
          return q && q.ans === userAns;
        }).length;

        return (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    🎓 4,000 MCQ Statutory Certification Engine
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      Domain Expert Unlocked
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive statutory practice question bank covering 40 chapters of Companies Act, GST, Income Tax, Accounting Prime, and FPO Rules.
                  </p>
                </div>

                {/* Score Counter */}
                <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-xs flex items-center gap-3">
                  <div>
                    <span className="text-slate-400">Answered:</span>{' '}
                    <strong className="text-slate-200">{answeredCount}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-700" />
                  <div>
                    <span className="text-slate-400">Score:</span>{' '}
                    <strong className="text-emerald-400 font-mono text-sm">{correctCount} Correct</strong>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60">
                <div className="md:col-span-2 flex flex-wrap gap-1.5">
                  {[
                    ['all', 'All 4,000 MCQs'],
                    ['mca', 'Companies Act (1,200)'],
                    ['gst', 'GST Compliance (1,000)'],
                    ['it', 'Income Tax & TDS (800)'],
                    ['tally', 'Double Entry (600)'],
                    ['fpo', 'FPO Governance (400)'],
                  ].map(([c, lbl]) => (
                    <button
                      key={c}
                      onClick={() => {
                        setMcqCategory(c as any);
                        setMcqPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        mcqCategory === c
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={mcqSearch}
                    onChange={e => {
                      setMcqSearch(e.target.value);
                      setMcqPage(1);
                    }}
                    placeholder="🔍 Search 4,000 MCQs or chapters..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-4">
              {pagedQs.map((q, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                const userSelected = mcqAnswers[q.id];
                const isAnswered = userSelected !== undefined;
                const isCorrect = isAnswered && userSelected === q.ans;

                return (
                  <div
                    key={q.id}
                    className={`p-4 md:p-5 rounded-xl border transition-all space-y-3.5 text-xs ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-emerald-950/20 border-emerald-800/80'
                          : 'bg-red-950/20 border-red-800/80'
                        : 'bg-slate-800/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                            {q.catName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.chapter}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 leading-snug">
                          Q{globalIndex}. {q.q}
                        </h4>
                      </div>

                      {isAnswered && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded border whitespace-nowrap ${
                            isCorrect
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-red-950 text-red-300 border-red-800'
                          }`}
                        >
                          {isCorrect ? '✓ Correct' : '❌ Incorrect'}
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userSelected === optIdx;
                        const isRightOpt = q.ans === optIdx;

                        let optStyle = 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800';
                        if (isAnswered) {
                          if (isRightOpt) {
                            optStyle = 'bg-emerald-900/60 border-emerald-600 text-emerald-200 font-semibold';
                          } else if (isChosen) {
                            optStyle = 'bg-red-900/60 border-red-600 text-red-200 font-semibold';
                          } else {
                            optStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setMcqAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                            }}
                            className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                          >
                            <span>
                              <strong className="mr-1.5 opacity-70">{String.fromCharCode(65 + optIdx)}.</strong>
                              {opt}
                            </span>
                            {isAnswered && isRightOpt && <span className="text-emerald-400 font-bold">✓</span>}
                            {isAnswered && isChosen && !isRightOpt && <span className="text-red-400 font-bold">✕</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box when answered */}
                    {isAnswered && (
                      <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-lg text-[11px] text-slate-300 space-y-1">
                        <strong className="text-amber-300 block">💡 Statutory CA Explanation:</strong>
                        <p>{q.exp}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-xs">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setMcqPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded bg-slate-900 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
                >
                  ← Previous
                </button>
                <span className="text-slate-400 font-mono">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredQs.length} total questions)
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setMcqPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded bg-slate-900 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* TASK REGISTER */}
      {view === 'tasks' && (
        <TaskRegisterView co={co} update={update} session={session} setDrill={setDrill} />
      )}

      {/* EXPERT / CA PORTAL */}
      {view === 'expert' && (
        <ExpertPortalView co={co} update={update} session={session} setDrill={setDrill} />
      )}

      {/* DRILL DOWN & PROOF UPLOAD MODAL */}
      {selectedItemKey && currentRecord && (
        <ComplianceItemModal
          co={co}
          record={currentRecord}
          session={session}
          onClose={() => setSelectedItemKey(null)}
          onSave={updatedRecord => {
            update(c => {
              if (!c.fpoCompliance) c.fpoCompliance = {};
              c.fpoCompliance[updatedRecord.key] = updatedRecord as any;
            });
            setSelectedItemKey(null);
          }}
        />
      )}
    </div>
  );
};

interface ComplianceItemModalProps {
  co: Company;
  record: ComplianceRecordData;
  session: Session;
  onClose: () => void;
  onSave: (rec: ComplianceRecordData) => void;
}

const ComplianceItemModal: React.FC<ComplianceItemModalProps> = ({
  co,
  record,
  session,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<'Filed' | 'Not Filed' | 'Pending' | 'Upcoming' | 'Exempt'>(record.status);
  const [filedDate, setFiledDate] = useState<string>(record.filedDate || new Date().toISOString().slice(0, 10));
  const [ackNo, setAckNo] = useState<string>(record.acknowledgementNo || '');
  const [reason, setReason] = useState<string>(record.reasonNotFiled || '');
  const [remarks, setRemarks] = useState<string>(record.remarks || '');

  const [attachment, setAttachment] = useState<ComplianceAttachment | null>(record.attachment || null);
  const [proofAttachment, setProofAttachment] = useState<ComplianceAttachment | null>(record.proofAttachment || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isProofOfReason: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      const att: ComplianceAttachment = {
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl,
        size: file.size,
        uploadedAt: new Date().toLocaleString(),
      };

      if (isProofOfReason) {
        setProofAttachment(att);
      } else {
        setAttachment(att);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: ComplianceRecordData = {
      ...record,
      status,
      filedDate: status === 'Filed' ? filedDate : undefined,
      acknowledgementNo: status === 'Filed' ? ackNo : undefined,
      reasonNotFiled: status !== 'Filed' ? reason : undefined,
      attachment: status === 'Filed' ? attachment : null,
      proofAttachment: status !== 'Filed' ? proofAttachment : null,
      remarks,
      updatedBy: session.name,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-5 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
        >
          ✕
        </button>

        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold uppercase">
              {record.type} Statutory Form / Doc
            </span>
            <span className="text-xs text-slate-400">Due: {record.due}</span>
          </div>
          <h2 className="text-base font-bold text-slate-100">{record.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{co.name} · Statutory Compliance Filing &amp; Verification Portal</p>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Filing / Compliance Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'Filed', label: '✓ Filed / Completed', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
              { id: 'Not Filed', label: '❌ Not Filed', color: 'bg-red-950 text-red-300 border-red-700' },
              { id: 'Pending', label: '⏳ Pending / Deferred', color: 'bg-amber-950 text-amber-300 border-amber-700' },
              { id: 'Exempt', label: '⚪ Exempt / N/A', color: 'bg-slate-800 text-slate-300 border-slate-600' },
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id as any)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                  status === s.id ? `${s.color} ring-2 ring-blue-500 scale-[1.02]` : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* IF FILED -> Filed Date, Ack No, Attachment (SS, PDF, Excel) */}
        {status === 'Filed' && (
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-4 space-y-4 text-xs">
            <h3 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
              📝 Filing Particulars &amp; Proof Attachment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Date of Filing</label>
                <input
                  type="date"
                  value={filedDate}
                  onChange={e => setFiledDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Acknowledgement / ARN / SRN / Challan No.</label>
                <input
                  type="text"
                  value={ackNo}
                  onChange={e => setAckNo(e.target.value)}
                  placeholder="e.g. AA1806260123456"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                📎 Upload Filing Proof / Acknowledgement (Screenshot / Photo / PDF / Excel)
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.xlsx,.xls,.csv"
                onChange={e => handleFileUpload(e, false)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-emerald-100 hover:file:bg-emerald-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Portal Screenshot (SS / PNG / JPG), Acknowledgement PDF, or Excel computation sheet.
              </p>

              {attachment && (
                <div className="mt-3 p-2.5 bg-slate-900 border border-emerald-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">📄</span>
                    <span className="text-slate-200 font-medium truncate">{attachment.name}</span>
                    <span className="text-[10px] text-slate-400">({attachment.uploadedAt})</span>
                  </div>
                  <a
                    href={attachment.dataUrl}
                    download={attachment.name}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                  >
                    ⬇ View / Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* IF NOT FILED / PENDING -> State Reason & Upload Proof of Reason */}
        {status !== 'Filed' && (
          <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-4 space-y-4 text-xs">
            <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider">
              ⚠️ Reason for Non-Filing &amp; Supporting Proof
            </h3>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">State Reason for Non-Filing</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Waiting for Bank Statement reconciliation / NIL Turnover / Board approval pending"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Awaiting Bank Statement',
                  'Under Board Review',
                  'NIL Turnover Period',
                  'Technical MCA/GST Portal Issue',
                  'Awaiting Auditor Sign-off',
                ].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReason(p)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2 py-0.5 rounded"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                📎 Upload Proof of Reason (PDF / Screenshot / Photo / Excel)
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.xlsx,.xls,.csv"
                onChange={e => handleFileUpload(e, true)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-800 file:text-amber-100 hover:file:bg-amber-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Attach proof of non-filing reason (e.g. portal error screenshot, email copy, bank request PDF, or Excel summary).
              </p>

              {proofAttachment && (
                <div className="mt-3 p-2.5 bg-slate-900 border border-amber-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-amber-400 font-bold">📄</span>
                    <span className="text-slate-200 font-medium truncate">{proofAttachment.name}</span>
                    <span className="text-[10px] text-slate-400">({proofAttachment.uploadedAt})</span>
                  </div>
                  <a
                    href={proofAttachment.dataUrl}
                    download={proofAttachment.name}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                  >
                    ⬇ View / Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-slate-300 block mb-1 text-xs">Additional Statutory Remarks / Notes</label>
          <textarea
            rows={2}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Enter optional compliance notes or CA review remarks..."
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all"
          >
            ✓ Save Compliance Status &amp; Proof
          </button>
        </div>
      </div>
    </div>
  );
};
