import React from 'react';
import { Session } from '../types';

interface SidebarProps {
  page: string;
  setPage: (p: string) => void;
  navOpen: boolean;
  setNavOpen: (o: boolean) => void;
  session?: Session | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ page, setPage, navOpen, setNavOpen, session }) => {
  const nav = (p: string) => {
    setPage(p);
    setNavOpen(false);
  };

  const isDomainExpert =
    session?.role === 'Domain Expert' ||
    session?.role === 'CA' ||
    session?.name?.toLowerCase() === 'domainexpert';

  const navItems = [
    {
      group: 'Overview',
      items: [
        ['dashboard', '📊', 'Dashboard'],
        ['daybook', '📒', 'Day Book'],
      ],
    },
    {
      group: 'Transactions',
      items: [
        ['voucher', '✍️', 'Voucher Entry'],
        ['bank_feed', '🏦', 'Bank Account Auto-Feed ★'],
        ['smartpdf', '📄', 'Smart PDF → Voucher'],
        ['vouchers', '🧾', 'All Vouchers'],
      ],
    },
    {
      group: 'Registers',
      items: [
        ['grand_reg', '📊', 'Grand Executive Register ★'],
        ['purchase_reg', '🛒', 'Purchase Register'],
        ['sales_reg', '🏷️', 'Sales Register'],
        ['expense_reg', '💸', 'Expense Register'],
        ['income_reg', '💰', 'Income Register'],
        ['assets_reg', '🏭', 'Fixed Asset Register'],
        ['share_reg', '📜', 'Share Capital & Certificates'],
      ],
    },
    {
      group: 'Masters',
      items: [
        ['masters', '🗂️', 'Create Accounting Masters'],
        ['ledgers', '📇', 'Ledgers & Groups'],
        ['inventory', '📦', 'Inventory'],
        ['assets', '🏗️', 'Asset Master'],
      ],
    },
    {
      group: 'Reports',
      items: [
        ['trial', '⚖️', 'Trial Balance'],
        ['pl', '📈', 'Profit & Loss (Expandable)'],
        ['bs', '🏦', 'Balance Sheet (Expandable)'],
        ['schedule3', '📓', 'Schedule III Notes'],
        ['gst', '🧮', 'GSTR-1 & GST Reports'],
        ['tds', '📑', 'TDS Register & 194Q'],
        ['ageing', '⏳', 'Ageing Analysis'],
        ['stockrep', '📦', 'Stock Summary'],
        ['cashflow', '💵', 'Cash Flow'],
        ['msme', '⏱️', 'MSME Interest (Sec 16)'],
      ],
    },
    {
      group: 'Compliance & Audit',
      items: [
        ['calendar', '📅', 'Compliance Calendar'],
        ['audittracker', '📋', 'Audit Doc Tracker'],
        ['auditreport', '📝', 'Auditor Report'],
        ['negledger', '🚩', 'Negative Ledgers'],
        ['fpocomp', '✅', 'Producer Co Checklist'],
        ['forms', '📃', 'Statutory Forms ★'],
        ['directory', '📇', 'FPC Directory & GST Portal Credentials'],
        ['gst_credentials', '🔑', 'GST Credentials Directory ★'],
        ...(isDomainExpert ? [['mcq', '❓', 'Statutory & Tax MCQs ★']] : []),
        ['login_reg', '👥', 'User Login Register ★'],
        ['tasks', '🗓️', 'Task Register'],
        ['expert', '⚖️', 'Expert / CA Portal'],
      ],
    },
    {
      group: 'Payroll & Settings',
      items: [
        ['payroll', '👷', 'Payroll & Labour Law'],
        ['features', '⚙️', 'Company Features (F11)'],
        ['bridge', '🔁', 'Excel / Sheets Bridge'],
        ['company', '🏢', 'Company & Sync'],
        ['privacy', '📜', 'Privacy & Security Policy'],
      ],
    },
  ];

  return (
    <>
      {navOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out overflow-y-auto ${
          navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <h2 className="font-bold text-slate-100 text-lg leading-none">CoserveU</h2>
              <span className="text-[11px] text-slate-400 font-medium">Accounting &amp; Compliance</span>
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-4 flex-1">
          {navItems.map(g => (
            <div key={g.group}>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {g.group}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {g.items.map(([p, ic, lbl]) => (
                  <button
                    key={p}
                    onClick={() => nav(p)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <span className="text-sm">{ic}</span>
                    <span>{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
