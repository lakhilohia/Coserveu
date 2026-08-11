export const ROLES = {
  'Admin': { v: true, edit: true, del: true, reports: true, admin: true, label: 'Administrator / CEO' },
  'Accountant': { v: true, edit: true, del: true, reports: true, admin: false, label: 'Accountant' },
  'Data Entry': { v: true, edit: false, del: false, reports: false, admin: false, label: 'Data Entry Operator' },
  'Auditor': { v: false, edit: false, del: false, reports: true, admin: false, label: 'Internal Auditor (Read-only)' },
  'CA': { v: false, edit: false, del: false, reports: true, admin: false, label: 'Chartered Accountant' },
  'Domain Expert': { v: true, edit: true, del: true, reports: true, admin: true, label: 'Domain Expert (Law & Accounts)' },
} as const;
