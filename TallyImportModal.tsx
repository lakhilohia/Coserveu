import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { AppDatabase, Company, Ledger, Voucher, VoucherEntryLine } from '../types';
import { processDataImportFiles, resolveTallyGroup, sanitizeVouchers } from '../utils/tallyImporter';
import { saveDB } from '../utils/db';
import { uid, today } from '../data/seedFPCs';
import { fmtn } from '../utils/engine';

interface TallyImportModalProps {
  db: AppDatabase;
  setDB: React.Dispatch<React.SetStateAction<AppDatabase>>;
  onClose: () => void;
}

export const TallyImportModal: React.FC<TallyImportModalProps> = ({ db, setDB, onClose }) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'excel_mapping'>('auto');

  // Auto Importer state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Excel Mapping state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<any[][]>([]);

  // Column Map
  const [colMap, setColMap] = useState<{
    dateCol: number;
    vtypeCol: number;
    refCol: number;
    partyCol: number;
    partCol: number;
    drCol: number;
    crCol: number;
    narrCol: number;
  }>({
    dateCol: -1,
    vtypeCol: -1,
    refCol: -1,
    partyCol: -1,
    partCol: -1,
    drCol: -1,
    crCol: -1,
    narrCol: -1,
  });

  const activeCo = db.companies[0] || null;

  // Auto-importer handler
  const handleProcessFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setMsg('Processing selected Tally data / archive files...');
    setError(null);

    try {
      const res = await processDataImportFiles(files, db);
      if (res.success && res.db) {
        setDB(res.db);
        saveDB(res.db);
        setMsg(res.message);
      } else {
        setError(res.message || 'Failed to import selected Tally data.');
      }
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (activeTab === 'auto') {
        handleProcessFiles(e.dataTransfer.files);
      } else {
        handleExcelUpload(e.dataTransfer.files[0]);
      }
    }
  };

  // Excel File upload handler
  const handleExcelUpload = async (file: File) => {
    if (!file) return;
    setExcelFile(file);
    setLoading(true);
    setMsg(`Reading Excel file "${file.name}"...`);
    setError(null);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      setWorkbook(wb);

      const sheetNames = wb.SheetNames;
      if (!sheetNames || sheetNames.length === 0) {
        throw new Error('No worksheets found in this Excel file.');
      }

      setSheets(sheetNames);
      setSelectedSheet(sheetNames[0]);
      parseSheet(wb, sheetNames[0]);
      setMsg(`Loaded Excel file "${file.name}". Map the columns below and push to CoServeU.`);
    } catch (err: any) {
      setError('Error reading Excel spreadsheet: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const parseSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    const rawJson: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rawJson || rawJson.length === 0) {
      setExcelHeaders([]);
      setExcelRows([]);
      return;
    }

    // Find header row (first row with 2+ columns)
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
      if (rawJson[i] && rawJson[i].length >= 2) {
        headerIdx = i;
        break;
      }
    }

    const headers = (rawJson[headerIdx] || []).map((h, colIdx) =>
      String(h !== undefined && h !== null ? h : `Column ${colIdx + 1}`).trim()
    );
    const rows = rawJson
      .slice(headerIdx + 1)
      .filter(r => r && r.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));

    setExcelHeaders(headers);
    setExcelRows(rows);

    // Auto-detect matching headers
    const autoMap = {
      dateCol: -1,
      vtypeCol: -1,
      refCol: -1,
      partyCol: -1,
      partCol: -1,
      drCol: -1,
      crCol: -1,
      narrCol: -1,
    };

    headers.forEach((h, idx) => {
      const l = h.toLowerCase();
      if (l.includes('date') && autoMap.dateCol === -1) autoMap.dateCol = idx;
      else if ((l.includes('type') || l.includes('vtype') || l.includes('voucher type')) && autoMap.vtypeCol === -1)
        autoMap.vtypeCol = idx;
      else if ((l.includes('no') || l.includes('num') || l.includes('ref') || l.includes('inv')) && autoMap.refCol === -1)
        autoMap.refCol = idx;
      else if (
        (l.includes('party') || l.includes('customer') || l.includes('vendor') || l.includes('supplier') || l.includes('account')) &&
        autoMap.partyCol === -1
      )
        autoMap.partyCol = idx;
      else if (
        (l.includes('particular') || l.includes('ledger') || l.includes('expense') || l.includes('head') || l.includes('item')) &&
        autoMap.partCol === -1
      )
        autoMap.partCol = idx;
      else if ((l.includes('debit') || l.includes('dr')) && !l.includes('cr') && autoMap.drCol === -1)
        autoMap.drCol = idx;
      else if ((l.includes('credit') || l.includes('cr')) && autoMap.crCol === -1) autoMap.crCol = idx;
      else if ((l.includes('narr') || l.includes('remark') || l.includes('desc')) && autoMap.narrCol === -1)
        autoMap.narrCol = idx;
      else if ((l.includes('amount') || l.includes('amt') || l.includes('value')) && autoMap.drCol === -1)
        autoMap.drCol = idx;
    });

    setColMap(autoMap);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbook) {
      parseSheet(workbook, sheetName);
    }
  };

  // Push Mapped Excel Rows directly to CoServeU Books
  const handlePushToCoServeU = () => {
    if (!activeCo) {
      setError('No active company selected in CoServeU.');
      return;
    }
    if (excelRows.length === 0) {
      setError('No valid rows found in selected sheet to import.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const existingLedgerMap = new Map<string, Ledger>();
      activeCo.ledgers.forEach(l => existingLedgerMap.set(l.name.toLowerCase(), l));

      const newLedgersList: Ledger[] = [];
      const createdVouchers: Voucher[] = [];
      let totalVolume = 0;

      excelRows.forEach((row, idx) => {
        const rawDate = colMap.dateCol >= 0 ? String(row[colMap.dateCol] || '') : '';
        const vDate = rawDate ? rawDate.replace(/\//g, '-').slice(0, 10) : today();

        const rawType = colMap.vtypeCol >= 0 ? String(row[colMap.vtypeCol] || '').trim() : '';
        const rawRef = colMap.refCol >= 0 ? String(row[colMap.refCol] || '').trim() : `EXCEL-${uid().slice(0, 6)}`;
        const partyName = colMap.partyCol >= 0 ? String(row[colMap.partyCol] || '').trim() : '';
        const partName = colMap.partCol >= 0 ? String(row[colMap.partCol] || '').trim() : '';
        const narration = colMap.narrCol >= 0 ? String(row[colMap.narrCol] || '').trim() : `Excel Push Row #${idx + 1}`;

        const drVal = colMap.drCol >= 0 ? Math.abs(parseFloat(String(row[colMap.drCol] || '0').replace(/,/g, '')) || 0) : 0;
        const crVal = colMap.crCol >= 0 ? Math.abs(parseFloat(String(row[colMap.crCol] || '0').replace(/,/g, '')) || 0) : 0;

        const rowAmt = drVal || crVal || 0;
        if (rowAmt <= 0 && !partyName && !partName) return;

        // Resolve or auto-create Party Ledger
        let partyLedger = partyName ? existingLedgerMap.get(partyName.toLowerCase()) : null;
        if (partyName && !partyLedger) {
          const grp = resolveTallyGroup('', partyName);
          partyLedger = {
            id: `led_map_${uid()}`,
            name: partyName,
            grp,
            ob: 0,
            obt: 'Dr',
          };
          existingLedgerMap.set(partyName.toLowerCase(), partyLedger);
          newLedgersList.push(partyLedger);
        }

        // Resolve or auto-create Particulars Ledger
        let partLedger = partName ? existingLedgerMap.get(partName.toLowerCase()) : null;
        if (partName && !partLedger) {
          const grp = resolveTallyGroup('', partName);
          partLedger = {
            id: `led_map_${uid()}`,
            name: partName,
            grp,
            ob: 0,
            obt: 'Dr',
          };
          existingLedgerMap.set(partName.toLowerCase(), partLedger);
          newLedgersList.push(partLedger);
        }

        const bankOrCash = activeCo.ledgers.find(l => l.grp === 'g_bank') || activeCo.ledgers.find(l => l.grp === 'g_cash') || activeCo.ledgers[0];

        const drLedId = partyLedger ? partyLedger.id : (bankOrCash ? bankOrCash.id : 'l_cash');
        const crLedId = partLedger ? partLedger.id : (bankOrCash ? bankOrCash.id : 'l_cash');

        // Deduce voucher type
        let finalVType = 'Payment';
        if (rawType) {
          if (/rec/i.test(rawType)) finalVType = 'Receipt';
          else if (/sal/i.test(rawType)) finalVType = 'Sales';
          else if (/pur/i.test(rawType)) finalVType = 'Purchase';
          else if (/jou/i.test(rawType)) finalVType = 'Journal';
          else if (/con/i.test(rawType)) finalVType = 'Contra';
        } else {
          if (crVal > 0 && drVal === 0) finalVType = 'Receipt';
          else finalVType = 'Payment';
        }

        let entries: VoucherEntryLine[] = [];
        if (drVal > 0 && crVal > 0) {
          entries = [
            { led: drLedId, dr: drVal, cr: 0 },
            { led: crLedId, dr: 0, cr: crVal },
          ];
        } else {
          const amt = drVal || crVal || 1000;
          if (finalVType === 'Receipt') {
            entries = [
              { led: bankOrCash ? bankOrCash.id : drLedId, dr: amt, cr: 0 },
              { led: crLedId, dr: 0, cr: amt },
            ];
          } else {
            entries = [
              { led: drLedId, dr: amt, cr: 0 },
              { led: bankOrCash ? bankOrCash.id : crLedId, dr: 0, cr: amt },
            ];
          }
        }

        totalVolume += rowAmt;

        createdVouchers.push({
          id: `vch_ex_${uid()}`,
          type: finalVType,
          no: rawRef || `EXCEL-${idx + 1}`,
          date: vDate,
          narration: narration || `Excel mapped import from sheet ${selectedSheet}`,
          partyName: partyName || partName || 'Excel Party',
          entries,
          createdBy: 'Excel Push Importer',
          createdAt: new Date().toISOString(),
          imported: true,
        });
      });

      // Combine ledgers and run double-entry sanitization
      const allCombinedLedgers = [...activeCo.ledgers, ...newLedgersList];
      const sanitized = sanitizeVouchers(createdVouchers, allCombinedLedgers);

      // Mutate and save database
      const newDb: AppDatabase = JSON.parse(JSON.stringify(db));
      const targetCo = newDb.companies.find(c => c.id === activeCo.id);
      if (targetCo) {
        targetCo.ledgers.push(...newLedgersList);
        targetCo.vouchers.unshift(...sanitized);

        setDB(newDb);
        saveDB(newDb);

        setMsg(`🚀 SUCCESS! Pushed ${sanitized.length} double-entry vouchers and created ${newLedgersList.length} ledgers into ${targetCo.name}! Total turnover: ₹ ${fmtn(totalVolume)}.`);
      }
    } catch (err: any) {
      setError('Error pushing mapped Excel data: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Preview Totals
  const previewTotDr = excelRows.reduce((s, row) => {
    if (colMap.drCol < 0) return s;
    return s + (Math.abs(parseFloat(String(row[colMap.drCol] || '0').replace(/,/g, '')) || 0));
  }, 0);

  const previewTotCr = excelRows.reduce((s, row) => {
    if (colMap.crCol < 0) return s;
    return s + (Math.abs(parseFloat(String(row[colMap.crCol] || '0').replace(/,/g, '')) || 0));
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-6 max-w-4xl w-full shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg">
          ✕
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Data Importer &amp; Column Mapper
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1">
            Import Accounting Data, RAR/ZIP Archives or Map Excel directly to Company Books
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Company: <strong className="text-amber-300">{activeCo?.name || 'Primary FPC'}</strong>
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'auto'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📦 Auto Data / Folder / Archive / PDF Importer
          </button>
          <button
            onClick={() => setActiveTab('excel_mapping')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'excel_mapping'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Excel Column Mapping &amp; Direct Push
          </button>
        </div>

        {/* TAB 1: AUTO TALLY IMPORTER */}
        {activeTab === 'auto' && (
          <div className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-800/40 rounded-xl p-6 text-center space-y-3 transition-colors cursor-pointer"
            >
              <div className="text-3xl">📄 📦 📁</div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Drag &amp; Drop <span className="text-red-400">PDF Statements</span>, Backup <span className="text-amber-400">Data.rar</span>, ZIP, XML, or Extracted <span className="text-amber-400">Company Data Folder</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  or select from your computer using the options below:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files && handleProcessFiles(e.target.files)}
                  multiple
                  accept=".pdf,.rar,.zip,.xml,.json,.xlsx,.xls,.csv,*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5"
                >
                  📄 Select PDF / RAR / ZIP / XML File
                </button>

                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={e => e.target.files && handleProcessFiles(e.target.files)}
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5"
                >
                  📁 Select Extracted Folder (100000 / Data)
                </button>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Supported Financial Formats:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong className="text-slate-200">PDF Reports &amp; Statements:</strong> PDF Daybook, Bank Statements, Invoices, Ledger Statements</li>
                <li><strong className="text-slate-200">Compressed Archives:</strong> Data.rar, Data.zip, backup archives</li>
                <li><strong className="text-slate-200">Extracted Accounting Folders:</strong> 100000, Data, Company.1800, Manager.1800</li>
                <li><strong className="text-slate-200">XML Accounting Exports:</strong> DayBook.xml, Master.xml, GSTR-1 export XMLs</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: EXCEL TO COSERVEU COLUMN MAPPING & PUSH */}
        {activeTab === 'excel_mapping' && (
          <div className="space-y-4">
            {/* Step 1: Upload Excel File */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Step 1: Upload Excel Spreadsheet (.xlsx, .xls, .csv)</h3>
                  <p className="text-[11px] text-slate-400">Select any transaction spreadsheet to map columns to CoServeU double-entry books.</p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={excelInputRef}
                    onChange={e => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />
                  <button
                    onClick={() => excelInputRef.current?.click()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5"
                  >
                    📊 Choose Excel / CSV File
                  </button>
                </div>
              </div>

              {/* Sheet Selector */}
              {sheets.length > 1 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-300 font-semibold">Select Sheet:</span>
                  <select
                    value={selectedSheet}
                    onChange={e => handleSheetChange(e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
                  >
                    {sheets.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Interactive Column Mapping Grid */}
            {excelHeaders.length > 0 && (
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Step 2: Map Excel Columns to CoServeU Fields</h3>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                    Auto-Detected Headers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* Date Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Voucher Date</label>
                    <select
                      value={colMap.dateCol}
                      onChange={e => setColMap(cm => ({ ...cm, dateCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Not Mapped (Use Today) --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voucher Type Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Voucher Type</label>
                    <select
                      value={colMap.vtypeCol}
                      onChange={e => setColMap(cm => ({ ...cm, vtypeCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Infer Payment / Receipt --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ref / Voucher No Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Voucher / Invoice No</label>
                    <select
                      value={colMap.refCol}
                      onChange={e => setColMap(cm => ({ ...cm, refCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Auto Generate --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Party Name Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Party / Account Name</label>
                    <select
                      value={colMap.partyCol}
                      onChange={e => setColMap(cm => ({ ...cm, partyCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Select Column --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Particulars / Expense Head Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Particulars / Expense Head</label>
                    <select
                      value={colMap.partCol}
                      onChange={e => setColMap(cm => ({ ...cm, partCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Select Column --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Debit Amount Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Debit Amount (₹)</label>
                    <select
                      value={colMap.drCol}
                      onChange={e => setColMap(cm => ({ ...cm, drCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-emerald-300 font-bold"
                    >
                      <option value={-1}>-- Select Column --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Credit Amount Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Credit Amount (₹)</label>
                    <select
                      value={colMap.crCol}
                      onChange={e => setColMap(cm => ({ ...cm, crCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-amber-300 font-bold"
                    >
                      <option value={-1}>-- Select Column --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Narration Column */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Narration / Remarks</label>
                    <select
                      value={colMap.narrCol}
                      onChange={e => setColMap(cm => ({ ...cm, narrCol: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                    >
                      <option value={-1}>-- Not Mapped --</option>
                      {excelHeaders.map((h, i) => (
                        <option key={i} value={i}>
                          Col {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Live Preview Table & Direct Push Action */}
            {excelRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                  <div>
                    <span className="font-bold text-slate-200">
                      Previewing {Math.min(excelRows.length, 10)} of {excelRows.length} Rows
                    </span>
                    <span className="text-slate-400 ml-2">
                      (Total Debit: <strong className="text-emerald-300">₹ {fmtn(previewTotDr)}</strong> | Total Credit: <strong className="text-amber-300">₹ {fmtn(previewTotCr)}</strong>)
                    </span>
                  </div>

                  <button
                    onClick={handlePushToCoServeU}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
                  >
                    🚀 Push {excelRows.length} Mapped Vouchers to CoServeU
                  </button>
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto border border-slate-700 rounded-xl bg-slate-950">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Vch Type</th>
                        <th className="py-2 px-3">Party Name</th>
                        <th className="py-2 px-3">Particulars Head</th>
                        <th className="py-2 px-3 text-right">Debit ₹</th>
                        <th className="py-2 px-3 text-right">Credit ₹</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {excelRows.slice(0, 10).map((row, idx) => {
                        const rawDate = colMap.dateCol >= 0 ? String(row[colMap.dateCol] || '') : '';
                        const rawType = colMap.vtypeCol >= 0 ? String(row[colMap.vtypeCol] || '') : 'Payment';
                        const party = colMap.partyCol >= 0 ? String(row[colMap.partyCol] || '-') : '-';
                        const part = colMap.partCol >= 0 ? String(row[colMap.partCol] || '-') : '-';
                        const dr = colMap.drCol >= 0 ? parseFloat(String(row[colMap.drCol] || '0')) || 0 : 0;
                        const cr = colMap.crCol >= 0 ? parseFloat(String(row[colMap.crCol] || '0')) || 0 : 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono">{rawDate || today()}</td>
                            <td className="py-2 px-3">
                              <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                                {rawType}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-200">{party}</td>
                            <td className="py-2 px-3 text-slate-300">{part}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400">
                              {dr > 0 ? fmtn(dr) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-amber-400">
                              {cr > 0 ? fmtn(cr) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-lg text-xs text-blue-300 flex items-center gap-2">
            <span className="animate-spin text-sm">⏳</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Message Banner */}
        {msg && !loading && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 font-medium">
            {msg}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 font-medium">
            ❌ {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
