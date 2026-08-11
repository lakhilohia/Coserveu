import React, { useState } from 'react';
import { Company, TDSEntry } from '../types';
import { calculateTDSRequirement, fmt, fmtn } from '../utils/engine';
import { uid, today } from '../data/seedFPCs';

interface TDSModuleProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
}

export const TDSModule: React.FC<TDSModuleProps> = ({ co, update }) => {
  const [vendorName, setVendorName] = useState('');
  const [pan, setPan] = useState('');
  const [section, setSection] = useState<'194Q' | '194H' | '194C' | '194I' | '194J' | '192' | '194A'>('194Q');
  const [grossAmount, setGrossAmount] = useState('');

  const calc = calculateTDSRequirement(+grossAmount || 0, section);

  const addTDSEntry = () => {
    if (!vendorName.trim() || !+grossAmount) return;
    const entry: TDSEntry = {
      id: uid(),
      vendorName: vendorName.trim(),
      pan: pan.trim() || 'PANNOTPROVIDED',
      section,
      grossAmount: +grossAmount,
      thresholdLimit: calc.threshold,
      tdsRate: calc.rate,
      tdsAmount: calc.tds,
      paymentDate: today(),
      status: 'Accrued',
    };

    update(c => {
      c.tdsList = c.tdsList || [];
      c.tdsList.unshift(entry);
    });

    setVendorName('');
    setPan('');
    setGrossAmount('');
  };

  const sectionDescriptions = {
    '194Q': 'TDS on Purchase of Goods (> ₹50 Lakhs) - 0.1%',
    '194H': 'TDS on Commission / Brokerage (> ₹15,000) - 5%',
    '194C': 'TDS on Transport & Contractors (> ₹30,000) - 1% / 2%',
    '194I': 'TDS on Rent for Godown / Land / Buildings (> ₹2,40,000) - 10%',
    '194J': 'TDS on Professional & Technical Fees (> ₹30,000) - 10%',
    '192': 'TDS on Salary payments (> ₹50,000 monthly) - Slab / 10%',
    '194A': 'TDS on Interest on Securities & Loans (> ₹5,000) - 10%',
  };

  const list = co.tdsList || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">📑 TDS Deduction &amp; Imposition Register</h2>
        <p className="text-xs text-slate-400">
          Chapter XVII-B Income Tax Act, 1961 · 194Q, 194H, 194C, 194I, 194J, 192, 194A Compliance
        </p>
      </div>

      {/* TDS Calculator & Entry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Compute &amp; Deduct TDS
          </h3>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">TDS Section</label>
            <select
              value={section}
              onChange={e => setSection(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="194Q">194Q - Purchase of Goods &gt; 50 Lakhs (0.1%)</option>
              <option value="194H">194H - Commission / Brokerage (5%)</option>
              <option value="194C">194C - Transport / Contractor (1% / 2%)</option>
              <option value="194I">194I - Godown / Building Rent (10%)</option>
              <option value="194J">194J - Professional Fee (10%)</option>
              <option value="192">192 - Salary Payments (&gt; 50k)</option>
              <option value="194A">194A - Interest on Securities (10%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Deductee / Vendor Name</label>
            <input
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              placeholder="Full Vendor or Employee Name"
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Vendor PAN</label>
            <input
              value={pan}
              onChange={e => setPan(e.target.value)}
              placeholder="10-digit PAN (e.g. ABCDE1234F)"
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Gross Payment Amount ₹</label>
            <input
              type="number"
              value={grossAmount}
              onChange={e => setGrossAmount(e.target.value)}
              placeholder="Gross payment before TDS"
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100"
            />
          </div>

          <div className="p-3 bg-slate-800/80 rounded border border-slate-700 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Threshold Limit:</span>
              <span className="font-mono text-slate-200">{fmt(calc.threshold)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TDS Rate:</span>
              <span className="font-mono text-slate-200">{calc.rate}%</span>
            </div>
            <div className="flex justify-between text-slate-200 font-bold border-t border-slate-700 pt-1">
              <span>Computed TDS ₹:</span>
              <span className="text-amber-400 font-mono">{fmt(calc.tds)}</span>
            </div>
          </div>

          <button
            onClick={addTDSEntry}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded text-xs transition-colors"
          >
            Record TDS Deduction
          </button>
        </div>

        {/* Recorded TDS Deductions Table */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            TDS Deductions Register (Form 26Q &amp; Challan 281)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Vendor / Deductee</th>
                  <th className="py-2.5 px-3">PAN</th>
                  <th className="py-2.5 px-3 text-right">Gross Amount ₹</th>
                  <th className="py-2.5 px-3 text-right">TDS Deducted ₹</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {list.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{t.paymentDate}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{t.section}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{t.vendorName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{t.pan}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{fmtn(t.grossAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">{fmtn(t.tdsAmount)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No TDS deductions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
