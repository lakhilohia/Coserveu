import React, { useRef, useState } from 'react';
import { AppDatabase, Company, Session } from '../types';
import { ROLES } from '../data/roles';
import { licenseDaysLeft, saveDB } from '../utils/db';
import { processDataImportFiles } from '../utils/tallyImporter';
import { TallyImportModal } from './TallyImportModal';

interface HeaderProps {
  co: Company;
  db: AppDatabase;
  setDB: React.Dispatch<React.SetStateAction<AppDatabase>>;
  session: Session;
  setSession: (s: Session | null) => void;
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lic: any;
  setLic: (l: any) => void;
  onOpenExportBundle: () => void;
  onNav?: (p: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  co,
  db,
  setDB,
  session,
  setSession,
  setNavOpen,
  lic,
  setLic,
  onOpenExportBundle,
  onNav,
}) => {
  const daysLeft = licenseDaysLeft(lic);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTallyModal, setShowTallyModal] = useState(false);
  const visitorCount = db.visitorCount || 1482;

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const res = await processDataImportFiles(files, db);
      if (res.success && res.db) {
        setDB(res.db);
        saveDB(res.db);
        alert(res.message);
      } else {
        alert('❌ ' + (res.message || 'Failed to process import files.'));
      }
    } catch (err: any) {
      alert('❌ Failed to restore data: ' + String(err?.message || err));
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setNavOpen(o => !o)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800 border border-slate-700"
          title="Toggle Navigation"
        >
          ☰
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              {co.name}
            </h1>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              🟢 100% Offline Local Mode
            </span>
          </div>
          <p className="text-xs text-slate-400">
            FY {co.fyStart} → {co.fyEnd} · GSTIN: {co.gstin || 'Not configured'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {session.role === 'Domain Expert' || session.role === 'CA' ? (
          <select
            value={db.active || ''}
            onChange={e => setDB({ ...db, active: e.target.value })}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 max-w-[240px] focus:outline-none focus:border-blue-500"
          >
            {[...db.companies]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        ) : (
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            🔒 {co.name}
          </span>
        )}

        <button
          onClick={() => onNav && onNav('login_reg')}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700 font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Click to view User Login Register & Visitor Counter"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>👁️ Visitor Count: <strong className="text-amber-300 font-bold">{visitorCount.toLocaleString('en-IN')}</strong></span>
        </button>

        <span className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700">
          {session.name} ({session.role})
        </span>

        {session.role === 'Domain Expert' ? (
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
            🔓 Full Access
          </span>
        ) : (
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
            🔑 {daysLeft}d left
          </span>
        )}

        <button
          onClick={onOpenExportBundle}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          title="Export colorful Excel, P&L, Balance Sheet, and attachments as ZIP"
        >
          📦 ZIP &amp; Excel Export
        </button>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `accounting-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          }}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors"
          title="Download JSON Backup"
        >
          ⬇ Backup
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileRestore}
          multiple
          accept=".json,.zip,.rar,.xml,.xlsx,.xls,.csv,application/json,application/zip,application/x-rar-compressed,text/xml"
          className="hidden"
        />

        <button
          onClick={() => setShowTallyModal(true)}
          className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          title="Restore / Import Accounting Data, ZIP, RAR, XML, Excel, or JSON Backup"
        >
          ⬆ Restore / Import Data
        </button>

        <button
          onClick={() => setSession(null)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {showTallyModal && (
        <TallyImportModal
          db={db}
          setDB={setDB}
          onClose={() => setShowTallyModal(false)}
        />
      )}
    </header>
  );
};
