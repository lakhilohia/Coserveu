import React, { useState } from 'react';
import { Company, Session, Observation, FileAttachment } from '../types';

interface ExpertPortalViewProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  session: Session;
  setDrill: (d: any) => void;
}

const DEFAULT_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-1',
    title: 'Anomalous Cash Withdrawal Without Vendor Sub-Vouchers',
    cat: 'Malpractice Alert',
    severity: 'Critical',
    note: 'A cash withdrawal of ₹48,000 on 15th July was recorded under miscellaneous expenses without supporting vendor receipts or sub-vouchers.',
    actionRequired: 'Produce physical vendor cash receipts signed by recipient or redeposit unaccounted cash back to bank account.',
    deadline: '2026-08-08',
    by: 'CA Abhishek Agarwal (Partner)',
    role: 'CA',
    status: 'Open',
    ts: new Date(Date.now() - 86400000 * 3).toISOString(),
    attachment: {
      name: 'Cash_Withdrawal_Discrepancy_Audit_Proof.pdf',
      type: 'application/pdf',
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      size: 452000,
      uploadedAt: '2026-07-28 11:30 AM',
    },
  },
  {
    id: 'obs-2',
    title: 'GSTR-3B vs Sales Register Tax Liability Variance',
    cat: 'Irregularity & Accounting Variance',
    severity: 'High',
    note: 'Output GST liability in GSTR-3B return is lower by ₹12,400 compared to total taxable sales recorded in the Sales Register for Q1.',
    actionRequired: 'Reconcile B2B tax invoices with GST Portal GSTR-2B/3B and file DRC-03 tax difference ledger voucher.',
    deadline: '2026-08-10',
    by: 'Domain Expert (CBBO-ASRLM)',
    role: 'Domain Expert',
    status: 'Under Review',
    ts: new Date(Date.now() - 86400000 * 5).toISOString(),
    attachment: {
      name: 'GSTR3B_Sales_Reconciliation_Variance.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dataUrl: 'data:application/vnd.ms-excel;base64,UEsDBBQAAAAIA',
      size: 185000,
      uploadedAt: '2026-07-26 04:15 PM',
    },
  },
  {
    id: 'obs-3',
    title: 'Missing Board Resolution Copy for Asset Purchase Exceeding ₹50,000',
    cat: 'Compliance Violation',
    severity: 'Medium',
    note: 'Fixed Asset Purchase voucher #FAR-2025-004 (Processing Unit Machinery) lacks signed Board Resolution copy as per Companies Act Sec 179.',
    actionRequired: 'Attach signed PDF proceedings copy of Board Resolution approving capital expenditure.',
    deadline: '2026-08-12',
    by: 'CA Abhishek Agarwal',
    role: 'CA',
    status: 'Resolved',
    ts: new Date(Date.now() - 86400000 * 8).toISOString(),
    reply: 'Board resolution copy signed by Directors Sulekha Shikary & Dawny Tudu Rawani has been attached.',
    replyBy: 'Accountant (Sumit Das)',
    replyTs: new Date(Date.now() - 86400000 * 2).toISOString(),
    replyAttachment: {
      name: 'Signed_Board_Resolution_Far_Procurement.pdf',
      type: 'application/pdf',
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
      size: 320000,
      uploadedAt: '2026-07-29 02:40 PM',
    },
  },
];

