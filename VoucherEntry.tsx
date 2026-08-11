import React, { useState, useEffect } from 'react';
import { Company, Session, Voucher, VoucherAttachment } from '../types';
import { computeEngine, fmtn } from '../utils/engine';
import { ROLES } from '../data/roles';
import { idbPut, idbGet } from '../utils/db';
import { VTYPES, uid, today, nowISO } from '../data/seedFPCs';

interface VoucherEntryProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  logAudit: (c: Company, action: string, detail: string, meta?: any) => void;
  session: Session;
  drill: any;
  setDrill: (d: any) => void;
}

export const VoucherEntry: React.FC<VoucherEntryProps> = ({
  co,
  update,
  logAudit,
  session,
  drill,
  setDrill,
}) => {
  const editingVoucherId = drill
    ? drill.editVoucher || (typeof drill.voucher === 'object' ? drill.voucher?.id : drill.voucher) || drill.voucherId
    : null;
  const editing = editingVoucherId ? co.vouchers.find(v => v.id === editingVoucherId) : null;

  const eng = computeEngine(co);
  const perm = ROLES[session.role];

  const [vtype, setVtype] = useState<string>('Payment');
  const [date, setDate] = useState<string>(today());
  const [narration, setNarration] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [partyMobile, setPartyMobile] = useState<string>('');
  const [isB2B, setIsB2B] = useState<boolean>(false);
  const [invoiceNo, setInvoiceNo] = useState<string>('');

  const [lines, setLines] = useState<Array<{ led: string; dr: string; cr: string }>>([
    { led: '', dr: '', cr: '' },
    { led: '', dr: '', cr: '' },
  ]);

  const [inv, setInv] = useState<Array<{ item: string; qty: string; rate: string; dir: 'in' | 'out' }>>([]);
  const [justify, setJustify] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  // Attachments
  const [billAttachment, setBillAttachment] = useState<VoucherAttachment | null>(null);
  const [proceedingsAttachment, setProceedingsAttachment] = useState<VoucherAttachment | null>(null);

  // Sync state whenever editing changes or voucher is selected for edit
  useEffect(() => {
    if (editing) {
      setVtype(editing.type || 'Payment');
      setDate(editing.date || today());
      setNarration(editing.narration || '');
      setPartyName(editing.partyName || '');
      setPartyMobile(editing.partyMobile || '');
      setIsB2B(!!editing.isB2B);
      setInvoiceNo(editing.invoiceNo || '');
      setLines(
        editing.entries && editing.entries.length > 0
          ? editing.entries.map(e => ({ led: e.led, dr: String(e.dr || ''), cr: String(e.cr || '') }))
          : [
              { led: '', dr: '', cr: '' },
              { led: '', dr: '', cr: '' },
            ]
      );
      setInv(
        (editing.inv || []).map(r => ({ ...r, item: r.item, qty: String(r.qty || ''), rate: String(r.rate || ''), dir: r.dir }))
      );
      setJustify(editing.justify || '');
      setBillAttachment(editing.attachment || null);
      setProceedingsAttachment(editing.proceedingsAttachment || null);
    }
  }, [editingVoucherId, editing]);

  // Quick Masters Modal state
  const [showQuickLedgerModal, setShowQuickLedgerModal] = useState<boolean>(false);
  const [quickLedgerName, setQuickLedgerName] = useState<string>('');
  const [quickLedgerGroup, setQuickLedgerGroup] = useState<string>('g_ie');
  const [quickLedgerIndex, setQuickLedgerIndex] = useState<number | null>(null);

  const [showQuickItemModal, setShowQuickItemModal] = useState<boolean>(false);
  const [quickItemName, setQuickItemName] = useState<string>('');
  const [quickItemUnit, setQuickItemUnit] = useState<string>('Qtl');
  const [quickItemRate, setQuickItemRate] = useState<string>('0');
  const [quickItemHsn, setQuickItemHsn] = useState<string>('1006');
  const [quickItemGst, setQuickItemGst] = useState<string>('0');

  if (!perm.v) {
    return (
      <div className="p-4 bg-amber-950/40 border border-amber-800/80 text-amber-200 rounded-xl text-sm">
        Your role ({session.role}) is read-only and cannot create or edit vouchers.
      </div>
    );
  }

  const setLine = (i: number, f: 'led' | 'dr' | 'cr', val: string) => {
    setLines(ls => ls.map((l, j) => (j === i ? { ...l, [f]: val } : l)));
  };

  const handleLedgerSelect = (i: number, val: string) => {
    if (val === '__new__') {
      setQuickLedgerIndex(i);
      setQuickLedgerName('');
      setShowQuickLedgerModal(true);
    } else {
      setLine(i, 'led', val);
    }
  };

  const addLine = () => setLines(ls => [...ls, { led: '', dr: '', cr: '' }]);
  const rmLine = (i: number) => setLines(ls => ls.filter((_, j) => j !== i));

  const totDr = lines.reduce((s, l) => s + (+l.dr || 0), 0);
  const totCr = lines.reduce((s, l) => s + (+l.cr || 0), 0);
  const balanced = Math.abs(totDr - totCr) < 0.005 && totDr > 0;
  const backdatedFlag = date < today();

  const isExpenseType = vtype === 'Payment' || lines.some(l => {
    const led = co.ledgers.find(x => x.id === l.led);
    return led && (led.grp === 'g_de' || led.grp === 'g_ie');
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProc: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.onerror = j => rej(j);
        fr.readAsDataURL(file);
      });
      const attId = uid();
      await idbPut(attId, dataUrl);
      const att: VoucherAttachment = { name: file.name, size: file.size, attId, isProceedingsCopy: isProc };
      if (isProc) {
        setProceedingsAttachment(att);
      } else {
        setBillAttachment(att);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };

  const saveQuickLedger = () => {
    if (!quickLedgerName.trim()) return;
    const newId = uid();
    update(c => {
      c.ledgers.push({
        id: newId,
        name: quickLedgerName.trim(),
        grp: quickLedgerGroup,
        ob: 0,
        obt: 'Dr',
      });
      logAudit(c, 'CREATE', `Quick Ledger "${quickLedgerName.trim()}" created`);
    });
    if (quickLedgerIndex !== null) {
      setLine(quickLedgerIndex, 'led', newId);
    }
    setShowQuickLedgerModal(false);
    setQuickLedgerName('');
  };

  const saveQuickItem = () => {
    if (!quickItemName.trim()) return;
    const newId = uid();
    update(c => {
      c.stockItems.push({
        id: newId,
        name: quickItemName.trim(),
        unit: quickItemUnit,
        hsn: quickItemHsn,
        gst: +quickItemGst || 0,
        openingQty: 0,
        rate: +quickItemRate || 0,
      });
      logAudit(c, 'CREATE', `Quick Stock Item "${quickItemName.trim()}" created`);
    });
    setInv(v => [...v, { item: newId, qty: '1', rate: quickItemRate, dir: vtype === 'Sales' ? 'out' : 'in' }]);
    setShowQuickItemModal(false);
    setQuickItemName('');
  };

  const save = () => {
    if (!balanced) {
      setMsg('Debit and Credit totals must be equal and non-zero.');
      return;
    }
    if (lines.some(l => l.led && +l.dr > 0 && +l.cr > 0)) {
      setMsg('A single line cannot have both Debit and Credit amounts.');
      return;
    }
    const clean = lines.filter(l => l.led && (+l.dr > 0 || +l.cr > 0)).map(l => ({
      led: l.led,
      dr: +l.dr || 0,
      cr: +l.cr || 0,
    }));
    if (clean.length < 2) {
      setMsg('At least two valid ledger lines are required for double-entry.');
      return;
    }
    if (backdatedFlag && !justify.trim()) {
      setMsg('Backdated entry: a justification memo is mandatory (Rule 11(g)).');
      return;
    }

    if (isExpenseType && !proceedingsAttachment && !billAttachment) {
      const confirmNoProc = confirm(
        '⚠ Note: Expense transaction without Proceedings / Approval copy or bill photo attached. Do you still want to save?'
      );
      if (!confirmNoProc) return;
    }

    const nameStr = clean
      .map(l => co.ledgers.find(x => x.id === l.led)?.name)
      .filter(Boolean)
      .join(', ');

    let derivedParty = partyName.trim();
    if (!derivedParty) {
      const partyLed = clean
        .map(l => co.ledgers.find(x => x.id === l.led))
        .find(l => l && (l.grp === 'g_cred' || l.grp === 'g_debt' || l.type === 'party'));
      if (partyLed) {
        derivedParty = partyLed.name;
      }
    }

    update(c => {
      if (editing) {
        const v = c.vouchers.find(x => x.id === editing.id);
        if (v) {
          v.type = vtype;
          v.date = date;
          v.narration = narration;
          v.partyName = derivedParty;
          v.partyMobile = partyMobile;
          v.isB2B = isB2B;
          v.invoiceNo = invoiceNo;
          v.entries = clean;
          v.inv = inv.map(r => ({ item: r.item, qty: +r.qty || 0, rate: +r.rate || 0, dir: r.dir }));
          v.justify = justify;
          v.modifiedBy = session.name;
          v.modifiedAt = nowISO();
          v.backdated = backdatedFlag;
          v.attachment = billAttachment;
          v.proceedingsAttachment = proceedingsAttachment;
          logAudit(c, 'MODIFY', `${vtype} voucher ${v.no} edited (Dr ${fmtn(totDr)})`, {
            amt: totDr,
            dr: totDr,
            cr: totCr,
            vtype,
            name: nameStr,
            vdate: date,
          });
        }
      } else {
        const no = c.vouchers.filter(x => x.type === vtype).length + 1;
        const autoNo = `${vtype.slice(0, 2).toUpperCase()}-${String(no).padStart(4, '0')}`;
        const v: Voucher = {
          id: uid(),
          type: vtype,
          no: autoNo,
          date,
          narration,
          partyName: derivedParty,
          partyMobile,
          isB2B,
          invoiceNo: invoiceNo || autoNo,
          entries: clean,
          inv: inv.map(r => ({ item: r.item, qty: +r.qty || 0, rate: +r.rate || 0, dir: r.dir })),
          justify,
          backdated: backdatedFlag,
          createdBy: session.name,
          createdAt: nowISO(),
          attachment: billAttachment,
          proceedingsAttachment: proceedingsAttachment,
        };
        c.vouchers.unshift(v);
        logAudit(c, 'CREATE', `${vtype} voucher ${v.no} posted (Dr ${fmtn(totDr)})` + (backdatedFlag ? ' [BACKDATED]' : ''), {
          amt: totDr,
          dr: totDr,
          cr: totCr,
          vtype,
          name: nameStr,
          vdate: date,
        });
      }
    });

    setMsg('✓ Voucher saved successfully.');
    if (setDrill) setDrill(null);
    setLines([
      { led: '', dr: '', cr: '' },
      { led: '', dr: '', cr: '' },
    ]);
    setNarration('');
    setPartyName('');
    setPartyMobile('');
    setInvoiceNo('');
    setInv([]);
    setJustify('');
    setBillAttachment(null);
    setProceedingsAttachment(null);
  };

  const invMode = vtype === 'Sales' || vtype === 'Purchase';

  const resetForm = () => {
    if (setDrill) setDrill(null);
    setLines([
      { led: '', dr: '', cr: '' },
      { led: '', dr: '', cr: '' },
    ]);
    setNarration('');
    setPartyName('');
    setPartyMobile('');
    setInvoiceNo('');
    setInv([]);
    setJustify('');
    setBillAttachment(null);
    setProceedingsAttachment(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      {editing && (
        <div className="bg-amber-950/60 border border-amber-800/80 rounded-lg p-3 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-amber-900 text-amber-100 px-2 py-0.5 rounded text-[11px]">
              Editing Mode
            </span>
            <span>
              Modifying Voucher <strong>{editing.no}</strong> ({editing.type} dated {editing.date}).
            </span>
          </div>
          <button
            onClick={resetForm}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs font-medium transition-colors"
          >
            ✕ Cancel Editing / New Entry
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">{editing ? `Edit Voucher (${editing.no})` : 'New Voucher Entry'}</h2>
          <p className="text-xs text-slate-400">Double-entry voucher with inventory &amp; proceedings attachment</p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          {VTYPES.map(t => (
            <button
              key={t}
              onClick={() => setVtype(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                vtype === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Voucher Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Voucher Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Invoice / Reference No.</label>
          <input
            value={invoiceNo}
            onChange={e => setInvoiceNo(e.target.value)}
            placeholder="Auto or supplier invoice no"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1">
            {vtype === 'Purchase' || vtype === 'Payment' ? (
              <span className="text-amber-300">🏢 Supplier / Vendor / Farmer Name</span>
            ) : vtype === 'Sales' || vtype === 'Receipt' ? (
              <span className="text-emerald-300">👤 Customer / Buyer Name</span>
            ) : (
              <span>👥 Party / Vendor / Customer Name</span>
            )}
          </label>
          <div className="relative">
            <input
              list="party-names-list"
              value={partyName}
              onChange={e => setPartyName(e.target.value)}
              placeholder={
                vtype === 'Purchase' || vtype === 'Payment'
                  ? 'Enter supplier name (even if paid via Bank or Cash)'
                  : vtype === 'Sales' || vtype === 'Receipt'
                  ? 'Enter customer name (even if received via Bank, UPI or Cash)'
                  : 'Party / Vendor / Customer Name'
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            />
            <datalist id="party-names-list">
              {co.ledgers
                .filter(l => ['g_cred', 'g_debt'].includes(l.grp) || l.type === 'party')
                .map(l => (
                  <option key={l.id} value={l.name} />
                ))}
            </datalist>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {vtype === 'Purchase' || vtype === 'Payment'
              ? 'ℹ️ Record supplier name here for cash/bank payments to maintain party sub-ledger audit trail.'
              : vtype === 'Sales' || vtype === 'Receipt'
              ? 'ℹ️ Record customer name here for cash/bank/UPI receipts for billing and statutory registers.'
              : 'ℹ️ Record party name for ledger cross-referencing.'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Party Mobile No. (Optional)</label>
          <input
            value={partyMobile}
            onChange={e => setPartyMobile(e.target.value)}
            placeholder="Party Contact Mobile"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {vtype === 'Sales' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isB2B}
              onChange={e => setIsB2B(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            Mark as B2B Sales Transaction (Registered Business with GSTIN)
          </label>
        </div>
      )}

      {backdatedFlag && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-200">
          ⚠ Backdated entry ({date}). A justification memo is mandatory under Rule 11(g) and will be flagged in the Audit Trail.
        </div>
      )}

      {/* Ledger Lines */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ledger Accounts (Double-Entry)</h3>
          <button
            onClick={() => {
              setQuickLedgerIndex(null);
              setQuickLedgerName('');
              setShowQuickLedgerModal(true);
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded border border-slate-700"
          >
            ➕ Create New Ledger
          </button>
        </div>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-800/50 p-2 rounded-lg border border-slate-800">
              <div className="col-span-6 sm:col-span-5">
                <select
                  value={l.led}
                  onChange={e => handleLedgerSelect(i, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">— Select Ledger —</option>
                  <option value="__new__">➕ Quick Add New Ledger…</option>
                  {co.ledgers.map(led => (
                    <option key={led.id} value={led.id}>
                      {led.name} ({eng.grpById[led.grp]?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3 sm:col-span-3">
                <input
                  type="number"
                  placeholder="Debit ₹"
                  value={l.dr}
                  onChange={e => setLine(i, 'dr', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-3 sm:col-span-3">
                <input
                  type="number"
                  placeholder="Credit ₹"
                  value={l.cr}
                  onChange={e => setLine(i, 'cr', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-12 sm:col-span-1 flex justify-end">
                <button
                  onClick={() => rmLine(i)}
                  disabled={lines.length <= 2}
                  className="text-red-400 hover:text-red-300 p-1 disabled:opacity-30"
                  title="Remove Line"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLine}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          + Add Line
        </button>
      </div>

      {/* Totals Bar */}
      <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between text-xs font-semibold">
        <div>
          Total Debit: <span className="text-red-400">{fmtn(totDr)}</span>
        </div>
        <div>
          Total Credit: <span className="text-emerald-400">{fmtn(totCr)}</span>
        </div>
        <div>
          Difference:{' '}
          <span className={balanced ? 'text-emerald-400' : 'text-amber-400'}>
            {fmtn(Math.abs(totDr - totCr))} {balanced ? '✓ Balanced' : '⚠ Unbalanced'}
          </span>
        </div>
      </div>

      {/* Inventory Movements */}
      {invMode && (
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inventory Movement ({vtype === 'Sales' ? 'Stock Out' : 'Stock In'})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickItemModal(true)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded border border-slate-700"
              >
                ➕ Create Stock Item
              </button>
              <button
                onClick={() => setInv(v => [...v, { item: '', qty: '', rate: '', dir: vtype === 'Sales' ? 'out' : 'in' }])}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700"
              >
                + Item Line
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {inv.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                <div className="col-span-5">
                  <select
                    value={r.item}
                    onChange={e => setInv(v => v.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— Select Stock Item —</option>
                    {co.stockItems.map(it => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={r.qty}
                    onChange={e => setInv(v => v.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={r.rate}
                    onChange={e => setInv(v => v.map((x, j) => (j === i ? { ...x, rate: e.target.value } : x)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setInv(v => v.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Uploads: Bill Photo / Proceedings Copy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Bill / Invoice Attachment (JPG / PNG / PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={e => handleFileUpload(e, false)}
            className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
          />
          {billAttachment && (
            <div className="text-xs text-emerald-400 mt-1">📎 Bill Attached: {billAttachment.name}</div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Proceedings / Board Approval Copy (Mandatory/Required for Expenses)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={e => handleFileUpload(e, true)}
            className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
          />
          {proceedingsAttachment && (
            <div className="text-xs text-emerald-400 mt-1">
              📜 Proceedings Attached: {proceedingsAttachment.name}
            </div>
          )}
        </div>
      </div>

      {/* Narration */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Narration / Description</label>
        <textarea
          rows={2}
          value={narration}
          onChange={e => setNarration(e.target.value)}
          placeholder="Being..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      {backdatedFlag && (
        <div>
          <label className="block text-xs font-medium text-amber-300 mb-1">
            Justification Memo (Mandatory for Backdated Entry)
          </label>
          <textarea
            rows={2}
            value={justify}
            onChange={e => setJustify(e.target.value)}
            placeholder="Reason for backdated voucher submission..."
            className="w-full bg-slate-800 border border-amber-700 rounded-lg p-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

      {msg && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            msg.startsWith('✓')
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/50 border-amber-800 text-amber-300'
          }`}
        >
          {msg}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={save}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
        >
          {editing ? 'Update Voucher' : 'Save &amp; Post Voucher'}
        </button>
      </div>

      {/* Quick Add Ledger Modal */}
      {showQuickLedgerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Quick Create New Ledger</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Ledger Name</label>
              <input
                value={quickLedgerName}
                onChange={e => setQuickLedgerName(e.target.value)}
                placeholder="e.g. Labour Expenses / Office Rent"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Group</label>
              <select
                value={quickLedgerGroup}
                onChange={e => setQuickLedgerGroup(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
              >
                {co.groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowQuickLedgerModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={saveQuickLedger}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
              >
                Create Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Stock Item Modal */}
      {showQuickItemModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Quick Create Stock Item</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Item Name</label>
              <input
                value={quickItemName}
                onChange={e => setQuickItemName(e.target.value)}
                placeholder="e.g. Paddy / Mustard Seed"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Unit</label>
                <input
                  value={quickItemUnit}
                  onChange={e => setQuickItemUnit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rate ₹</label>
                <input
                  type="number"
                  value={quickItemRate}
                  onChange={e => setQuickItemRate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">HSN Code</label>
                <input
                  value={quickItemHsn}
                  onChange={e => setQuickItemHsn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">GST %</label>
                <input
                  type="number"
                  value={quickItemGst}
                  onChange={e => setQuickItemGst(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowQuickItemModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={saveQuickItem}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
              >
                Create Stock Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
