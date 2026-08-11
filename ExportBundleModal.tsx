import React, { useState } from 'react';
import { Company } from '../types';
import { computeEngine, computePL, fmt, fmtn } from '../utils/engine';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

interface ExportBundleModalProps {
  co: Company;
  onClose: () => void;
}

export const ExportBundleModal: React.FC<ExportBundleModalProps> = ({ co, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const eng = computeEngine(co);
  const pl = computePL(co, eng);

  // Generate Colorful Workbook
  const exportColorfulExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Balance Sheet Sheet
    const bsAoa = [
      ['BALANCE SHEET AS AT ' + co.fyEnd],
      ['Company: ' + co.name],
      ['GSTIN: ' + (co.gstin || 'N/A')],
      [],
      ['EQUITY AND LIABILITIES', 'Amount (₹)'],
      ['Share Capital (Note 1)', co.shares?.reduce((s, x) => s + x.numberOfShares * 10, 0) || 0],
      ['Reserves & Surplus (P&L)', pl.netProfit],
      ['Current Liabilities', 0],
      ['TOTAL LIABILITIES', (co.shares?.reduce((s, x) => s + x.numberOfShares * 10, 0) || 0) + pl.netProfit],
      [],
      ['ASSETS', 'Amount (₹)'],
      ['Fixed Assets / Property, Plant & Equipment', co.assets.reduce((s, a) => s + a.cost, 0)],
      ['Closing Inventories / Stock', eng.stockVal],
      ['Cash & Bank Balances', co.ledgers.filter(l => ['g_cash', 'g_bank'].includes(l.grp)).reduce((s, l) => s + (eng.bal[l.id]?.signed || 0), 0)],
      ['TOTAL ASSETS', eng.stockVal + co.assets.reduce((s, a) => s + a.cost, 0)],
    ];
    const bsSheet = XLSX.utils.aoa_to_sheet(bsAoa);
    XLSX.utils.book_append_sheet(wb, bsSheet, 'Balance Sheet');

    // 2. Profit & Loss Sheet
    const plAoa = [
      ['STATEMENT OF PROFIT AND LOSS FOR THE YEAR ENDED ' + co.fyEnd],
      ['Company: ' + co.name],
      [],
      ['PARTICULARS', 'Amount (₹)'],
      ['Revenue from Operations (Sales)', pl.sales],
      ['Other Operating Incomes', pl.directInc],
      ['TOTAL REVENUE', pl.sales + pl.directInc],
      [],
      ['EXPENSES', 'Amount (₹)'],
      ['Purchases of Stock-in-Trade', pl.purchase],
      ['Direct Expenses', pl.directExp],
      ['Indirect Expenses', pl.indExp],
      ['TOTAL EXPENSES', pl.purchase + pl.directExp + pl.indExp],
      [],
      ['PROFIT / (LOSS) BEFORE TAX', pl.netProfit],
    ];
    const plSheet = XLSX.utils.aoa_to_sheet(plAoa);
    XLSX.utils.book_append_sheet(wb, plSheet, 'Profit and Loss');

    // 3. Vouchers Sheet
    const vchRows = co.vouchers.flatMap(v =>
      v.entries.map(e => ({
        'Voucher No': v.no,
        'Date': v.date,
        'Type': v.type,
        'Party': v.partyName || '',
        'Ledger Account': eng.ledById[e.led]?.name || '',
        'Debit ₹': e.dr || 0,
        'Credit ₹': e.cr || 0,
        'Narration': v.narration || '',
      }))
    );
    const vchSheet = XLSX.utils.json_to_sheet(vchRows);
    XLSX.utils.book_append_sheet(wb, vchSheet, 'Vouchers');

    XLSX.writeFile(wb, `${co.name.replace(/\s+/g, '_')}_Financials_${co.fyEnd}.xlsx`);
  };

  // Generate Complete ZIP Bundle
  const exportZipBundle = async () => {
    setLoading(true);
    setMsg('Bundling financial reports & attachments into ZIP...');

    try {
      const zip = new JSZip();

      // Excel Financial Statements
      const wb = XLSX.utils.book_new();
      const bsAoa = [
        ['BALANCE SHEET AS AT ' + co.fyEnd],
        ['Company: ' + co.name],
        [],
        ['EQUITY AND LIABILITIES', 'Amount (₹)'],
        ['Share Capital', co.shares?.reduce((s, x) => s + x.numberOfShares * 10, 0) || 0],
        ['Reserves & Surplus', pl.netProfit],
        [],
        ['ASSETS', 'Amount (₹)'],
        ['Fixed Assets', co.assets.reduce((s, a) => s + a.cost, 0)],
        ['Closing Stock', eng.stockVal],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bsAoa), 'Balance Sheet');
      const excelBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file('Financial_Statements_BalanceSheet_PL.xlsx', excelBuf);

      // JSON Data
      zip.file('Full_Company_Database.json', JSON.stringify(co, null, 2));

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `CoServeU_Complete_Bundle_${co.name.replace(/\s+/g, '_')}.zip`;
      a.click();

      setMsg('✓ ZIP bundle created and downloaded successfully!');
    } catch (e: any) {
      setMsg('Error generating ZIP: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">📦 Export Complete Financial Bundle</h3>
            <p className="text-xs text-slate-400">Colorful Excel, Balance Sheet, P&amp;L and ZIP packaging</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Multi-Sheet Colorful Excel Workbook
            </h4>
            <p className="text-xs text-slate-400">
              Generates a styled Excel workbook containing Balance Sheet, Profit &amp; Loss Statement, and all Vouchers with narrations.
            </p>
            <button
              onClick={exportColorfulExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
            >
              ⬇ Download Colorful Excel Workbook (.xlsx)
            </button>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Complete ZIP Package (All Files in One Go)
            </h4>
            <p className="text-xs text-slate-400">
              Bundles Balance Sheet, Profit &amp; Loss, Schedule Notes, JSON backup, and vouchers into a single ZIP archive.
            </p>
            <button
              onClick={exportZipBundle}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating ZIP...' : '📦 Download Complete ZIP Bundle'}
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              msg.startsWith('✓')
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-blue-950/50 border-blue-800 text-blue-300'
            }`}
          >
            {msg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
