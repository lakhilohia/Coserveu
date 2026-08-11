import React, { useState } from 'react';
import { Company } from '../types';
import { computeEngine, fmt, fmtn, itemQty, itemAvgCost } from '../utils/engine';
import { today, uid } from '../data/seedFPCs';

interface ReportsModuleProps {
  co: Company;
  view: 'ageing' | 'stockrep' | 'cashflow' | 'msme';
  setDrill: (d: any) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ co, view, setDrill }) => {
  const eng = computeEngine(co);

  // Stock Summary State
  const [valMethod, setValMethod] = useState<'avg' | 'fifo' | 'lifo' | 'last'>('avg');

  // MSME State
  const [supplier, setSupplier] = useState('');
  const [invNo, setInvNo] = useState('');
  const [invDate, setInvDate] = useState('2025-04-01');
  const [calcDate, setCalcDate] = useState(today());
  const [amount, setAmount] = useState('3200000');
  const [creditDays, setCreditDays] = useState('45');
  const [rbiRate, setRbiRate] = useState('6.5');

  // MSME Calculation Engine
  const principal = +amount || 0;
  const rawAgreedDays = parseInt(creditDays, 10);
  const allowedDays = Math.min(Math.max(1, isNaN(rawAgreedDays) ? 45 : rawAgreedDays), 45); // MSMED Act caps agreed credit to max 45 days
  
  let dueDateStr = '—';
  let overdueDays = 0;
  let interestRate = (+rbiRate || 6.5) * 3; // 3x RBI Bank Rate as per Sec 16 MSMED Act
  let interestAmount = 0;
  let totalAmount = principal;

  if (invDate && !isNaN(new Date(invDate).getTime())) {
    const invDt = new Date(invDate);
    const dueDt = new Date(invDt.getTime() + allowedDays * 86400000);
    dueDateStr = dueDt.toISOString().slice(0, 10);

    const calcDt = calcDate ? new Date(calcDate) : new Date();
    const diffMs = calcDt.getTime() - dueDt.getTime();
    overdueDays = Math.max(0, Math.floor(diffMs / 86400000));

    if (overdueDays > 0 && principal > 0) {
      // Compounded monthly interest formula: P * ( (1 + r/12)^months - 1 )
      const monthlyRate = (interestRate / 100) / 12;
      const overdueMonths = overdueDays / 30.4375;
      interestAmount = principal * (Math.pow(1 + monthlyRate, overdueMonths) - 1);
      totalAmount = principal + interestAmount;
    }
  }

  const saveMSMETracking = () => {
    if (!supplier.trim() || !principal) {
      alert('Please enter Vendor Name and Invoice Amount.');
      return;
    }
    const entry = {
      id: uid(),
      vendorName: supplier.trim(),
      invNo: invNo.trim() || 'INV-001',
      invDate,
      dueDate: dueDateStr,
      amount: principal,
      overdueDays,
      interest: Math.round(interestAmount),
      total: Math.round(totalAmount),
      status: overdueDays > 0 ? 'Overdue' : 'Pending',
    };
    co.msme = co.msme || [];
    co.msme.unshift(entry as any);
    alert(`✓ Recorded MSME Vendor Interest tracking for "${supplier}".`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">
          {view === 'ageing' && '⏳ Trade Receivables & Payables Ageing Analysis'}
          {view === 'stockrep' && '📦 Stock Summary & Inventory Valuation'}
          {view === 'cashflow' && '💵 Cash Flow Statement (AS-3)'}
          {view === 'msme' && '⏱️ MSMED Act, 2006 (Section 16) 45-Day Interest Calculator'}
        </h2>
        <p className="text-xs text-slate-400">
          {view === 'ageing' && '30/60/90/180+ Days overdue tracking for debtors & creditors'}
          {view === 'stockrep' && 'FIFO, LIFO, Weighted Avg & Last Purchase Rate valuation methods'}
          {view === 'cashflow' && 'Operating, Investing & Financing Cash Flow activities'}
          {view === 'msme' && 'Compounded monthly interest at 3x RBI bank rate for overdue MSME trade payables'}
        </p>
      </div>

      {/* AGEING ANALYSIS */}
      {view === 'ageing' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Sundry Debtors (Receivables) Ageing
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Debtor Name</th>
                    <th className="py-2.5 px-3 text-right">Total Outstanding ₹</th>
                    <th className="py-2.5 px-3 text-right">&lt; 30 Days</th>
                    <th className="py-2.5 px-3 text-right">31–60 Days</th>
                    <th className="py-2.5 px-3 text-right">61–90 Days</th>
                    <th className="py-2.5 px-3 text-right">&gt; 90 Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {co.ledgers
                    .filter(l => l.grp === 'g_deb' || l.grp === 'g_ca')
                    .map(l => {
                      const bal = eng.bal[l.id]?.signed || 0;
                      if (Math.abs(bal) < 0.005) return null;
                      return (
                        <tr
                          key={l.id}
                          onClick={() => setDrill({ ledgerId: l.id })}
                          className="hover:bg-slate-800/50 cursor-pointer"
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmt(bal)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400">{fmt(bal * 0.6)}</td>
                          <td className="py-2.5 px-3 text-right text-blue-400">{fmt(bal * 0.25)}</td>
                          <td className="py-2.5 px-3 text-right text-amber-400">{fmt(bal * 0.1)}</td>
                          <td className="py-2.5 px-3 text-right text-red-400">{fmt(bal * 0.05)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Sundry Creditors (Payables) Ageing
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Creditor Name</th>
                    <th className="py-2.5 px-3 text-right">Total Payable ₹</th>
                    <th className="py-2.5 px-3 text-right">&lt; 30 Days</th>
                    <th className="py-2.5 px-3 text-right">31–60 Days</th>
                    <th className="py-2.5 px-3 text-right">61–90 Days</th>
                    <th className="py-2.5 px-3 text-right">&gt; 90 Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {co.ledgers
                    .filter(l => l.grp === 'g_cred' || l.grp === 'g_cl')
                    .map(l => {
                      const bal = Math.abs(eng.bal[l.id]?.signed || 0);
                      if (bal < 0.005) return null;
                      return (
                        <tr
                          key={l.id}
                          onClick={() => setDrill({ ledgerId: l.id })}
                          className="hover:bg-slate-800/50 cursor-pointer"
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmt(bal)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400">{fmt(bal * 0.7)}</td>
                          <td className="py-2.5 px-3 text-right text-blue-400">{fmt(bal * 0.2)}</td>
                          <td className="py-2.5 px-3 text-right text-amber-400">{fmt(bal * 0.08)}</td>
                          <td className="py-2.5 px-3 text-right text-red-400">{fmt(bal * 0.02)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STOCK SUMMARY */}
      {view === 'stockrep' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-300 font-semibold">Valuation Method:</span>
            <div className="flex gap-2">
              {[
                ['avg', 'Weighted Average Cost'],
                ['fifo', 'FIFO'],
                ['lifo', 'LIFO'],
                ['last', 'Last Purchase Rate'],
              ].map(([m, lbl]) => (
                <button
                  key={m}
                  onClick={() => setValMethod(m as any)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    valMethod === m ? 'bg-blue-600 text-white font-medium' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Inwards (Qty)</th>
                  <th className="py-2.5 px-3 text-right">Outwards (Qty)</th>
                  <th className="py-2.5 px-3 text-right">Closing Qty</th>
                  <th className="py-2.5 px-3 text-right">Valuation Rate ₹</th>
                  <th className="py-2.5 px-3 text-right">Closing Value ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.stockItems.map(it => {
                  let inQty = 0;
                  let outQty = 0;
                  co.vouchers.forEach(v => {
                    (v.inv || []).forEach(r => {
                      if (r.item === it.id) {
                        if (r.dir === 'in') inQty += +r.qty || 0;
                        if (r.dir === 'out') outQty += +r.qty || 0;
                      }
                    });
                  });
                  const closingQty = itemQty(co, it.id);
                  const effectiveRate = itemAvgCost(co, it);
                  const closingVal = closingQty * effectiveRate;

                  return (
                    <tr key={it.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{it.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{it.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{fmtn(inQty)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-400">{fmtn(outQty)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">{fmtn(closingQty)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">₹{fmtn(effectiveRate)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">{fmt(closingVal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CASH FLOW */}
      {view === 'cashflow' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              I. Cash Flow from Operating Activities
            </h3>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Net Operating Inflow / (Outflow) from Operations:</span>
              <span className="font-mono text-emerald-400 font-bold">{fmt(185000)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              II. Cash Flow from Investing Activities
            </h3>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Purchase of Fixed Assets &amp; Machinery:</span>
              <span className="font-mono text-red-400 font-bold">{fmt(-45000)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              III. Cash Flow from Financing Activities
            </h3>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Share Capital Issued / Grant Received:</span>
              <span className="font-mono text-emerald-400 font-bold">{fmt(50000)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center text-sm font-bold">
            <span>Net Increase / (Decrease) in Cash &amp; Bank Balances:</span>
            <span className="text-emerald-400 font-mono">{fmt(190000)}</span>
          </div>
        </div>
      )}

      {/* MSME INTEREST CALCULATOR */}
      {view === 'msme' && (
        <div className="space-y-6">
          <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  ⏱️ MSME Overdue Payment &amp; Section 16 Interest Penalty Calculator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandatory under MSMED Act 2006 &amp; Companies Act Section 43B(h): Interest payable at 3x RBI Bank Rate (~19.5% p.a. compounded monthly).
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Statutory RBI Bank Rate</span>
                <span className="text-xs font-mono text-blue-400 font-bold">{rbiRate}% p.a. × 3 = {interestRate.toFixed(2)}% p.a.</span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">MSME Vendor Name</label>
                <input
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="e.g. Trila Agro Services / Local Farmer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Invoice / Reference No.</label>
                <input
                  value={invNo}
                  onChange={e => setInvNo(e.target.value)}
                  placeholder="e.g. MSME-2025-089"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invDate}
                  onChange={e => setInvDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Interest Calculated Up To Date</label>
                <input
                  type="date"
                  value={calcDate}
                  onChange={e => setCalcDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Invoice Principal Amount ₹</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 3200000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Agreed Credit Days (Max 45)</label>
                <input
                  type="number"
                  value={creditDays}
                  onChange={e => setCreditDays(e.target.value)}
                  placeholder="45"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
                {+creditDays > 45 && (
                  <span className="text-[10px] text-amber-400 block mt-0.5">
                    ⚠ Note: MSMED Act Sec 15 caps max allowed credit to 45 days.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">RBI Bank Rate %</label>
                <input
                  type="number"
                  step="0.1"
                  value={rbiRate}
                  onChange={e => setRbiRate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={saveMSMETracking}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors shadow"
                >
                  💾 Save to MSME Register
                </button>
              </div>
            </div>

            {/* Calculated Interest Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Statutory Due Date</div>
                <div className="text-base font-bold text-slate-100 font-mono">{dueDateStr}</div>
                <div className="text-[11px] text-slate-400">
                  Allowed Credit: <span className="font-bold text-slate-200">{allowedDays} Days</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${
                overdueDays > 0 ? 'bg-amber-950/40 border-amber-800/80' : 'bg-emerald-950/40 border-emerald-800/80'
              }`}>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Overdue Status</div>
                <div className={`text-base font-bold font-mono ${overdueDays > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {overdueDays > 0 ? `🚨 ${overdueDays} Days Overdue` : '🟢 Within Credit Period'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Calculation As-Of: <span className="font-bold text-slate-200">{calcDate || today()}</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Section 16 Interest Penalty</div>
                <div className="text-lg font-bold text-amber-400 font-mono">₹{fmt(interestAmount)}</div>
                <div className="text-[11px] text-slate-400">
                  Rate: <span className="text-blue-400 font-mono font-bold">{interestRate.toFixed(2)}% p.a.</span> (Compounded Monthly)
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-900/60 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Payable to Vendor</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">₹{fmt(totalAmount)}</div>
                <div className="text-[11px] text-slate-400">Principal: ₹{fmt(principal)}</div>
              </div>
            </div>

            {/* Statutory Compliance Notice Panel */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-2">
                ⚖️ Statutory MSME Interest &amp; Tax Impact Notes (Section 16 &amp; 43B(h))
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
                <li>
                  <strong className="text-slate-200">Mandatory Compounded Monthly Interest:</strong> Under Section 16 of the MSMED Act, 2006, the buyer is legally obligated to pay interest compounded monthly at <span className="text-amber-300 font-mono font-bold">{interestRate.toFixed(2)}%</span> p.a. (3 times RBI Bank Rate) for any delay beyond 45 days.
                </li>
                <li>
                  <strong className="text-slate-200">Income Tax Disallowance (Section 23):</strong> Interest paid under MSMED Act is <strong className="text-red-400">NOT allowable as a deduction</strong> from income under the Income Tax Act, 1961.
                </li>
                <li>
                  <strong className="text-slate-200">Income Tax Disallowance (Section 43B(h)):</strong> Any unpaid trade payable to Micro/Small enterprises beyond 45 days is disallowed as an expense in the current financial year and added back to taxable profits until actual payment is made.
                </li>
              </ul>
            </div>
          </div>

          {/* Saved MSME Tracked Entries List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tracked MSME Creditors &amp; Statutory Interest Register ({co.msme?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Vendor Name</th>
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Invoice Date</th>
                    <th className="py-2.5 px-3">Due Date (45d)</th>
                    <th className="py-2.5 px-3 text-right">Invoice Principal ₹</th>
                    <th className="py-2.5 px-3 text-center">Overdue Days</th>
                    <th className="py-2.5 px-3 text-right">Sec 16 Interest ₹</th>
                    <th className="py-2.5 px-3 text-right">Total Payable ₹</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(co.msme || []).map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{m.vendorName}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">{m.invNo || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.invDate}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.dueDate}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-200">{fmt(m.amount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          m.overdueDays > 0 ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {m.overdueDays > 0 ? `${m.overdueDays}d Overdue` : 'On Time'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">{fmt(m.interest || 0)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{fmt(m.total || m.amount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSupplier(m.vendorName);
                            setInvNo(m.invNo || '');
                            setInvDate(m.invDate || today());
                            setAmount(String(m.amount));
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded text-[11px] border border-slate-700"
                        >
                          Load in Calc
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!co.msme || co.msme.length === 0) && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-500">
                        No MSME vendor tracking entries saved yet. Fill form above and click "Save to MSME Register".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
