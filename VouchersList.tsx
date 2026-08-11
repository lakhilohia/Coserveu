import React, { useState } from 'react';
import { Company, Session, Voucher } from '../types';
import { computeEngine, fmtn } from '../utils/engine';
import { ROLES } from '../data/roles';
import { VTYPES, nowISO } from '../data/seedFPCs';

interface VouchersListProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  logAudit: (c: Company, action: string, detail: string, meta?: any) => void;
  session: Session;
  nav: (p: string) => void;
  setDrill: (d: any) => void;
}

export const VouchersList: React.FC<VouchersListProps> = ({
  co,
  update,
  logAudit,
  session,
  nav,
  setDrill,
}) => {
  const eng = computeEngine(co);
  const perm = ROLES[session.role];
  const isDomainExpert = session.role === 'Domain Expert';

  const [f, setF] = useState({
    type: '',
    from: '',
    to: '',
    min: '',
    max: '',
    text: '',
  });

  // State for Raising Delete Request (FPC User)
  const [requestingDeleteVoucher, setRequestingDeleteVoucher] = useState<Voucher | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');

  const rows = co.vouchers.filter(v => {
    if (f.type && v.type !== f.type) return false;
    if (f.from && v.date < f.from) return false;
    if (f.to && v.date > f.to) return false;
    const amt = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    if (f.min && amt < +f.min) return false;
    if (f.max && amt > +f.max) return false;
    if (f.text) {
      const t = f.text.toLowerCase();
      const match =
        (v.narration || '').toLowerCase().includes(t) ||
        v.no.toLowerCase().includes(t) ||
        (v.partyName || '').toLowerCase().includes(t) ||
        v.entries.some(e => eng.ledById[e.led]?.name.toLowerCase().includes(t));
      if (!match) return false;
    }
    return true;
  });

  const pendingDeleteRequests = co.vouchers.filter(v => v.deleteRequest?.status === 'pending');

  // Handle Delete Action
  const handleDeleteClick = (v: Voucher) => {
    if (isDomainExpert) {
      // Domain Expert can delete directly
      const isExpense = v.type === 'Payment' || v.entries.some(e => {
        const led = co.ledgers.find(l => l.id === e.led);
        return led && (led.grp === 'g_de' || led.grp === 'g_ie');
      });

      let confirmMsg = `As Domain Expert, are you sure you want to permanently delete voucher ${v.no}? This deletion will be recorded in the audit log.`;
      if (isExpense && !v.proceedingsAttachment && !v.attachment) {
        confirmMsg = `⚠ Notice: Expense voucher (${v.no}) has no attached Proceedings copy. Delete as Domain Expert anyway?`;
      }

      if (!confirm(confirmMsg)) return;

      const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
      const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
      const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');

      update(c => {
        c.vouchers = c.vouchers.filter(x => x.id !== v.id);
        logAudit(c, 'DELETE_BY_DOMAIN_EXPERT', `Domain Expert deleted voucher ${v.type} ${v.no} (Dr ${fmtn(dr)})`, {
          amt: dr,
          dr,
          cr,
          vtype: v.type,
          name: nameStr,
          vdate: v.date,
        });
      });
    } else {
      // FPC User MUST raise a delete request with mandatory reason
      setRequestingDeleteVoucher(v);
      setDeleteReason('');
    }
  };

  // Submit Delete Request (FPC User)
  const submitDeleteRequest = () => {
    if (!requestingDeleteVoucher || !deleteReason.trim()) return;

    const v = requestingDeleteVoucher;
    const reasonText = deleteReason.trim();

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target) {
        target.deleteRequest = {
          requestedBy: session.name,
          requestedRole: session.role,
          reason: reasonText,
          requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'pending',
        };
      }
      logAudit(
        c,
        'DELETE_REQUEST_RAISED',
        `Delete request raised for ${v.type} ${v.no} by ${session.name} (${session.role}). Reason: "${reasonText}"`,
        { vtype: v.type, vno: v.no }
      );
    });

    setRequestingDeleteVoucher(null);
    setDeleteReason('');
    alert(`✓ Delete request submitted to Domain Expert for review & approval.`);
  };

  // Approve Delete Request (Domain Expert)
  const approveDeleteRequest = (v: Voucher) => {
    if (!confirm(`Approve deletion of voucher ${v.no}? It will be permanently removed.`)) return;

    const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
    const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');
    const reason = v.deleteRequest?.reason || 'No reason provided';
    const requestedBy = v.deleteRequest?.requestedBy || 'FPC User';

    update(c => {
      c.vouchers = c.vouchers.filter(x => x.id !== v.id);
      logAudit(
        c,
        'DELETE_REQUEST_APPROVED',
        `Domain Expert approved delete request for ${v.type} ${v.no} (Requested by ${requestedBy}). Reason: "${reason}"`,
        { amt: dr, dr, cr, vtype: v.type, name: nameStr, vdate: v.date }
      );
    });
  };

  // Reject Delete Request (Domain Expert)
  const rejectDeleteRequest = (v: Voucher) => {
    const rejectNote = prompt(`Enter rejection reason for voucher ${v.no} delete request:`, 'Request rejected after review.');
    if (rejectNote === null) return;

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target && target.deleteRequest) {
        target.deleteRequest.status = 'rejected';
        target.deleteRequest.rejectedReason = rejectNote || 'Rejected by Domain Expert';
        target.deleteRequest.rejectedBy = session.name;
        target.deleteRequest.rejectedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
      logAudit(
        c,
        'DELETE_REQUEST_REJECTED',
        `Domain Expert rejected delete request for ${v.type} ${v.no}. Rejection note: "${rejectNote}"`
      );
    });
  };

  // Cancel Delete Request (FPC User)
  const cancelDeleteRequest = (v: Voucher) => {
    if (!confirm(`Cancel pending delete request for voucher ${v.no}?`)) return;

    update(c => {
      const target = c.vouchers.find(x => x.id === v.id);
      if (target) {
        target.deleteRequest = null;
      }
      logAudit(c, 'DELETE_REQUEST_CANCELLED', `Delete request cancelled for ${v.type} ${v.no} by ${session.name}`);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">All Posted Vouchers ({rows.length})</h2>
          <p className="text-xs text-slate-400">Search, filter, view attachments &amp; manage transaction delete requests</p>
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
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Voucher Type</label>
          <select
            value={f.type}
            onChange={e => setF({ ...f, type: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          >
            <option value="">All Types</option>
            {VTYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">From Date</label>
          <input
            type="date"
            value={f.from}
            onChange={e => setF({ ...f, from: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">To Date</label>
          <input
            type="date"
            value={f.to}
            onChange={e => setF({ ...f, to: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Min Amount ₹</label>
          <input
            type="number"
            value={f.min}
            onChange={e => setF({ ...f, min: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Max Amount ₹</label>
          <input
            type="number"
            value={f.max}
            onChange={e => setF({ ...f, max: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Search Keyword</label>
          <input
            value={f.text}
            onChange={e => setF({ ...f, text: e.target.value })}
            placeholder="No / party / narration / ledger"
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Vch No</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Particulars &amp; Party</th>
              <th className="py-2.5 px-3 text-right">Amount ₹</th>
              <th className="py-2.5 px-3 text-center">Docs / Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map(v => {
              const amt = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
              const parts = v.entries
                .map(e => eng.ledById[e.led]?.name)
                .filter(Boolean)
                .join(', ');

              const hasPendingDel = v.deleteRequest?.status === 'pending';
              const hasRejectedDel = v.deleteRequest?.status === 'rejected';

              return (
                <tr
                  key={v.id}
                  onClick={() => setDrill({ voucherId: v.id })}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    hasPendingDel ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    {v.date}
                    {v.backdated && (
                      <span className="ml-1.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                        backdated
                      </span>
                    )}
                  </td>
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
                  <td className="py-2.5 px-3 text-slate-400">
                    {v.partyName ? <div className="text-slate-200 font-medium">{v.partyName}</div> : null}
                    <div className="text-slate-400 truncate max-w-xs">{parts}</div>
                    {hasPendingDel && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 mt-1">
                        <strong>Reason:</strong> "{v.deleteRequest?.reason}"
                      </div>
                    )}
                    {hasRejectedDel && (
                      <div className="text-[11px] text-red-400 bg-red-950/30 p-1 rounded border border-red-900 mt-1">
                        ❌ Delete Request Rejected: "{v.deleteRequest?.rejectedReason}"
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(amt)}</td>
                  <td className="py-2.5 px-3 text-center">
                    {v.attachment ? (
                      <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded mr-1">
                        📎 Bill
                      </span>
                    ) : null}
                    {v.proceedingsAttachment ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                        📜 Proc
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {perm.edit && (
                        <button
                          onClick={() => {
                            nav('voucher');
                            setDrill({ editVoucher: v.id });
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[11px] border border-slate-700"
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
                            title="Click to cancel your pending delete request"
                          >
                            ⏳ Request Pending
                          </button>
                        )
                      ) : (
                        (perm.del || isDomainExpert) && (
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
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No vouchers match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: RAISE DELETE REQUEST (FPC User) */}
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
                placeholder="State why this voucher needs deletion (e.g. Wrong entry, incorrect party, duplicate posting)..."
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

