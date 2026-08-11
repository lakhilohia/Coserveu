import React, { useState } from 'react';
import { Company } from '../types';
import { computeEngine, computePL, fmt, fmtn } from '../utils/engine';

interface FinancialStatementsProps {
  co: Company;
  view: 'trial' | 'pl' | 'bs' | 'schedule3';
  setDrill: (d: any) => void;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({ co, view, setDrill }) => {
  // Period filter states
  const [fromDate, setFromDate] = useState<string>(''); // Default empty = All Time (Poora Data)
  const [toDate, setToDate] = useState<string>('');

  const eng = computeEngine(co, fromDate, toDate);
  const pl = computePL(co, eng);

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
    } else if (preset === 'Q1') {
      setFromDate('2025-04-01');
      setToDate('2025-06-30');
    } else if (preset === 'Q2') {
      setFromDate('2025-07-01');
      setToDate('2025-09-30');
    } else if (preset === 'Q3') {
      setFromDate('2025-10-01');
      setToDate('2025-12-31');
    } else if (preset === 'Q4') {
      setFromDate('2026-01-01');
      setToDate('2026-03-31');
    }
  };

  // Expanded nodes state for P&L and Balance Sheet
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    g_pur: true,
    g_sales: true,
    g_cap: true,
    g_cred: true,
    g_deb: true,
    g_bank: true,
    g_cash: true,
    g_fa: true,
  });

  const toggleNode = (key: string) => {
    setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const allKeys: Record<string, boolean> = {};
    co.groups.forEach(g => (allKeys[g.id] = true));
    setExpandedNodes(allKeys);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Group ledgers by group for expandable P&L / BS
  const getGroupLedgers = (groupId: string) => {
    return co.ledgers.filter(l => {
      const b = eng.bal[l.id];
      if (!b) return false;
      const rootId = b.root?.id;
      const directGrp = l.grp;
      let matchesGroup = directGrp === groupId || rootId === groupId;
      if (!matchesGroup) {
        let p = eng.grpById[directGrp]?.parent;
        while (p) {
          if (p === groupId) {
            matchesGroup = true;
            break;
          }
          p = eng.grpById[p]?.parent;
        }
      }
      return matchesGroup && (Math.abs(b.signed) > 0.005 || l.ob);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Header with Navigation Hint */}
      <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            {view === 'trial' && '⚖️ Trial Balance'}
            {view === 'pl' && '📈 Statement of Profit & Loss (Expandable Nodes)'}
            {view === 'bs' && '🏦 Balance Sheet (Expandable Nodes)'}
            {view === 'schedule3' && '📓 Schedule III Notes to Financial Statements'}
          </h2>
          <p className="text-xs text-slate-400">
            Period: {fromDate || 'Start'} to {toDate || 'End'} · Schedule III, Companies Act 2013 &amp; Income Tax Act Compliant
          </p>
        </div>

        {(view === 'pl' || view === 'bs' || view === 'schedule3') && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-2.5 py-1 rounded border border-slate-700 font-medium"
            >
              ▼ Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2.5 py-1 rounded border border-slate-700 font-medium"
            >
              ▶ Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Tally Style Period Filter Bar (Alt + F2) */}
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
                ✕ Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-400 mr-1">Quick Presets:</span>
          <button
            onClick={() => setPeriodPreset('ALL')}
            className={`px-2.5 py-0.5 rounded border transition-colors ${
              !fromDate && !toDate
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            🌐 All Time (Poora Data)
          </button>
          <button
            onClick={() => setPeriodPreset('FY2526')}
            className={`px-2.5 py-0.5 rounded border transition-colors ${
              fromDate === '2025-04-01' && toDate === '2026-03-31'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            FY 2025-26
          </button>
          <button
            onClick={() => setPeriodPreset('FY2425')}
            className={`px-2.5 py-0.5 rounded border transition-colors ${
              fromDate === '2024-04-01' && toDate === '2025-03-31'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            FY 2024-25
          </button>
          <button
            onClick={() => setPeriodPreset('FY2627')}
            className={`px-2.5 py-0.5 rounded border transition-colors ${
              fromDate === '2026-04-01' && toDate === '2027-03-31'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            FY 2026-27
          </button>
          <button
            onClick={() => setPeriodPreset('Q1')}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded"
          >
            Q1
          </button>
          <button
            onClick={() => setPeriodPreset('Q2')}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded"
          >
            Q2
          </button>
          <button
            onClick={() => setPeriodPreset('Q3')}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded"
          >
            Q3
          </button>
          <button
            onClick={() => setPeriodPreset('Q4')}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded"
          >
            Q4
          </button>
        </div>
      </div>

      {/* Step-by-Step Tally Navigation & CA Auditor Banner */}
      <div className="p-3 bg-blue-950/40 border border-blue-800/80 rounded-xl text-xs text-blue-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span>
            <strong>CA Step-by-Step Drill-Down:</strong> <span className="font-mono text-amber-300">Gateway of Books &gt; {view.toUpperCase()} &gt; Sub-Group &gt; Ledger &gt; Date-wise Vouchers</span>. Click any ledger row to inspect vouchers for the selected period.
          </span>
        </div>
      </div>

      {/* TRIAL BALANCE */}
      {view === 'trial' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Ledger Name</th>
                <th className="py-2.5 px-3">Under Group</th>
                <th className="py-2.5 px-3 text-right">Debit Balance ₹</th>
                <th className="py-2.5 px-3 text-right">Credit Balance ₹</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {co.ledgers
                .map(l => ({ l, b: eng.bal[l.id] }))
                .filter(r => Math.abs(r.b?.signed || 0) > 0.005 || r.l.ob)
                .map(({ l, b }) => (
                  <tr
                    key={l.id}
                    onClick={() => setDrill({ ledgerId: l.id })}
                    className="hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>📜</span>
                      <span className="hover:underline hover:text-blue-300">{l.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{eng.grpById[l.grp]?.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-red-400">
                      {b.signed > 0 ? fmtn(b.signed) : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-400">
                      {b.signed < 0 ? fmtn(-b.signed) : ''}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-700">
                        Drill Down
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EXPANDABLE PROFIT & LOSS */}
      {view === 'pl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Expenses & Cost of Goods Sold */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                I. Trading Expenses (Dr)
              </h3>

              {/* Purchases Node */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleNode('g_pur')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_pur'] ? '▼' : '▶'}</span>
                    <span>Purchases (Direct)</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.purchase)}</span>
                </div>
                {expandedNodes['g_pur'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_pur').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Expenses Node */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleNode('g_de')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_de'] ? '▼' : '▶'}</span>
                    <span>Direct Manufacturing / Agri Expenses</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.directExp)}</span>
                </div>
                {expandedNodes['g_de'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_de').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Indirect Expenses Node */}
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase">II. Indirect Expenses</h4>
                <div
                  onClick={() => toggleNode('g_ie')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_ie'] ? '▼' : '▶'}</span>
                    <span>Administrative, Salary &amp; Office Expenses</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.indExp)}</span>
                </div>
                {expandedNodes['g_ie'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_ie').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Income & Gross / Net Profit */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                Revenue &amp; Income (Cr)
              </h3>

              {/* Sales Node */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleNode('g_sales')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_sales'] ? '▼' : '▶'}</span>
                    <span>Revenue from Operations (Sales)</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.sales)}</span>
                </div>
                {expandedNodes['g_sales'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_sales').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Incomes Node */}
              <div className="space-y-1">
                <div
                  onClick={() => toggleNode('g_di')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_di'] ? '▼' : '▶'}</span>
                    <span>Other Operating Incomes</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.directInc)}</span>
                </div>
                {expandedNodes['g_di'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_di').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Closing Stock */}
              <div className="flex justify-between p-2 bg-slate-800 rounded text-xs font-semibold">
                <span className="text-slate-200">Closing Stock Valuation</span>
                <span className="font-mono text-slate-100">{fmt(pl.closingStock)}</span>
              </div>

              {/* Indirect Incomes Node */}
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase">Other Incomes &amp; Subsidies</h4>
                <div
                  onClick={() => toggleNode('g_ii')}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-blue-400 font-bold">{expandedNodes['g_ii'] ? '▼' : '▶'}</span>
                    <span>Grant Incomes &amp; Other Non-Operating Incomes</span>
                  </span>
                  <span className="font-mono text-slate-100">{fmt(pl.indInc)}</span>
                </div>
                {expandedNodes['g_ii'] && (
                  <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                    {getGroupLedgers('g_ii').map(l => (
                      <div
                        key={l.id}
                        onClick={() => setDrill({ ledgerId: l.id })}
                        className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                          <span>📜</span> {l.name}
                        </span>
                        <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4 text-sm font-bold">
            <div>
              Gross Profit / (Loss):{' '}
              <span className={`font-mono ${pl.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(pl.grossProfit)}
              </span>
            </div>
            <div>
              Net Profit / (Loss) After Tax:{' '}
              <span className={`font-mono ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(pl.netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDABLE BALANCE SHEET */}
      {view === 'bs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liabilities */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>I. Equity &amp; Liabilities</span>
                <span className="text-[10px] text-slate-400 font-normal">Schedule III Format</span>
              </h3>

              {['g_cap', 'g_loan', 'g_cl', 'g_dt', 'g_cred', 'g_prov'].map(grpId => {
                const grp = eng.grpById[grpId];
                if (!grp) return null;
                const grpLeds = getGroupLedgers(grpId);
                const sum = grpLeds.reduce((s, l) => s + Math.abs(eng.bal[l.id]?.signed || 0), 0);

                return (
                  <div key={grpId} className="space-y-1">
                    <div
                      onClick={() => toggleNode(grpId)}
                      className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                    >
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <span className="text-blue-400 font-bold">{expandedNodes[grpId] ? '▼' : '▶'}</span>
                        <span>{grp.name}</span>
                      </span>
                      <span className="font-mono text-slate-100">{fmt(sum)}</span>
                    </div>

                    {expandedNodes[grpId] && (
                      <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                        {grpLeds.map(l => (
                          <div
                            key={l.id}
                            onClick={() => setDrill({ ledgerId: l.id })}
                            className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                          >
                            <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                              <span>📜</span> {l.name}
                            </span>
                            <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                          </div>
                        ))}
                        {grpLeds.length === 0 && (
                          <div className="text-[11px] text-slate-500 italic py-1 px-2">No active ledgers in this group.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Profit & Loss Surplus */}
              <div className="flex justify-between p-2 bg-slate-800 rounded text-xs font-semibold">
                <span className="text-slate-200">Surplus / (Deficit) from P&amp;L Statement</span>
                <span className={`font-mono ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(pl.netProfit)}
                </span>
              </div>
            </div>

            {/* Assets */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>II. Assets</span>
                <span className="text-[10px] text-slate-400 font-normal">Property &amp; Current Assets</span>
              </h3>

              {['g_fa', 'g_inv', 'g_ca', 'g_bank', 'g_cash', 'g_deb', 'g_stk', 'g_la'].map(grpId => {
                const grp = eng.grpById[grpId];
                if (!grp) return null;
                const grpLeds = getGroupLedgers(grpId);
                const sum = grpLeds.reduce((s, l) => s + Math.abs(eng.bal[l.id]?.signed || 0), 0);

                return (
                  <div key={grpId} className="space-y-1">
                    <div
                      onClick={() => toggleNode(grpId)}
                      className="flex items-center justify-between p-2 bg-slate-800 rounded cursor-pointer text-xs font-semibold hover:bg-slate-700/60"
                    >
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <span className="text-blue-400 font-bold">{expandedNodes[grpId] ? '▼' : '▶'}</span>
                        <span>{grp.name}</span>
                      </span>
                      <span className="font-mono text-slate-100">{fmt(sum)}</span>
                    </div>

                    {expandedNodes[grpId] && (
                      <div className="pl-6 space-y-1 py-1 border-l-2 border-blue-900 ml-2">
                        {grpLeds.map(l => (
                          <div
                            key={l.id}
                            onClick={() => setDrill({ ledgerId: l.id })}
                            className="flex justify-between items-center text-xs text-slate-300 py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
                          >
                            <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                              <span>📜</span> {l.name}
                            </span>
                            <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                          </div>
                        ))}
                        {grpLeds.length === 0 && (
                          <div className="text-[11px] text-slate-500 italic py-1 px-2">No active ledgers in this group.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Stock Valuation */}
              <div className="flex justify-between p-2 bg-slate-800 rounded text-xs font-semibold">
                <span className="text-slate-200">Closing Inventories / Stock-in-Hand Valuation</span>
                <span className="font-mono text-slate-100">{fmt(eng.stockVal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE III NOTES WITH DRILL DOWN */}
      {view === 'schedule3' && (
        <div className="space-y-6 text-xs text-slate-300">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Note 1: Share Capital Details</h3>
              <span className="text-[10px] text-slate-400">Companies Act Sec 68 / FPO Shares</span>
            </div>
            <p className="text-slate-400">Authorised Share Capital: 1,50,000 Equity Shares of ₹10 each = ₹15,00,000</p>
            <p className="text-slate-400">
              Issued, Subscribed &amp; Paid-up Capital: {co.shares?.reduce((s, x) => s + x.numberOfShares, 0) || 0} Equity
              Shares of ₹10 each = {fmt((co.shares?.reduce((s, x) => s + x.numberOfShares, 0) || 0) * 10)}
            </p>

            <div className="pt-2">
              <span className="text-slate-300 font-bold block mb-1">Subscribed Share Capital Ledgers:</span>
              <div className="space-y-1 pl-3 border-l-2 border-slate-700">
                {getGroupLedgers('g_cap').map(l => (
                  <div
                    key={l.id}
                    onClick={() => setDrill({ ledgerId: l.id })}
                    className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800 cursor-pointer text-slate-200"
                  >
                    <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                      <span>📜</span> {l.name}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Note 2: Reserves &amp; Surplus</h3>
              <span className="text-[10px] text-slate-400">Sec 581ZI Statutory Reserve</span>
            </div>
            <p className="text-slate-400">
              General / Producer Company Statutory Reserve Fund: ₹0.00
            </p>
            <p className="text-slate-400">Surplus / (Deficit) from Statement of Profit &amp; Loss: <strong className="text-emerald-400 font-mono">{fmt(pl.netProfit)}</strong></p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Note 3: Trade Payables &amp; MSME Creditors</h3>
              <span className="text-[10px] text-amber-400 font-bold">MSMED Act 2006 &amp; 43B(h)</span>
            </div>
            <div className="space-y-1 pl-3 border-l-2 border-slate-700">
              {getGroupLedgers('g_cred').map(l => (
                <div
                  key={l.id}
                  onClick={() => setDrill({ ledgerId: l.id })}
                  className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800 cursor-pointer text-slate-200"
                >
                  <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                    <span>🏢</span> {l.name} {l.gstin ? `(GSTIN: ${l.gstin})` : ''}
                  </span>
                  <span className="font-mono text-amber-300">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                </div>
              ))}
              {getGroupLedgers('g_cred').length === 0 && (
                <p className="text-slate-500 italic py-1">No outstanding trade payables recorded.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Note 6: Property, Plant &amp; Equipment (FAR)</h3>
              <span className="text-[10px] text-slate-400">Depreciation SLM / WDV Schedule</span>
            </div>
            <div className="space-y-1 pl-3 border-l-2 border-slate-700">
              {getGroupLedgers('g_fa').map(l => (
                <div
                  key={l.id}
                  onClick={() => setDrill({ ledgerId: l.id })}
                  className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800 cursor-pointer text-slate-200"
                >
                  <span className="hover:underline hover:text-blue-300 flex items-center gap-1">
                    <span>🚜</span> {l.name}
                  </span>
                  <span className="font-mono text-slate-200">{fmt(Math.abs(eng.bal[l.id]?.signed || 0))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
