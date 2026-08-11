import React, { useState } from 'react';
import { Company } from '../types';
import { computeEngine, computePL, fmt } from '../utils/engine';
import { COMPLIANCE } from '../data/seedFPCs';

interface DashboardProps {
  co: Company;
  nav: (p: string) => void;
  setDrill?: (d: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ co, nav, setDrill }) => {
  const [period, setPeriod] = useState<'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'MONTH'>('FY');
  const [monthSel, setMonthSel] = useState<string>(new Date().toISOString().slice(0, 7));
  const [activeModal, setActiveModal] = useState<
    'cash_bank' | 'receivables' | 'payables' | 'sales' | 'pl' | 'stock' | null
  >(null);

  const eng = computeEngine(co);

  // Cash & Bank
  const cashBankLedgers = co.ledgers.filter(l => ['g_cash', 'g_bank'].includes(l.grp));
  const cashBank = cashBankLedgers.reduce((s, l) => s + (eng.bal[l.id]?.signed || 0), 0);

  // Receivables & Payables
  const debtorLedgers = co.ledgers.filter(l => l.grp === 'g_deb' || l.grp === 'g_dr');
  const debtors = debtorLedgers.reduce((s, l) => s + Math.max(0, eng.bal[l.id]?.signed || 0), 0);

  const creditorLedgers = co.ledgers.filter(l => l.grp === 'g_cred');
  const creditors = creditorLedgers.reduce((s, l) => s + Math.abs(Math.min(0, eng.bal[l.id]?.signed || 0)), 0);

  const pl = computePL(co, eng);

  // Period filter for Sales calculation
  const salesVouchersList = co.vouchers
    .filter(v => v.type === 'Sales')
    .filter(v => {
      if (period === 'FY') return true;
      if (period === 'MONTH') return v.date.startsWith(monthSel);
      const m = parseInt(v.date.slice(5, 7), 10);
      if (period === 'Q1') return m >= 4 && m <= 6;
      if (period === 'Q2') return m >= 7 && m <= 9;
      if (period === 'Q3') return m >= 10 && m <= 12;
      if (period === 'Q4') return m >= 1 && m <= 3;
      return true;
    });

  const filteredSales = salesVouchersList.reduce(
    (s, v) => s + v.entries.reduce((a, e) => a + (+e.cr || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Period Filtration Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Overview Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time accounting summary &amp; compliance status. <span className="text-blue-400 font-medium">Click any metric card below to drill down!</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-400 font-medium">Period Filter:</label>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="FY">Full Financial Year ({co.fyStart} → {co.fyEnd})</option>
            <option value="Q1">Q1 (Apr - Jun)</option>
            <option value="Q2">Q2 (Jul - Sep)</option>
            <option value="Q3">Q3 (Oct - Dec)</option>
            <option value="Q4">Q4 (Jan - Mar)</option>
            <option value="MONTH">Specific Month</option>
          </select>

          {period === 'MONTH' && (
            <input
              type="month"
              value={monthSel}
              onChange={e => setMonthSel(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      </div>

      {/* KPI Grid with Click-to-Drill-Down */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Cash & Bank */}
        <div
          onClick={() => setActiveModal('cash_bank')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Cash &amp; Bank
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{fmt(cashBank)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{cashBankLedgers.length} Accounts</p>
        </div>

        {/* 2. Receivables */}
        <div
          onClick={() => setActiveModal('receivables')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Receivables
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{fmt(debtors)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{debtorLedgers.length} Debtors / Customers</p>
        </div>

        {/* 3. Payables */}
        <div
          onClick={() => setActiveModal('payables')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Payables
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{fmt(creditors)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{creditorLedgers.length} Creditors / Suppliers</p>
        </div>

        {/* 4. Sales */}
        <div
          onClick={() => setActiveModal('sales')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Sales ({period})
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{fmt(filteredSales)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{salesVouchersList.length} Invoices</p>
        </div>

        {/* 5. Net Profit (P&L) */}
        <div
          onClick={() => setActiveModal('pl')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Net Profit (P&amp;L)
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className={`text-xl font-bold mt-1 ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(pl.netProfit)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Trading &amp; Operating P&amp;L</p>
        </div>

        {/* 6. Stock Value */}
        <div
          onClick={() => setActiveModal('stock')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 rounded-xl p-4 cursor-pointer transition-all duration-150 group relative shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-400">
              Stock Value
            </div>
            <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Drill down 🔍
            </span>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">{fmt(eng.stockVal)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{co.stockItems.length} Items Listed</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Company Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3">Quick Navigation &amp; Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => nav('voucher')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                ✍️ New Voucher
              </button>
              <button
                onClick={() => nav('ledgers')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                📇 Add Ledger
              </button>
              <button
                onClick={() => nav('inventory')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                📦 Add Stock Item
              </button>
              <button
                onClick={() => nav('bs')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                🏦 Balance Sheet
              </button>
              <button
                onClick={() => nav('gst')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                🧮 GSTR-1
              </button>
              <button
                onClick={() => nav('share_reg')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors"
              >
                📜 Share Certificates
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-2">Company Books Stats <span className="text-[11px] text-slate-400 font-normal">(Click any row to drill down)</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr
                    onClick={() => nav('vouchers')}
                    className="border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-slate-300 font-medium">Total Vouchers Posted</td>
                    <td className="py-2.5 px-2 font-bold text-right text-blue-400">{co.vouchers.length} →</td>
                  </tr>
                  <tr
                    onClick={() => nav('masters')}
                    className="border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-slate-300 font-medium">Total Ledgers</td>
                    <td className="py-2.5 px-2 font-bold text-right text-blue-400">{co.ledgers.length} →</td>
                  </tr>
                  <tr
                    onClick={() => nav('inventory')}
                    className="border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-slate-300 font-medium">Stock Items</td>
                    <td className="py-2.5 px-2 font-bold text-right text-blue-400">{co.stockItems.length} →</td>
                  </tr>
                  <tr
                    onClick={() => nav('assets_reg')}
                    className="border-b border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-slate-300 font-medium">Fixed Assets</td>
                    <td className="py-2.5 px-2 font-bold text-right text-blue-400">{co.assets.length} →</td>
                  </tr>
                  <tr
                    onClick={() => nav('audittracker')}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-slate-300 font-medium">Audit Trail Events Recorded</td>
                    <td className="py-2.5 px-2 font-bold text-right text-blue-400">{co.audit.length} →</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Upcoming Statutory Compliances</h3>
            <button
              onClick={() => nav('calendar')}
              className="text-xs text-blue-400 hover:underline"
            >
              View Calendar →
            </button>
          </div>

          <div className="space-y-2">
            {COMPLIANCE.slice(0, 6).map((c, i) => (
              <div
                key={i}
                onClick={() => nav('calendar')}
                className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-800 cursor-pointer text-xs transition-colors"
              >
                <span className="font-medium text-slate-200">{c.task}</span>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {c.freq === 'Monthly' ? `${c.day}th monthly` : `${c.day}th qtr`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DRILL DOWN MODAL OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  {activeModal === 'cash_bank' && '🏦 Cash & Bank Drill-Down'}
                  {activeModal === 'receivables' && '📈 Sundry Debtors & Receivables Drill-Down'}
                  {activeModal === 'payables' && '📉 Sundry Creditors & Payables Drill-Down'}
                  {activeModal === 'sales' && `🏷️ Sales Drill-Down (${period})`}
                  {activeModal === 'pl' && '📊 Profit & Loss Drill-Down'}
                  {activeModal === 'stock' && '📦 Stock Valuation & Inventory Drill-Down'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed ledger balances and contributing voucher transactions
                </p>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* CASH & BANK DRILL-DOWN */}
              {activeModal === 'cash_bank' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Total Cash &amp; Bank Balance</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-0.5">{fmt(cashBank)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('cash_reg');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Open Cash Register →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account-Wise Balances</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Ledger Name</th>
                          <th className="py-2.5 px-3">Account Group</th>
                          <th className="py-2.5 px-3 text-right">Closing Balance</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {cashBankLedgers.map(l => {
                          const b = eng.bal[l.id]?.signed || 0;
                          return (
                            <tr key={l.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {l.grp === 'g_cash' ? 'Cash-in-hand' : 'Bank Accounts'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                                {fmt(b)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {setDrill && (
                                  <button
                                    onClick={() => {
                                      setActiveModal(null);
                                      setDrill({ ledgerId: l.id });
                                    }}
                                    className="text-blue-400 hover:underline text-xs font-medium"
                                  >
                                    View Statement 🔍
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* RECEIVABLES DRILL-DOWN */}
              {activeModal === 'receivables' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Total Sundry Debtors Outstanding</div>
                      <div className="text-2xl font-bold text-blue-400 mt-0.5">{fmt(debtors)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('ageing');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Open Receivables Ageing →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Debtor Ledger Balances</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Debtor Name</th>
                          <th className="py-2.5 px-3">GSTIN / Ref</th>
                          <th className="py-2.5 px-3 text-right">Outstanding Amount</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {debtorLedgers.map(l => {
                          const b = eng.bal[l.id]?.signed || 0;
                          return (
                            <tr key={l.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                              <td className="py-2.5 px-3 text-slate-400 font-mono">{l.gstin || 'Unregistered'}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                                {fmt(b)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {setDrill && (
                                  <button
                                    onClick={() => {
                                      setActiveModal(null);
                                      setDrill({ ledgerId: l.id });
                                    }}
                                    className="text-blue-400 hover:underline text-xs font-medium"
                                  >
                                    View Statement 🔍
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {debtorLedgers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-500">
                              No Sundry Debtors recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAYABLES DRILL-DOWN */}
              {activeModal === 'payables' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Total Sundry Creditors Outstanding</div>
                      <div className="text-2xl font-bold text-amber-400 mt-0.5">{fmt(creditors)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('purchase_reg');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Open Purchase Register →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Creditor Ledger Balances</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Creditor / Supplier Name</th>
                          <th className="py-2.5 px-3">GSTIN / Ref</th>
                          <th className="py-2.5 px-3 text-right">Outstanding Amount</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {creditorLedgers.map(l => {
                          const b = Math.abs(eng.bal[l.id]?.signed || 0);
                          return (
                            <tr key={l.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                              <td className="py-2.5 px-3 text-slate-400 font-mono">{l.gstin || 'Unregistered'}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                                {fmt(b)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {setDrill && (
                                  <button
                                    onClick={() => {
                                      setActiveModal(null);
                                      setDrill({ ledgerId: l.id });
                                    }}
                                    className="text-blue-400 hover:underline text-xs font-medium"
                                  >
                                    View Statement 🔍
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {creditorLedgers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-500">
                              No Sundry Creditors recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SALES DRILL-DOWN */}
              {activeModal === 'sales' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Total Period Sales ({period})</div>
                      <div className="text-2xl font-bold text-indigo-400 mt-0.5">{fmt(filteredSales)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('sales_reg');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Open Full Sales Register →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sales Invoices ({salesVouchersList.length})
                  </h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Invoice No</th>
                          <th className="py-2.5 px-3">Customer Party</th>
                          <th className="py-2.5 px-3 text-right">Amount ₹</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {salesVouchersList.map(v => {
                          const amt = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
                          return (
                            <tr key={v.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                              <td className="py-2.5 px-3 text-slate-300 font-mono">{v.invoiceNo || v.no}</td>
                              <td className="py-2.5 px-3 text-slate-200">{v.partyName || 'Cash Sale'}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                                {fmt(amt)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {setDrill && (
                                  <button
                                    onClick={() => {
                                      setActiveModal(null);
                                      setDrill({ voucherId: v.id });
                                    }}
                                    className="text-blue-400 hover:underline text-xs font-medium"
                                  >
                                    View Voucher 📄
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {salesVouchersList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              No sales vouchers recorded in this period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROFIT & LOSS DRILL-DOWN */}
              {activeModal === 'pl' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Net Profit / Loss</div>
                      <div
                        className={`text-2xl font-bold mt-0.5 ${
                          pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {fmt(pl.netProfit)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('pl');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Open Full P&amp;L Statement →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Financial Breakdown</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
                    <div className="p-3 bg-slate-800/40 flex justify-between items-center">
                      <span className="font-semibold text-slate-200">Sales / Operating Revenue</span>
                      <span className="font-mono font-bold text-emerald-400">{fmt(pl.sales)}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Direct Income &amp; Subsidies</span>
                      <span className="font-mono text-emerald-400">{fmt(pl.directInc)}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Less: Purchases &amp; Direct Costs</span>
                      <span className="font-mono text-red-400">({fmt(pl.purchase + pl.directExp)})</span>
                    </div>
                    <div className="p-3 bg-slate-800/80 flex justify-between items-center font-bold">
                      <span className="text-slate-100">Gross Profit</span>
                      <span className="font-mono text-emerald-400">{fmt(pl.grossProfit)}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Indirect Income &amp; Interest</span>
                      <span className="font-mono text-emerald-400">{fmt(pl.indInc)}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="font-semibold text-slate-300">Less: Operating &amp; Indirect Expenses</span>
                      <span className="font-mono text-red-400">({fmt(pl.indExp)})</span>
                    </div>
                    <div className="p-3.5 bg-slate-800 font-bold text-sm flex justify-between items-center">
                      <span className="text-slate-100">Net Profit / Loss</span>
                      <span className={`font-mono ${pl.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(pl.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STOCK VALUE DRILL-DOWN */}
              {activeModal === 'stock' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Total Closing Inventory Value</div>
                      <div className="text-2xl font-bold text-purple-400 mt-0.5">{fmt(eng.stockVal)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        nav('inventory');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
                    >
                      Manage Inventory Items →
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Itemized Stock List</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3 text-right">Closing Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Rate ₹</th>
                          <th className="py-2.5 px-3 text-right">Total Valuation ₹</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {co.stockItems.map(item => {
                          const val = (item.closingQty || 0) * (item.rate || 0);
                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-medium text-slate-200">{item.name}</td>
                              <td className="py-2.5 px-3 text-slate-400">{item.unit}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-100">
                                {item.closingQty || 0}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                {fmt(item.rate || 0)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-300">
                                {fmt(val)}
                              </td>
                            </tr>
                          );
                        })}
                        {co.stockItems.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              No stock items configured yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
