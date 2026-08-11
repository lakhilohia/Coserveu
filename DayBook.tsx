import React, { useState } from 'react';
import { Company, Session, Voucher } from '../types';
import { computeEngine, fmtn } from '../utils/engine';

interface DayBookProps {
  co: Company;
  update?: (fn: (c: Company) => void) => void;
  logAudit?: (co: Company, act: string, det: string, m?: any) => void;
  session?: Session;
  nav?: (page: string) => void;
  setDrill: (d: any) => void;
}

export const DayBook: React.FC<DayBookProps> = ({ co, update, logAudit, session, nav, setDrill }) => {
  const eng = computeEngine(co);
  const isDomainExpert = session?.role === 'Domain Expert';

  const [fromDateFilter, setFromDateFilter] = useState<string>('');
  const [toDateFilter, setToDateFilter] = useState<string>('');
  const [vtypeFilter, setVtypeFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default 'asc' = older entries first!

  // Delete Request Modal State
  const [requestingDeleteVoucher, setRequestingDeleteVoucher] = useState<Voucher | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  let rows = co.vouchers.filter(v => {
    if (fromDateFilter && v.date < fromDateFilter) return false;
    if (toDateFilter && v.date > toDateFilter) return false;
    if (vtypeFilter && v.type !== vtypeFilter) return false;
    return true;
  });

  // Sort by date according to sortOrder preference
  rows = rows.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const pendingDeleteRequests = co.vouchers.filter(v => v.deleteRequest?.status === 'pending');

  // Handle Delete Button Click in Day Book
  const handleDeleteClick = (v: Voucher) => {
    if (!update) return;

    if (isDomainExpert) {
      if (!confirm(`As Domain Expert, permanently delete Day Book voucher ${v.no}?`)) return;

      const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
      const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
      const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');

      update(c => {
        c.vouchers = c.vouchers.filter(x => x.id !== v.id);
        if (logAudit) {
          logAudit(c, 'DELETE_BY_DOMAIN_EXPERT', `Domain Expert deleted voucher ${v.type} ${v.no} from Day Book (Dr ₹${fmtn(dr)})`, {
            amt: dr,
            dr,
            cr,
            vtype: v.type,
            name: nameStr,
            vdate: v.date,
          });
        }
      });
    } else {
      setRequestingDeleteVoucher(v);
      setDeleteReason('');
    }
  };

  // Submit Delete Request (FPC User)
  const submitDeleteRequest = () => {
    if (!update || !requestingDeleteVoucher || !deleteReason.trim()) return;

    const v = requestingDeleteVoucher;
    const reasonText = deleteReason.trim();

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target) {
        target.deleteRequest = {
          requestedBy: session?.name || 'FPC Staff',
          requestedRole: session?.role || 'FPC Staff',
          reason: reasonText,
          requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'pending',
        };
      }
      if (logAudit) {
        logAudit(
          c,
          'DELETE_REQUEST_RAISED',
          `Delete request raised for ${v.type} ${v.no} in Day Book by ${session?.name || 'Staff'}. Reason: "${reasonText}"`,
          { vtype: v.type, vno: v.no }
        );
      }
    });

    setRequestingDeleteVoucher(null);
    setDeleteReason('');
    alert(`✓ Delete request submitted to Domain Expert for review.`);
  };

  // Approve Delete Request (Domain Expert)
  const approveDeleteRequest = (v: Voucher) => {
    if (!update) return;
    if (!confirm(`Approve deletion of voucher ${v.no}?`)) return;

    const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
    const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');

    update(c => {
      c.vouchers = c.vouchers.filter(x => x.id !== v.id);
      if (logAudit) {
        logAudit(
          c,
          'DELETE_REQUEST_APPROVED',
          `Domain Expert approved delete request for ${v.type} ${v.no}. Reason: "${v.deleteRequest?.reason}"`,
          { amt: dr, dr, cr, vtype: v.type, name: nameStr, vdate: v.date }
        );
      }
    });
  };

  // Reject Delete Request
  const rejectDeleteRequest = (v: Voucher) => {
    if (!update) return;
    const note = prompt(`Enter rejection reason for voucher ${v.no} delete request:`, 'Request rejected after review.');
    if (note === null) return;

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target && target.deleteRequest) {
        target.deleteRequest.status = 'rejected';
        target.deleteRequest.rejectedReason = note || 'Rejected by Domain Expert';
        target.deleteRequest.rejectedBy = session?.name || 'Domain Expert';
        target.deleteRequest.rejectedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
    });
  };

  // Cancel Delete Request
  const cancelDeleteRequest = (v: Voucher) => {
    if (!update) return;
    if (!confirm(`Cancel pending delete request for voucher ${v.no}?`)) return;

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target) {
        target.deleteRequest = null;
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Day Book</h2>
          <p className="text-xs text-slate-400">Daily transaction register with chronological sorting, ledger breakdown &amp; voucher deletion requests</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2.5 py-1">
            <label className="text-slate-400">From:</label>
            <input
              type="date"
              value={fromDateFilter}
              onChange={e => setFromDateFilter(e.target.value)}
              className="bg-transparent text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2.5 py-1">
            <label className="text-slate-400">To:</label>
            <input
              type="date"
              value={toDateFilter}
              onChange={e => setToDateFilter(e.target.value)}
              className="bg-transparent text-slate-100 font-mono focus:outline-none"
            />
          </div>

          {(fromDateFilter || toDateFilter) && (
            <button
              onClick={() => {
                setFromDateFilter('');
                setToDateFilter('');
              }}
              className="text-xs bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900 px-2 py-1 rounded"
            >
              🌐 All Time (Poora Data)
            </button>
          )}

          <div>
            <label className="text-slate-400 mr-1.5">Type:</label>
            <select
              value={vtypeFilter}
              onChange={e => setVtypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {['Payment', 'Receipt', 'Contra', 'Journal', 'Sales', 'Purchase', 'Debit Note', 'Credit Note'].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 mr-1.5">Sort Order:</label>
            <button
              onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-blue-400 font-medium hover:bg-slate-700"
            >
              {sortOrder === 'asc' ? 'Older First (Chronological)' : 'Newest First'}
            </button>
          </div>
        </div>
      </div>

      {/* PENDING DELETE REQUESTS BANNER */}
      {pendingDeleteRequests.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-800/60 pb-2">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              ⚠️ Pending Voucher Delete Requests ({pendingDeleteRequests.length})
            </h3>
            {isDomainExpert ? (
              <span className="text-[11px] bg-amber-900/80 text-amber-200 border border-amber-700 px-2.5 py-0.5 rounded font-medium">
                Domain Expert Action Needed
              </span>
            ) : (
              <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded">
                Awaiting Domain Expert Approval
              </span>
            )}
          </div>

          <div className="divide-y divide-amber-900/40">
            {pendingDeleteRequests.map(v => {
              const amt = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
              const req = v.deleteRequest!;
              return (
                <div key={v.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100">{v.type} · {v.no}</span>
                      <span className="text-slate-400">Date: {v.date}</span>
                      <span className="font-mono text-emerald-400 font-bold">₹{fmtn(amt)}</span>
                    </div>
                    <div className="text-slate-300">
                      <strong>Party:</strong> {v.partyName || '—'}
                    </div>
                    <div className="text-amber-200 bg-amber-900/40 px-2.5 py-1 rounded border border-amber-800/50">
                      <strong>Deletion Reason:</strong> "{req.reason}"
                      <span className="text-slate-400 ml-2 block sm:inline">
                        (Requested by: {req.requestedBy} [{req.requestedRole}] on {req.requestedAt})
                      </span>
                    </div>
                  </div>

                  {isDomainExpert ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveDeleteRequest(v)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded text-xs transition-colors shadow"
                      >
                        ✅ Approve &amp; Delete
                      </button>
                      <button
                        onClick={() => rejectDeleteRequest(v)}
                        className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded text-xs transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded font-medium">
                        ⏳ Pending DE Review
                      </span>
                      <button
                        onClick={() => cancelDeleteRequest(v)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded border border-slate-700"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Vch No.</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Debit Ledger</th>
              <th className="py-2.5 px-3">Credit Ledger</th>
              <th className="py-2.5 px-3">Party / Narration</th>
              <th className="py-2.5 px-3 text-right">Amount ₹</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map(v => {
              const drLeds = v.entries
                .filter(e => +e.dr > 0)
                .map(e => eng.ledById[e.led]?.name)
                .filter(Boolean)
                .join(', ');

              const crLeds = v.entries
                .filter(e => +e.cr > 0)
                .map(e => eng.ledById[e.led]?.name)
                .filter(Boolean)
                .join(', ');

              const amt = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
              const hasPendingDel = v.deleteRequest?.status === 'pending';
              const hasRejectedDel = v.deleteRequest?.status === 'rejected';

              return (
                <tr
                  key={v.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    hasPendingDel ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    {v.no}
                    {hasPendingDel && (
                      <span className="block text-[10px] text-amber-400 font-sans font-bold">
                        ⏳ Delete Requested
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
                      {v.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-red-400 font-medium">{drLeds || '—'}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-medium">{crLeds || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {v.partyName ? <span className="text-slate-200 font-medium">{v.partyName}: </span> : null}
                    <span>{v.narration || '—'}</span>
                    {hasPendingDel && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 mt-1">
                        <strong>Delete Reason:</strong> "{v.deleteRequest?.reason}"
                      </div>
                    )}
                    {hasRejectedDel && (
                      <div className="text-[11px] text-red-400 bg-red-950/30 p-1 rounded border border-red-900 mt-1">
                        ❌ Delete Request Rejected: "{v.deleteRequest?.rejectedReason}"
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(amt)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDrill({ voucherId: v.id })}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[11px] border border-slate-700"
                        title="View Full Voucher Details"
                      >
                        View
                      </button>

                      {nav && (
                        <button
                          onClick={() => {
                            setDrill({ editVoucher: v.id });
                            nav('voucher');
                          }}
                          className="bg-blue-950/60 hover:bg-blue-900 text-blue-300 px-2 py-1 rounded text-[11px] border border-blue-800"
                          title="Edit Voucher"
                        >
                          Edit
                        </button>
                      )}

                      {hasPendingDel ? (
                        isDomainExpert ? (
                          <button
                            onClick={() => approveDeleteRequest(v)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-2 py-1 rounded text-[11px]"
                          >
                            Approve Del
                          </button>
                        ) : (
                          <button
                            onClick={() => cancelDeleteRequest(v)}
                            className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 px-2 py-1 rounded text-[11px] border border-amber-800"
                            title="Click to cancel pending delete request"
                          >
                            ⏳ Pending
                          </button>
                        )
                      ) : (
                        update && (
                          <button
                            onClick={() => handleDeleteClick(v)}
                            className="bg-red-950/60 hover:bg-red-900 text-red-300 px-2 py-1 rounded text-[11px] border border-red-800"
                            title={isDomainExpert ? 'Delete Voucher (Domain Expert Direct Permission)' : 'Raise Voucher Delete Request'}
                          >
                            {isDomainExpert ? 'Del' : 'Request Del'}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  No daybook entries match the current date / type filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: RAISE DELETE REQUEST (FPC Staff) */}
      {requestingDeleteVoucher && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                🗑️ Raise Voucher Delete Request
              </h3>
              <button
                onClick={() => setRequestingDeleteVoucher(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
              <p className="text-slate-200 font-semibold">
                Voucher: {requestingDeleteVoucher.type} · {requestingDeleteVoucher.no}
              </p>
              <p className="text-slate-400">
                Date: {requestingDeleteVoucher.date} · Created By: {requestingDeleteVoucher.createdBy}
              </p>
              <p className="text-slate-300 font-mono">
                Amount: ₹{fmtn(requestingDeleteVoucher.entries.reduce((s, e) => s + (+e.dr || 0), 0))}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Reason for Deletion <span className="text-red-400">* Mandatory</span>
              </label>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="State why this Day Book voucher needs deletion (e.g. Wrong entry, incorrect party, duplicate posting)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2.5 rounded border border-amber-800/60">
              ℹ️ Under FPC Compliance rules, vouchers cannot be deleted directly by FPC staff. Your request will be forwarded to the <strong>Domain Expert</strong> for review and approval.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRequestingDeleteVoucher(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitDeleteRequest}
                disabled={!deleteReason.trim()}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded text-xs transition-colors shadow"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
