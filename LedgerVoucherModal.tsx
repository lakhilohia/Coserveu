import React, { useState } from 'react';
import { Company, Ledger, Voucher } from '../types';
import { computeEngine, fmt, fmtn } from '../utils/engine';

interface LedgerVoucherModalProps {
  co: Company;
  ledgerId: string;
  onClose: () => void;
  onSelectVoucher: (vid: string) => void;
  nav?: (page: string) => void;
  setDrill?: (d: any) => void;
}

export const LedgerVoucherModal: React.FC<LedgerVoucherModalProps> = ({
  co,
  ledgerId,
  onClose,
  onSelectVoucher,
}) => {
  const [fromDate, setFromDate] = useState<string>(''); // Default empty = All Time / Poora Data
  const [toDate, setToDate] = useState<string>('');

  const eng = computeEngine(co, fromDate, toDate);
  const ledger: Ledger | undefined = co.ledgers.find(l => l.id === ledgerId);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  if (!ledger) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 max-w-md">
          <p className="text-slate-300">Ledger record not found.</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const grp = eng.grpById[ledger.grp];
  const rootGrp = grp ? eng.rootGroup(grp) : null;

  // Raw vouchers involving this ledger
  const rawVouchers = co.vouchers.filter(v => v.entries.some(e => e.led === ledgerId));

  // Sort chronologically ascending
  const sortedVouchers = [...rawVouchers].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Compute prior period transactions before fromDate
  const initialOb = (+ledger.ob || 0) * (ledger.obt === 'Dr' ? 1 : -1);
  let priorNet = 0;

  const periodVouchers: Voucher[] = [];

  sortedVouchers.forEach(v => {
    const isBefore = fromDate && v.date < fromDate;
    const isAfter = toDate && v.date > toDate;

    if (isBefore) {
      v.entries.forEach(e => {
        if (e.led === ledgerId) {
          priorNet += (+e.dr || 0) - (+e.cr || 0);
        }
      });
    } else if (!isAfter) {
      periodVouchers.push(v);
    }
  });

  const periodOpeningVal = initialOb + priorNet;

  let runningSigned = periodOpeningVal;
  let totalDr = 0;
  let totalCr = 0;

  const ledgerRows = periodVouchers.map(v => {
    let vDr = 0;
    let vCr = 0;
    v.entries.forEach(e => {
      if (e.led === ledgerId) {
        vDr += +e.dr || 0;
        vCr += +e.cr || 0;
      }
    });

    totalDr += vDr;
    totalCr += vCr;

    // Opposite ledgers for "Particulars" column
    const oppositeLeds = v.entries
      .filter(e => e.led !== ledgerId)
      .map(e => eng.ledById[e.led]?.name || 'Particulars')
      .filter(Boolean);
    const particulars = oppositeLeds.length > 0 ? oppositeLeds.join(', ') : 'Self / Journal';

    // Update running balance
    runningSigned += vDr - vCr;

    return {
      v,
      vDr,
      vCr,
      particulars,
      runningSigned,
      partyName: v.partyName || (v.entries.find(e => e.led !== ledgerId)?.led ? eng.ledById[v.entries.find(e => e.led !== ledgerId)!.led]?.name : ''),
    };
  });

  // Apply UI filters
  const filteredRows = ledgerRows.filter(({ v, particulars, partyName }) => {
    if (filterType !== 'ALL' && v.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = v.no.toLowerCase().includes(q);
      const matchPart = particulars.toLowerCase().includes(q);
      const matchParty = (partyName || '').toLowerCase().includes(q);
      const matchNarr = (v.narration || '').toLowerCase().includes(q);
      if (!matchNo && !matchPart && !matchParty && !matchNarr) return false;
    }
    return true;
  });

  const closingSigned = runningSigned;

  // Quick preset helper
  const setPeriodPreset = (preset: string) => {
    if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'FY2526') {
      setFromDate('2025-04-01');
      setToDate('2026-03-31');
    } else if (preset === 'FY2425') {
      setFromDate('2024-04-01');
      setToDate('2025-03-31');
    } else if (preset === 'FY2627') {
      setFromDate('2026-04-01');
      setToDate('2027-03-31');
    }
  };

  // CA Auditor Checks
  const isCash = ledger.grp === 'g_cash' || ledger.name.toLowerCase().includes('cash');
  const hasNegativeCash = isCash && ledgerRows.some(r => r.runningSigned < 0);
  const isCreditor = ledger.grp === 'g_cred' || ledger.type === 'party';

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 w-full max-w-5xl space-y-5 shadow-2xl my-auto text-xs"
        onClick={e => e.stopPropagation()}
      >
        {/* Tally Style Breadcrumb Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] text-amber-400 font-mono tracking-wider flex items-center gap-1.5 uppercase font-semibold">
              <span>ERP Path:</span>
              <span className="text-slate-400">Gateway of Books</span>
              <span>›</span>
              <span className="text-slate-400">{rootGrp?.name || 'Reports'}</span>
              <span>›</span>
              <span className="text-slate-400">{grp?.name || 'Group'}</span>
              <span>›</span>
              <span className="text-amber-300 font-bold">{ledger.name}</span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
              📜 Ledger Vouchers Statement: <span className="text-blue-400">{ledger.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Period Filter Control Bar (Alt + F2) */}
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span>📅 Period Filter (Alt + F2):</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                <span className="text-slate-400 text-[11px]">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                <span className="text-slate-400 text-[11px]">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
                />
              </div>

              {(fromDate || toDate) && (
                <button
                  onClick={() => setPeriodPreset('ALL')}
                  className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-2.5 py-1 rounded font-medium text-[11px]"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 mr-1">Presets:</span>
            <button
              onClick={() => setPeriodPreset('ALL')}
              className={`px-2 py-0.5 rounded border ${
                !fromDate && !toDate
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              🌐 All Time (Poora Data)
            </button>
            <button
              onClick={() => setPeriodPreset('FY2526')}
              className={`px-2 py-0.5 rounded border ${
                fromDate === '2025-04-01' && toDate === '2026-03-31'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              FY 2025-26
            </button>
            <button
              onClick={() => setPeriodPreset('FY2425')}
              className={`px-2 py-0.5 rounded border ${
                fromDate === '2024-04-01' && toDate === '2025-03-31'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              FY 2024-25
            </button>
            <button
              onClick={() => setPeriodPreset('FY2627')}
              className={`px-2 py-0.5 rounded border ${
                fromDate === '2026-04-01' && toDate === '2027-03-31'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              FY 2026-27
            </button>
          </div>
        </div>

        {/* Ledger Summary Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Opening Balance B/F</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {fmt(Math.abs(periodOpeningVal))}{' '}
              <span className="text-[10px] text-slate-400">{periodOpeningVal >= 0 ? 'Dr' : 'Cr'}</span>
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Total Debit Entries</span>
            <span className="text-sm font-bold font-mono text-red-400">{fmt(totalDr)}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Total Credit Entries</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{fmt(totalCr)}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-blue-800">
            <span className="text-slate-400 block text-[10px] uppercase">Net Closing Balance</span>
            <span className={`text-sm font-bold font-mono ${closingSigned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(Math.abs(closingSigned))}{' '}
              <span className="text-[10px] text-slate-400">{closingSigned >= 0 ? 'Dr' : 'Cr'}</span>
            </span>
          </div>
        </div>

        {/* Auditor Alerts */}
        {hasNegativeCash && (
          <div className="bg-red-950/60 border border-red-800 p-3 rounded-lg text-xs text-red-200 flex items-center justify-between gap-2">
            <span>🚨 <strong>Audit Discrepancy Alert:</strong> Negative Cash Balance detected during transaction history! Cash balance must never go below ₹0. Check backdated entries.</span>
          </div>
        )}
        {isCreditor && (
          <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg text-xs text-amber-200 flex items-center justify-between gap-2">
            <span>⏳ <strong>MSME Section 16 &amp; 43B(h) Auditor Check:</strong> Verify payments are settled within 45 days to avoid mandatory 3x RBI interest penalty and income tax disallowances.</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Voucher No, Particulars, Party, Narration..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs">Type:</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Voucher Types</option>
              <option value="Purchase">Purchases</option>
              <option value="Sales">Sales</option>
              <option value="Payment">Payments</option>
              <option value="Receipt">Receipts</option>
              <option value="Journal">Journal</option>
              <option value="Contra">Contra</option>
            </select>
          </div>
        </div>

        {/* Date-wise Voucher Ledger Entries Table */}
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-lg border border-slate-800">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-800/80 sticky top-0 z-10 border-b border-slate-700">
              <tr className="text-slate-300 uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vch Type &amp; No</th>
                <th className="py-2.5 px-3">Particulars / Account</th>
                <th className="py-2.5 px-3">Supplier / Customer Party</th>
                <th className="py-2.5 px-3 text-right">Debit ₹</th>
                <th className="py-2.5 px-3 text-right">Credit ₹</th>
                <th className="py-2.5 px-3 text-right">Balance ₹</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* Opening Balance Row */}
              <tr className="bg-slate-800/30 text-slate-400 font-medium">
                <td className="py-2 px-3">{fromDate || co.fyStart}</td>
                <td className="py-2 px-3 font-mono">OB</td>
                <td className="py-2 px-3 italic" colSpan={2}>Opening Balance B/F</td>
                <td className="py-2 px-3 text-right font-mono">{periodOpeningVal > 0 ? fmtn(periodOpeningVal) : ''}</td>
                <td className="py-2 px-3 text-right font-mono">{periodOpeningVal < 0 ? fmtn(-periodOpeningVal) : ''}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-300">
                  {fmtn(Math.abs(periodOpeningVal))} {periodOpeningVal >= 0 ? 'Dr' : 'Cr'}
                </td>
                <td className="py-2 px-3 text-center">—</td>
              </tr>

              {filteredRows.map(({ v, vDr, vCr, particulars, partyName, runningSigned }) => (
                <tr key={v.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300 font-mono">{v.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-200">{v.type}</span>
                    <span className="text-slate-400 font-mono ml-1">#{v.no}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    <div>{particulars}</div>
                    {v.narration && (
                      <div className="text-[10px] text-slate-400 italic font-normal line-clamp-1">{v.narration}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium">
                    {partyName ? (
                      <span className="text-amber-300/90">{partyName}</span>
                    ) : (
                      <span className="text-slate-500 italic">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-400 font-semibold">
                    {vDr > 0 ? fmtn(vDr) : ''}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                    {vCr > 0 ? fmtn(vCr) : ''}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                    {fmtn(Math.abs(runningSigned))} {runningSigned >= 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectVoucher(v.id)}
                      className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 px-2.5 py-1 rounded text-[11px] font-medium border border-blue-700/60 transition-colors"
                      title="Open full voucher details"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No voucher entries found for this ledger matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-800/90 font-bold border-t border-slate-700 text-slate-100">
              <tr>
                <td colSpan={4} className="py-2.5 px-3">Total Transaction Volume</td>
                <td className="py-2.5 px-3 text-right font-mono text-red-400">{fmtn(totalDr)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{fmtn(totalCr)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-300" colSpan={2}>
                  {fmtn(Math.abs(closingSigned))} {closingSigned >= 0 ? 'Dr' : 'Cr'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
          <span className="text-slate-400">
            Showing <strong className="text-slate-200">{filteredRows.length}</strong> vouchers for {ledger.name}.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = ['Date', 'Voucher Type', 'Voucher No', 'Particulars', 'Party Name', 'Debit', 'Credit', 'Running Balance'];
                const rows = filteredRows.map(r => [
                  r.v.date,
                  r.v.type,
                  r.v.no,
                  `"${r.particulars.replace(/"/g, '""')}"`,
                  `"${(r.partyName || '').replace(/"/g, '""')}"`,
                  r.vDr || 0,
                  r.vCr || 0,
                  r.runningSigned || 0,
                ]);
                const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Ledger_${ledger.name.replace(/\s+/g, '_')}_Statement.csv`;
                a.click();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors font-medium"
            >
              📊 Export CSV
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
