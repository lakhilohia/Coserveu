import React, { useState } from 'react';
import { Company, ShareCertificate } from '../types';
import { computeEngine, fmt, fmtn } from '../utils/engine';
import { ASSET_CLASSES, uid, today } from '../data/seedFPCs';
import { ShareCertificateFormSH1 } from './ShareCertificateFormSH1';

interface RegistersProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  tab: 'grand_reg' | 'purchase_reg' | 'sales_reg' | 'expense_reg' | 'income_reg' | 'assets_reg' | 'share_reg';
  setDrill: (d: any) => void;
}

export const Registers: React.FC<RegistersProps> = ({ co, update, tab, setDrill }) => {
  const eng = computeEngine(co);

  // Share Certificate State
  const [certForm, setCertForm] = useState({
    certNo: `SC-${String((co.shares || []).length + 1).padStart(4, '0')}`,
    folioNo: 'F-001',
    memberName: '',
    numberOfShares: '100',
    nominalValue: '10',
    distinctiveFrom: '1',
    distinctiveTo: '100',
    issueDate: today(),
  });

  const [selectedCert, setSelectedCert] = useState<ShareCertificate | null>(null);
  const [showBlankSH1, setShowBlankSH1] = useState<boolean>(false);

  const issueCertificate = () => {
    if (!certForm.memberName.trim() || !+certForm.numberOfShares) return;
    const cert: ShareCertificate = {
      id: uid(),
      certNo: certForm.certNo,
      folioNo: certForm.folioNo,
      memberName: certForm.memberName.trim(),
      numberOfShares: +certForm.numberOfShares,
      nominalValue: +certForm.nominalValue || 10,
      distinctiveFrom: +certForm.distinctiveFrom || 1,
      distinctiveTo: +certForm.distinctiveTo || 100,
      issueDate: certForm.issueDate,
      status: 'Active',
    };

    update(c => {
      c.shares = c.shares || [];
      c.shares.push(cert);
    });

    setCertForm({
      certNo: `SC-${String((co.shares || []).length + 2).padStart(4, '0')}`,
      folioNo: 'F-002',
      memberName: '',
      numberOfShares: '100',
      nominalValue: '10',
      distinctiveFrom: String(+certForm.distinctiveTo + 1),
      distinctiveTo: String(+certForm.distinctiveTo + 100),
      issueDate: today(),
    });
  };

  // Helper filters for vouchers
  const purchaseVouchers = co.vouchers.filter(v => v.type === 'Purchase');
  const salesVouchers = co.vouchers.filter(v => v.type === 'Sales');

  const expenseVouchers = co.vouchers.filter(v => {
    const hasExpenseOrAsset = v.entries.some(e => {
      const led = co.ledgers.find(l => l.id === e.led);
      if (!led) return false;
      const grp = led.grp;
      const name = led.name.toLowerCase();
      return (
        grp === 'g_de' ||
        grp === 'g_ie' ||
        grp === 'g_pur' ||
        grp === 'g_fa' ||
        name.includes('furniture') ||
        name.includes('expense')
      );
    });
    return v.type === 'Payment' || hasExpenseOrAsset;
  });

  const incomeVouchers = co.vouchers.filter(v => {
    const hasIncomeCredit = v.entries.some(e => {
      const led = co.ledgers.find(l => l.id === e.led);
      if (!led) return false;
      return (+e.cr > 0) && (led.grp === 'g_di' || led.grp === 'g_ii' || led.grp === 'g_sales');
    });

    const hasExpenseOrAssetDebit = v.entries.some(e => {
      const led = co.ledgers.find(l => l.id === e.led);
      if (!led) return false;
      const name = led.name.toLowerCase();
      return (+e.dr > 0) && (led.grp === 'g_de' || led.grp === 'g_ie' || led.grp === 'g_pur' || led.grp === 'g_fa' || name.includes('furniture') || name.includes('expense'));
    });

    return (v.type === 'Sales' || (v.type === 'Receipt' && hasIncomeCredit) || hasIncomeCredit) && !hasExpenseOrAssetDebit;
  });

  // Calculate Grand Totals
  const totalPurchaseAmt = purchaseVouchers.reduce((tot, v) => tot + v.entries.reduce((s, e) => s + (+e.dr || 0), 0), 0);
  const totalSalesAmt = salesVouchers.reduce((tot, v) => tot + v.entries.reduce((s, e) => s + (+e.dr || 0), 0), 0);
  const totalExpenseAmt = expenseVouchers.reduce((tot, v) => tot + v.entries.reduce((s, e) => s + (+e.dr || 0), 0), 0);
  const totalIncomeAmt = incomeVouchers.reduce((tot, v) => {
    const incEntries = v.entries.filter(e => {
      const l = eng.ledById[e.led];
      return l && (l.grp === 'g_di' || l.grp === 'g_ii' || l.grp === 'g_sales');
    });
    return tot + (incEntries.reduce((s, e) => s + (+e.cr || 0), 0) || v.entries.reduce((s, e) => s + (+e.cr || 0), 0));
  }, 0);

  const netOperatingProfit = (totalIncomeAmt + totalSalesAmt) - (totalPurchaseAmt + totalExpenseAmt);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Top Grand Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-blue-950/40 border border-blue-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">🛒 Grand Purchase</span>
          <span className="text-base font-bold text-blue-100">₹ {fmtn(totalPurchaseAmt)}</span>
          <span className="text-[10px] text-blue-400 block">{purchaseVouchers.length} Purchase Invoices</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">🏷️ Grand Total Sales</span>
          <span className="text-base font-bold text-emerald-100">₹ {fmtn(totalSalesAmt)}</span>
          <span className="text-[10px] text-emerald-400 block">{salesVouchers.length} Sales Invoices</span>
        </div>

        <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">💸 Grand Expenses</span>
          <span className="text-base font-bold text-rose-100">₹ {fmtn(totalExpenseAmt)}</span>
          <span className="text-[10px] text-rose-400 block">{expenseVouchers.length} Expense Vouchers</span>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">💰 Grand Total Income</span>
          <span className="text-base font-bold text-amber-100">₹ {fmtn(totalIncomeAmt)}</span>
          <span className="text-[10px] text-amber-400 block">{incomeVouchers.length} Receipts / Grants</span>
        </div>

        <div className={`col-span-2 md:col-span-1 border p-3.5 rounded-xl space-y-1 ${
          netOperatingProfit >= 0 ? 'bg-teal-950/40 border-teal-800/80' : 'bg-red-950/40 border-red-800/80'
        }`}>
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">📊 Net Operating Balance</span>
          <span className={`text-base font-bold ${netOperatingProfit >= 0 ? 'text-teal-200' : 'text-red-200'}`}>
            ₹ {fmtn(netOperatingProfit)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {netOperatingProfit >= 0 ? '✓ Net Surplus' : '⚠ Net Deficit'}
          </span>
        </div>
      </div>

      {/* Tab Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            {tab === 'grand_reg' && '📊 Executive Grand Master Register'}
            {tab === 'purchase_reg' && '🛒 Grand Total Purchase Register'}
            {tab === 'sales_reg' && '🏷️ Grand Total Sales Register (B2B & B2C)'}
            {tab === 'expense_reg' && '💸 Grand Total Expense Register'}
            {tab === 'income_reg' && '💰 Grand Total Income Register'}
            {tab === 'assets_reg' && '🏭 Fixed Asset Register (FAR)'}
            {tab === 'share_reg' && '📜 Share Capital Register & Certificates'}
          </h2>
          <p className="text-xs text-slate-400">Statutory registers required under Companies Act, 2013 &amp; GST</p>
        </div>
      </div>

      {/* GRAND EXECUTIVE MASTER REGISTER */}
      {tab === 'grand_reg' && (
        <div className="space-y-6">
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              📜 Grand Summary Breakdown for {co.name}
            </h3>
            <p className="text-xs text-slate-300">
              Complete aggregated summary of Purchases, Sales, Expenses, and Incomes for GST audit and ICSI compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center justify-between">
                <span>🛒 Purchases Summary</span>
                <span className="text-slate-100">₹ {fmtn(totalPurchaseAmt)}</span>
              </h4>
              <p className="text-[11px] text-slate-400">Total agri-inputs, raw materials, and trading inventory purchased.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                <span>🏷️ Sales Summary</span>
                <span className="text-slate-100">₹ {fmtn(totalSalesAmt)}</span>
              </h4>
              <p className="text-[11px] text-slate-400">Total B2B &amp; B2C member sales of agricultural produce.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
                <span>💸 Expenses Summary</span>
                <span className="text-slate-100">₹ {fmtn(totalExpenseAmt)}</span>
              </h4>
              <p className="text-[11px] text-slate-400">Total administrative, direct operational, and processing expenses.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span>💰 Incomes &amp; Subsidies</span>
                <span className="text-slate-100">₹ {fmtn(totalIncomeAmt)}</span>
              </h4>
              <p className="text-[11px] text-slate-400">Total grants, interest, processing charges, and non-operating revenue.</p>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE REGISTER */}
      {tab === 'purchase_reg' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vch No / Inv</th>
                <th className="py-2.5 px-3">Supplier / Party</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Items Purchased</th>
                <th className="py-2.5 px-3 text-right">Taxable ₹</th>
                <th className="py-2.5 px-3 text-right">GST ₹</th>
                <th className="py-2.5 px-3 text-right">Total ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchaseVouchers.map(v => {
                const party =
                  v.partyName ||
                  v.entries
                    .map(e => eng.ledById[e.led])
                    .find(l => l && l.grp === 'g_cred')?.name ||
                  'Supplier';

                const gstin =
                  v.entries
                    .map(e => eng.ledById[e.led])
                    .find(l => l && l.gstin)?.gstin || '—';

                const itemsStr = (v.inv || [])
                  .map(r => {
                    const it = co.stockItems.find(s => s.id === r.item);
                    return it ? `${it.name} (${r.qty} ${it.unit})` : '';
                  })
                  .filter(Boolean)
                  .join(', ');

                const total = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);

                return (
                  <tr
                    key={v.id}
                    onClick={() => setDrill({ voucherId: v.id })}
                    className="hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                    <td className="py-2.5 px-3 text-slate-300">{v.no}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">{party}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{gstin}</td>
                    <td className="py-2.5 px-3 text-slate-400">{itemsStr || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-200">{fmtn(total * 0.9)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{fmtn(total * 0.1)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(total)}</td>
                  </tr>
                );
              })}
              {purchaseVouchers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No purchase vouchers recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-slate-100">
              <tr>
                <td colSpan={5} className="py-3 px-3 uppercase text-blue-300">Grand Total Purchases ({purchaseVouchers.length} Invoices)</td>
                <td className="py-3 px-3 text-right">{fmtn(totalPurchaseAmt * 0.9)}</td>
                <td className="py-3 px-3 text-right text-emerald-400">{fmtn(totalPurchaseAmt * 0.1)}</td>
                <td className="py-3 px-3 text-right text-blue-300 font-extrabold text-sm">₹ {fmtn(totalPurchaseAmt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* SALES REGISTER */}
      {tab === 'sales_reg' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Customer / Party</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">Items Sold</th>
                  <th className="py-2.5 px-3 text-right">Taxable ₹</th>
                  <th className="py-2.5 px-3 text-right">Total Invoice ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {salesVouchers.map(v => {
                  const party =
                    v.partyName ||
                    v.entries
                      .map(e => eng.ledById[e.led])
                      .find(l => l && l.grp === 'g_deb')?.name ||
                    'Customer';

                  const gstin =
                    v.entries
                      .map(e => eng.ledById[e.led])
                      .find(l => l && l.gstin)?.gstin || '—';

                  const isB2b = v.isB2B || (gstin !== '—' && gstin.length === 15);

                  const itemsStr = (v.inv || [])
                    .map(r => {
                      const it = co.stockItems.find(s => s.id === r.item);
                      return it ? `${it.name} (${r.qty} ${it.unit})` : '';
                    })
                    .filter(Boolean)
                    .join(', ');

                  const total = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setDrill({ voucherId: v.id })}
                      className="hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                      <td className="py-2.5 px-3 text-slate-300">{v.invoiceNo || v.no}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isB2b
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isB2b ? 'B2B Sales' : 'B2C Sales'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{party}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{gstin}</td>
                      <td className="py-2.5 px-3 text-slate-400">{itemsStr || '—'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">{fmtn(total * 0.95)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(total)}</td>
                    </tr>
                  );
                })}
                {salesVouchers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No sales vouchers recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-slate-100">
                <tr>
                  <td colSpan={6} className="py-3 px-3 uppercase text-emerald-300">Grand Total Sales ({salesVouchers.length} Invoices)</td>
                  <td className="py-3 px-3 text-right">{fmtn(totalSalesAmt * 0.95)}</td>
                  <td className="py-3 px-3 text-right text-emerald-300 font-extrabold text-sm">₹ {fmtn(totalSalesAmt)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSE REGISTER */}
      {tab === 'expense_reg' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vch No</th>
                <th className="py-2.5 px-3">Expense Head</th>
                <th className="py-2.5 px-3">Paid To / Party</th>
                <th className="py-2.5 px-3">Narration</th>
                <th className="py-2.5 px-3 text-center">Proceedings Copy</th>
                <th className="py-2.5 px-3 text-right">Amount ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expenseVouchers.map(v => {
                const expHead = v.entries
                  .map(e => eng.ledById[e.led])
                  .filter(l => l && (l.grp === 'g_de' || l.grp === 'g_ie'))
                  .map(l => l.name)
                  .join(', ');

                const amt = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);

                return (
                  <tr
                    key={v.id}
                    onClick={() => setDrill({ voucherId: v.id })}
                    className="hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                    <td className="py-2.5 px-3 text-slate-300">{v.no}</td>
                    <td className="py-2.5 px-3 text-red-400 font-medium">{expHead || 'Expenses'}</td>
                    <td className="py-2.5 px-3 text-slate-200">{v.partyName || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{v.narration || '—'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {v.proceedingsAttachment || v.attachment ? (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          ✓ Attached
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                          ⚠ Missing Proc
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(amt)}</td>
                  </tr>
                );
              })}
              {expenseVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No expense transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-slate-100">
              <tr>
                <td colSpan={6} className="py-3 px-3 uppercase text-rose-300">Grand Total Expenses ({expenseVouchers.length} Vouchers)</td>
                <td className="py-3 px-3 text-right text-rose-300 font-extrabold text-sm">₹ {fmtn(totalExpenseAmt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* INCOME REGISTER */}
      {tab === 'income_reg' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vch No</th>
                <th className="py-2.5 px-3">Income Head</th>
                <th className="py-2.5 px-3">Received From</th>
                <th className="py-2.5 px-3">Narration</th>
                <th className="py-2.5 px-3 text-right">Amount ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {incomeVouchers.map(v => {
                const incomeEntries = v.entries.filter(e => {
                  const l = eng.ledById[e.led];
                  return l && (l.grp === 'g_di' || l.grp === 'g_ii' || l.grp === 'g_sales');
                });
                const incHead = incomeEntries.map(e => eng.ledById[e.led]?.name).filter(Boolean).join(', ');
                const amt = incomeEntries.reduce((s, e) => s + (+e.cr || 0), 0) || v.entries.reduce((s, e) => s + (+e.cr || 0), 0);

                return (
                  <tr
                    key={v.id}
                    onClick={() => setDrill({ voucherId: v.id })}
                    className="hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-200">{v.date}</td>
                    <td className="py-2.5 px-3 text-slate-300">{v.no}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">{incHead || 'Income'}</td>
                    <td className="py-2.5 px-3 text-slate-200">{v.partyName || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{v.narration || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">{fmtn(amt)}</td>
                  </tr>
                );
              })}
              {incomeVouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No income transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-bold text-xs text-slate-100">
              <tr>
                <td colSpan={5} className="py-3 px-3 uppercase text-amber-300">Grand Total Income &amp; Grants ({incomeVouchers.length} Vouchers)</td>
                <td className="py-3 px-3 text-right text-amber-300 font-extrabold text-sm">₹ {fmtn(totalIncomeAmt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* FIXED ASSETS REGISTER */}
      {tab === 'assets_reg' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Asset Name</th>
                  <th className="py-2.5 px-3">Schedule II Class</th>
                  <th className="py-2.5 px-3 text-right">Useful Life (Yrs)</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Gross Block ₹</th>
                  <th className="py-2.5 px-3 text-right">Depreciation ₹</th>
                  <th className="py-2.5 px-3 text-right">Net Block ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.assets.map(a => {
                  const cls = ASSET_CLASSES.find(x => x.c === a.cls);
                  const life = cls?.life || 10;
                  const dep = (a.cost * 0.95) / life;
                  const net = a.cost - dep;

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{a.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{a.cls}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">{life}</td>
                      <td className="py-2.5 px-3 text-slate-300">{a.method}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-200">{fmt(a.cost)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{fmt(dep)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{fmt(net)}</td>
                    </tr>
                  );
                })}
                {co.assets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No fixed assets recorded in Fixed Asset Register yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHARE CAPITAL REGISTER & CERTIFICATE ISSUER */}
      {tab === 'share_reg' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Share Certificate Form */}
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                📜 Issue Share Certificate
              </h3>
              <p className="text-[11px] text-slate-400">
                Section 581ZA - Farmer Producer Company Share Register
              </p>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Certificate Number</label>
                <input
                  value={certForm.certNo}
                  onChange={e => setCertForm({ ...certForm, certNo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Folio Number</label>
                <input
                  value={certForm.folioNo}
                  onChange={e => setCertForm({ ...certForm, folioNo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Member / Producer Name</label>
                <input
                  value={certForm.memberName}
                  onChange={e => setCertForm({ ...certForm, memberName: e.target.value })}
                  placeholder="Full name of member"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">No. of Shares</label>
                  <input
                    type="number"
                    value={certForm.numberOfShares}
                    onChange={e => setCertForm({ ...certForm, numberOfShares: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Face Value ₹</label>
                  <input
                    type="number"
                    value={certForm.nominalValue}
                    onChange={e => setCertForm({ ...certForm, nominalValue: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Distinctive From</label>
                  <input
                    type="number"
                    value={certForm.distinctiveFrom}
                    onChange={e => setCertForm({ ...certForm, distinctiveFrom: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Distinctive To</label>
                  <input
                    type="number"
                    value={certForm.distinctiveTo}
                    onChange={e => setCertForm({ ...certForm, distinctiveTo: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={certForm.issueDate}
                  onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100"
                />
              </div>

              <button
                onClick={issueCertificate}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded text-xs transition-colors"
              >
                Issue Certificate
              </button>
            </div>

            {/* Issued Share Certificates List */}
            <div className="lg:col-span-2 overflow-x-auto space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Register of Members &amp; Issued Certificates (Form MGT-1 / SH-1)
                </h3>
                <button
                  onClick={() => setShowBlankSH1(true)}
                  className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                >
                  📜 Draft Blank Form SH-1 Template
                </button>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2 px-2.5">Cert No</th>
                    <th className="py-2 px-2.5">Folio</th>
                    <th className="py-2 px-2.5">Member Name</th>
                    <th className="py-2 px-2.5 text-right">Shares</th>
                    <th className="py-2 px-2.5 text-right">Paid Amount ₹</th>
                    <th className="py-2 px-2.5 text-center">Distinctive Nos</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(co.shares || []).map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/50">
                      <td className="py-2 px-2.5 font-mono text-slate-300">{s.certNo}</td>
                      <td className="py-2 px-2.5 font-mono text-slate-400">{s.folioNo}</td>
                      <td className="py-2 px-2.5 font-medium text-slate-200">{s.memberName}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-100">{s.numberOfShares}</td>
                      <td className="py-2 px-2.5 text-right text-emerald-400">
                        {fmt(s.numberOfShares * s.nominalValue)}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono text-slate-400">
                        {s.distinctiveFrom} - {s.distinctiveTo}
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          onClick={() => setSelectedCert(s)}
                          className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 px-2.5 py-1 rounded text-[11px] font-semibold border border-amber-800 transition-colors"
                        >
                          📜 Form SH-1
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(co.shares || []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No share certificates issued yet. Fill form on the left to issue or click &quot;Draft Blank Form SH-1 Template&quot; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Form SH-1 Share Certificate Modal */}
          {selectedCert && (
            <ShareCertificateFormSH1
              co={co}
              cert={selectedCert}
              onClose={() => setSelectedCert(null)}
              onSave={updated => {
                update(c => {
                  c.shares = (c.shares || []).map(s => (s.id === updated.id ? updated : s));
                });
                setSelectedCert(null);
              }}
            />
          )}

          {/* Blank Form SH-1 Draft Template Modal */}
          {showBlankSH1 && (
            <ShareCertificateFormSH1
              co={co}
              defaultBlank={true}
              onClose={() => setShowBlankSH1(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