export const ExpertPortalView: React.FC<ExpertPortalViewProps> = ({
  co,
  update,
  session,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeObsModal, setActiveObsModal] = useState<Observation | null>(null);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Observation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<'Malpractice Alert' | 'Irregularity & Accounting Variance' | 'Compliance Violation' | 'Audit Observation' | 'Financial Discrepancy'>('Malpractice Alert');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newVoucher, setNewVoucher] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newActionRequired, setNewActionRequired] = useState('');
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [newAttachment, setNewAttachment] = useState<FileAttachment | null>(null);

  // FPC Reply & Expert Resolution state inside Modal
  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<FileAttachment | null>(null);
  const [statusChoice, setStatusChoice] = useState<string>('Resolved');

  const obsList: Observation[] = co.observations && co.observations.length > 0 ? co.observations : DEFAULT_OBSERVATIONS;

  const isExpertOrCA =
    session.role === 'CA' ||
    session.role === 'Domain Expert' ||
    session.role === 'Admin' ||
    session.name.toLowerCase() === 'domainexpert';

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (att: FileAttachment) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      callback({
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl,
        size: file.size,
        uploadedAt: new Date().toLocaleString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newObs: Observation = {
      id: 'obs-' + Math.random().toString(36).slice(2, 9),
      title: newTitle.trim() || `${newCat} - ${co.name}`,
      cat: newCat,
      severity: newSeverity,
      voucher: newVoucher.trim() || undefined,
      note: newNote.trim(),
      actionRequired: newActionRequired.trim() || undefined,
      deadline: newDeadline,
      by: session.name + ' (' + session.role + ')',
      role: session.role,
      status: 'Open',
      ts: new Date().toISOString(),
      attachment: newAttachment,
    };

    update(c => {
      c.observations = c.observations || [...DEFAULT_OBSERVATIONS];
      c.observations.unshift(newObs);
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewNote('');
    setNewActionRequired('');
    setNewVoucher('');
    setNewAttachment(null);
  };

  const openObsModal = (obs: Observation) => {
    setActiveObsModal(obs);
    setReplyText(obs.reply || '');
    setReplyAttachment(obs.replyAttachment || null);
    setStatusChoice(obs.status || 'Open');
  };

  const handleSaveObsResponse = () => {
    if (!activeObsModal) return;

    update(c => {
      const list = c.observations && c.observations.length > 0 ? c.observations : [...DEFAULT_OBSERVATIONS];
      const idx = list.findIndex(o => o.id === activeObsModal.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: statusChoice,
          reply: replyText.trim() || list[idx].reply,
          replyBy: replyText.trim() ? session.name + ' (' + session.role + ')' : list[idx].replyBy,
          replyTs: replyText.trim() ? new Date().toISOString() : list[idx].replyTs,
          replyAttachment: replyAttachment || list[idx].replyAttachment,
        };
      }
      c.observations = list;
    });

    setActiveObsModal(null);
  };

  // Filters
  const filteredObs = obsList.filter(o => {
    const matchSearch =
      !search.trim() ||
      (o.title || '').toLowerCase().includes(search.toLowerCase()) ||
      o.note.toLowerCase().includes(search.toLowerCase()) ||
      (o.actionRequired || '').toLowerCase().includes(search.toLowerCase()) ||
      o.by.toLowerCase().includes(search.toLowerCase());

    const matchCat = catFilter === 'All' || o.cat === catFilter;
    const matchSeverity = severityFilter === 'All' || o.severity === severityFilter;
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;

    return matchSearch && matchCat && matchSeverity && matchStatus;
  });

  const malpracticeCount = obsList.filter(o => o.cat.includes('Malpractice')).length;
  const irregularityCount = obsList.filter(o => o.cat.includes('Irregularity') || o.cat.includes('Discrepancy')).length;
  const violationCount = obsList.filter(o => o.cat.includes('Violation')).length;
  const resolvedCount = obsList.filter(o => o.status === 'Resolved' || o.status === 'Closed' || o.status === 'Overridden').length;

  return (
    <div className="space-y-6 text-xs text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-base font-bold text-slate-100">Domain Expert &amp; Statutory CA Portal</h2>
            <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Compliance Override &amp; Observation Hub
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Log statutory audit observations, malpractice alerts, accounting irregularities, and compliance violations with full PDF, Excel, &amp; image proof attachments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto text-xs"
        >
          <span>🚨</span>
          <span>Log Expert / CA Observation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-950/40 border border-red-900/80 p-3.5 rounded-xl">
          <div className="text-red-300 font-semibold text-[11px]">🚨 Malpractice Alerts</div>
          <div className="text-xl font-bold text-red-200 font-mono mt-1">{malpracticeCount}</div>
        </div>

        <div className="bg-amber-950/40 border border-amber-900/80 p-3.5 rounded-xl">
          <div className="text-amber-300 font-semibold text-[11px]">⚠️ Irregularities &amp; Variances</div>
          <div className="text-xl font-bold text-amber-200 font-mono mt-1">{irregularityCount}</div>
        </div>

        <div className="bg-rose-950/40 border border-rose-900/80 p-3.5 rounded-xl">
          <div className="text-rose-300 font-semibold text-[11px]">🛑 Statutory Violations</div>
          <div className="text-xl font-bold text-rose-200 font-mono mt-1">{violationCount}</div>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-900/80 p-3.5 rounded-xl">
          <div className="text-emerald-300 font-semibold text-[11px]">✓ Resolved / Overridden</div>
          <div className="text-xl font-bold text-emerald-200 font-mono mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search observations, findings, CA notes..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Categories</option>
            <option value="Malpractice Alert">Malpractice Alert</option>
            <option value="Irregularity & Accounting Variance">Irregularity &amp; Variance</option>
            <option value="Compliance Violation">Compliance Violation</option>
            <option value="Audit Observation">Audit Observation</option>
            <option value="Financial Discrepancy">Financial Discrepancy</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low / Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Overridden">Overridden</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Observations List */}
      <div className="space-y-4">
        {filteredObs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            No observations match your search criteria.
          </div>
        ) : (
          filteredObs.map(obs => {
            const isCritical = obs.severity === 'Critical' || obs.cat.includes('Malpractice');
            const isResolved = obs.status === 'Resolved' || obs.status === 'Closed' || obs.status === 'Overridden';

            return (
              <div
                key={obs.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isCritical && !isResolved
                    ? 'bg-red-950/20 border-red-900/80'
                    : isResolved
                    ? 'bg-emerald-950/20 border-emerald-900/60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          obs.cat.includes('Malpractice')
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : obs.cat.includes('Irregularity') || obs.cat.includes('Discrepancy')
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                        }`}
                      >
                        {obs.cat}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          obs.severity === 'Critical'
                            ? 'bg-red-900 text-red-100 border-red-700 animate-pulse'
                            : obs.severity === 'High'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : obs.severity === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {obs.severity || 'Medium'} Severity
                      </span>

                      {obs.voucher && (
                        <span className="text-[10px] font-mono bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                          Ref Voucher: {obs.voucher}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{obs.title || 'Audit Observation'}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <strong>Audit Finding / Observation:</strong> {obs.note}
                    </p>

                    {obs.actionRequired && (
                      <p className="text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/60 font-medium">
                        <strong>⚡ Corrective Action Required:</strong> {obs.actionRequired}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span>✍️ Logged By: <strong className="text-slate-200">{obs.by}</strong></span>
                      <span>📅 Date Logged: <strong className="text-slate-300">{new Date(obs.ts).toLocaleDateString()}</strong></span>
                      {obs.deadline && (
                        <span>
                          🎯 Target Rectification Deadline:{' '}
                          <strong className="text-amber-300 font-mono">{obs.deadline}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex flex-col items-end gap-2 whitespace-nowrap self-start md:self-auto">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        obs.status === 'Resolved' || obs.status === 'Closed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : obs.status === 'Overridden'
                          ? 'bg-purple-950 text-purple-300 border-purple-700'
                          : obs.status === 'Under Review'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-red-950 text-red-300 border-red-800'
                      }`}
                    >
                      {obs.status === 'Overridden' ? '⚡ Statutory Overridden' : obs.status}
                    </span>

                    <button
                      onClick={() => openObsModal(obs)}
                      className="bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>💬</span>
                      <span>{isExpertOrCA ? 'Manage / Resolve Observation' : 'Respond & Upload Rectification'}</span>
                    </button>
                  </div>
                </div>

                {/* Evidence Attachment & FPC Responses */}
                {(obs.attachment || obs.reply || obs.replyAttachment) && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                    {obs.attachment && (
                      <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-purple-800/80 rounded-lg max-w-lg">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-purple-400 font-bold text-sm">📎 Evidence Proof:</span>
                          <span className="text-slate-200 font-medium truncate">{obs.attachment.name}</span>
                          <span className="text-[10px] text-slate-400">({obs.attachment.uploadedAt})</span>
                        </div>
                        <a
                          href={obs.attachment.dataUrl}
                          download={obs.attachment.name}
                          className="bg-purple-700 hover:bg-purple-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors"
                        >
                          ⬇ Download Proof
                        </a>
                      </div>
                    )}

                    {obs.reply && (
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <div className="font-bold text-emerald-400 flex items-center justify-between">
                          <span>💬 FPC / Accountant Response:</span>
                          <span className="text-[10px] text-slate-400 font-normal">{obs.replyBy}</span>
                        </div>
                        <p className="text-slate-200 pl-3 italic">"{obs.reply}"</p>

                        {obs.replyAttachment && (
                          <div className="mt-2 p-2 bg-slate-900 border border-emerald-800 rounded-lg flex items-center justify-between gap-2 max-w-lg">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-emerald-400 font-bold text-sm">📎 Rectification Proof:</span>
                              <span className="text-slate-200 font-medium truncate">{obs.replyAttachment.name}</span>
                            </div>
                            <a
                              href={obs.replyAttachment.dataUrl}
                              download={obs.replyAttachment.name}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors"
                            >
                              ⬇ Download Rectification Proof
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* LOG OBSERVATION MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <form
            onSubmit={handleCreateObservation}
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                Domain Expert &amp; CA Audit Logging
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">🚨 Log Expert Observation / Malpractice Alert</h3>
              <p className="text-xs text-slate-400 mt-0.5">Record accounting irregularities, statutory violations, or malpractice with proof attachments.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Observation Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Unvouched Cash Withdrawal Exceeding Limit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={e => setNewCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Malpractice Alert">🚨 Malpractice Alert</option>
                    <option value="Irregularity & Accounting Variance">⚠️ Irregularity &amp; Variance</option>
                    <option value="Compliance Violation">🛑 Compliance Violation</option>
                    <option value="Audit Observation">📋 Audit Observation</option>
                    <option value="Financial Discrepancy">💸 Financial Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">⚪ Low / Info</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Ref Voucher No. (Optional)</label>
                  <input
                    type="text"
                    value={newVoucher}
                    onChange={e => setNewVoucher(e.target.value)}
                    placeholder="e.g. PUR-2025-001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Detailed Observation &amp; Finding Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Provide precise details of malpractice, irregularity, or statutory defect identified during audit..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Corrective Action Required by FPC</label>
                  <input
                    type="text"
                    value={newActionRequired}
                    onChange={e => setNewActionRequired(e.target.value)}
                    placeholder="e.g. Produce physical vendor invoice signed by recipient"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Rectification Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* File Attachment Facility */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-purple-300 font-bold block mb-1">
                  📎 Upload Evidence Attachment (PDF, Excel, PNG, JPG, CSV, DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={e => handleFileUpload(e, setNewAttachment)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-800 file:text-purple-100 hover:file:bg-purple-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Attach scan/photo of defective voucher, bank discrepancy PDF, or Excel calculation sheet.
                </p>

                {newAttachment && (
                  <div className="mt-2 p-2 bg-slate-900 border border-purple-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-purple-400 font-bold">📄</span>
                      <span className="text-slate-200 font-medium truncate">{newAttachment.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ File Attached</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg text-xs transition-all"
              >
                🚨 Log Observation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE / RESPOND TO OBSERVATION MODAL */}
      {activeObsModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveObsModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 relative"
          >
            <button
              onClick={() => setActiveObsModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                  {activeObsModal.cat}
                </span>
                <span className="text-xs text-slate-400">Logged By: {activeObsModal.by}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">{activeObsModal.title || 'Observation Details'}</h3>
            </div>

            {/* Note Display */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div>
                <strong className="text-slate-300 block">Finding:</strong>
                <p className="text-slate-200 mt-0.5">{activeObsModal.note}</p>
              </div>
              {activeObsModal.actionRequired && (
                <div className="pt-2 border-t border-slate-800">
                  <strong className="text-amber-300 block">Required Action:</strong>
                  <p className="text-amber-200 mt-0.5">{activeObsModal.actionRequired}</p>
                </div>
              )}
            </div>

            {/* Expert Status Control */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Set Resolution Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Open', label: '🔴 Open', color: 'bg-red-950 text-red-300 border-red-700' },
                  { id: 'Under Review', label: '🟡 Under Review', color: 'bg-amber-950 text-amber-300 border-amber-700' },
                  { id: 'Resolved', label: '✓ Resolved', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
                  { id: 'Overridden', label: '⚡ Overridden (Expert Authority)', color: 'bg-purple-950 text-purple-300 border-purple-700' },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusChoice(s.id)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold text-center transition-all ${
                      statusChoice === s.id ? `${s.color} ring-2 ring-purple-500 scale-[1.02]` : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FPC Response / Rectification Section */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                💬 FPC Response &amp; Rectification Proof Upload
              </h4>

              <div>
                <label className="text-slate-300 block mb-1">Response / Rectification Explanation</label>
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Enter response notes explaining rectification action taken..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  📎 Upload Rectification Attachment (PDF, Excel, PNG, JPG, CSV, DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={e => handleFileUpload(e, setReplyAttachment)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-emerald-100 hover:file:bg-emerald-700 cursor-pointer"
                />

                {replyAttachment && (
                  <div className="mt-2 p-2 bg-slate-900 border border-emerald-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-emerald-400 font-bold">📄</span>
                      <span className="text-slate-200 font-medium truncate">{replyAttachment.name}</span>
                    </div>
                    <a
                      href={replyAttachment.dataUrl}
                      download={replyAttachment.name}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap"
                    >
                      ⬇ Download
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveObsModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveObsResponse}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg text-xs transition-all"
              >
                ✓ Save Status &amp; Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
