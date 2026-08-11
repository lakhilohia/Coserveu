import React, { useEffect, useState } from 'react';
import { Company, Session, Voucher } from '../types';
import { computeEngine, fmtn } from '../utils/engine';
import { DEFAULT_GROUPS } from '../data/seedFPCs';
import { idbGet } from '../utils/db';

interface VoucherDetailModalProps {
  co: Company;
  vid: string;
  onClose: () => void;
  update?: (fn: (c: Company) => void) => void;
  logAudit?: (co: Company, act: string, det: string, m?: any) => void;
  session?: Session;
  nav?: (page: string) => void;
  setDrill?: (d: any) => void;
}

function getDisplayGroup(grpCode?: string, co?: Company): string {
  if (!grpCode) return 'Primary Group';
  const found = co?.groups?.find(g => g.id === grpCode || g.name.toLowerCase() === grpCode.toLowerCase());
  if (found) return found.name;

  const seedFound = DEFAULT_GROUPS.find(g => g.id === grpCode || g.name.toLowerCase() === grpCode.toLowerCase());
  if (seedFound) return seedFound.name;

  // Fallback mappings
  if (grpCode === 'g_bank') return 'Bank Accounts';
  if (grpCode === 'g_cash') return 'Cash-in-Hand';
  if (grpCode === 'g_cap') return 'Capital Account';
  if (grpCode === 'g_sales') return 'Sales Accounts';
  if (grpCode === 'g_pur') return 'Purchase Accounts';
  if (grpCode === 'g_di') return 'Direct Incomes';
  if (grpCode === 'g_de') return 'Direct Expenses';
  if (grpCode === 'g_ii') return 'Indirect Incomes';
  if (grpCode === 'g_ie') return 'Indirect Expenses';
  if (grpCode === 'g_cred') return 'Sundry Creditors';
  if (grpCode === 'g_dr' || grpCode === 'g_deb') return 'Sundry Debtors';
  if (grpCode === 'g_dt') return 'Duties & Taxes';
  if (grpCode === 'g_fa') return 'Fixed Assets';
  if (grpCode === 'g_stk') return 'Stock-in-Hand';

  return grpCode;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  co,
  vid,
  onClose,
  update,
  logAudit,
  session,
  nav,
  setDrill,
}) => {
  const v = co.vouchers.find(x => x.id === vid);
  const eng = computeEngine(co);

  const [billUrl, setBillUrl] = useState<string | null>(null);
  const [procUrl, setProcUrl] = useState<string | null>(null);

  // Deletion Request state
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const isDomainExpert = session?.role === 'Domain Expert';

  useEffect(() => {
    if (v?.attachment?.attId) {
      idbGet(v.attachment.attId).then(d => {
        if (d) setBillUrl(d);
      });
    }
    if (v?.proceedingsAttachment?.attId) {
      idbGet(v.proceedingsAttachment.attId).then(d => {
        if (d) setProcUrl(d);
      });
    }
  }, [v]);

  if (!v) return null;

  const totDr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);

  // Direct Delete (Domain Expert)
  const handleDirectDelete = () => {
    if (!update) return;
    if (!confirm(`As Domain Expert, delete voucher ${v.no} permanently?`)) return;

    const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
    const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');

    update(c => {
      c.vouchers = c.vouchers.filter(x => x.id !== v.id);
      if (logAudit) {
        logAudit(c, 'DELETE_BY_DOMAIN_EXPERT', `Domain Expert deleted voucher ${v.type} ${v.no} (Dr ${fmtn(dr)})`, {
          amt: dr,
          dr,
          cr,
          vtype: v.type,
          name: nameStr,
          vdate: v.date,
        });
      }
    });

    onClose();
  };

  // Submit Delete Request (FPC User)
  const handleSubmitDeleteRequest = () => {
    if (!update || !deleteReason.trim()) return;

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
          `Delete request raised for ${v.type} ${v.no} by ${session?.name || 'Staff'}. Reason: "${reasonText}"`,
          { vtype: v.type, vno: v.no }
        );
      }
    });

    setShowDeleteForm(false);
    setDeleteReason('');
    alert('✓ Delete request submitted to Domain Expert for review.');
  };

  // Approve Delete Request (Domain Expert)
  const handleApproveDeleteRequest = () => {
    if (!update) return;
    if (!confirm(`Approve deletion request for voucher ${v.no}?`)) return;

    const dr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    const cr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
    const nameStr = v.entries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');

    update(c => {
      c.vouchers = c.vouchers.filter(x => x.id !== v.id);
      if (logAudit) {
        logAudit(
          c,
          'DELETE_REQUEST_APPROVED',
          `Domain Expert approved deletion request for ${v.type} ${v.no}. Reason: "${v.deleteRequest?.reason}"`,
          { amt: dr, dr, cr, vtype: v.type, name: nameStr, vdate: v.date }
        );
      }
    });

    onClose();
  };

  // Reject Delete Request
  const handleRejectDeleteRequest = () => {
    if (!update) return;
    const note = prompt('Enter rejection reason:', 'Rejected after review.');
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

  // Cancel Delete Request (FPC User)
  const handleCancelDeleteRequest = () => {
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">{v.type} · {v.no}</h3>
            <p className="text-xs text-slate-400">Date: {v.date} · Created By: {v.createdBy}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        {v.partyName && (
          <div className="text-xs text-slate-300">
            <strong>Party:</strong> {v.partyName} {v.partyMobile ? `(${v.partyMobile})` : ''}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2 px-2.5">Ledger Name</th>
                <th className="py-2 px-2.5">Under Group</th>
                <th className="py-2 px-2.5 text-right">Debit ₹</th>
                <th className="py-2 px-2.5 text-right">Credit ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {v.entries.map((e, i) => {
                const ledObj = eng.ledById[e.led] || co.ledgers.find(l => l.id === e.led);
                const lName = ledObj?.name || (e.led?.startsWith('led_') ? 'General Account' : e.led) || 'Primary Ledger';
                const gName = getDisplayGroup(ledObj?.grp, co);
                return (
                  <tr key={i}>
                    <td className="py-2 px-2.5 font-medium text-slate-200">{lName}</td>
                    <td className="py-2 px-2.5 text-slate-400 font-medium">{gName}</td>
                    <td className="py-2 px-2.5 text-right text-red-400 font-mono font-bold">{+e.dr > 0 ? fmtn(+e.dr) : ''}</td>
                    <td className="py-2 px-2.5 text-right text-emerald-400 font-mono font-bold">{+e.cr > 0 ? fmtn(+e.cr) : ''}</td>
                  </tr>
                );
              })}
              <tr className="font-bold border-t border-slate-700 bg-slate-800/40">
                <td colSpan={2} className="py-2 px-2.5 text-slate-200">Total</td>
                <td className="py-2 px-2.5 text-right text-slate-100">{fmtn(totDr)}</td>
                <td className="py-2 px-2.5 text-right text-slate-100">{fmtn(totDr)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {v.inv && v.inv.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Inventory Movements</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-1.5 px-2">Stock Item</th>
                    <th className="py-1.5 px-2 text-right">Qty</th>
                    <th className="py-1.5 px-2 text-right">Rate ₹</th>
                    <th className="py-1.5 px-2">Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {v.inv.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-2 text-slate-200">{co.stockItems.find(s => s.id === r.item)?.name || '?'}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">{fmtn(+r.qty || 0)}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-300">{fmtn(+r.rate || 0)}</td>
                      <td className="py-1.5 px-2 text-slate-400">{r.dir === 'in' ? 'Stock In' : 'Stock Out'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attachments Section */}
        <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
          {v.attachment && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Bill Attachment:</span>
              {billUrl ? (
                <a href={billUrl} target="_blank" download={v.attachment.name} className="text-blue-400 hover:underline">
                  📎 {v.attachment.name} (Download / View)
                </a>
              ) : (
                <span className="text-slate-500">📎 {v.attachment.name}</span>
              )}
            </div>
          )}

          {v.proceedingsAttachment && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Proceedings / Approval Copy:</span>
              {procUrl ? (
                <a href={procUrl} target="_blank" download={v.proceedingsAttachment.name} className="text-emerald-400 hover:underline font-medium">
                  📜 {v.proceedingsAttachment.name} (Download / View)
                </a>
              ) : (
                <span className="text-slate-500">📜 {v.proceedingsAttachment.name}</span>
              )}
            </div>
          )}
        </div>

        {v.narration && (
          <div className="text-xs text-slate-300 border-t border-slate-800 pt-3">
            <span className="text-slate-400">Narration:</span> {v.narration}
          </div>
        )}

        {v.justify && (
          <div className="p-3 bg-amber-950/40 border border-amber-800 rounded text-xs text-amber-200">
            <strong>Backdated Justification:</strong> {v.justify}
          </div>
        )}

        {v.deleteRequest && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/80 rounded-lg text-xs space-y-1">
            <div className="font-bold text-amber-200 flex items-center justify-between">
              <span>🗑️ Delete Request Status: {v.deleteRequest.status.toUpperCase()}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {v.deleteRequest.requestedAt}
              </span>
            </div>
            <div className="text-slate-300">
              <strong>Requested By:</strong> {v.deleteRequest.requestedBy} ({v.deleteRequest.requestedRole})
            </div>
            <div className="text-amber-200 bg-amber-900/40 p-2 rounded border border-amber-800/50 mt-1">
              <strong>Reason:</strong> "{v.deleteRequest.reason}"
            </div>
            {v.deleteRequest.status === 'rejected' && (
              <div className="text-red-300 bg-red-950/40 p-2 rounded border border-red-800/50 mt-1">
                <strong>Rejection Note:</strong> "{v.deleteRequest.rejectedReason}" (by {v.deleteRequest.rejectedBy} on {v.deleteRequest.rejectedAt})
              </div>
            )}
          </div>
        )}

        {/* Delete Request Reason Input Form */}
        {showDeleteForm && (
          <div className="bg-slate-800/80 border border-amber-800/80 rounded-lg p-3 space-y-2 text-xs">
            <label className="block font-bold text-amber-200">
              Reason for Deletion <span className="text-red-400">* Mandatory</span>
            </label>
            <textarea
              rows={2}
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="State why this voucher needs deletion..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteForm(false)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDeleteRequest}
                disabled={!deleteReason.trim()}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded text-xs"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            {nav && setDrill && (
              <button
                onClick={() => {
                  onClose();
                  setDrill({ editVoucher: v.id });
                  nav('voucher');
                }}
                className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 rounded text-xs font-medium"
              >
                ✏️ Edit Voucher
              </button>
            )}

            {update && (
              v.deleteRequest?.status === 'pending' ? (
                isDomainExpert ? (
                  <>
                    <button
                      onClick={handleApproveDeleteRequest}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs shadow"
                    >
                      ✅ Approve &amp; Delete
                    </button>
                    <button
                      onClick={handleRejectDeleteRequest}
                      className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs"
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCancelDeleteRequest}
                    className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded text-xs"
                    title="Click to cancel pending request"
                  >
                    ⏳ Request Pending (Cancel)
                  </button>
                )
              ) : (
                isDomainExpert ? (
                  <button
                    onClick={handleDirectDelete}
                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs font-medium"
                  >
                    🗑️ Delete Voucher
                  </button>
                ) : (
                  !showDeleteForm && (
                    <button
                      onClick={() => {
                        setShowDeleteForm(true);
                        setDeleteReason('');
                      }}
                      className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-medium"
                    >
                      🗑️ Request Deletion
                    </button>
                  )
                )
              )
            )}
          </div>

          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
