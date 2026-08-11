import React, { useState } from 'react';
import { Company, Voucher } from '../types';
import {
  getGSTR1OutwardSales,
  GSTR1ParsedVoucher,
  GSTR1SummaryHead,
  GSTR1StateRateGroup,
  fmt,
  fmtn,
  STATE_CODE_MAP,
} from '../utils/engine';
import { VoucherDetailModal } from './VoucherDetailModal';

interface GSTR1ModuleProps {
  co: Company;
  updateCompany?: (fn: (c: Company) => void) => void;
}

export const GSTR1Module: React.FC<GSTR1ModuleProps> = ({ co, updateCompany }) => {
  // Period filter state (default 1-Jun-26 to 30-Jun-26 as per Tally Prime interface)
  const [fromDate, setFromDate] = useState<string>('2026-06-01');
  const [toDate, setToDate] = useState<string>('2026-06-30');
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);

  // View modes: 'reconciliation' | 'drilldown' | 'hsn' | 'uncertain' | 'einvoice'
  const [viewMode, setViewMode] = useState<
    'reconciliation' | 'drilldown' | 'hsn' | 'uncertain' | 'einvoice'
  >('reconciliation');

  // Drilldown selection state
  const [selectedHeadKey, setSelectedHeadKey] = useState<string>('b2b');
  const [selectedHeadTitle, setSelectedHeadTitle] = useState<string>('B2B Invoices - 4A, 4B, 4C, 6B, 6C');
  const [selectedStateRateGroup, setSelectedStateRateGroup] = useState<GSTR1StateRateGroup | null>(null);
  const [drillSubView, setDrillSubView] = useState<'summary' | 'vouchers'>('summary');

  // Viewing individual voucher details in modal
  const [viewingVoucherId, setViewingVoucherId] = useState<string | null>(null);

  // Fixing uncertain transaction modal state
  const [fixingVoucher, setFixingVoucher] = useState<GSTR1ParsedVoucher | null>(null);
  const [editGstin, setEditGstin] = useState<string>('');
  const [editInvNo, setEditInvNo] = useState<string>('');
  const [editHsn, setEditHsn] = useState<string>('');

  // Exception category filter for Uncertain Transactions
  const [selectedMismatchCode, setSelectedMismatchCode] = useState<string | null>(null);

  // Filter company vouchers by period
  const periodVouchers = co.vouchers.filter(v => {
    if (fromDate && v.date < fromDate) return false;
    if (toDate && v.date > toDate) return false;
    return true;
  });

  // Calculate GSTR-1 outward sales and daybook vouchers
  const periodCompany: Company = { ...co, vouchers: periodVouchers };
  const gstr1Data = getGSTR1OutwardSales(periodCompany);

  // Formatted date string for top right display
  const formatDateDisp = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`;
  };

  const periodText =
    fromDate && toDate
      ? `${formatDateDisp(fromDate)} to ${formatDateDisp(toDate)}`
      : 'All Time (Poora Data)';

  // Calculate grand totals across all outward heads
  const headsList = [
    { key: 'b2b', title: 'B2B Invoices - 4A, 4B, 4C, 6B, 6C', data: gstr1Data.b2b },
    { key: 'b2cLarge', title: 'B2C (Large) Invoices - 5A, 5B', data: gstr1Data.b2cLarge },
    { key: 'exports', title: 'Exports Invoices - 6A', data: gstr1Data.exports },
    { key: 'cdnr', title: 'Credit or Debit Notes (Registered) - 9B', data: gstr1Data.cdnr },
    { key: 'cdnur', title: 'Credit or Debit Notes (Unregistered) - 9B', data: gstr1Data.cdnur },
    { key: 'b2cSmall', title: 'B2C (Small) Invoices - 7', data: gstr1Data.b2cSmall },
    { key: 'nilRated', title: 'Nil Rated Invoices - 8A, 8B, 8C, 8D', data: gstr1Data.nilRated },
  ];

  const totalTaxable = headsList.reduce((s, h) => s + h.data.taxable, 0);
  const totalCgst = headsList.reduce((s, h) => s + h.data.cgst, 0);
  const totalSgst = headsList.reduce((s, h) => s + h.data.sgst, 0);
  const totalIgst = headsList.reduce((s, h) => s + h.data.igst, 0);
  const totalCess = headsList.reduce((s, h) => s + h.data.cess, 0);
  const totalTax = totalCgst + totalSgst + totalIgst + totalCess;
  const totalInvoiceVal = headsList.reduce((s, h) => s + h.data.invoiceTotal, 0);
  const totalVchCount = headsList.reduce((s, h) => s + h.data.vchCount, 0);

  // Drilldown handler for category rows
  const handleOpenCategoryDrilldown = (headKey: string, title: string) => {
    setSelectedHeadKey(headKey);
    setSelectedHeadTitle(title);
    setSelectedStateRateGroup(null);
    setDrillSubView('summary');
    setViewMode('drilldown');
  };

  // Get active selected head data
  const getActiveHeadData = (): GSTR1SummaryHead => {
    switch (selectedHeadKey) {
      case 'b2b':
        return gstr1Data.b2b;
      case 'b2cLarge':
        return gstr1Data.b2cLarge;
      case 'exports':
        return gstr1Data.exports;
      case 'cdnr':
        return gstr1Data.cdnr;
      case 'cdnur':
        return gstr1Data.cdnur;
      case 'b2cSmall':
        return gstr1Data.b2cSmall;
      case 'nilRated':
        return gstr1Data.nilRated;
      default:
        return gstr1Data.b2b;
    }
  };

  const activeHeadData = getActiveHeadData();

  // Save Quick Fix for uncertain transaction
  const handleSaveQuickFix = () => {
    if (!fixingVoucher || !updateCompany) return;

    updateCompany(c => {
      const v = c.vouchers.find(x => x.id === fixingVoucher.voucher.id);
      if (!v) return;

      if (editInvNo.trim()) {
        v.invoiceNo = editInvNo.trim();
        v.no = editInvNo.trim();
      }

      // Update party ledger GSTIN if present
      if (editGstin.trim() && editGstin.trim().length === 15) {
        v.isB2B = true;
        const partyLed = c.ledgers.find(
          l =>
            l.name === v.partyName ||
            (['g_deb', 'g_cred'].includes(l.grp) && v.entries.some(e => e.led === l.id))
        );
        if (partyLed) {
          partyLed.gstin = editGstin.trim().toUpperCase();
        }
      }

      // Update HSN on stock items if provided
      if (editHsn.trim() && v.inv && v.inv.length > 0) {
        v.inv.forEach(r => {
          const item = c.stockItems.find(it => it.id === r.item);
          if (item) {
            item.hsn = editHsn.trim();
          }
        });
      }
    });

    setFixingVoucher(null);
  };

  // Mismatch category counts
  const mismatchesByCode = {
    invalidGstin: gstr1Data.uncertainList.filter(u => u.mismatches.some(m => m.code === 'invalidGstin')),
    missingInvNo: gstr1Data.uncertainList.filter(u => u.mismatches.some(m => m.code === 'missingInvNo')),
    missingHsn: gstr1Data.uncertainList.filter(u => u.mismatches.some(m => m.code === 'missingHsn')),
    taxMismatch: gstr1Data.uncertainList.filter(u => u.mismatches.some(m => m.code === 'taxMismatch')),
    missingPos: gstr1Data.uncertainList.filter(u => u.mismatches.some(m => m.code === 'missingPos')),
  };

  return (
    <div className="bg-[#0f172a] text-slate-100 rounded-lg overflow-hidden border border-slate-700 font-sans shadow-2xl">
      {/* 1. COSERVEU ERP BRANDED BLUE HEADER BAR */}
      <div className="bg-[#0f3a6b] text-white px-3 py-1.5 flex flex-wrap items-center justify-between border-b border-blue-900 text-xs font-semibold select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 font-black text-sm tracking-tight font-serif">CoServeU</span>
            <span className="text-white font-bold text-xs">ERP</span>
            <span className="bg-gradient-to-r from-slate-200 to-amber-200 text-slate-900 text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              ENTERPRISE
            </span>
          </div>
          <span className="text-blue-300">|</span>
          <div className="flex items-center gap-3 text-[11px] text-blue-100 font-medium">
            <button onClick={() => setShowPeriodModal(true)} className="hover:underline hover:text-white">
              <span className="underline decoration-dotted">K</span>: Company
            </button>
            <button className="hover:underline hover:text-white">
              <span className="underline decoration-dotted">Y</span>: Data
            </button>
            <button className="hover:underline hover:text-white">
              <span className="underline decoration-dotted">Z</span>: Exchange
            </button>
            <button className="hover:underline hover:text-white">
              <span className="underline decoration-dotted">P</span>: Print
            </button>
            <button className="hover:underline hover:text-white">
              <span className="underline decoration-dotted">9</span>: Capital
            </button>
            <button className="hover:underline hover:text-white">F1: Help</button>
          </div>
        </div>

        {/* Center Title */}
        <div className="font-bold text-amber-300 text-sm tracking-wide">
          GSTR-1 Reconciliation
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-200">
          <span className="bg-blue-900/80 px-2 py-0.5 rounded text-amber-200 border border-blue-700">
            {co.name}
          </span>
        </div>
      </div>

      {/* 2. SUB-HEADER METADATA BAR */}
      <div className="bg-[#1e293b] px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400">GST Registration : </span>
            <span className="font-mono font-bold text-blue-300">{co.gstin || '18ABDPY3955G1Z7'}</span>
          </div>
          <div>
            <span className="text-slate-400">Status : </span>
            <span className="font-semibold text-amber-400">Unreconciled</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPeriodModal(true)}
            className="bg-slate-900/90 hover:bg-slate-900 border border-amber-500/50 px-2.5 py-1 rounded text-amber-300 font-mono font-bold transition-all"
          >
            🗓 {periodText}
          </button>
          <div className="text-[11px] text-slate-400">
            Period Vouchers: <span className="text-slate-200 font-mono font-bold">{periodVouchers.length}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE WITH RIGHT TALLY ACTION BAR */}
      <div className="flex flex-col xl:flex-row min-h-[580px]">
        {/* LEFT & CENTER CONTENT CONTAINER */}
        <div className="flex-1 p-3 space-y-3 bg-[#0b1329] overflow-x-auto">
          {/* VIEW SWITCHER TABS */}
          <div className="flex items-center gap-1.5 border-b border-slate-700 pb-2 text-xs flex-wrap">
            <button
              onClick={() => {
                setViewMode('reconciliation');
                setSelectedStateRateGroup(null);
              }}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                viewMode === 'reconciliation'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📊 Return View (ERP Reconciliation)
            </button>

            <button
              onClick={() => handleOpenCategoryDrilldown('b2b', 'B2B Invoices - 4A, 4B, 4C, 6B, 6C')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'drilldown' && selectedHeadKey === 'b2b'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              B2B Invoices ({gstr1Data.b2b.vchCount})
            </button>

            <button
              onClick={() => handleOpenCategoryDrilldown('b2cSmall', 'B2C (Small) Invoices - 7')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'drilldown' && selectedHeadKey === 'b2cSmall'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              B2C Invoices ({gstr1Data.b2cSmall.vchCount})
            </button>

            <button
              onClick={() => handleOpenCategoryDrilldown('exports', 'Exports Invoices - 6A')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'drilldown' && selectedHeadKey === 'exports'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Exports ({gstr1Data.exports.vchCount})
            </button>

            <button
              onClick={() => handleOpenCategoryDrilldown('cdnr', 'Credit or Debit Notes (Registered) - 9B')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'drilldown' && (selectedHeadKey === 'cdnr' || selectedHeadKey === 'cdnur')
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cr/Dr Notes ({gstr1Data.cdnr.vchCount + gstr1Data.cdnur.vchCount})
            </button>

            <button
              onClick={() => setViewMode('hsn')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'hsn'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              HSN Summary
            </button>

            <button
              onClick={() => setViewMode('uncertain')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                viewMode === 'uncertain'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
            >
              ⚠️ Uncertain ({gstr1Data.uncertainList.length})
            </button>

            <button
              onClick={() => setViewMode('einvoice')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                viewMode === 'einvoice'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚡ Export JSON
            </button>
          </div>

          {/* MAIN VIEW 1: RECONCILIATION RETURN VIEW */}
          {viewMode === 'reconciliation' && (
            <div className="space-y-3">
              {/* UPPER RECONCILIATION SUMMARY BOX */}
              <div className="border border-slate-700 bg-slate-900 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e293b] text-slate-200 border-b border-slate-700 font-bold uppercase text-[11px]">
                      <th className="py-1.5 px-3">Particulars</th>
                      <th className="py-1.5 px-3 text-right">Voucher/Summary Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[12px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-1 px-3 text-slate-300">Reconciled</td>
                      <td className="py-1 px-3 text-right text-slate-400">-</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-1 px-3 text-amber-300 font-medium">Unreconciled</td>
                      <td className="py-1 px-3 text-right font-bold text-slate-200">
                        {totalVchCount ? totalVchCount.toLocaleString('en-IN') : '-'}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-1 px-3 text-blue-300">Available Only in Books</td>
                      <td className="py-1 px-3 text-right font-bold text-slate-200">
                        {totalVchCount ? totalVchCount.toLocaleString('en-IN') : '-'}
                      </td>
                    </tr>
                    {/* TALLY PRIME ORANGE UNCERTAIN TRANSACTIONS ROW */}
                    <tr
                      onClick={() => setViewMode('uncertain')}
                      className="bg-amber-600 text-slate-950 font-bold hover:bg-amber-500 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-3 flex items-center justify-between">
                        <span>Transactions with Incomplete/Mismatch in Information</span>
                        <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded">Click to Resolve</span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm">{gstr1Data.uncertainList.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* LOWER MAIN TABLE: RETURN VIEW COMPARISON */}
              <div className="border border-slate-700 bg-slate-900 rounded-md overflow-x-auto text-xs">
                <div className="bg-[#1e293b] px-3 py-1.5 font-bold text-amber-300 border-b border-slate-700 text-[11px] tracking-wide flex items-center justify-between">
                  <span>Return View (Comparison of Books &amp; Portal Values)</span>
                  <span className="text-[10px] text-slate-400 font-normal">💡 Click any row to drill down into category details</span>
                </div>

                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="bg-[#0f172a] text-slate-300 border-b border-slate-700 font-bold text-[11px]">
                      <th className="py-2 px-2.5">Particulars</th>
                      <th className="py-2 px-2 text-right">Vch Count</th>
                      <th className="py-2 px-2 text-right">Taxable Amount</th>
                      <th className="py-2 px-2 text-right">IGST</th>
                      <th className="py-2 px-2 text-right">CGST</th>
                      <th className="py-2 px-2 text-right">SGST/UTGST</th>
                      <th className="py-2 px-2 text-right">Cess</th>
                      <th className="py-2 px-2 text-right">Tax Amount</th>
                      <th className="py-2 px-2 text-right">Invoice Amount</th>
                      <th className="py-2 px-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {/* 1. B2B Invoices */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('b2b', 'B2B Invoices - 4A, 4B, 4C, 6B, 6C')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        B2B Invoices - 4A, 4B, 4C, 6B, 6C
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.b2b.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.taxable ? fmtn(gstr1Data.b2b.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.igst ? fmtn(gstr1Data.b2b.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.cgst ? fmtn(gstr1Data.b2b.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.sgst ? fmtn(gstr1Data.b2b.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.cess ? fmtn(gstr1Data.b2b.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2b.taxTotal ? fmtn(gstr1Data.b2b.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.b2b.invoiceTotal ? fmtn(gstr1Data.b2b.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.b2b.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 2. B2C Large */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('b2cLarge', 'B2C (Large) Invoices - 5A, 5B')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        B2C (Large) Invoices - 5A, 5B
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.b2cLarge.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.taxable ? fmtn(gstr1Data.b2cLarge.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.igst ? fmtn(gstr1Data.b2cLarge.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.cgst ? fmtn(gstr1Data.b2cLarge.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.sgst ? fmtn(gstr1Data.b2cLarge.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.cess ? fmtn(gstr1Data.b2cLarge.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cLarge.taxTotal ? fmtn(gstr1Data.b2cLarge.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.b2cLarge.invoiceTotal ? fmtn(gstr1Data.b2cLarge.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.b2cLarge.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 3. Exports */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('exports', 'Exports Invoices - 6A')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        Exports Invoices - 6A
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.exports.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.taxable ? fmtn(gstr1Data.exports.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.igst ? fmtn(gstr1Data.exports.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.cgst ? fmtn(gstr1Data.exports.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.sgst ? fmtn(gstr1Data.exports.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.cess ? fmtn(gstr1Data.exports.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.exports.taxTotal ? fmtn(gstr1Data.exports.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.exports.invoiceTotal ? fmtn(gstr1Data.exports.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.exports.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 4. Credit / Debit Notes Registered */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('cdnr', 'Credit or Debit Notes (Registered) - 9B')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        Credit or Debit Notes (Registered) - 9B
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.cdnr.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.taxable ? fmtn(gstr1Data.cdnr.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.igst ? fmtn(gstr1Data.cdnr.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.cgst ? fmtn(gstr1Data.cdnr.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.sgst ? fmtn(gstr1Data.cdnr.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.cess ? fmtn(gstr1Data.cdnr.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnr.taxTotal ? fmtn(gstr1Data.cdnr.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.cdnr.invoiceTotal ? fmtn(gstr1Data.cdnr.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.cdnr.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 5. Credit / Debit Notes Unregistered */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('cdnur', 'Credit or Debit Notes (Unregistered) - 9B')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        Credit or Debit Notes (Unregistered) - 9B
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.cdnur.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.taxable ? fmtn(gstr1Data.cdnur.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.igst ? fmtn(gstr1Data.cdnur.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.cgst ? fmtn(gstr1Data.cdnur.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.sgst ? fmtn(gstr1Data.cdnur.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.cess ? fmtn(gstr1Data.cdnur.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.cdnur.taxTotal ? fmtn(gstr1Data.cdnur.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.cdnur.invoiceTotal ? fmtn(gstr1Data.cdnur.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.cdnur.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 6. Amended B2B */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amended B2B Invoices - 9A</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 7. Amended B2C Large */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amended B2C (Large) Invoices - 9A</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 8. Amended Exports */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amended Exports Invoices - 9A</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 9. Amended Credit/Debit Notes Reg */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amended Credit or Debit Notes (Registered) - 9C</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 10. Amended Credit/Debit Notes Unreg */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amended Credit or Debit Notes (Unregistered) - 9C</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 11. B2C (Small) Invoices - 7 */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('b2cSmall', 'B2C (Small) Invoices - 7')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        B2C (Small) Invoices - 7
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">
                        {gstr1Data.b2cSmall.vchCount ? `${gstr1Data.b2cSmall.vchCount} (${gstr1Data.b2cSmall.stateRateBreakdown.length})` : ''}
                      </td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.taxable ? fmtn(gstr1Data.b2cSmall.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.igst ? fmtn(gstr1Data.b2cSmall.igst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.cgst ? fmtn(gstr1Data.b2cSmall.cgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.sgst ? fmtn(gstr1Data.b2cSmall.sgst) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.cess ? fmtn(gstr1Data.b2cSmall.cess) : ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.b2cSmall.taxTotal ? fmtn(gstr1Data.b2cSmall.taxTotal) : ''}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.b2cSmall.invoiceTotal ? fmtn(gstr1Data.b2cSmall.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px]">
                        {gstr1Data.b2cSmall.vchCount > 0 ? <span className="text-amber-400">Unreconciled</span> : '-'}
                      </td>
                    </tr>

                    {/* 12. Nil Rated Invoices */}
                    <tr
                      onClick={() => handleOpenCategoryDrilldown('nilRated', 'Nil Rated Invoices - 8A, 8B, 8C, 8D')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        Nil Rated Invoices - 8A, 8B, 8C, 8D
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.nilRated.vchCount || ''}</td>
                      <td className="py-1.5 px-2 text-right">{gstr1Data.nilRated.taxable ? fmtn(gstr1Data.nilRated.taxable) : ''}</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right">0.00</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{gstr1Data.nilRated.invoiceTotal ? fmtn(gstr1Data.nilRated.invoiceTotal) : ''}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 13. Amendment B2C Small */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Amendment B2C (Small) Invoices - 10</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 14. Tax Liability Advances Received */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Tax Liability (Advances Received) - 11A(1), 11A(2)</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 15. Adjustment of Advances */}
                    <tr className="hover:bg-slate-800/40 opacity-70">
                      <td className="py-1.5 px-2.5 font-sans">Adjustment of Advances - 11B(1), 11B(2)</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-slate-500">-</td>
                    </tr>

                    {/* 18. HSN Summary - 12 */}
                    <tr
                      onClick={() => setViewMode('hsn')}
                      className="hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <td className="py-1.5 px-2.5 font-sans font-medium text-slate-100 hover:text-blue-300">
                        HSN Summary - 12 (B2B - B2C Supplies)
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold">{gstr1Data.hsnSummary.length}</td>
                      <td className="py-1.5 px-2 text-right">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.taxable, 0))}</td>
                      <td className="py-1.5 px-2 text-right">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.igst, 0))}</td>
                      <td className="py-1.5 px-2 text-right">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.cgst, 0))}</td>
                      <td className="py-1.5 px-2 text-right">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.sgst, 0))}</td>
                      <td className="py-1.5 px-2 text-right"></td>
                      <td className="py-1.5 px-2 text-right text-emerald-400">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.taxTotal, 0))}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-100">{fmtn(gstr1Data.hsnSummary.reduce((s, h) => s + h.totalVal, 0))}</td>
                      <td className="py-1.5 px-2.5 text-center font-sans text-[10px] text-amber-400">
                        Unreconciled
                      </td>
                    </tr>
                  </tbody>

                  {/* BOTTOM TOTAL ROW */}
                  <tfoot>
                    <tr className="bg-[#1e293b] text-slate-100 font-bold border-t-2 border-slate-600 font-mono text-[12px]">
                      <td className="py-2 px-2.5 font-sans uppercase">Total</td>
                      <td className="py-2 px-2 text-right">{totalVchCount || ''}</td>
                      <td className="py-2 px-2 text-right text-slate-100">{totalTaxable ? fmtn(totalTaxable) : '0.00'}</td>
                      <td className="py-2 px-2 text-right">{totalIgst ? fmtn(totalIgst) : ''}</td>
                      <td className="py-2 px-2 text-right">{totalCgst ? fmtn(totalCgst) : ''}</td>
                      <td className="py-2 px-2 text-right">{totalSgst ? fmtn(totalSgst) : ''}</td>
                      <td className="py-2 px-2 text-right">{totalCess ? fmtn(totalCess) : ''}</td>
                      <td className="py-2 px-2 text-right text-amber-300">{totalTax ? fmtn(totalTax) : '0.00'}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-bold">{totalInvoiceVal ? fmtn(totalInvoiceVal) : '0.00'}</td>
                      <td className="py-2 px-2.5 text-center font-sans text-[10px] text-amber-400">Unreconciled</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* MAIN VIEW 2: CATEGORY SUMMARY & VOUCHER DRILLDOWN (Exact Match to Screenshot 2!) */}
          {viewMode === 'drilldown' && (
            <div className="space-y-3">
              {/* HEADER BAR FOR CATEGORY DRILLDOWN */}
              <div className="bg-[#1e293b] p-3 rounded-md border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    GSTR-1 Reconciliation - Summary
                  </div>
                  <h3 className="text-sm font-bold text-amber-300 font-mono">
                    Details of : <span className="text-white">{selectedHeadTitle}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrillSubView(prev => (prev === 'summary' ? 'vouchers' : 'summary'))}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-bold text-xs shadow flex items-center gap-1"
                  >
                    <span>F5: {drillSubView === 'summary' ? 'Voucher View' : 'State/Rate Summary'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('reconciliation');
                      setSelectedStateRateGroup(null);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded font-bold text-xs"
                  >
                    ← Back to Return View
                  </button>
                </div>
              </div>

              {/* CATEGORY STATE/RATE BREAKDOWN TABLE (Screenshot 2 exact format) */}
              {drillSubView === 'summary' && !selectedStateRateGroup && (
                <div className="border border-slate-700 bg-slate-900 rounded-md overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-[#0f172a] text-slate-300 border-b border-slate-700 font-bold text-[11px]">
                        <th className="py-2 px-3">Particulars</th>
                        <th className="py-2 px-3 text-right">Taxable Amount</th>
                        <th className="py-2 px-3 text-right">IGST</th>
                        <th className="py-2 px-3 text-right">CGST</th>
                        <th className="py-2 px-3 text-right">SGST/UTGST</th>
                        <th className="py-2 px-3 text-right">Cess</th>
                        <th className="py-2 px-3 text-right">Tax Amount</th>
                        <th className="py-2 px-3 text-right">Invoice Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {/* SECTION: Available Only in Books */}
                      <tr className="bg-slate-800/50 font-bold text-slate-200 text-[11px]">
                        <td colSpan={8} className="py-1.5 px-3 uppercase text-blue-300">
                          Available Only in Books
                        </td>
                      </tr>

                      {activeHeadData.stateRateBreakdown.map(grp => (
                        <tr
                          key={grp.key}
                          onClick={() => {
                            setSelectedStateRateGroup(grp);
                            setDrillSubView('vouchers');
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-bold cursor-pointer transition-colors border-l-4 border-amber-500"
                        >
                          <td className="py-2 px-3 flex items-center justify-between">
                            <span className="font-sans text-amber-300">{grp.key}</span>
                            <span className="text-[10px] bg-slate-950/40 text-slate-300 px-1.5 py-0.5 rounded font-mono font-normal">
                              {grp.vchCount} Vouchers →
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">{fmtn(grp.taxable)}</td>
                          <td className="py-2 px-3 text-right">{grp.igst ? fmtn(grp.igst) : ''}</td>
                          <td className="py-2 px-3 text-right">{grp.cgst ? fmtn(grp.cgst) : ''}</td>
                          <td className="py-2 px-3 text-right">{grp.sgst ? fmtn(grp.sgst) : ''}</td>
                          <td className="py-2 px-3 text-right">{grp.cess ? fmtn(grp.cess) : ''}</td>
                          <td className="py-2 px-3 text-right font-bold text-amber-300">{fmtn(grp.taxTotal)}</td>
                          <td className="py-2 px-3 text-right font-bold text-white">{fmtn(grp.invoiceTotal)}</td>
                        </tr>
                      ))}

                      {activeHeadData.stateRateBreakdown.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500 italic font-sans">
                            No entries found in Day Book under {selectedHeadTitle} for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* CATEGORY TOTAL FOOTER */}
                    <tfoot>
                      <tr className="bg-[#1e293b] text-slate-100 font-bold border-t-2 border-slate-600 font-mono text-[12px]">
                        <td className="py-2.5 px-3 font-sans uppercase">Total</td>
                        <td className="py-2.5 px-3 text-right">{fmtn(activeHeadData.taxable)}</td>
                        <td className="py-2.5 px-3 text-right">{activeHeadData.igst ? fmtn(activeHeadData.igst) : ''}</td>
                        <td className="py-2.5 px-3 text-right">{activeHeadData.cgst ? fmtn(activeHeadData.cgst) : ''}</td>
                        <td className="py-2.5 px-3 text-right">{activeHeadData.sgst ? fmtn(activeHeadData.sgst) : ''}</td>
                        <td className="py-2.5 px-3 text-right">{activeHeadData.cess ? fmtn(activeHeadData.cess) : ''}</td>
                        <td className="py-2.5 px-3 text-right text-amber-300">{fmtn(activeHeadData.taxTotal)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{fmtn(activeHeadData.invoiceTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* VOUCHER LEVEL LIST VIEW */}
              {(drillSubView === 'vouchers' || selectedStateRateGroup) && (
                <div className="space-y-2">
                  {selectedStateRateGroup && (
                    <div className="bg-slate-900 p-2.5 border border-slate-700 rounded text-xs flex items-center justify-between text-amber-300 font-mono">
                      <span>
                        Filtered by State/Rate: <strong>{selectedStateRateGroup.key}</strong> ({selectedStateRateGroup.vchCount} Vouchers)
                      </span>
                      <button
                        onClick={() => setSelectedStateRateGroup(null)}
                        className="text-xs text-slate-400 hover:text-white underline"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}

                  <div className="border border-slate-700 bg-slate-900 rounded-md overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-[#0f172a] text-slate-300 border-b border-slate-700 font-bold text-[11px] uppercase font-sans">
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Vch / Inv No</th>
                          <th className="py-2 px-3">Party GSTIN</th>
                          <th className="py-2 px-3">Party Name</th>
                          <th className="py-2 px-3">POS / State</th>
                          <th className="py-2 px-3 text-right">Taxable ₹</th>
                          <th className="py-2 px-3 text-right">CGST ₹</th>
                          <th className="py-2 px-3 text-right">SGST ₹</th>
                          <th className="py-2 px-3 text-right">IGST ₹</th>
                          <th className="py-2 px-3 text-right">Total Inv ₹</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                        {(selectedStateRateGroup ? selectedStateRateGroup.vouchers : activeHeadData.vouchers).map(p => (
                          <tr
                            key={p.voucher.id}
                            className="hover:bg-slate-800/80 cursor-pointer transition-colors"
                            onClick={() => setViewingVoucherId(p.voucher.id)}
                          >
                            <td className="py-2 px-3 text-slate-300">{p.date}</td>
                            <td className="py-2 px-3 font-bold text-amber-300">{p.invoiceNo}</td>
                            <td className="py-2 px-3 text-blue-400">{p.gstin || 'Unregistered'}</td>
                            <td className="py-2 px-3 font-sans text-slate-100 font-medium">{p.partyName}</td>
                            <td className="py-2 px-3 text-slate-400">{p.stateName}</td>
                            <td className="py-2 px-3 text-right">{fmtn(p.taxable)}</td>
                            <td className="py-2 px-3 text-right text-slate-300">{p.cgst ? fmtn(p.cgst) : '-'}</td>
                            <td className="py-2 px-3 text-right text-slate-300">{p.sgst ? fmtn(p.sgst) : '-'}</td>
                            <td className="py-2 px-3 text-right text-slate-300">{p.igst ? fmtn(p.igst) : '-'}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-400">{fmtn(p.invoiceTotal)}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setViewingVoucherId(p.voucher.id);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px]"
                              >
                                👁 View Vch
                              </button>
                            </td>
                          </tr>
                        ))}

                        {(selectedStateRateGroup ? selectedStateRateGroup.vouchers : activeHeadData.vouchers).length === 0 && (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-slate-500 font-sans italic">
                              No vouchers found in Day Book for this category.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN VIEW 3: UNCERTAIN TRANSACTIONS (MISMATCHES & CORRECTIONS NEEDED) */}
          {viewMode === 'uncertain' && (
            <div className="space-y-4">
              {/* Header Box matching Screenshot 1 */}
              <div className="bg-[#1e293b] p-3 rounded-md border border-amber-600/80 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">
                    GSTR-1 Reconciliation - Uncertain Transactions
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Details of : <span className="text-amber-300">Uncertain Transactions (Corrections needed)</span>
                  </h3>
                </div>

                <button
                  onClick={() => setViewMode('reconciliation')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded font-bold text-xs"
                >
                  ← Back to Return View
                </button>
              </div>

              {/* YELLOW/ORANGE HEADER BANNER MATCHING SCREENSHOT 1 */}
              <div className="border border-amber-500 bg-slate-900 rounded-md overflow-hidden text-xs">
                <div className="bg-amber-600 text-slate-950 px-3 py-2 font-bold text-xs flex items-center justify-between">
                  <span className="uppercase tracking-wide">Transactions with Incomplete/Mismatch in Information</span>
                  <span className="text-sm font-black font-mono">{gstr1Data.uncertainList.length}</span>
                </div>

                <div className="p-3 bg-slate-950 space-y-3">
                  <div className="text-slate-300 font-semibold text-xs border-b border-slate-800 pb-1">
                    Outward Supplies
                  </div>

                  {/* MISMATCH CATEGORY BREAKDOWN LIST */}
                  <div className="space-y-1 font-sans text-xs">
                    {/* Exception 1: GST Registration Invalid / Missing */}
                    <div
                      onClick={() => setSelectedMismatchCode('invalidGstin')}
                      className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedMismatchCode === 'invalidGstin'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        <span>Invalid or Missing Information: <strong>GST Registration Details of the Party are invalid or not specified</strong></span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {mismatchesByCode.invalidGstin.length}
                      </span>
                    </div>

                    {/* Exception 2: Missing Invoice Number */}
                    <div
                      onClick={() => setSelectedMismatchCode('missingInvNo')}
                      className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedMismatchCode === 'missingInvNo'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        <span>Invalid or Missing Information: <strong>Invoice Number or Voucher Number is missing</strong></span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {mismatchesByCode.missingInvNo.length}
                      </span>
                    </div>

                    {/* Exception 3: Missing HSN details */}
                    <div
                      onClick={() => setSelectedMismatchCode('missingHsn')}
                      className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedMismatchCode === 'missingHsn'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        <span>Invalid or Missing Information: <strong>HSN/SAC details of stock items are missing or invalid</strong></span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {mismatchesByCode.missingHsn.length}
                      </span>
                    </div>

                    {/* Exception 4: Tax Mismatch */}
                    <div
                      onClick={() => setSelectedMismatchCode('taxMismatch')}
                      className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedMismatchCode === 'taxMismatch'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        <span>Tax Rate / Amount Mismatch: <strong>CGST/SGST/IGST tax rates or amounts do not match place of supply</strong></span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {mismatchesByCode.taxMismatch.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIST OF AFFECTED VOUCHERS FOR SELECTED MISMATCH CATEGORY */}
              <div className="border border-slate-700 bg-slate-900 rounded-md p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wide">
                    {selectedMismatchCode
                      ? `Affected Vouchers for Selected Exception (${
                          (mismatchesByCode as any)[selectedMismatchCode]?.length || 0
                        })`
                      : `All Uncertain Transactions Needing Correction (${gstr1Data.uncertainList.length})`}
                  </h4>

                  {selectedMismatchCode && (
                    <button
                      onClick={() => setSelectedMismatchCode(null)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Show All Uncertain Vouchers
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-800 bg-slate-950 rounded border border-slate-800 overflow-x-auto">
                  {(selectedMismatchCode
                    ? (mismatchesByCode as any)[selectedMismatchCode] || []
                    : gstr1Data.uncertainList
                  ).map((p: GSTR1ParsedVoucher) => (
                    <div key={p.voucher.id} className="p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono hover:bg-slate-900/60 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span className="text-amber-300">{p.date}</span>
                          <span>·</span>
                          <span className="text-blue-400">{p.invoiceNo}</span>
                          <span>·</span>
                          <span className="text-slate-200 font-sans">{p.partyName}</span>
                        </div>
                        <div className="text-[11px] text-amber-400 font-sans flex flex-col gap-0.5">
                          {p.mismatches.map((m, idx) => (
                            <div key={idx}>• {m.reason}</div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">₹{fmtn(p.invoiceTotal)}</div>
                          <div className="text-[10px] text-slate-400">Tax: ₹{fmtn(p.taxTotal)}</div>
                        </div>

                        <button
                          onClick={() => {
                            setFixingVoucher(p);
                            setEditGstin(p.gstin || '');
                            setEditInvNo(p.invoiceNo || '');
                            setEditHsn('');
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs shadow flex items-center gap-1"
                        >
                          <span>✏️ Quick Fix Details</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {gstr1Data.uncertainList.length === 0 && (
                    <div className="p-8 text-center text-emerald-400 font-bold font-sans">
                      ✓ Fantastic! All Day Book vouchers are complete with valid GSTIN, invoice numbers, and tax calculations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MAIN VIEW 4: HSN SUMMARY VIEW */}
          {viewMode === 'hsn' && (
            <div className="space-y-3 bg-slate-900 p-4 rounded border border-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-slate-100 uppercase tracking-wide">
                  HSN/SAC Summary - Table 12 (B2B &amp; B2C Outward Supplies)
                </h3>
                <button
                  onClick={() => setViewMode('reconciliation')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs"
                >
                  ← Back to Return View
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-sans">
                      <th className="py-2 px-3">HSN/SAC</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">UQC</th>
                      <th className="py-2 px-3 text-right">Total Qty</th>
                      <th className="py-2 px-3 text-right">Total Value ₹</th>
                      <th className="py-2 px-3 text-right">Taxable Value ₹</th>
                      <th className="py-2 px-3 text-right">CGST ₹</th>
                      <th className="py-2 px-3 text-right">SGST ₹</th>
                      <th className="py-2 px-3 text-right">IGST ₹</th>
                      <th className="py-2 px-3 text-right">Total Tax ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {gstr1Data.hsnSummary.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-bold text-amber-300">{h.hsn}</td>
                        <td className="py-2 px-3 font-sans text-slate-200">{h.desc}</td>
                        <td className="py-2 px-3 text-slate-400">{h.uqc}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.qty)}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.totalVal)}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.taxable)}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.cgst)}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.sgst)}</td>
                        <td className="py-2 px-3 text-right">{fmtn(h.igst)}</td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-bold">{fmtn(h.taxTotal)}</td>
                      </tr>
                    ))}

                    {gstr1Data.hsnSummary.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 font-sans italic">
                          No inventory lines recorded for HSN summary.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAIN VIEW 5: GSTN PORTAL JSON EXPORT & SIMULATION */}
          {viewMode === 'einvoice' && (
            <div className="space-y-4 bg-slate-900 p-4 rounded border border-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-emerald-400 uppercase tracking-wide">
                  ⚡ GSTR-1 Official GSTN Portal Export Payload
                </h3>
                <button
                  onClick={() => setViewMode('reconciliation')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs"
                >
                  ← Back to Return View
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[350px]">
                <pre>
                  {JSON.stringify(
                    {
                      gstin: co.gstin || '18ABDPY3955G1Z7',
                      fp: '062026',
                      gt: totalInvoiceVal,
                      cur_gt: totalInvoiceVal,
                      b2b: gstr1Data.b2b.vouchers.map(p => ({
                        ctin: p.gstin || '18AAAAA0000A1Z5',
                        inv: [
                          {
                            inum: p.invoiceNo,
                            idt: p.date,
                            val: p.invoiceTotal,
                            pos: p.stateCode,
                            rchrg: 'N',
                            inv_ty: 'R',
                            itms: [
                              {
                                num: 1,
                                itm_det: {
                                  rt: p.taxRate,
                                  txval: p.taxable,
                                  camt: p.cgst,
                                  samt: p.sgst,
                                  iamt: p.igst,
                                  csamt: p.cess,
                                },
                              },
                            ],
                          },
                        ],
                      })),
                      b2cs: gstr1Data.b2cSmall.vouchers.map(p => ({
                        sply_ty: p.isInterstate ? 'INTER' : 'INTRA',
                        pos: p.stateCode,
                        rt: p.taxRate,
                        txval: p.taxable,
                        iamt: p.igst,
                        camt: p.cgst,
                        samt: p.sgst,
                      })),
                      hsn: {
                        data: gstr1Data.hsnSummary,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(gstr1Data, null, 2)], {
                      type: 'application/json',
                    });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `GSTR1-Portal-Export-${co.name.replace(/\s+/g, '_')}.json`;
                    a.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded shadow"
                >
                  ⬇ Download Official GSTR-1 Portal JSON File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. RIGHT SIDE TALLY ACTION PANEL (STANDARD LIGHT BLUE SIDEBAR) */}
        <div className="w-full xl:w-56 bg-[#dbeafe] text-slate-900 border-l border-blue-300 p-1 flex flex-col justify-between text-xs select-none">
          <div className="space-y-1">
            {/* F2 Period */}
            <button
              onClick={() => setShowPeriodModal(true)}
              className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1.5 rounded font-bold text-blue-950 flex items-center justify-between shadow-sm active:translate-y-0.5 transition-all"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-blue-700 underline font-black">F2</span>: Period
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Alt+F2</span>
            </button>

            {/* F3 Company */}
            <button className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1.5 rounded font-semibold text-slate-800 flex items-center justify-between">
              <span>
                <span className="text-blue-700 underline">F3</span>: Company
              </span>
            </button>

            {/* F5 Toggle View */}
            {viewMode === 'drilldown' && (
              <button
                onClick={() => setDrillSubView(prev => (prev === 'summary' ? 'vouchers' : 'summary'))}
                className="w-full text-left bg-amber-100 hover:bg-amber-200 border border-amber-400 px-2.5 py-1.5 rounded font-bold text-slate-900 flex items-center justify-between shadow-sm"
              >
                <span>
                  <span className="text-amber-800 underline">F5</span>: {drillSubView === 'summary' ? 'Voucher View' : 'Summary'}
                </span>
              </button>
            )}

            <div className="pt-2 border-t border-blue-300 space-y-1">
              <button
                onClick={() => {
                  setViewMode('reconciliation');
                  setSelectedStateRateGroup(null);
                }}
                className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-medium text-slate-800"
              >
                <span className="underline">B</span>: Basis of Values
              </button>

              <button
                onClick={() =>
                  setViewMode(prev => (prev === 'reconciliation' ? 'drilldown' : 'reconciliation'))
                }
                className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-medium text-slate-800"
              >
                <span className="underline">H</span>: Change View
              </button>

              <button
                onClick={() => setViewMode('uncertain')}
                className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-bold text-amber-900"
              >
                <span className="underline font-black">J</span>: Exception Reports
              </button>

              <button className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-medium text-slate-800">
                <span className="underline">L</span>: Save View
              </button>

              <button
                onClick={() => window.open('https://tutorial.gst.gov.in/', '_blank')}
                className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded shadow flex items-center justify-between"
              >
                <span>
                  <span className="underline font-black">V</span>: Open GST Portal
                </span>
                <span>↗</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-300">
            <button
              onClick={() => setShowPeriodModal(true)}
              className="w-full text-left bg-white hover:bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-semibold text-slate-800"
            >
              F12: Configure
            </button>
          </div>
        </div>
      </div>

      {/* 5. TALLY BOTTOM ACTION BAR */}
      <div className="bg-[#0f172a] border-t border-slate-700 px-3 py-1.5 flex items-center justify-between text-xs text-slate-400 font-mono select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('reconciliation')}
            className="hover:text-white flex items-center gap-1"
          >
            <span className="font-bold text-amber-400">Q: Quit</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-400">
          Agri-Accounting &amp; Compliance · Executive ERP Mode
        </div>
      </div>

      {/* 6. PERIOD CHANGE MODAL (ALT + F2) */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-blue-500/80 rounded-xl max-w-md w-full p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span>📅 Select Period (Alt + F2)</span>
              </h3>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">To Date:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700"
                >
                  🌐 All Time (Poora Data)
                </button>
                <button
                  onClick={() => {
                    setFromDate('2026-06-01');
                    setToDate('2026-06-30');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700"
                >
                  June 2026
                </button>
                <button
                  onClick={() => {
                    setFromDate('2025-04-01');
                    setToDate('2026-03-31');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700"
                >
                  FY 2025-26
                </button>
                <button
                  onClick={() => {
                    setFromDate('2026-04-01');
                    setToDate('2027-03-31');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700"
                >
                  FY 2026-27
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPeriodModal(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs"
              >
                Apply Period
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. QUICK FIX MODAL FOR UNCERTAIN TRANSACTIONS */}
      {fixingVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-500 rounded-xl max-w-lg w-full p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span>✏️ Correct Voucher Details ({fixingVoucher.invoiceNo})</span>
              </h3>
              <button
                onClick={() => setFixingVoucher(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200">{fixingVoucher.partyName}</div>
                <div className="text-slate-400 text-[11px] font-mono">
                  Date: {fixingVoucher.date} · Invoice Total: ₹{fmtn(fixingVoucher.invoiceTotal)}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Party GSTIN (15 characters):</label>
                <input
                  type="text"
                  maxLength={15}
                  value={editGstin}
                  onChange={e => setEditGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 18AAAAA0000A1Z5"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-blue-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Invoice / Voucher Number:</label>
                <input
                  type="text"
                  value={editInvNo}
                  onChange={e => setEditInvNo(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Stock Item HSN Code (if missing):</label>
                <input
                  type="text"
                  value={editHsn}
                  onChange={e => setEditHsn(e.target.value)}
                  placeholder="e.g. 1006 or 0401"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setFixingVoucher(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuickFix}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs shadow"
              >
                Save &amp; Resolve Mismatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. VOUCHER DETAIL MODAL */}
      {viewingVoucherId && (
        <VoucherDetailModal
          co={co}
          vid={viewingVoucherId}
          onClose={() => setViewingVoucherId(null)}
        />
      )}
    </div>
  );
};
