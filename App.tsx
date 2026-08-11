import React, { useState, useEffect } from 'react';
import { AppDatabase, Session } from './types';
import { loadDB, saveDB, loadLicense, saveLicense } from './utils/db';
import { seedFPCs } from './data/seedFPCs';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { VoucherEntry } from './components/VoucherEntry';
import { DayBook } from './components/DayBook';
import { VouchersList } from './components/VouchersList';
import { Registers } from './components/Registers';
import { FinancialStatements } from './components/FinancialStatements';
import { GSTR1Module } from './components/GSTR1Module';
import { TDSModule } from './components/TDSModule';
import { ExportBundleModal } from './components/ExportBundleModal';
import { VoucherDetailModal } from './components/VoucherDetailModal';
import { LedgerVoucherModal } from './components/LedgerVoucherModal';

import { MastersModule } from './components/MastersModule';
import { SmartPDFModule } from './components/SmartPDFModule';
import { BankFeedModule } from './components/BankFeedModule';
import { ReportsModule } from './components/ReportsModule';
import { ComplianceModule } from './components/ComplianceModule';
import { AdminSettingsModule } from './components/AdminSettingsModule';
import { PrivacyPolicyModule } from './components/PrivacyPolicyModule';
import { LoginRegisterModule } from './components/LoginRegisterModule';

export default function App() {
  const [db, setDB] = useState<AppDatabase>(loadDB);
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('coservu_session') || '');
      if (s && s.at && Date.now() - s.at < 86400000) return s.session;
    } catch (e) {}
    return null;
  });

  const [page, setPage] = useState<string>('dashboard');
  const [drill, setDrill] = useState<any>(null);
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [lic, setLic] = useState<any>(loadLicense);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  useEffect(() => {
    saveDB(db);
  }, [db]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('coservu_session', JSON.stringify({ session, at: Date.now() }));
    } else {
      localStorage.removeItem('coservu_session');
    }
  }, [session]);

  const co = db.companies.find(c => c.id === db.active) || db.companies[0];

  const updateCompany = (fn: (c: typeof co) => void) => {
    setDB(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const c = next.companies.find((x: any) => x.id === next.active) || next.companies[0];
      if (c) fn(c);
      return next;
    });
  };

  const logAudit = (c: typeof co, action: string, detail: string, meta?: any) => {
    c.audit = c.audit || [];
    c.audit.unshift({
      id: Math.random().toString(36).slice(2, 10),
      ts: new Date().toISOString(),
      user: session ? session.name : 'system',
      role: session ? session.role : '-',
      action,
      detail,
      ...(meta || {}),
    });
  };

  if (!session) {
    return <Login db={db} setDB={setDB} onLogin={setSession} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        co={co}
        db={db}
        setDB={setDB}
        session={session}
        setSession={setSession}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        lic={lic}
        setLic={setLic}
        onOpenExportBundle={() => setShowExportModal(true)}
        onNav={setPage}
      />

      <div className="flex flex-1">
        <Sidebar page={page} setPage={setPage} navOpen={navOpen} setNavOpen={setNavOpen} session={session} />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full min-w-0">
          {page === 'dashboard' && <Dashboard co={co} nav={setPage} setDrill={setDrill} />}
          {page === 'daybook' && (
            <DayBook
              co={co}
              update={updateCompany}
              logAudit={logAudit}
              session={session}
              nav={setPage}
              setDrill={setDrill}
            />
          )}
          {page === 'voucher' && (
            <VoucherEntry
              co={co}
              update={updateCompany}
              logAudit={logAudit}
              session={session}
              drill={drill}
              setDrill={setDrill}
            />
          )}
          {page === 'vouchers' && (
            <VouchersList
              co={co}
              update={updateCompany}
              logAudit={logAudit}
              session={session}
              nav={setPage}
              setDrill={setDrill}
            />
          )}

          {(page === 'grand_reg' ||
            page === 'purchase_reg' ||
            page === 'sales_reg' ||
            page === 'expense_reg' ||
            page === 'income_reg' ||
            page === 'assets_reg' ||
            page === 'share_reg' ||
            page === 'cash_reg') && (
            <Registers
              co={co}
              update={updateCompany}
              tab={page as any}
              setDrill={setDrill}
            />
          )}

          {page === 'trial' && <FinancialStatements co={co} view="trial" setDrill={setDrill} />}
          {page === 'pl' && <FinancialStatements co={co} view="pl" setDrill={setDrill} />}
          {page === 'bs' && <FinancialStatements co={co} view="bs" setDrill={setDrill} />}
          {page === 'schedule3' && <FinancialStatements co={co} view="schedule3" setDrill={setDrill} />}

          {page === 'gst' && <GSTR1Module co={co} updateCompany={updateCompany} />}
          {page === 'privacy' && <PrivacyPolicyModule />}
          {page === 'login_reg' && <LoginRegisterModule db={db} setDB={setDB} session={session} />}
          {page === 'tds' && <TDSModule co={co} update={updateCompany} />}

          {(page === 'masters' || page === 'ledgers' || page === 'inventory' || page === 'assets') && (
            <MastersModule co={co} update={updateCompany} view={page as any} />
          )}

          {page === 'smartpdf' && (
            <SmartPDFModule co={co} update={updateCompany} session={session} nav={setPage} />
          )}

          {page === 'bank_feed' && (
            <BankFeedModule co={co} update={updateCompany} session={session} nav={setPage} />
          )}

          {(page === 'ageing' || page === 'stockrep' || page === 'cashflow' || page === 'msme') && (
            <ReportsModule co={co} view={page as any} setDrill={setDrill} />
          )}

          {(page === 'calendar' ||
            page === 'audittracker' ||
            page === 'auditreport' ||
            page === 'negledger' ||
            page === 'fpocomp' ||
            page === 'forms' ||
            page === 'directory' ||
            page === 'gst_credentials' ||
            page === 'mcq' ||
            page === 'tasks' ||
            page === 'expert') && (
            <ComplianceModule
              co={co}
              update={updateCompany}
              session={session}
              view={page as any}
              setDrill={setDrill}
            />
          )}

          {(page === 'payroll' ||
            page === 'features' ||
            page === 'bridge' ||
            page === 'users' ||
            page === 'company') && (
            <AdminSettingsModule co={co} update={updateCompany} session={session} view={page as any} />
          )}
        </main>
      </div>

      {/* Export Bundle Modal */}
      {showExportModal && <ExportBundleModal co={co} onClose={() => setShowExportModal(false)} />}

      {/* Voucher Detail Modal */}
      {drill && drill.voucherId && (
        <VoucherDetailModal
          co={co}
          vid={drill.voucherId}
          update={updateCompany}
          logAudit={logAudit}
          session={session}
          nav={setPage}
          setDrill={setDrill}
          onClose={() => setDrill(null)}
        />
      )}

      {/* Ledger Voucher Drill-Down Statement Modal */}
      {drill && drill.ledgerId && (
        <LedgerVoucherModal
          co={co}
          ledgerId={drill.ledgerId}
          onClose={() => setDrill(null)}
          onSelectVoucher={vid => setDrill({ voucherId: vid })}
          nav={setPage}
          setDrill={setDrill}
        />
      )}
    </div>
  );
}
